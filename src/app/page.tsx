import { prisma } from "@/lib/prisma";
import { serializeInnovation } from "@/lib/serializers";
import { RadarWorkspace } from "@/components/RadarWorkspace";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const startedAt = performance.now();
  let items: Awaited<ReturnType<typeof prisma.innovation.findMany>> = [];
  let serialized: ReturnType<typeof serializeInnovation>[] = [];

  try {
    const rows = await prisma.innovation.findMany({
      include: {
        source: true,
        scoring: true,
        similarities: { orderBy: { matchPercent: "desc" } },
        pathways: true,
        _count: { select: { evaluations: true } },
      },
      orderBy: [{ isPreIndexed: "desc" }, { createdAt: "desc" }],
    });
    items = rows;
    serialized = rows.map(serializeInnovation);
  } catch (error) {
    console.error("[HomePage] Błąd odczytu bazy danych:", error);
  }

  const latencyMs = Math.max(1, Math.round(performance.now() - startedAt));
  void items;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <RadarWorkspace
        initialInnovations={serialized}
        initialLatencyMs={latencyMs}
      />
    </div>
  );
}
