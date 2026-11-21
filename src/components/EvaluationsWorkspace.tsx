"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Home,
  Scale,
  Play,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  Database,
  FileEdit,
  Eye,
  MoreHorizontal,
  Banknote,
} from "lucide-react";
import {
  EVALUATION_TABLE_LABELS,
  type AdminBudgetDTO,
  type EvaluationTable,
  type ProjectEvaluationDTO,
} from "@/types/evaluation";
import { EvaluationDetail } from "@/components/EvaluationDetail";

interface InnovationOption {
  id: string;
  title: string;
  institution: string | null;
  domain: string;
}

interface EvaluationsWorkspaceProps {
  initialEvaluations: ProjectEvaluationDTO[];
  initialBudget: AdminBudgetDTO;
  innovationOptions: InnovationOption[];
}

const DEBATE_STEPS = [
  {
    step: 1,
    title: "1. AI 1 Adwokat + AI 2 Sceptyk",
    desc: "Równoległa debata 15 podkategorii, kosztorys optymistyczny vs pesymistyczny i min. 5 referencji",
  },
  {
    step: 2,
    title: "2. AI 4 Weryfikator Źródeł (Fast-Check)",
    desc: "Pobranie HTTP z ochroną SSRF, odrzucenie halucynacji i zebranie ≥ 5 realnych źródeł",
  },
  {
    step: 3,
    title: "3. AI 3 Arbiter (Sędzia)",
    desc: "Bezstronny werdykt punktowy i weryfikacja zaadresowania ryzyk krytycznych",
  },
  {
    step: 4,
    title: "4. Wzory PERT, Ryzyko i Routing",
    desc: "Deterministyczne obliczenia TypeScript (C_i, S_total, PERT, R_kryt) i wybór tabeli",
  },
];

const TABLE_TABS: Array<{
  key: EvaluationTable;
  label: string;
  rule: string;
  badgeColor: string;
}> = [
{
  key: "TABELA_GLOWNA",
    label: "Tabela Główna",
      rule: "S_total ≥ 25 pkt oraz K_calk ≤ 1,20 × B_max — rekomendowane do budżetu głównego",
        badgeColor: "bg-[#7c3aed] text-white",
  },
{
  key: "TABELA_DRUGORZEDNA",
    label: "Tabela Drugorzędna",
      rule: "S_total ≥ 25 pkt oraz K_calk > 1,20 × B_max — silne merytorycznie, do grantów zewnętrznych",
        badgeColor: "bg-[#4b5563] text-white",
  },
{
  key: "ARCHIWUM_ODRZUCONE",
    label: "Archiwum / Odrzucone",
      rule: "S_total < 25 pkt — wymaga rewizji koncepcji lub narusza kryteria jakości",
        badgeColor: "bg-rose-600 text-white",
  },
];

function formatPln(val: number): string {
  return `${Math.round(val).toLocaleString("pl-PL")} PLN`;
}

