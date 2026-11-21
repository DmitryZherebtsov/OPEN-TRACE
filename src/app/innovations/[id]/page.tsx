import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Scale, ArrowUpRight } from "lucide-react";
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
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#4C1D95]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Powrót do Radaru OSINT (Tor A + Tor B)</span>
        </Link>

        <Link
          href="/oceny"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D28D9] hover:underline"
        >
          <Scale className="h-4 w-4" />
          <span>Wszystkie Oceny Wieloagentowe</span>
        </Link>
      </div>

      <InnovationCard innovation={innovation} />

      {/* Powiązane raporty Debaty 4 AI */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">
          Historia Ocen Wieloagentowych (Debata 4 AI) dla tej innowacji
        </h2>
        {evaluations.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">
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
                className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 transition hover:border-violet-300 hover:bg-violet-50/30 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#4C1D95] px-2.5 py-0.5 text-[11px] font-bold text-white">
                      {EVALUATION_TABLE_LABELS[ev.targetTable]}
                    </span>
                    <span className="text-xs font-bold tabular-nums text-slate-900">
                      Wynik: {ev.totalScore.toFixed(2)} / 50 pkt (
                      {ev.percentScore.toFixed(1)}%)
                    </span>
                    <span className="text-xs text-slate-600 tabular-nums">
                      PERT: {Math.round(ev.totalPertCostPln).toLocaleString("pl-PL")}{" "}
                      PLN
                    </span>
                    <span className="text-xs text-slate-600 tabular-nums">
                      R_kryt: {ev.criticalRiskPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Wygenerowano: {new Date(ev.createdAt).toLocaleString("pl-PL")}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#6D28D9]">
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
