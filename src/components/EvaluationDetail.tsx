"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  AlertTriangle,
  Banknote,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  XCircle,
  Scale,
  ArrowUpRight,
} from "lucide-react";
import {
  CATEGORY_METADATA,
  EVALUATION_TABLE_LABELS,
  type EvaluationTable,
  type ProjectEvaluationDTO,
  type VerifierStatus,
} from "@/types/evaluation";

interface EvaluationDetailProps {
  evaluation: ProjectEvaluationDTO;
  showPermalink?: boolean;
}

function formatPln(amount: number): string {
  return `${Math.round(amount).toLocaleString("pl-PL")} PLN`;
}

function tableBadgeClasses(table: EvaluationTable): string {
  if (table === "TABELA_GLOWNA") {
    return "bg-[#7c3aed] text-white";
  }
  if (table === "TABELA_DRUGORZEDNA") {
    return "bg-[#4b5563] text-white";
  }
  return "bg-rose-600 text-white";
}

function verifierStatusBadge(status: VerifierStatus): string {
  if (status === "ZWERYFIKOWANY") {
    return "bg-purple-100 text-[#5b21b6] border-purple-200";
  }
  if (status === "CZĘŚCIOWO_ZGODNY") {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }
  return "bg-rose-50 text-rose-800 border-rose-200";
}