export function EvaluationsWorkspace({
  initialEvaluations,
  initialBudget,
  innovationOptions,
}: EvaluationsWorkspaceProps) {
  const [evaluations, setEvaluations] =
    useState<ProjectEvaluationDTO[]>(initialEvaluations);
  const [budget] = useState<AdminBudgetDTO>(initialBudget);
  const [activeTable, setActiveTable] =
    useState<EvaluationTable>("TABELA_GLOWNA");
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<ProjectEvaluationDTO | null>(initialEvaluations[0] ?? null);

  const [inputMode, setInputMode] = useState<"existing" | "custom">("existing");
  const [selectedInnovationId, setSelectedInnovationId] = useState<string>(
    innovationOptions[0]?.id ?? ""
  );
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!running) return;
    setActiveStep(1);
    const t1 = setTimeout(() => setActiveStep(2), 900);
    const t2 = setTimeout(() => setActiveStep(3), 1800);
    const t3 = setTimeout(() => setActiveStep(4), 2700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [running]);

  const counts = useMemo(() => {
    const map: Record<EvaluationTable, number> = {
      TABELA_GLOWNA: 0,
      TABELA_DRUGORZEDNA: 0,
      ARCHIWUM_ODRZUCONE: 0,
    };
    for (const ev of evaluations) {
      map[ev.targetTable] = (map[ev.targetTable] || 0) + 1;
    }
    return map;
  }, [evaluations]);

  const visibleEvaluations = useMemo(
    () => evaluations.filter((ev) => ev.targetTable === activeTable),
    [evaluations, activeTable]
  );

  const handleRunEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const payload =
        inputMode === "existing"
          ? { innovationId: selectedInnovationId }
          : {
      title: customTitle.trim(),
        description: customDescription.trim(),
            };

    const res = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data.error || "Nie udało się przeprowadzić oceny wieloagentowej."
      );
    }

    const created = data.evaluation as ProjectEvaluationDTO;
    setActiveStep(4);
    setEvaluations((prev) => [created, ...prev]);
    setActiveTable(created.targetTable);
    setSelectedEvaluation(created);
    setInfoMsg(
      `Zakończono Debatę 4 AI dla projektu „${created.projectTitle}”. Wynik: ${created.totalScore.toFixed(2)}/50 pkt, PERT: ${formatPln(created.totalPertCostPln)} → ${EVALUATION_TABLE_LABELS[created.targetTable]}.`
    );
  } catch (err) {
    setErrorMsg(
      err instanceof Error
        ? err.message
        : "Wystąpił błąd podczas uruchamiania Debaty 4 AI."
    );
  } finally {
    setRunning(false);
  }
};

