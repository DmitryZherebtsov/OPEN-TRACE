"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  SlidersHorizontal,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ArrowUpRight,
  Banknote,
  MoreHorizontal,
} from "lucide-react";
import {
  EVALUATION_TABLE_LABELS,
  type AdminBudgetDTO,
  type EvaluationTable,
} from "@/types/evaluation";

interface BudgetProjectRow {
  id: string;
  projectTitle: string;
  totalScore: number;
  totalPertCostPln: number;
  targetTable: EvaluationTable;
  criticalRiskPercent: number;
}

interface MovedProjectInfo {
  id: string;
  projectTitle: string;
  totalScore: number;
  totalPertCostPln: number;
  fromTable: EvaluationTable;
  toTable: EvaluationTable;
}

function formatPln(val: number): string {
  return `${Math.round(val).toLocaleString("pl-PL")} PLN`;
}

function tableBadge(table: EvaluationTable) {
  if (table === "TABELA_GLOWNA") {
    return "bg-[#7c3aed] text-white";
  }
  if (table === "TABELA_DRUGORZEDNA") {
    return "bg-[#4b5563] text-white";
  }
  return "bg-rose-600 text-white";
}

export default function AdminBudgetPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budget, setBudget] = useState<AdminBudgetDTO | null>(null);
  const [maxBudgetInput, setMaxBudgetInput] = useState<string>("250000");
  const [projects, setProjects] = useState<BudgetProjectRow[]>([]);
  const [movedProjects, setMovedProjects] = useState<MovedProjectInfo[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadBudget = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/budget");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Nie udało się pobrać ustawień budżetu.");
      }
      setBudget(data.budget);
      setMaxBudgetInput(String(data.budget.maxBudgetPln));
      setProjects(data.projects || []);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Błąd odczytu ustawień budżetu."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBudget();
  }, []);

  const parsedBudget = Number(maxBudgetInput);
  const multiplier = budget?.toleranceMultiplier ?? 1.2;
  const liveLimitPln =
    !Number.isNaN(parsedBudget) && parsedBudget > 0
      ? parsedBudget * multiplier
      : 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setStatusMessage(null);
    setMovedProjects([]);

    try {
      const numeric = Number(maxBudgetInput);
      if (Number.isNaN(numeric) || numeric < 10_000) {
        throw new Error(
          "Podaj poprawną kwotę maksymalnego budżetu B_max (minimum 10 000 PLN)."
        );
      }

      const res = await fetch("/api/admin/budget", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxBudgetPln: numeric }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "Nie udało się zapisać nowej wartości budżetu B_max."
        );
      }

      setBudget(data.budget);
      setProjects(data.projects || []);
      setMovedProjects(data.movedProjects || []);
      setStatusMessage(
        `Zaktualizowano B_max do ${formatPln(data.budget.maxBudgetPln)} (limit 120%: ${formatPln(data.budget.budgetLimitPln)}). Automatycznie przeliczono ${data.recalculatedCount} projektów.`
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Błąd zapisu budżetu B_max."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
          <div className="space-y-5">
            {/* Okruszki i nagłówek (Flat Able) */}
            <div>
              <h1 className="text-[19px] font-semibold tracking-tight text-[#374151]">
                Panel Administratora — Konfiguracja Budżetu B_max
              </h1>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                <Link href="/" className="hover:text-[#7c3aed]">
                  <Home className="h-3.5 w-3.5" />
                </Link>
                <span>/</span>
                <span className="font-medium text-gray-600">
                  Administracja · Limit 120% i automatyczny routing tabel
                </span>
              </div>
            </div>

            {/* Górne split-icon banery */}
            <section className="grid gap-5 md:grid-cols-2">
              <div className="flex overflow-hidden rounded-[2px] bg-[#7c3aed] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                <div className="flex w-20 shrink-0 items-center justify-center bg-[#5b21b6]">
                  <SlidersHorizontal className="h-7 w-7" />
                </div>
                <div className="flex flex-col justify-center px-5 py-4">
                  <div className="text-2xl font-bold tabular-nums">
                    {budget ? formatPln(budget.maxBudgetPln) : "..."}
                  </div>
                  <div className="text-xs text-purple-100">
                    Zapisany budżet bazowy na projekt (B_max)
                  </div>
                </div>
              </div>

              <div className="flex overflow-hidden rounded-[2px] bg-[#4b5563] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                <div className="flex w-20 shrink-0 items-center justify-center bg-[#374151]">
                  <Banknote className="h-7 w-7 text-[#c4b5fd]" />
                </div>
                <div className="flex flex-col justify-center px-5 py-4">
                  <div className="text-2xl font-bold tabular-nums">
                    {formatPln(liveLimitPln)}
                  </div>
                  <div className="text-xs text-gray-200">
                    Podgląd progu tolerancji 120% (B_limit = 1,20 × B_max)
                  </div>
                </div>
              </div>
            </section>

                {/* Formularz edycji B_max */}
                <section className="flat-card">
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h2 className="text-[15px] font-semibold text-[#374151]">
                      Parametry progu budżetowego
                    </h2>
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </div>

                  <form onSubmit={handleSave} className="space-y-5 p-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor="admin-bmax-input"
                          className="block text-xs font-bold uppercase tracking-wider text-gray-600"
                        >
                          Maksymalny budżet bazowy na projekt B_max (PLN)
                        </label>
                        <input
                          id="admin-bmax-input"
                          type="number"
                          min={10000}
                          max={100000000}
                          step={5000}
                          value={maxBudgetInput}
                          onChange={(e) => setMaxBudgetInput(e.target.value)}
                          disabled={loading}
                          className="w-full rounded-[2px] border border-gray-300 bg-white px-4 py-2.5 text-lg font-extrabold tabular-nums text-[#374151] focus:border-[#7c3aed] focus:outline-none"
                        />
                        <div className="flex flex-wrap gap-2 pt-1 text-xs">
                          {[150_000, 250_000, 320_000, 500_000].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setMaxBudgetInput(String(preset))}
                              className="rounded-[2px] border border-purple-200 bg-purple-50 px-2.5 py-1 font-semibold text-[#6d28d9] hover:bg-purple-100"
                            >
                              {formatPln(preset)}
                            </button>
                          ))}
                        </div>
                      </div>

                          <div className="flex flex-col justify-center rounded-[2px] border border-gray-200 bg-[#f9fafb] p-4">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-[#7c3aed]">
                              Reguła automatycznego routingu tabel
                            </div>
                              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                                Wzór: <code className="font-mono">B_limit = 1,20 × B_max</code>.
                                Projekty z oceną{" "}
                                <strong className="text-[#374151]">S_total ≥ 25 pkt</strong> i
                                kosztem PERT ≤ B_limit trafiają do{" "}
                                <strong className="text-[#6d28d9]">Tabeli Głównej</strong>; przy
                                koszcie &gt; B_limit do{" "}
                                <strong className="text-[#374151]">Tabeli Drugorzędnej</strong>.
                                Projekty &lt; 25 pkt pozostają w Archiwum.
                              </p>
                          </div>
                        </div>

                        {errorMsg && (
                          <div
                            role="alert"
                            className="flex items-start gap-2 rounded-[2px] border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800"
                          >
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{errorMsg}</span>
                          </div>
                        )}

                        {statusMessage && (
                          <div
                            role="status"
                            className="space-y-3 rounded-[2px] border border-purple-200 bg-purple-50 p-4 text-xs text-[#5b21b6]"
                          >
                            <div className="flex items-start gap-2 font-semibold">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7c3aed]" />
                              <span>{statusMessage}</span>
                            </div>

                            {movedProjects.length > 0 ? (
                                  <div className="space-y-2 border-t border-purple-200 pt-3">
                                    <div className="font-bold text-[#374151]">
                                      Przeniesione projekty ({movedProjects.length}):
                                    </div>
                                    {movedProjects.map((mp) => (
                                      <div
                                        key={mp.id}
                                        className="flex flex-wrap items-center gap-2 rounded-[2px] border border-gray-200 bg-white px-3 py-2 text-xs"
                                      >
                                          <span className="font-bold text-[#374151]">
                                            {mp.projectTitle}
                                          </span>
                                            <span className="tabular-nums text-gray-500">
                                              (PERT: {formatPln(mp.totalPertCostPln)})
                                            </span>
                                            <span
                                              className={`rounded-[2px] px-2 py-0.5 text-[10px] font-bold ${tableBadge(mp.fromTable)}`}
                                            >
                                              {EVALUATION_TABLE_LABELS[mp.fromTable]}
                                            </span>
                                            <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                                            <span
                                              className={`rounded-[2px] px-2 py-0.5 text-[10px] font-bold ${tableBadge(mp.toTable)}`}
                                            >
                                              {EVALUATION_TABLE_LABELS[mp.toTable]}
                                            </span>
                                          </div>
                  ))}
                                      </div>
                                    ) : (
                                      <p className="text-[11px] text-purple-900/80">
                                        Żaden projekt nie zmienił tabeli docelowej przy nowym limicie.
                                      </p>
              )}
                                  </div>
          )}

                                  <div className="flex flex-wrap items-center gap-3">
                                    <button
                                      type="submit"
                                      disabled={saving || loading}
                                      className="inline-flex items-center gap-2 rounded-[2px] bg-[#7c3aed] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                                    >
                                      {saving ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                          <span>Zapisywanie i przeliczanie tabel...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Save className="h-4 w-4" />
                                          <span>Zapisz B_max i przelicz tabele</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => void loadBudget()}
                                      className="inline-flex items-center gap-1.5 rounded-[2px] border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                      <RefreshCw className="h-3.5 w-3.5" />
                                      <span>Odśwież stan</span>
                                    </button>
                                  </div>
                                </form>
                              </section>

      {/* Zestawienie wszystkich projektów względem progu B_limit */}
                                <section className="flat-card">
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-4">
                                    <div>
                                        <h2 className="text-[15px] font-semibold text-[#374151]">
                                          Aktualny rozkład ocenionych projektów względem B_limit
                                        </h2>
                                          <p className="text-xs text-gray-500">
                                            Zapisany limit w bazie:{" "}
                                            <strong>
                                              {budget ? formatPln(budget.budgetLimitPln) : "..."}
                                            </strong>{" "}
                                            (ostatnia aktualizacja:{" "}
                                            {budget
                                              ? new Date(budget.updatedAt).toLocaleString("pl-PL")
                                              : "..."}
                                            )
                                          </p>
                                        </div>
                                        <Link
                                          href="/oceny"
                                          className="inline-flex items-center gap-1 text-xs font-bold text-[#7c3aed] hover:underline"
                                        >
                                          <span>Przejdź do Ocen AI</span>
                                          <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </div>

                                      <div className="overflow-x-auto p-5">
                                        <table className="w-full min-w-[640px] border-collapse text-left text-xs">
                                          <thead>
                                              <tr className="border-b border-gray-200 bg-[#f9fafb] text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                                <th className="py-2.5 pl-3 pr-3">Projekt</th>
                                                <th className="py-2.5 pr-3 text-right">Wynik S_total</th>
                                                <th className="py-2.5 pr-3 text-right">Koszt PERT (K_calk)</th>
                                                <th className="py-2.5 pr-3 text-right">Ryzyko R_kryt</th>
                                                <th className="py-2.5 pr-3 text-right">Przypisana tabela</th>
                                              </tr>
                                          </thead>
                                            <tbody className="divide-y divide-gray-100">
                                              {projects.map((p) => (
                                                    <tr key={p.id} className="hover:bg-gray-50">
                                                      <td className="py-3 pl-3 pr-3 font-semibold text-[#374151]">
                                                        <Link
                                                          href={`/oceny/${p.id}`}
                                                          className="hover:text-[#7c3aed] hover:underline"
                                                        >
                                                          {p.projectTitle}
                                                        </Link>
                                                      </td>
                                                        <td className="py-3 pr-3 text-right font-bold tabular-nums text-[#6d28d9]">
                                                          {p.totalScore.toFixed(2)} / 50
                                                        </td>
                                                          <td className="py-3 pr-3 text-right font-semibold tabular-nums text-[#374151]">
                                                            {formatPln(p.totalPertCostPln)}
                                                          </td>
                                                            <td className="py-3 pr-3 text-right tabular-nums text-gray-600">
                                                              {p.criticalRiskPercent.toFixed(1)}%
                                                            </td>
                                                              <td className="py-3 pr-3 text-right">
                                                                <span
                                                                  className={`inline-block rounded-[2px] px-2.5 py-0.5 text-[11px] font-bold ${tableBadge(p.targetTable)}`}
                                                                >
                                                                  {EVALUATION_TABLE_LABELS[p.targetTable]}
                                                                </span>
                                                              </td>
                                                            </tr>
              ))}
                                                          </tbody>
                                                        </table>
                                                      </div>
                                                    </section>
                                                  </div>
                                                  );
}
