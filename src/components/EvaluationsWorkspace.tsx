"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Scale,
  Play,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  Database,
  FileEdit,
  Eye,
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
    title: "2. AI 4 Weryfikator Źródeł (Fast-Check URL)",
    desc: "Pobranie HTTP z ochroną SSRF, odrzucenie halucynacji i zebranie ≥ 5 realnych źródeł",
  },
  {
    step: 3,
    title: "3. AI 3 Arbiter (Sędzia)",
    desc: "Bezstronny werdykt punktowy i weryfikacja zaadresowania ryzyk krytycznych",
  },
  {
    step: 4,
    title: "4. Wzory PERT, Ryzyko i Routing Budżetowy",
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
    badgeColor: "bg-emerald-100 text-emerald-900",
  },
  {
    key: "TABELA_DRUGORZEDNA",
    label: "Tabela Drugorzędna",
    rule: "S_total ≥ 25 pkt oraz K_calk > 1,20 × B_max — silne merytorycznie, do grantów zewnętrznych",
    badgeColor: "bg-amber-100 text-amber-900",
  },
  {
    key: "ARCHIWUM_ODRZUCONE",
    label: "Archiwum / Odrzucone",
    rule: "S_total < 25 pkt — wymaga rewizji koncepcji lub narusza kryteria jakości",
    badgeColor: "bg-rose-100 text-rose-900",
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

  // Stan formularza uruchamiania debaty
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
    <div className="space-y-6">
      {/* Nagłówek i bieżący próg budżetowy */}
      <section className="radar-hero-bg rounded-3xl p-6 text-white shadow-lg sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-violet-100">
              <Scale className="h-3.5 w-3.5" />
              <span>System Wieloagentowej Oceny Projektów („Oceny AI”)</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Debata 4 AI · Kalkulacja PERT · Routing Budżetowy
            </h1>
            <p className="text-sm text-violet-100/90">
              AI 1 (Adwokat) + AI 2 (Sceptyk) → AI 4 (Weryfikator Źródeł
              Fast-Check) → AI 3 (Arbiter) → deterministyczne wzory TypeScript.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-xs backdrop-blur-xs">
            <div className="text-violet-200">Aktualny budżet instytucji</div>
            <div className="mt-1 text-lg font-extrabold tabular-nums">
              B_max = {formatPln(budget.maxBudgetPln)}
            </div>
            <div className="mt-0.5 font-semibold text-emerald-300 tabular-nums">
              Próg 120% (B_limit) = {formatPln(budget.budgetLimitPln)}
            </div>
            <Link
              href="/admin"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-white underline decoration-violet-300 hover:text-violet-100"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Zmień B_max w Panelu Administratora</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Formularz uruchamiania nowej Debaty 4 AI */}
      <section className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Uruchom nową Ocenę Wieloagentową (Debata 4 AI)
            </h2>
            <p className="text-xs text-slate-500">
              Oceń istniejącą innowację z bazy OSINT lub wklej opis dowolnej
              koncepcji projektu do pełnego audytu.
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setInputMode("existing")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                inputMode === "existing"
                  ? "bg-[#4C1D95] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-violet-50"
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>Innowacja z bazy OSINT</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode("custom")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                inputMode === "custom"
                  ? "bg-[#4C1D95] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-violet-50"
              }`}
            >
              <FileEdit className="h-3.5 w-3.5" />
              <span>Własna koncepcja projektu</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleRunEvaluation} className="mt-4 space-y-4">
          {inputMode === "existing" ? (
            <div>
              <label
                htmlFor="eval-innovation-select"
                className="block text-xs font-semibold text-slate-700"
              >
                Wybierz innowację z bazy OPEN TRACE
              </label>
              <select
                id="eval-innovation-select"
                value={selectedInnovationId}
                onChange={(e) => setSelectedInnovationId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-violet-200"
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
                  className="block text-xs font-semibold text-slate-700"
                >
                  Tytuł projektu
                </label>
                <input
                  id="eval-custom-title"
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="np. Gminny system wczesnego wykrywania awarii oświetlenia ulicznego LED"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
              <div>
                <label
                  htmlFor="eval-custom-desc"
                  className="block text-xs font-semibold text-slate-700"
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
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
            </div>
          )}

          {/* 4-etapowy wskaźnik postępu Debaty 4 AI */}
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {DEBATE_STEPS.map((s) => {
              const isDone =
                (!running && activeStep === 4) ||
                (running && activeStep > s.step);
              const isCurrent = running && activeStep === s.step;
              return (
                <div
                  key={s.step}
                  className={`rounded-xl border p-3 text-xs transition ${
                    isCurrent
                      ? "border-[#6D28D9] bg-violet-50 ring-1 ring-[#6D28D9]"
                      : isDone
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-slate-200 bg-slate-50/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 font-bold text-slate-900">
                    <span>{s.title}</span>
                    {isCurrent && (
                      <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[#6D28D9]" />
                    )}
                    {isDone && (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-slate-600">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={running}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
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
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-[#6D28D9] bg-violet-50/70 shadow-sm ring-1 ring-[#6D28D9]"
                    : "border-slate-200 bg-slate-50/50 hover:border-violet-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {t.label}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold tabular-nums ${t.badgeColor}`}
                  >
                    {counts[t.key]}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-slate-600">
                  {t.rule}
                </p>
              </button>
            );
          })}
        </div>

        {/* Tabela projektów w wybranej zakładce */}
        {visibleEvaluations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-xs text-slate-500">
            Brak ocenionych projektów w kategorii{" "}
            <strong>{EVALUATION_TABLE_LABELS[activeTable]}</strong>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 pr-3">Projekt</th>
                  <th className="py-2.5 pr-3 text-right">Wynik S_total</th>
                  <th className="py-2.5 pr-3 text-right">Średnia / %</th>
                  <th className="py-2.5 pr-3 text-right">Koszt PERT (K_calk)</th>
                  <th className="py-2.5 pr-3 text-right">Ryzyko R_kryt</th>
                  <th className="py-2.5 text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleEvaluations.map((ev) => {
                  const isSelected = selectedEvaluation?.id === ev.id;
                  return (
                    <tr
                      key={ev.id}
                      onClick={() => setSelectedEvaluation(ev)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? "bg-violet-50/80"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="py-3 pr-3">
                        <div className="font-bold text-slate-900">
                          {ev.projectTitle}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          {new Date(ev.createdAt).toLocaleString("pl-PL")}
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-right font-extrabold tabular-nums text-[#4C1D95]">
                        {ev.totalScore.toFixed(2)} / 50
                      </td>
                      <td className="py-3 pr-3 text-right tabular-nums text-slate-700">
                        {ev.avgScore.toFixed(2)} ({ev.percentScore.toFixed(1)}%)
                      </td>
                      <td className="py-3 pr-3 text-right font-semibold tabular-nums text-slate-900">
                        {formatPln(ev.totalPertCostPln)}
                      </td>
                      <td className="py-3 pr-3 text-right font-bold tabular-nums">
                        <span
                          className={
                            ev.criticalRiskPercent >= 50
                              ? "text-rose-700"
                              : ev.criticalRiskPercent >= 25
                                ? "text-amber-700"
                                : "text-emerald-700"
                          }
                        >
                          {ev.criticalRiskPercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvaluation(ev);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-[#4C1D95] hover:bg-violet-200"
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
      </section>

      {/* Szczegółowy raport wybranej oceny */}
      {selectedEvaluation && (
        <EvaluationDetail evaluation={selectedEvaluation} showPermalink />
      )}
    </div>
  );
}
