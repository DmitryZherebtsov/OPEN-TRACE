import { prisma } from "@/lib/prisma";
import {
  serializeAdminBudget,
  serializeEvaluation,
  serializeInnovation,
  serializeScanJob,
} from "@/lib/serializers";
import { RadarWorkspace } from "@/components/RadarWorkspace";
import type { Domain } from "@/types/innovation";

export const dynamic = "force-dynamic";

  export default async function HomePage({
    searchParams,
  }: {
    searchParams: Promise<{ q?: string; domain?: string }>;
  }) {
    const startedAt = performance.now();
    const sp = await searchParams;

    let serializedInnovations: ReturnType<typeof serializeInnovation>[] = [];
    let serializedEvaluations: ReturnType<typeof serializeEvaluation>[] = [];
    let serializedJobs: ReturnType<typeof serializeScanJob>[] = [];
    let serializedBudget: ReturnType<typeof serializeAdminBudget> = {
      id: "default",
      maxBudgetPln: 250_000,
      toleranceMultiplier: 1.2,
      budgetLimitPln: 300_000,
      updatedAt: new Date().toISOString(),
    };

    try {
      const [rows, evalRows, jobRows, settings] = await Promise.all([
        prisma.innovation.findMany({
          include: {
            source: true,
            scoring: true,
            similarities: { orderBy: { matchPercent: "desc" } },
            pathways: true,
            _count: { select: { evaluations: true } },
          },
          orderBy: [{ isPreIndexed: "desc" }, { createdAt: "desc" }],
        }),
        prisma.projectEvaluation.findMany({
          orderBy: [{ totalScore: "desc" }, { createdAt: "desc" }],
          take: 10,
        }),
        prisma.scanJob.findMany({
          orderBy: { startedAt: "desc" },
          take: 6,
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
      ]);

      serializedInnovations = rows.map(serializeInnovation);
      serializedEvaluations = evalRows.map(serializeEvaluation);
      serializedJobs = jobRows.map(serializeScanJob);
      serializedBudget = serializeAdminBudget(settings);
    } catch (error) {
      console.error("[HomePage] Błąd odczytu bazy danych:", error);
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startedAt));
    const initialQuery = typeof sp.q === "string" ? sp.q : "";
    const rawDomain = typeof sp.domain === "string" ? sp.domain.toUpperCase() : "";
    const initialDomain: Domain | "ALL" =
      rawDomain === "TECHNOLOGICZNY" ||
        rawDomain === "EDUKACYJNY" ||
        rawDomain === "ADMINISTRACYJNY"
        ? rawDomain
        : "ALL";

    return (
    <RadarWorkspace
      initialInnovations={serializedInnovations}
      initialEvaluations={serializedEvaluations}
      initialJobs={serializedJobs}
      initialBudget={serializedBudget}
      initialLatencyMs={latencyMs}
      initialQuery={initialQuery}
      initialDomain={initialDomain}
    />
    );
  }
