import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Scale, ArrowUpRight, Home } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { serializeEvaluation, serializeInnovation } from "@/lib/serializers";
import { InnovationCard } from "@/components/InnovationCard";
import { EVALUATION_TABLE_LABELS } from "@/types/evaluation";

export const dynamic = "force-dynamic";

export default async function InnovationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const row = await prisma.innovation.findUnique({
    where: { id },
    include: {
      source: true,
      scoring: true,
      similarities: { orderBy: { matchPercent: "desc" } },
      pathways: true,
      evaluations: { orderBy: { createdAt: "desc" } },
      _count: { select: { evaluations: true } },
    },
  });

  if (!row) {
    notFound();
  }

  const innovation = serializeInnovation(row);
  const evaluations = row.evaluations.map(serializeEvaluation);

  return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[19px] font-semibold tracking-tight text-[#374151]">
              Karta Innowacji OSINT („Fakty vs AI”)
            </h1>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
              <Link href="/" className="hover:text-[#7c3aed]">
                <Home className="h-3.5 w-3.5" />
              </Link>
              <span>/</span>
              <Link href="/" className="hover:text-[#7c3aed]">
                Analityka Radaru
              </Link>
              <span>/</span>
              <span className="truncate font-medium text-gray-600">
                {innovation.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-[2px] border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#7c3aed] hover:text-[#7c3aed]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Powrót</span>
            </Link>
            <Link
              href="/oceny"
              className="inline-flex items-center gap-1.5 rounded-[2px] bg-[#7c3aed] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#6d28d9]"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Oceny 4 AI</span>
            </Link>
          </div>
        </div>

        <InnovationCard innovation={innovation} />

        {/* Powiązane raporty Debaty 4 AI */}
            <section className="flat-card p-5">
              <h2 className="text-[15px] font-semibold text-[#374151]">
                Historia Ocen Wieloagentowych (Debata 4 AI) dla tej innowacji
              </h2>
              {evaluations.length === 0 ? (
                  <p className="mt-2 text-xs text-gray-500">
                    Ta innowacja nie posiada jeszcze zapisanego raportu Debaty 4 AI.
                    Kliknij przycisk „Uruchom Ocenę Wieloagentową (Debata 4 AI)” powyżej,
                    aby wygenerować pełny raport z kosztorysem PERT i weryfikacją źródeł.
                  </p>
                  ) : (
                  <div className="mt-3 space-y-2.5">
                    {evaluations.map((ev) => (
                      <Link
                        key={ev.id}
                        href={`/oceny/${ev.id}`}
                        className="flex flex-col justify-between gap-3 rounded-[2px] border border-gray-200 bg-[#f9fafb] p-3.5 transition hover:border-[#7c3aed] hover:bg-purple-50/30 sm:flex-row sm:items-center"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-[2px] bg-[#7c3aed] px-2.5 py-0.5 text-[11px] font-bold text-white">
                                {EVALUATION_TABLE_LABELS[ev.targetTable]}
                              </span>
                                <span className="text-xs font-bold tabular-nums text-[#374151]">
                                  Wynik: {ev.totalScore.toFixed(2)} / 50 pkt (
                                  {ev.percentScore.toFixed(1)}%)
                                </span>
                                  <span className="text-xs text-gray-600 tabular-nums">
                                    PERT:{" "}
                                    {Math.round(ev.totalPertCostPln).toLocaleString("pl-PL")}{" "}
                                    PLN
                                  </span>
                                    <span className="text-xs text-gray-600 tabular-nums">
                                      R_kryt: {ev.criticalRiskPercent.toFixed(1)}%
                                    </span>
                                  </div>
                                    <div className="mt-1 text-xs text-gray-500">
                                      Wygenerowano: {new Date(ev.createdAt).toLocaleString("pl-PL")}
                                    </div>
                                  </div>
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#7c3aed]">
                                      <span>Otwórz pełny raport</span>
                                      <ArrowUpRight className="h-4 w-4" />
                                    </span>
                                  </Link>
            ))}
                                </div>
        )}
                              </section>
                          </div>
                          );
}
