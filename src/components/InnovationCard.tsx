"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  FileText,
  Scale,
  ArrowUpRight,
  AlertTriangle,
  Layers,
  Loader2,
  Compass,
  Quote,
} from "lucide-react";
import {
  DOMAIN_LABELS,
  PATHWAY_LABELS,
  SIMILARITY_STATUS_LABELS,
  SOURCE_TYPE_LABELS,
  formatSourceValue,
  formatTrl,
  type InnovationDTO,
  type SimilarityStatus,
} from "@/types/innovation";
import { usePersona } from "@/components/PersonaContext";

interface InnovationCardProps {
  innovation: InnovationDTO;
  compact?: boolean;
  showFullPageLink?: boolean;
  onEvaluated?: (evaluationId: string) => void;
}

function similarityBarStyle(status: SimilarityStatus) {
  if (status === "POTENCJALNY_DUPLIKAT") {
    return {
      bar: "bg-rose-600",
      badge: "bg-rose-50 text-rose-800 border-rose-200",
    };
  }
  if (status === "POKREWNE") {
    return {
      bar: "bg-amber-500",
      badge: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }
  return {
    bar: "bg-emerald-600",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };
}

function domainBadgeStyle(domain: InnovationDTO["domain"]) {
  if (domain === "TECHNOLOGICZNY") {
    return "bg-violet-100 text-[#4C1D95] border-violet-200";
  }
  if (domain === "EDUKACYJNY") {
    return "bg-sky-100 text-sky-900 border-sky-200";
  }
  return "bg-emerald-100 text-emerald-900 border-emerald-200";
}

export function InnovationCard({
  innovation,
  showFullPageLink = false,
  onEvaluated,
}: InnovationCardProps) {
  const router = useRouter();
  const { persona } = usePersona();
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  const facts = innovation.verifiedFacts;
  const scoring = innovation.scoring;

  const isExternalHttpUrl =
    innovation.source.url.startsWith("http://") ||
    innovation.source.url.startsWith("https://");

  const handleLaunchDebate = async () => {
    setEvaluating(true);
    setEvalError(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ innovationId: innovation.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "Nie udało się uruchomić oceny wieloagentowej."
        );
      }
      const evaluationId = data.evaluation?.id as string | undefined;
      if (evaluationId) {
        if (onEvaluated) {
          onEvaluated(evaluationId);
        } else {
          router.push(`/oceny/${evaluationId}`);
        }
      }
    } catch (err) {
      setEvalError(
        err instanceof Error
          ? err.message
          : "Wystąpił błąd podczas uruchamiania Debaty 4 AI."
      );
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {/* Nagłówek karty */}
      <header className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${domainBadgeStyle(innovation.domain)}`}
            >
              Domena: {DOMAIN_LABELS[innovation.domain]}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {formatTrl(innovation.domain, scoring?.trl ?? null)}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                innovation.isPreIndexed
                  ? "bg-indigo-50 text-[#4C1D95]"
                  : "bg-amber-50 text-amber-900"
              }`}
            >
              {innovation.isPreIndexed
                ? "Tor A · Baza pre-indeksowana"
                : "Tor B · Skan doraźny"}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-600">
              Rejestr: {innovation.source.registryName}
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {innovation.title}
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
            {innovation.summary}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {showFullPageLink && (
            <Link
              href={`/innovations/${innovation.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:border-violet-300 hover:text-[#4C1D95]"
            >
              <span>Pełna karta</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
          <button
            type="button"
            onClick={handleLaunchDebate}
            disabled={evaluating}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
          >
            {evaluating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Trwa Debata 4 AI...</span>
              </>
            ) : (
              <>
                <Scale className="h-4 w-4" />
                <span>Uruchom Ocenę Wieloagentową (Debata 4 AI)</span>
              </>
            )}
          </button>
        </div>
      </header>

      {evalError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{evalError}</span>
        </div>
      )}

      {/* Problem i Rozwiązanie */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Zdiagnozowany problem
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-800">
            {innovation.problem}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Proponowane rozwiązanie
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-800">
            {innovation.solution}
          </p>
        </div>
      </div>

      {/* ŚCISŁY PODZIAŁ DWUWARSTWOWY: PROTOKÓŁ „FAKTY VS AI” */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* WARSTWA 1: FAKTY ŹRÓDŁOWE (verifiedFacts) */}
        <section className="rounded-2xl border-2 border-emerald-200/80 bg-emerald-50/30 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 border-b border-emerald-200/70 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  Warstwa faktów źródłowych (verifiedFacts)
                </h3>
                <p className="text-[11px] text-emerald-800">
                  Wyłącznie dane obecne wprost w dokumencie · Brak = „Brak
                  danych w źródle”
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              FAKTY
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <div className="rounded-xl bg-white p-3 ring-1 ring-emerald-100">
              <dt className="font-semibold text-slate-500">
                Instytucja / podmiot
              </dt>
              <dd className="mt-1 font-medium text-slate-900">
                {formatSourceValue(facts?.institution || innovation.institution)}
              </dd>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-emerald-100">
              <dt className="font-semibold text-slate-500">Twórca / zespół</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {formatSourceValue(innovation.creator)}
              </dd>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-emerald-100">
              <dt className="font-semibold text-slate-500">Data publikacji</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {formatSourceValue(facts?.publicationDate)}
              </dd>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-emerald-100">
              <dt className="font-semibold text-slate-500">
                Formalny identyfikator (patent / grant)
              </dt>
              <dd className="mt-1 font-mono font-medium text-slate-900">
                {formatSourceValue(facts?.formalIdentifier)}
              </dd>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-emerald-100">
              <dt className="font-semibold text-slate-500">
                Budżet lub koszt (ze źródła)
              </dt>
              <dd
                className={`mt-1 font-medium ${
                  facts?.budgetOrCost
                    ? "text-slate-900"
                    : "italic text-slate-500"
                }`}
              >
                {formatSourceValue(facts?.budgetOrCost)}
              </dd>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-emerald-100">
              <dt className="font-semibold text-slate-500">Typ źródła</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {SOURCE_TYPE_LABELS[innovation.source.institutionType]}
              </dd>
            </div>
          </dl>

          {/* URL źródłowy */}
          <div className="mt-3 rounded-xl bg-white p-3 text-xs ring-1 ring-emerald-100">
            <div className="font-semibold text-slate-500">
              Adres źródłowy (URL)
            </div>
            {isExternalHttpUrl ? (
              <a
                href={innovation.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 break-all font-medium text-emerald-700 underline decoration-emerald-300 hover:text-emerald-900"
              >
                <span>{innovation.source.url}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            ) : (
              <div className="mt-1 text-slate-600">
                {formatSourceValue(facts?.sourceUrl)} (materiał przesłany
                bezpośrednio w skanie doraźnym)
              </div>
            )}
          </div>

          {/* Cytaty dosłowne */}
          <div className="mt-3 rounded-xl bg-white p-3 text-xs ring-1 ring-emerald-100">
            <div className="flex items-center gap-1.5 font-semibold text-slate-600">
              <Quote className="h-3.5 w-3.5 text-emerald-600" />
              <span>Dosłowne cytaty z dokumentu źródłowego</span>
            </div>
            {facts?.verbatimQuotes && facts.verbatimQuotes.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {facts.verbatimQuotes.map((quote, idx) => (
                  <li
                    key={idx}
                    className="border-l-2 border-emerald-400 pl-2.5 italic leading-relaxed text-slate-700"
                  >
                    „{quote}”
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 italic text-slate-500">
                Brak danych w źródle
              </p>
            )}
          </div>

          {/* Metryki autorskie */}
          <div className="mt-3 rounded-xl bg-white p-3 text-xs ring-1 ring-emerald-100">
            <div className="font-semibold text-slate-600">
              Mierzalne wskaźniki zadeklarowane w źródle
            </div>
            {facts?.authorMetrics && facts.authorMetrics.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {facts.authorMetrics.map((metric, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-900 ring-1 ring-emerald-200"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-1 italic text-slate-500">
                Brak danych w źródle
              </p>
            )}
          </div>
        </section>

        {/* WARSTWA 2: WARSTWA ANALITYCZNA (aiEstimates + deterministyczny kod) */}
        <section className="rounded-2xl border-2 border-violet-200/80 bg-violet-50/30 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 border-b border-violet-200/70 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6D28D9] text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#4C1D95]">
                  Warstwa analityczna (AI + obliczenia kodu)
                </h3>
                <p className="text-[11px] text-violet-800">
                  Macierz 5-wymiarowa oraz deterministyczny Indeks wiarygodności
                </p>
              </div>
            </div>
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-[#4C1D95]">
              AI + KOD
            </span>
          </div>

          {scoring ? (
            <div className="mt-4 space-y-4">
              {/* Macierz 5 wymiarów */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3 ring-1 ring-violet-100">
                  <div className="text-[11px] font-medium text-slate-500">
                    Poziom wdrożenia
                  </div>
                  <div className="mt-1 text-lg font-extrabold tabular-nums text-[#4C1D95]">
                    {scoring.implementationLevel} / 5
                  </div>
                </div>
                <div className="rounded-xl bg-white p-3 ring-1 ring-violet-100">
                  <div className="text-[11px] font-medium text-slate-500">
                    Gotowość TRL
                  </div>
                  <div className="mt-1 text-lg font-extrabold tabular-nums text-slate-900">
                    {formatTrl(innovation.domain, scoring.trl)}
                  </div>
                </div>
                <div className="rounded-xl bg-white p-3 ring-1 ring-violet-100">
                  <div className="text-[11px] font-medium text-slate-500">
                    Innowacyjność
                  </div>
                  <div className="mt-1 text-lg font-extrabold tabular-nums text-[#4C1D95]">
                    {scoring.innovativeness} / 5
                  </div>
                </div>
                <div className="rounded-xl bg-white p-3 ring-1 ring-violet-100">
                  <div className="text-[11px] font-medium text-slate-500">
                    Potencjał transferu
                  </div>
                  <div className="mt-1 text-lg font-extrabold tabular-nums text-[#4C1D95]">
                    {scoring.transferPotential} / 5
                  </div>
                </div>
                <div className="col-span-2 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 p-3 ring-1 ring-violet-200 sm:col-span-2">
                  <div className="text-[11px] font-semibold text-[#4C1D95]">
                    Indeks wiarygodności źródła (kod deterministyczny)
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-lg font-extrabold tabular-nums text-[#4C1D95]">
                      {scoring.credibilityIndex} / 5
                    </span>
                    <span className="text-[11px] text-slate-600">
                      (5 mierzalnych atrybutów)
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 deterministycznych atrybutów wiarygodności */}
              <div className="rounded-xl bg-white p-3.5 ring-1 ring-violet-100">
                <h4 className="text-xs font-bold text-slate-800">
                  Audyt 5 atrybutów Indeksu Wiarygodności Źródła
                </h4>
                <ul className="mt-2.5 space-y-2 text-xs">
                  {scoring.credibilityDetails?.attributes?.map((attr) => (
                    <li
                      key={attr.key}
                      className="flex items-start gap-2 leading-snug"
                    >
                      {attr.met ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      )}
                      <div>
                        <span
                          className={
                            attr.met
                              ? "font-semibold text-slate-800"
                              : "text-slate-500"
                          }
                        >
                          {attr.label}
                        </span>
                        <div className="text-[11px] text-slate-500">
                          {attr.evidence}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Uzasadnienia analityczne AI */}
              <div className="rounded-xl bg-white p-3.5 text-xs ring-1 ring-violet-100">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-800">
                    Uzasadnienia estymacji analitycznych
                  </h4>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {scoring.aiEstimates?.modelUsed || "OPEN TRACE"}
                  </span>
                </div>
                <ul className="mt-2 space-y-1.5 text-slate-600">
                  <li>
                    <strong className="text-slate-800">Domena:</strong>{" "}
                    {scoring.aiEstimates?.domainRationale}
                  </li>
                  <li>
                    <strong className="text-slate-800">TRL:</strong>{" "}
                    {scoring.aiEstimates?.trlRationale}
                  </li>
                  <li>
                    <strong className="text-slate-800">Wdrożenie:</strong>{" "}
                    {scoring.aiEstimates?.implementationRationale}
                  </li>
                  <li>
                    <strong className="text-slate-800">Innowacyjność:</strong>{" "}
                    {scoring.aiEstimates?.innovativenessRationale}
                  </li>
                  <li>
                    <strong className="text-slate-800">Transfer:</strong>{" "}
                    {scoring.aiEstimates?.transferPotentialRationale}
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs italic text-slate-500">
              Brak danych w źródle — nie wygenerowano jeszcze macierzy punktowej.
            </p>
          )}
        </section>
      </div>

      {/* Analiza podobieństwa / antyduplikacja */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#6D28D9]" />
            <h3 className="text-sm font-bold text-slate-900">
              Analiza podobieństwa i antyduplikacja w rejestrach (UPRP / EPO /
              CORDIS / Interreg)
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
            <span className="font-medium text-emerald-700">
              &lt; 55% Unikalne
            </span>
            <span>·</span>
            <span className="font-medium text-amber-700">
              55–79% Pokrewne
            </span>
            <span>·</span>
            <span className="font-medium text-rose-700">
              ≥ 80% Potencjalny duplikat
            </span>
          </div>
        </div>

        {innovation.similarities.length > 0 ? (
          <div className="mt-3.5 space-y-3">
            {innovation.similarities.map((sim) => {
              const style = similarityBarStyle(sim.status);
              return (
                <div
                  key={sim.id}
                  className="rounded-xl border border-slate-200 bg-white p-3.5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                          {sim.registry}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {sim.matchedReferenceId}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${style.badge}`}
                        >
                          {SIMILARITY_STATUS_LABELS[sim.status]}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {sim.matchedTitle}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold tabular-nums text-slate-900">
                        {sim.matchPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${style.bar}`}
                      style={{
                        width: `${Math.min(100, Math.max(4, sim.matchPercent))}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    <strong className="text-slate-700">
                      Różnice funkcjonalne:
                    </strong>{" "}
                    {sim.functionalDifferences}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-500">
            Brak istotnych dopasowań powyżej progu — rozwiązanie unikalne w
            przeszukanych rejestrach.
          </p>
        )}
      </section>

      {/* Ścieżki transferu i KPI */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-[#6D28D9]" />
          <h3 className="text-sm font-bold text-slate-900">
            Rekomendowane ścieżki wdrożenia, transferu i wskaźniki KPI
          </h3>
        </div>

        <div className="mt-3.5 grid gap-4 md:grid-cols-2">
          {innovation.pathways.map((pw) => {
            const matchesPersona = persona.preferredPathways.includes(
              pw.pathway
            );
            return (
              <div
                key={pw.id}
                className={`rounded-xl border p-4 ${
                  matchesPersona
                    ? "border-violet-300 bg-violet-50/40 ring-1 ring-violet-200"
                    : "border-slate-200 bg-slate-50/50"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#4C1D95]">
                    {PATHWAY_LABELS[pw.pathway]}
                  </span>
                  {matchesPersona && (
                    <span className="rounded-full bg-[#6D28D9] px-2 py-0.5 text-[10px] font-semibold text-white">
                      Dopasowane do profilu: {persona.shortLabel}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">
                  {pw.rationale}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pw.targetGroups.map((tg, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200"
                    >
                      {tg}
                    </span>
                  ))}
                </div>

                {pw.kpis && pw.kpis.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-slate-200/80 pt-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Kluczowe wskaźniki KPI
                    </div>
                    {pw.kpis.map((kpi, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs ring-1 ring-slate-100"
                      >
                        <span className="text-slate-700">{kpi.metric}</span>
                        <span className="shrink-0 font-semibold text-emerald-700">
                          {kpi.target}{" "}
                          <span className="font-normal text-slate-400">
                            ({kpi.timeframe})
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          ID rekordu: <code className="font-mono">{innovation.id}</code>
        </span>
        <span>
          Ostatnie skanowanie źródła:{" "}
          {new Date(innovation.source.lastScannedAt).toLocaleString("pl-PL")}
        </span>
      </div>
    </article>
  );
}