return (
      <div className="space-y-5">
        {/* Nagłówek i okruszki (Flat Able) */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[19px] font-semibold tracking-tight text-[#374151]">
              Oceny Wieloagentowe (Debata 4 AI)
            </h1>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
              <Link href="/" className="hover:text-[#7c3aed]">
                <Home className="h-3.5 w-3.5" />
              </Link>
              <span>/</span>
              <span className="font-medium text-gray-600">
                Oceny Wieloagentowe · Kalkulacja PERT · Routing Budżetowy
              </span>
            </div>
          </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-[2px] border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] hover:border-[#7c3aed] hover:text-[#7c3aed]"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#7c3aed]" />
          <span>
            B_max: {formatPln(budget.maxBudgetPln)} · Limit 120%:{" "}
            {formatPln(budget.budgetLimitPln)}
          </span>
        </Link>
      </div>

        {/* Górne split-icon banery w stylu Flat Able */}
        <section className="grid gap-5 md:grid-cols-3">
          <div className="flex overflow-hidden rounded-[2px] bg-[#7c3aed] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
            <div className="flex w-16 shrink-0 items-center justify-center bg-[#5b21b6]">
              <Scale className="h-6 w-6" />
            </div>
            <div className="px-4 py-3.5">
              <div className="text-xl font-bold tabular-nums">
                {counts.TABELA_GLOWNA}
              </div>
              <div className="text-xs text-purple-100">
                Projekty w Tabeli Głównej
              </div>
            </div>
          </div>

          <div className="flex overflow-hidden rounded-[2px] bg-[#4b5563] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
            <div className="flex w-16 shrink-0 items-center justify-center bg-[#374151]">
              <Banknote className="h-6 w-6 text-[#c4b5fd]" />
            </div>
            <div className="px-4 py-3.5">
              <div className="text-xl font-bold tabular-nums">
                {formatPln(budget.budgetLimitPln)}
              </div>
              <div className="text-xs text-gray-200">
                Aktualny próg 120% B_max
              </div>
            </div>
          </div>

        <div className="flex overflow-hidden rounded-[2px] bg-[#282c34] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
          <div className="flex w-16 shrink-0 items-center justify-center bg-[#1e2128]">
            <CheckCircle2 className="h-6 w-6 text-[#a78bfa]" />
          </div>
          <div className="px-4 py-3.5">
            <div className="text-xl font-bold tabular-nums">
              {evaluations.length}
            </div>
            <div className="text-xs text-gray-300">
              Łączna liczba debat 4 AI
            </div>
          </div>
        </div>
      </section>

            {/* Formularz uruchamiania nowej Debaty 4 AI */}
            <section id="nowa-debata" className="flat-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#374151]">
                    Uruchom nową Ocenę Wieloagentową (Debata 4 AI)
                  </h2>
                  <p className="text-xs text-gray-500">
                    Oceń istniejącą innowację z bazy OSINT lub wklej opis dowolnej
                    koncepcji projektu.
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setInputMode("existing")}
                    className={`inline-flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-xs font-semibold ${inputMode === "existing"
                        ? "bg-[#7c3aed] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-purple-50"
                      }`}
                  >
                    <Database className="h-3.5 w-3.5" />
                    <span>Innowacja z bazy OSINT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("custom")}
                    className={`inline-flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-xs font-semibold ${inputMode === "custom"
                        ? "bg-[#7c3aed] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-purple-50"
                      }`}
                  >
              <FileEdit className="h-3.5 w-3.5" />
              <span>Własna koncepcja projektu</span>
            </button>
          </div>
        </div>

          <form onSubmit={handleRunEvaluation} className="space-y-4 p-5">
            {inputMode === "existing" ? (
              <div>
                <label
                  htmlFor="eval-innovation-select"
                  className="block text-xs font-semibold text-gray-700"
                >
                  Wybierz innowację z bazy OPEN TRACE
                </label>
                <select
                  id="eval-innovation-select"
                  value={selectedInnovationId}
                  onChange={(e) => setSelectedInnovationId(e.target.value)}
                  className="mt-1.5 w-full rounded-[2px] border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#7c3aed] focus:outline-none"
                >
                  {innovationOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      [{opt.domain}] {opt.title}
                      {opt.institution ? ` — ${opt.institution}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="eval-custom-title"
                    className="block text-xs font-semibold text-gray-700"
                  >
                    Tytuł projektu
                  </label>
                  <input
                    id="eval-custom-title"
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="np. Gminny system wczesnego wykrywania awarii oświetlenia ulicznego LED"
                    className="mt-1 w-full rounded-[2px] border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#7c3aed] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="eval-custom-desc"
                    className="block text-xs font-semibold text-gray-700"
                  >
                    Opis koncepcji, problemu, rozwiązania, grupy docelowej i
                    zakładanych efektów (min. 30 znaków)
                  </label>
                  <textarea
                    id="eval-custom-desc"
                    rows={4}
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Opisz problem, sposób realizacji MVP i pilotażu, kwestie RODO/prawne oraz mierzalne wskaźniki KPI..."
                    className="mt-1 w-full rounded-[2px] border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#7c3aed] focus:outline-none"
                  />
                </div>
              </div>
            )}

          {/* 4-etapowy wskaźnik postępu Debaty 4 AI */ }
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {DEBATE_STEPS.map((s) => {
                    const isDone =
                      (!running && activeStep === 4) ||
                      (running && activeStep > s.step);
                    const isCurrent = running && activeStep === s.step;
                    return (
                      <div
                        key={s.step}
                        className={`rounded-[2px] border p-3 text-xs transition ${isCurrent
                            ? "border-[#7c3aed] bg-purple-50"
                            : isDone
                              ? "border-purple-200 bg-purple-50/40"
                              : "border-gray-200 bg-[#f9fafb]"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-1 font-bold text-[#374151]">
                          <span>{s.title}</span>
                          {isCurrent && (
                            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#7c3aed]" />
                          )}
                          {isDone && (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#7c3aed]" />
                          )}
                        </div>
                        <p className="mt-1 text-[11px] leading-snug text-gray-500">
                          {s.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {
                  errorMsg && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-[2px] border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )
                }

                {
                  infoMsg && (
                    <div
                      role="status"
                      className="flex items-start gap-2 rounded-[2px] border border-purple-200 bg-purple-50 p-3 text-xs font-medium text-[#5b21b6]"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7c3aed]" />
                      <span>{infoMsg}</span>
                    </div>
                  )
                }

                <button
                  type="submit"
                  disabled={running}
                  className="inline-flex items-center gap-2 rounded-[2px] bg-[#7c3aed] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                >
                  {running ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Trwa Debata 4 AI i weryfikacja linków...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Uruchom Debatę 4 AI</span>
                    </>
                  )}
                </button>
        </form>
      </section>

      {/* 3 TABELE ROUTINGU BUDŻETOWEGO */}
      <section className="flat-card">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-[#374151]">
            Tabele routingu budżetowego (3 klasyfikacje)
          </h2>
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-3">
            {TABLE_TABS.map((t) => {
              const active = activeTable === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setActiveTable(t.key);
                    const firstInTab = evaluations.find(
                      (ev) => ev.targetTable === t.key
                    );
                    if (firstInTab) setSelectedEvaluation(firstInTab);
                  }}
                  className={`rounded-[2px] border p-4 text-left transition ${active
                      ? "border-[#7c3aed] bg-purple-50/60"
                      : "border-gray-200 bg-[#f9fafb] hover:border-purple-200 hover:bg-white"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#374151]">
                      {t.label}
                    </span>
                    <span
                      className={`rounded-[2px] px-2 py-0.5 text-xs font-bold tabular-nums ${t.badgeColor}`}
                    >
                      {counts[t.key]}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-snug text-gray-500">
                    {t.rule}
                  </p>
                </button>
              );
            })}
          </div>

          {visibleEvaluations.length === 0 ? (
            <div className="rounded-[2px] border border-dashed border-gray-300 py-8 text-center text-xs text-gray-500">
              Brak ocenionych projektów w kategorii{" "}
              <strong>{EVALUATION_TABLE_LABELS[activeTable]}</strong>.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#f9fafb] text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    <th className="py-2.5 pl-3 pr-3">Projekt</th>
                    <th className="py-2.5 pr-3 text-right">Wynik S_total</th>
                    <th className="py-2.5 pr-3 text-right">Średnia / %</th>
                    <th className="py-2.5 pr-3 text-right">
                      Koszt PERT (K_calk)
                    </th>
                    <th className="py-2.5 pr-3 text-right">Ryzyko R_kryt</th>
                    <th className="py-2.5 pr-3 text-right">Akcja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleEvaluations.map((ev) => {
                    const isSelected = selectedEvaluation?.id === ev.id;
                    return (
                      <tr
                        key={ev.id}
                        onClick={() => setSelectedEvaluation(ev)}
                        className={`cursor-pointer transition ${isSelected ? "bg-purple-50/70" : "hover:bg-gray-50"
                          }`}
                      >
                        <td className="py-3 pl-3 pr-3">
                          <div className="font-semibold text-[#374151]">
                            {ev.projectTitle}
                          </div>
                          <div className="mt-0.5 text-[11px] text-gray-400">
                            {new Date(ev.createdAt).toLocaleString("pl-PL")}
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-right font-bold tabular-nums text-[#6d28d9]">
                          {ev.totalScore.toFixed(2)} / 50
                        </td>
                        <td className="py-3 pr-3 text-right tabular-nums text-gray-600">
                          {ev.avgScore.toFixed(2)} ({ev.percentScore.toFixed(1)}
                          %)
                        </td>
                        <td className="py-3 pr-3 text-right font-semibold tabular-nums text-[#374151]">
                          {formatPln(ev.totalPertCostPln)}
                        </td>
                        <td className="py-3 pr-3 text-right font-bold tabular-nums">
                          <span
                            className={
                              ev.criticalRiskPercent >= 50
                                ? "text-rose-700"
                                : ev.criticalRiskPercent >= 25
                                  ? "text-amber-700"
                                  : "text-[#6d28d9]"
                            }
                          >
                            {ev.criticalRiskPercent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvaluation(ev);
                            }}
                            className="inline-flex items-center gap-1 rounded-[2px] bg-[#7c3aed] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#6d28d9]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Raport</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Szczegółowy raport wybranej oceny */}
      {selectedEvaluation && (
        <EvaluationDetail evaluation={selectedEvaluation} showPermalink />
      )}
    </div>
    );
}
