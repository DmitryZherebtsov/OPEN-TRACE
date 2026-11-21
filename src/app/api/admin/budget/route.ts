import { NextRequest, NextResponse } from "next/server";
import type { EvaluationTable } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { routeEvaluationTable } from "@/lib/evaluation-math";
import { serializeAdminBudget } from "@/lib/serializers";

const PatchBudgetSchema = z.object({
  maxBudgetPln: z
    .number({ invalid_type_error: "Budżet B_max musi być liczbą." })
    .min(10_000, "Minimalny budżet B_max wynosi 10 000 PLN.")
    .max(100_000_000, "Maksymalny budżet B_max wynosi 100 000 000 PLN."),
});

export async function GET() {
  try {
    const settings = await prisma.adminSettings.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        maxBudgetPln: 250_000,
        toleranceMultiplier: 1.2,
      },
    });

    const evaluations = await prisma.projectEvaluation.findMany({
      select: {
        id: true,
        projectTitle: true,
        totalScore: true,
        totalPertCostPln: true,
        targetTable: true,
        criticalRiskPercent: true,
      },
      orderBy: { totalScore: "desc" },
    });

    return NextResponse.json({
      budget: serializeAdminBudget(settings),
      projects: evaluations,
    });
  } catch (error) {
    console.error("[GET /api/admin/budget]", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać konfiguracji budżetu B_max." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => null);
    const parsed = PatchBudgetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Nieprawidłowa wartość maksymalnego budżetu B_max.",
        },
        { status: 400 }
      );
    }

    const updatedSettings = await prisma.adminSettings.upsert({
      where: { id: "default" },
      update: { maxBudgetPln: parsed.data.maxBudgetPln },
      create: {
        id: "default",
        maxBudgetPln: parsed.data.maxBudgetPln,
        toleranceMultiplier: 1.2,
      },
    });

    // Automatyczne przeliczenie targetTable dla wszystkich istniejących ocen
    const allEvaluations = await prisma.projectEvaluation.findMany({
      orderBy: { totalScore: "desc" },
    });

    const movedProjects: Array<{
      id: string;
      projectTitle: string;
      totalScore: number;
      totalPertCostPln: number;
      fromTable: EvaluationTable;
      toTable: EvaluationTable;
    }> = [];

    const updates = allEvaluations.map((ev) => {
      const { targetTable, budgetLimitPln } = routeEvaluationTable(
        ev.totalScore,
        ev.totalPertCostPln,
        updatedSettings.maxBudgetPln,
        updatedSettings.toleranceMultiplier
      );

      if (targetTable !== ev.targetTable) {
        movedProjects.push({
          id: ev.id,
          projectTitle: ev.projectTitle,
          totalScore: ev.totalScore,
          totalPertCostPln: ev.totalPertCostPln,
          fromTable: ev.targetTable,
          toTable: targetTable,
        });
      }

      return prisma.projectEvaluation.update({
        where: { id: ev.id },
        data: {
          targetTable,
          budgetLimitSnapshotPln: budgetLimitPln,
        },
      });
    });

    await prisma.$transaction(updates);

    const refreshed = await prisma.projectEvaluation.findMany({
      select: {
        id: true,
        projectTitle: true,
        totalScore: true,
        totalPertCostPln: true,
        targetTable: true,
        criticalRiskPercent: true,
      },
      orderBy: { totalScore: "desc" },
    });

    return NextResponse.json({
      budget: serializeAdminBudget(updatedSettings),
      recalculatedCount: allEvaluations.length,
      movedProjects,
      projects: refreshed,
    });
  } catch (error) {
    console.error("[PATCH /api/admin/budget]", error);
    return NextResponse.json(
      {
        error:
          "Wystąpił błąd podczas aktualizacji budżetu B_max i przeliczania tabel.",
      },
      { status: 500 }
    );
  }
}