export function EvaluationDetail({
  evaluation,
  showPermalink = false,
}: EvaluationDetailProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {
      kat_1_zwiazek_z_wyzwaniem: true,
      kat_2_pomysl_i_oryginalnosc: true,
      kat_3_uzytecznosc_i_ux: false,
      kat_4_kompletnosc_prototypu: false,
      kat_5_potencjal_wdrozeniowy: false,
    }
  );
  const [showFullVerifierLog, setShowFullVerifierLog] = useState(false);

  const toggleCategory = (key: string) => {
    setOpenCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = (value: boolean) => {
    const next: Record<string, boolean> = {};
    for (const cat of CATEGORY_METADATA) {
      next[cat.key] = value;
    }
    setOpenCategories(next);
  };

  const categoryAverages: Record<string, number> = {
    kat_1_zwiazek_z_wyzwaniem: evaluation.c1ChallengeFit,
    kat_2_pomysl_i_oryginalnosc: evaluation.c2Originality,
    kat_3_uzytecznosc_i_ux: evaluation.c3UsabilityUx,
    kat_4_kompletnosc_prototypu: evaluation.c4Completeness,
    kat_5_potencjal_wdrozeniowy: evaluation.c5Scalability,
  };

  const logs = evaluation.verifierLogs || [];
  const verifiedCount = logs.filter(
    (l) => l.status === "ZWERYFIKOWANY" || l.status === "CZĘŚCIOWO_ZGODNY"
  ).length;
  const hallucinationCount = logs.filter(
    (l) => l.status === "HALUCYNACJA"
  ).length;

  const logByUrl = new Map(logs.map((l) => [l.link_url, l]));
  const withinBudget =
    evaluation.totalPertCostPln <= evaluation.budgetLimitSnapshotPln;

  return (
      <div className="flat-card space-y-6 p-5 sm:p-6">
        {/* Nagłówek raportu */}
          <header className="flex flex-col gap-3 border-b border-gray-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-[2px] px-2.5 py-0.5 text-xs font-bold ${tableBadgeClasses(evaluation.targetTable)}`}
                >
                  <Scale className="h-3.5 w-3.5" />
                  {EVALUATION_TABLE_LABELS[evaluation.targetTable]}
                </span>
                  <span className="rounded-[2px] bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    Czas debaty: {(evaluation.durationMs / 1000).toFixed(2)} s
                  </span>
                    <span className="rounded-[2px] bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {new Date(evaluation.createdAt).toLocaleString("pl-PL")}
                    </span>
                  </div>
                    <h2 className="mt-2 text-xl font-bold text-[#374151] sm:text-2xl">
                      {evaluation.projectTitle}
                    </h2>
                      <p className="mt-1 max-w-4xl text-xs leading-relaxed text-gray-600 sm:text-sm">
                        {evaluation.projectDescription}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {evaluation.innovationId && (
                        <Link
                          href={`/innovations/${evaluation.innovationId}`}
                          className="inline-flex items-center gap-1 rounded-[2px] border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-[#7c3aed] hover:text-[#7c3aed]"
                        >
                          <span>Karta OSINT</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      {showPermalink && (
                        <Link
                          href={`/oceny/${evaluation.id}`}
                          className="inline-flex items-center gap-1 rounded-[2px] bg-purple-50 px-3 py-2 text-xs font-semibold text-[#6d28d9] hover:bg-purple-100"
                        >
                          <span>Otwórz pełny raport</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </header>

                  {/* 4 KARTY KPI ZARZĄDCZYCH (płaski styl Flat Able) */}
                  <section className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-[2px] border border-gray-200 border-t-2 border-t-[#7c3aed] bg-[#f9fafb] p-4">
                          <div className="flex items-center justify-between text-xs font-semibold text-[#6d28d9]">
                            <span>Wynik końcowy (Arbiter)</span>
                            <Award className="h-4 w-4" />
                          </div>
                          <div className="mt-2 flex items-baseline gap-2">
                              <span className="text-2xl font-extrabold tabular-nums text-[#5b21b6]">
                                {evaluation.totalScore.toFixed(2)}
                              </span>
                                <span className="text-xs font-semibold text-gray-500">
                                  / 50 pkt
                                </span>
                              </div>
                                <div className="mt-1 text-xs text-gray-600 tabular-nums">
                                  Średnia: <strong>{evaluation.avgScore.toFixed(2)} / 10</strong> ·{" "}
                                  <strong>{evaluation.percentScore.toFixed(1)}%</strong>
                                </div>
                              </div>

                                  <div className="rounded-[2px] border border-gray-200 border-t-2 border-t-[#4b5563] bg-[#f9fafb] p-4">
                                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                                      <span>Koszt urealniony PERT</span>
                                      <Banknote className="h-4 w-4 text-gray-500" />
                                    </div>
                                      <div className="mt-2 text-2xl font-extrabold tabular-nums text-[#374151]">
                                        {formatPln(evaluation.totalPertCostPln)}
                                      </div>
                                      <div
              withinBudget ? "text-[#6d28d9]" : "text-amber-700"
            }`}
          >
                                      {withinBudget ? "Mieści się w" : "Przekracza"} B_limit (
                                      {formatPln(evaluation.budgetLimitSnapshotPln)})
                                    </div>
                                  </div>

                                      <div className="rounded-[2px] border border-gray-200 border-t-2 border-t-[#7c3aed] bg-[#f9fafb] p-4">
                                        <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                                          <span>Ryzyko Krytyczne (R_kryt)</span>
                                          <ShieldAlert
                                            className={`h-4 w-4 ${evaluation.criticalRiskPercent >= 50
                                                ? "text-rose-600"
                                                : evaluation.criticalRiskPercent >= 25
                                                  ? "text-amber-600"
                    : "text-[#7c3aed]"
              }`}
            />
                                        </div>
                                        <div
                                          className={`mt-2 text-2xl font-extrabold tabular-nums ${evaluation.criticalRiskPercent >= 50
                                              ? "text-rose-700"
                                              : evaluation.criticalRiskPercent >= 25
                                                ? "text-amber-700"
                  : "text-[#6d28d9]"
            }`}
          >
                                        {evaluation.criticalRiskPercent.toFixed(1)}%
                                      </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                          Odsetek niezaadresowanych ryzyk krytycznych
                                        </div>
                                      </div>

                                          <div className="rounded-[2px] border border-gray-200 border-t-2 border-t-[#4b5563] bg-[#f9fafb] p-4">
                                            <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                                              <span>Tabela &amp; AI 4 Fast-Check</span>
                                              <ShieldCheck className="h-4 w-4 text-[#7c3aed]" />
                                            </div>
                                            <div className="mt-2">
                                              <span
                                                className={`inline-block rounded-[2px] px-2.5 py-1 text-xs font-bold ${tableBadgeClasses(evaluation.targetTable)}`}
                                              >
                                                {EVALUATION_TABLE_LABELS[evaluation.targetTable]}
                                              </span>
                                            </div>
                                              <div className="mt-2 text-xs text-gray-600">
                                                AI 4: <strong className="text-[#6d28d9]">{verifiedCount}</strong>{" "}
                                                zweryf. ·{" "}
                                                <strong className="text-rose-700">{hallucinationCount}</strong>{" "}
                                                halucynacji
                                              </div>
                                            </div>
                                          </section>

                                          {/* Podsumowania 3 agentów debaty */}
                                          <section className="grid gap-3.5 lg:grid-cols-3">
                                                <div className="rounded-[2px] border border-gray-200 bg-[#f9fafb] p-3.5 text-xs">
                                                  <div className="font-bold text-[#374151]">
                                                    AI 1 (Adwokat) — podsumowanie
                                                  </div>
                                                    <p className="mt-1.5 leading-relaxed text-gray-600">
                                                      {evaluation.advocateReport.podsumowanie_decyzji}
                                                    </p>
                                                </div>
                                                    <div className="rounded-[2px] border border-gray-200 bg-[#f9fafb] p-3.5 text-xs">
                                                      <div className="font-bold text-rose-800">
                                                        AI 2 (Sceptyk) — podsumowanie
                                                      </div>
                                                        <p className="mt-1.5 leading-relaxed text-gray-600">
                                                          {evaluation.skepticReport.podsumowanie_decyzji}
                                                        </p>
                                                    </div>
                                                        <div className="rounded-[2px] border border-purple-200 bg-purple-50/40 p-3.5 text-xs">
                                                          <div className="font-bold text-[#5b21b6]">
                                                            AI 3 (Arbiter) — ostateczny werdykt
                                                          </div>
                                                            <p className="mt-1.5 leading-relaxed text-gray-800">
                                                              {evaluation.arbiterReport.podsumowanie_decyzji}
                                                            </p>
                                                        </div>
                                                      </section>

                                                      {/* 5 KATEGORII I 15 PODKATEGORII — PORÓWNANIE AI 1 vs AI 2 vs AI 3 */}
                                                      <section className="space-y-3">
                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                          <div>
                                                              <h3 className="text-base font-bold text-[#374151]">
                                                                Macierz 5 kategorii (po 20%) i 15 podkategorii — debata AI 1 / AI
                                                                2 / AI 3
                                                              </h3>
                                                                <p className="text-xs text-gray-500">
                                                                  Każda kategoria C_i wyliczana jest deterministycznie jako średnia
                                                                  3 podkategorii Arbitra (p_i,1 + p_i,2 + p_i,3) / 3.
                                                                </p>
                                                              </div>
                                                              <div className="flex gap-2 text-xs">
                                                                <button
                                                                  type="button"
                                                                  onClick={() => expandAll(true)}
                                                                  className="rounded-[2px] border border-gray-300 bg-white px-2.5 py-1 font-semibold text-gray-700 hover:bg-gray-50"
                                                                >
                                                                  Rozwiń wszystkie
                                                                </button>
                                                                <button
                                                                  type="button"
                                                                  onClick={() => expandAll(false)}
                                                                  className="rounded-[2px] border border-gray-300 bg-white px-2.5 py-1 font-semibold text-gray-700 hover:bg-gray-50"
                                                                >
                                                                  Zwiń wszystkie
                                                                </button>
                                                              </div>
                                                          </div>

                                                          <div className="space-y-2.5">
                                                            {CATEGORY_METADATA.map((cat) => {
                                                              const isOpen = !!openCategories[cat.key];
                                                              const avg = categoryAverages[cat.key] ?? 0;

                                                              return (
                                                                <div
                                                                  key={cat.key}
                                                                  className="overflow-hidden rounded-[2px] border border-gray-200 bg-white"
                                                                >
                                                                  <button
                                                                    type="button"
                                                                    onClick={() => toggleCategory(cat.key)}
                                                                    className="flex w-full items-center justify-between gap-3 bg-[#f9fafb] px-4 py-3 text-left hover:bg-purple-50/40"
                                                                  >
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <span className="rounded-[2px] bg-[#7c3aed] px-2 py-0.5 text-xs font-bold text-white">
                                                                          {cat.code}
                                                                        </span>
                                                                          <span className="text-sm font-bold text-[#374151]">
                                                                            {cat.label}
                                                                          </span>
                                                                            <span className="text-xs text-gray-500">
                                                                              (waga {cat.weight})
                                                                            </span>
                                                                          </div>
                                                                          <div className="flex items-center gap-3">
                                                                              <span className="rounded-[2px] bg-purple-100 px-2.5 py-0.5 text-xs font-extrabold tabular-nums text-[#5b21b6]">
                                                                                {avg.toFixed(2)} / 10 pkt
                                                                              </span>
                                                                              {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                                                                              ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                                                              )}
                                                                          </div>
                                                                        </button>

                                                                        {isOpen && (
                                                                            <div className="divide-y divide-gray-100">
                                                                              {cat.subcategories.map((sub) => {
                                                                                const advSub = (
                                                                                  evaluation.advocateReport.oceny_podkategorii[
                                                                                  cat.key
                                                                                  ] as Record<
                                                                                    string,
                                                                                    { punkty: number; uzasadnienie: string }
                                                                                  >
                                                                                )[sub.key];
                                                                                const skepSub = (
                                                                                  evaluation.skepticReport.oceny_podkategorii[
                                                                                  cat.key
                                                                                  ] as Record<
                                                                                    string,
                                                                                    { punkty: number; uzasadnienie: string }
                                                                                  >
                                                                                )[sub.key];
                                                                                const arbSub = (
                                                                                  evaluation.arbiterReport.oceny_podkategorii[
                                                                                  cat.key
                                                                                  ] as Record<
                                                                                    string,
                                                                                    { punkty: number; uzasadnienie: string }
                                                                                  >
                                                                                )[sub.key];

                                                                                return (
                                                                                  <div key={sub.key} className="p-4">
                                                                                    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                                                                                        <h4 className="text-xs font-bold text-[#374151] sm:text-sm">
                                                                                          {sub.label}
                                                                                        </h4>
                                                                                        <div className="flex items-center gap-2 text-xs tabular-nums">
                                                                                            <span className="rounded-[2px] bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">
                                                                                              Adwokat: {advSub?.punkty ?? "-"}/10
                                                                                            </span>
                                                                                              <span className="rounded-[2px] bg-rose-50 px-2 py-0.5 font-semibold text-rose-800">
                                                                                                Sceptyk: {skepSub?.punkty ?? "-"}/10
                                                                                              </span>
                                                                                                <span className="rounded-[2px] bg-[#7c3aed] px-2.5 py-0.5 font-bold text-white">
                                                                                                  Arbiter: {arbSub?.punkty ?? "-"}/10
                                                                                                </span>
                                                                                              </div>
                                                                                            </div>

                                                                                            <div className="grid gap-2.5 text-xs lg:grid-cols-3">
                                                                                                  <div className="rounded-[2px] border border-gray-200 bg-[#f9fafb] p-2.5">
                                                                                                    <div className="font-semibold text-[#374151]">
                                                                                                      AI 1 · Adwokat
                                                                                                    </div>
                                                                                                      <p className="mt-1 leading-relaxed text-gray-600">
                                                                                                        {advSub?.uzasadnienie}
                                                                                                      </p>
                                                                                                  </div>
                                                                                                      <div className="rounded-[2px] border border-rose-100 bg-rose-50/30 p-2.5">
                                                                                                        <div className="font-semibold text-rose-800">
                                                                                                          AI 2 · Sceptyk
                                                                                                        </div>
                                                                                                          <p className="mt-1 leading-relaxed text-gray-600">
                                                                                                            {skepSub?.uzasadnienie}
                                                                                                          </p>
                                                                                                      </div>
                                                                                                          <div className="rounded-[2px] border border-purple-200 bg-purple-50/40 p-2.5">
                                                                                                            <div className="font-semibold text-[#5b21b6]">
                                                                                                              AI 3 · Arbiter (werdykt)
                                                                                                            </div>
                                                                                                              <p className="mt-1 leading-relaxed text-gray-800">
                                                                                                                {arbSub?.uzasadnienie}
                                                                                                              </p>
                                                                                                          </div>
                                                                                                        </div>
                                                                                                      </div>
                                                                                                      );
                    })}
                                                                                                    </div>
                )}
                                                                                                  </div>
                                                                                                  );
          })}
                                                                                                </div>
                                                                                              </section>

                                                                                              {/* TABELA KOSZTÓW PERT */}
                                                                                                <section className="rounded-[2px] border border-gray-200 bg-[#f9fafb] p-4 sm:p-5">
                                                                                                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                                                                      <h3 className="text-sm font-bold text-[#374151]">
                                                                                                        Deterministyczna kalkulacja kosztów metodą PERT
                                                                                                      </h3>
                                                                                                        <span className="font-mono text-xs text-gray-500">
                                                                                                          K_ost = (K_AI1 + 4 × K_AI3 + K_AI2) / 6
                                                                                                        </span>
                                                                                                      </div>

                                                                                                      <div className="mt-3 overflow-x-auto">
                                                                                                        <table className="w-full min-w-[640px] border-collapse text-left text-xs">
                                                                                                          <thead>
                                                                                                              <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500">
                                                                                                                <th className="py-2 pr-3">Etap wdrożenia</th>
                                                                                                                <th className="py-2 pr-3">AI 1 · Adwokat (Optymistyczny)</th>
                                                                                                                <th className="py-2 pr-3">AI 3 · Arbiter (Realistyczny ×4)</th>
                                                                                                                <th className="py-2 pr-3">AI 2 · Sceptyk (Pesymistyczny)</th>
                                                                                                                  <th className="py-2 text-right font-bold text-[#6d28d9]">
                                                                                                                    Wynik PERT
                                                                                                                  </th>
                                                                                                              </tr>
                                                                                                          </thead>
                                                                                                            <tbody className="divide-y divide-gray-200/80 bg-white">
                                                                                                              <tr>
                                                                                                                  <td className="px-2 py-3 font-semibold text-[#374151]">
                                                                                                                    Budowa MVP (K_MVP)
                                                                                                                  </td>
                                                                                                                    <td className="py-3 pr-3 tabular-nums text-gray-700">
                                                                                                                      <div className="font-bold">
                                                                                                                        {formatPln(evaluation.advocateReport.koszty_pln.koszt_mvp)}
                                                                                                                      </div>
                                                                                                                        <div className="mt-0.5 text-[11px] text-gray-500">
                                                                                                                          {evaluation.advocateReport.koszty_pln.uzasadnienie_mvp}
                                                                                                                        </div>
                                                                                                                    </td>
                                                                                                                      <td className="py-3 pr-3 tabular-nums text-[#5b21b6]">
                                                                                                                        <div className="font-bold">
                                                                                                                          {formatPln(evaluation.arbiterReport.koszty_pln.koszt_mvp)}
                                                                                                                        </div>
                                                                                                                          <div className="mt-0.5 text-[11px] text-gray-500">
                                                                                                                            {evaluation.arbiterReport.koszty_pln.uzasadnienie_mvp}
                                                                                                                          </div>
                                                                                                                      </td>
                                                                                                                      <td className="py-3 pr-3 tabular-nums text-rose-800">
                                                                                                                        <div className="font-bold">
                                                                                                                          {formatPln(evaluation.skepticReport.koszty_pln.koszt_mvp)}
                                                                                                                        </div>
                                                                                                                          <div className="mt-0.5 text-[11px] text-gray-500">
                                                                                                                            {evaluation.skepticReport.koszty_pln.uzasadnienie_mvp}
                                                                                                                          </div>
                                                                                                                      </td>
                                                                                                                        <td className="px-2 py-3 text-right text-sm font-extrabold tabular-nums text-[#5b21b6]">
                                                                                                                          {formatPln(evaluation.pertMvpCostPln)}
                                                                                                                        </td>
                                                                                                                      </tr>

                                                                                                                      <tr>
                                                                                                                          <td className="px-2 py-3 font-semibold text-[#374151]">
                                                                                                                            Wdrożenie pilotażowe (K_PILOT)
                                                                                                                          </td>
                                                                                                                            <td className="py-3 pr-3 tabular-nums text-gray-700">
                                                                                                                              <div className="font-bold">
                                                                                                                                {formatPln(
                                                                                                                                  evaluation.advocateReport.koszty_pln.koszt_pilotazu
                                                                                                                                )}
                                                                                                                              </div>
                                                                                                                                <div className="mt-0.5 text-[11px] text-gray-500">
                                                                                                                                  {evaluation.advocateReport.koszty_pln.uzasadnienie_pilotazu}
                                                                                                                                </div>
                                                                                                                            </td>
                                                                                                                              <td className="py-3 pr-3 tabular-nums text-[#5b21b6]">
                                                                                                                                <div className="font-bold">
                                                                                                                                  {formatPln(
                                                                                                                                    evaluation.arbiterReport.koszty_pln.koszt_pilotazu
                                                                                                                                  )}
                                                                                                                                </div>
                                                                                                                                  <div className="mt-0.5 text-[11px] text-gray-500">
                                                                                                                                    {evaluation.arbiterReport.koszty_pln.uzasadnienie_pilotazu}
                                                                                                                                  </div>
                                                                                                                              </td>
                                                                                                                              <td className="py-3 pr-3 tabular-nums text-rose-800">
                                                                                                                                <div className="font-bold">
                                                                                                                                  {formatPln(
                                                                                                                                    evaluation.skepticReport.koszty_pln.koszt_pilotazu
                                                                                                                                  )}
                                                                                                                                </div>
                                                                                                                                  <div className="mt-0.5 text-[11px] text-gray-500">
                                                                                                                                    {evaluation.skepticReport.koszty_pln.uzasadnienie_pilotazu}
                                                                                                                                  </div>
                                                                                                                              </td>
                                                                                                                                <td className="px-2 py-3 text-right text-sm font-extrabold tabular-nums text-[#5b21b6]">
                                                                                                                                  {formatPln(evaluation.pertPilotCostPln)}
                                                                                                                                </td>
                                                                                                                              </tr>

                                                                                                                                <tr className="bg-purple-50/70">
                                                                                                                                  <td
                                                                                                                                    colSpan={4}
                                                                                                                                    className="px-2 py-3 font-bold text-[#374151]"
                                                                                                                                  >
                                                                                                                                    Całkowity koszt urealniony (K_calk = K_MVP_ost + K_PILOT_ost)
                                                                                                                                    względem limitu B_limit ={" "}
                                                                                                                                    {formatPln(evaluation.budgetLimitSnapshotPln)}
                                                                                                                                  </td>
                                                                                                                                    <td className="px-2 py-3 text-right text-base font-extrabold tabular-nums text-[#5b21b6]">
                                                                                                                                      {formatPln(evaluation.totalPertCostPln)}
                                                                                                                                    </td>
                                                                                                                                </tr>
                                                                                                                              </tbody>
                                                                                                                            </table>
                                                                                                                          </div>
                                                                                                                        </section>

                                                                                                                        {/* ZWERYFIKOWANE PODOBNE PROBLEMY I DZIENNIK AI 4 (FAST-CHECK) */}
                                                                                                                          <section className="space-y-3 rounded-[2px] border border-gray-200 bg-white p-4 sm:p-5">
                                                                                                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                                                                                              <div>
                                                                                                                                  <h3 className="text-sm font-bold text-[#374151]">
                                                                                                                                    Zweryfikowane podobne problemy referencyjne (≥ 5 źródeł) i audyt
                                                                                                                                    AI 4 (Fast-Check)
                                                                                                                                  </h3>
                                                                                                                                    <p className="text-xs text-gray-500">
                                                                                                                                      Wszystkie linki przekazane do Arbitra przeszły weryfikację HTTP i
                                                                                                                                      antyhalucynacyjną przez AI 4.
                                                                                                                                    </p>
                                                                                                                                  </div>
                                                                                                                                  <div className="flex flex-wrap items-center gap-2 text-xs">
                                                                                                                                      <span className="rounded-[2px] bg-purple-100 px-2.5 py-1 font-bold text-[#5b21b6]">
                                                                                                                                        Zweryfikowane: {verifiedCount}
                                                                                                                                      </span>
                                                                                                                                        <span className="rounded-[2px] bg-rose-100 px-2.5 py-1 font-bold text-rose-800">
                                                                                                                                          Odrzucone HALUCYNACJE: {hallucinationCount}
                                                                                                                                        </span>
                                                                                                                                      </div>
                                                                                                                                  </div>

                                                                                                                                  <div className="space-y-2.5">
                                                                                                                                    {evaluation.arbiterReport.podobne_problemy.map((prob, idx) => {
                                                                                                                                      const log = logByUrl.get(prob.link_url);
                                                                                                                                      const status: VerifierStatus = log?.status ?? "ZWERYFIKOWANY";
                                                                                                                                      const addressed = prob.czy_zaadresowany_w_projekcie === true;

                                                                                                                                      return (
                                                                                                                                        <div
                                                                                                                                          key={`${prob.link_url}-${idx}`}
                                                                                                                                          className="rounded-[2px] border border-gray-200 bg-[#f9fafb] p-3.5 text-xs"
                                                                                                                                        >
                                                                                                                                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                                                                                                            <div className="space-y-1">
                                                                                                                                              <div className="flex flex-wrap items-center gap-2">
                                                                                                                                                  <span className="font-bold text-[#374151]">
                                                                                                                                                    {idx + 1}. {prob.nazwa_projektu}
                                                                                                                                                  </span>
                                                                                                                                                  <span
                                                                                                                                                    className={`rounded-[2px] border px-2 py-0.5 text-[10px] font-bold ${verifierStatusBadge(status)}`}
                                                                                                                                                  >
                                                                                                                                                    AI 4: {status}
                                                                                                                                                  </span>
                                                                                                                                                  {prob.czy_krytyczny && (
                        <span className="inline-flex items-center gap-1 rounded-[2px] bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                          <AlertTriangle className="h-3 w-3" />
                          Problem krytyczny
                        </span>
                      )}
                    </div>

                    <a
                      href={prob.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 break-all font-medium text-[#7c3aed] underline hover:text-[#5b21b6]"
                    >
                      <span>{prob.link_url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>

                                                                                                                                              <div className="shrink-0">
                                                                                                                                                {addressed ? (
                      <span className="inline-flex items-center gap-1 rounded-[2px] bg-purple-100 px-2.5 py-1 text-[11px] font-bold text-[#5b21b6]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Zaadresowany: Tak
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-[2px] bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-900">
                        <XCircle className="h-3.5 w-3.5" />
                        Zaadresowany: Nie — Ryzyko
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-[2px] border border-gray-200 bg-white p-2.5">
                    <span className="font-semibold text-gray-600">
                      Zidentyfikowany problem:
                    </span>{" "}
                    <span className="text-gray-800">{prob.opis_problemu}</span>
                  </div>
                  <div className="rounded-[2px] border border-gray-200 bg-white p-2.5">
                    <span className="font-semibold text-gray-600">
                      Sposób rozwiązania w referencji:
                    </span>{" "}
                    <span className="text-gray-800">{prob.jak_rozwiazano}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pełny dziennik AI 4 z odrzuconymi halucynacjami */}
                                                                                                                                                <div className="pt-2">
                                                                                                                                                  <button
                                                                                                                                                    type="button"
                                                                                                                                                    onClick={() => setShowFullVerifierLog((prev) => !prev)}
                                                                                                                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7c3aed] hover:underline"
                                                                                                                                                  >
                                                                                                                                                    <span>
                                                                                                                                                      {showFullVerifierLog ? "Ukryj" : "Pokaż"} pełny dziennik
                                                                                                                                                      weryfikacji AI 4 ({logs.length} sprawdzonych linków, w tym
                                                                                                                                                      odrzucone halucynacje)
                                                                                                                                                    </span>
                                                                                                                                                    {showFullVerifierLog ? (
                                                                                                                                                      <ChevronUp className="h-4 w-4" />
                                                                                                                                                    ) : (
                                                                                                                                                      <ChevronDown className="h-4 w-4" />
                                                                                                                                                    )}
                                                                                                                                                  </button>

                                                                                                                                                  {showFullVerifierLog && (
                                                                                                                                                      <div className="mt-2.5 space-y-2 rounded-[2px] border border-gray-200 bg-[#f9fafb] p-3 text-xs">
                                                                                                                                                        {logs.map((log, idx) => (
                                                                                                                                                          <div
                                                                                                                                                            key={`${log.link_url}-${idx}`}
                                                                                                                                                            className="flex flex-col gap-1 rounded-[2px] border border-gray-200 bg-white p-2.5 sm:flex-row sm:items-center sm:justify-between"
                                                                                                                                                          >
                                                                                                                                                            <div className="space-y-0.5">
                                                                                                                                                              <div className="flex flex-wrap items-center gap-2">
                                                                                                                                                                <span
                                                                                                                                                                  className={`rounded-[2px] border px-2 py-0.5 text-[10px] font-bold ${verifierStatusBadge(log.status)}`}
                                                                                                                                                                >
                                                                                                                                                                  {log.status}
                                                                                                                                                                </span>
                                                                                                                                                                {log.zrodlo_agenta && (
                                                                                                                                                                    <span className="rounded-[2px] bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                                                                                                                                                                      Źródło: {log.zrodlo_agenta}
                                                                                                                                                                    </span>
                      )}
                                                                                                                                                                      <span className="font-mono text-[11px] text-gray-600">
                                                                                                                                                                        Zgodność: {log.zgodnosc_nazwy_i_opisu_procent}%
                                                                                                                                                                      </span>
                                                                                                                                                                    </div>
                                                                                                                                                                      <div className="break-all font-medium text-gray-800">
                                                                                                                                                                        {log.link_url}
                                                                                                                                                                      </div>
                                                                                                                                                                      <p className="text-gray-600">{log.krotkie_uzasadnienie}</p>
                                                                                                                                                                    </div>
                                                                                                                                                                  </div>
                                                                                                                                                                ))}
                                                                                                                                                              </div>
          )}
                                                                                                                                                            </div>
                                                                                                                                                          </section>
    </div>
                                                                                                                                                      );
}
