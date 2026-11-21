import { NextRequest, NextResponse } from "next/server";
import type { EvaluationTable } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { serializeAdminBudget, serializeEvaluation } from "@/lib/serializers";

const VALID_TABLES: EvaluationTable[] = [
  "TABELA_GLOWNA",
  "TABELA_DRUGORZEDNA",
  "ARCHIWUM_ODRZUCONE",
];

export async function GET(request: NextRequest) {
  try {
    const tableParam = request.nextUrl.searchParams
      .get("table")
      ?.trim()
      .toUpperCase();

    const where =
      tableParam && VALID_TABLES.includes(tableParam as EvaluationTable)
        ? { targetTable: tableParam as EvaluationTable }
        : {};

    const [evaluations, settings, countsRaw] = await Promise.all([
      prisma.projectEvaluation.findMany({
        where,
        orderBy: [{ totalScore: "desc" }, { createdAt: "desc" }],
      }),
      prisma.adminSettings.upsert({
        where: { id: "default" },
        update: {},
        create: {
          id: "default",
          maxBudgetPln: 250_000,
          toleranceMultiplier: 1.2,
        },
      }),
      prisma.projectEvaluation.groupBy({
        by: ["targetTable"],
        _count: { _all: true },
      }),
    ]);

    const counts: Record<EvaluationTable, number> = {
      TABELA_GLOWNA: 0,
      TABELA_DRUGORZEDNA: 0,
      ARCHIWUM_ODRZUCONE: 0,
    };
    for (const row of countsRaw) {
      counts[row.targetTable] = row._count._all;
    }

    return NextResponse.json({
      items: evaluations.map(serializeEvaluation),
      counts,
      budget: serializeAdminBudget(settings),
    });
  } catch (error) {
    console.error("[GET /api/evaluations]", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać listy ocen wieloagentowych." },
      { status: 500 }
    );
  }
}
