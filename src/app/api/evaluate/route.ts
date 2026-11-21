import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { runMultiAgentEvaluation } from "@/lib/multi-agent-evaluator";
import { serializeEvaluation } from "@/lib/serializers";

const EvaluateRequestSchema = z.object({
  innovationId: z.string().trim().optional(),
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => null);
    const parsed = EvaluateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Nieprawidłowy format żądania oceny wieloagentowej." },
        { status: 400 }
      );
    }

    const { innovationId, title, description } = parsed.data;

    let projectTitle = title || "";
    let projectDescription = description || "";
    let resolvedInnovationId: string | null = null;

    if (innovationId) {
      const innovation = await prisma.innovation.findUnique({
        where: { id: innovationId },
        include: { source: true, scoring: true },
      });
      if (!innovation) {
        return NextResponse.json(
          { error: "Nie znaleziono wskazanej innowacji w bazie danych." },
          { status: 404 }
        );
      }
      resolvedInnovationId = innovation.id;
      projectTitle = projectTitle || innovation.title;
      projectDescription =
        projectDescription ||
        [
          `Instytucja: ${innovation.institution ?? "Brak danych w źródle"}`,
          `Domena Oslo 2018: ${innovation.domain}`,
          `Streszczenie: ${innovation.summary}`,
          `Problem: ${innovation.problem}`,
          `Rozwiązanie: ${innovation.solution}`,
          `Źródło: ${innovation.source.registryName} (${innovation.source.url})`,
        ].join("\n");
    }

    if (projectTitle.length < 5) {
      return NextResponse.json(
        { error: "Tytuł ocenianego projektu musi mieć co najmniej 5 znaków." },
        { status: 400 }
      );
    }
    if (projectDescription.length < 30) {
      return NextResponse.json(
        {
          error:
            "Opis projektu do debaty 4 AI jest zbyt krótki (minimum 30 znaków).",
        },
        { status: 400 }
      );
    }

    const settings = await prisma.adminSettings.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        maxBudgetPln: 250_000,
        toleranceMultiplier: 1.2,
      },
    });

    const result = await runMultiAgentEvaluation({
      title: projectTitle,
      description: projectDescription,
      maxBudgetPln: settings.maxBudgetPln,
      toleranceMultiplier: settings.toleranceMultiplier,
    });

    const saved = await prisma.projectEvaluation.create({
      data: {
        innovationId: resolvedInnovationId,
        projectTitle,
        projectDescription,
        advocateReport:
          result.advocateReport as unknown as Prisma.InputJsonValue,
        skepticReport: result.skepticReport as unknown as Prisma.InputJsonValue,
        verifierLogs: result.verifierLogs as unknown as Prisma.InputJsonValue,
        arbiterReport: result.arbiterReport as unknown as Prisma.InputJsonValue,
        ...result.metrics,
        durationMs: result.durationMs,
      },
    });

    return NextResponse.json(
      {
        evaluation: serializeEvaluation(saved),
        usedOfflineFallback: result.usedOfflineFallback,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/evaluate]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nie udało się przeprowadzić oceny wieloagentowej projektu.",
      },
      { status: 500 }
    );
  }
}
