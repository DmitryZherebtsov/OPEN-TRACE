import { prisma } from "@/lib/prisma";
import { serializeAdminBudget, serializeEvaluation } from "@/lib/serializers";
import { EvaluationsWorkspace } from "@/components/EvaluationsWorkspace";

export const dynamic = "force-dynamic";

export default async function OcenyPage() {
  let evaluations: ReturnType<typeof serializeEvaluation>[] = [];
  let budget: ReturnType<typeof serializeAdminBudget> = {
    id: "default",
    maxBudgetPln: 250_000,
    toleranceMultiplier: 1.2,
    budgetLimitPln: 300_000,
    updatedAt: new Date().toISOString(),
  };
  let innovationOptions: Array<{
    id: string;
    title: string;
    institution: string | null;
    domain: string;
  }> = [];

  try {
    const [evalRows, settings, innovations] = await Promise.all([
      prisma.projectEvaluation.findMany({
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
      prisma.innovation.findMany({
        select: {
          id: true,
          title: true,
          institution: true,
          domain: true,
        },
        orderBy: [{ isPreIndexed: "desc" }, { createdAt: "desc" }],
      }),
    ]);

    evaluations = evalRows.map(serializeEvaluation);
    budget = serializeAdminBudget(settings);
    innovationOptions = innovations;
  } catch (error) {
    console.error("[OcenyPage] Błąd odczytu bazy danych:", error);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <EvaluationsWorkspace
        initialEvaluations={evaluations}
        initialBudget={budget}
        innovationOptions={innovationOptions}
      />
    </div>
  );
}
