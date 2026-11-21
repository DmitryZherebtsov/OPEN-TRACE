"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ArrowUpRight,
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
    return "bg-emerald-100 text-emerald-900 border-emerald-200";
  }
  if (table === "TABELA_DRUGORZEDNA") {
    return "bg-amber-100 text-amber-900 border-amber-200";
  }
  return "bg-rose-100 text-rose-900 border-rose-200";
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
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="radar-hero-bg rounded-3xl p-6 text-white shadow-lg sm:p-7">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-violet-100">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Panel Administratora · Konfiguracja limitu B_max</span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Zarządzanie progiem budżetowym i automatycznym routingiem tabel
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm text-violet-100/90">
          Każda zmiana maksymalnego budżetu na projekt (B_max) natychmiast
          przelicza próg tolerancji 120% (B_limit = 1,20 × B_max) oraz
          aktualizuje przypisanie ocenionych projektów między Tabelą Główną a
          Tabelą Drugorzędną.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="admin-bmax-input"
                className="block text-sm font-bold text-slate-900"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-extrabold tabular-nums text-slate-900 focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                {[150_000, 250_000, 320_000, 500_000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMaxBudgetInput(String(preset))}
                    className="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 font-semibold text-[#4C1D95] hover:bg-violet-100"
                  >
                    {formatPln(preset)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#4C1D95]">
                Podgląd progu tolerancji 120% na żywo
              </div>
              <div className="mt-2 text-3xl font-extrabold tabular-nums text-[#4C1D95]">
                {formatPln(liveLimitPln)}
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Wzór: <code className="font-mono">B_limit = 1,20 × B_max</code>.
                Projekty z wynikiem S_total ≥ 25 pkt i kosztem PERT ≤ B_limit
                trafiają do <strong>Tabeli Głównej</strong>; powyżej limitu do{" "}
                <strong>Tabeli Drugorzędnej</strong>.
              </p>
            </div>
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

          {statusMessage && (
            <div
              role="status"
              className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900"
            >
              <div className="flex items-start gap-2 font-semibold">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{statusMessage}</span>
              </div>

              {movedProjects.length > 0 ? (
                <div className="space-y-2 border-t border-emerald-200/80 pt-3">
                  <div className="font-bold text-emerald-950">
                    Przeniesione projekty ({movedProjects.length}):
                  </div>
                  {movedProjects.map((mp) => (
                    <div
                      key={mp.id}
                      className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs shadow-2xs"
                    >
                      <span className="font-bold text-slate-900">
                        {mp.projectTitle}
                      </span>
                      <span className="tabular-nums text-slate-500">
                        (PERT: {formatPln(mp.totalPertCostPln)})
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${tableBadge(mp.fromTable)}`}
                      >
                        {EVALUATION_TABLE_LABELS[mp.fromTable]}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${tableBadge(mp.toTable)}`}
                      >
                        {EVALUATION_TABLE_LABELS[mp.toTable]}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-emerald-800">
                  Żaden projekt nie zmienił tabeli docelowej przy nowym limicie
                  (wszystkie obecne klasyfikacje pozostają bez zmian).
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4C1D95] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-60"
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Odśwież stan</span>
            </button>
          </div>
        </form>
      </section>

      {/* Zestawienie wszystkich projektów względem progu B_limit */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Aktualny rozkład ocenionych projektów względem B_limit
            </h2>
            <p className="text-xs text-slate-500">
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
            className="inline-flex items-center gap-1 text-xs font-bold text-[#6D28D9] hover:underline"
          >
            <span>Przejdź do Ocen AI</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="py-2 pr-3">Projekt</th>
                <th className="py-2 pr-3 text-right">Wynik S_total</th>
                <th className="py-2 pr-3 text-right">Koszt PERT (K_calk)</th>
                <th className="py-2 pr-3 text-right">Ryzyko R_kryt</th>
                <th className="py-2 text-right">Przypisana tabela</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 pr-3 font-semibold text-slate-900">
                    <Link
                      href={`/oceny/${p.id}`}
                      className="hover:text-[#4C1D95] hover:underline"
                    >
                      {p.projectTitle}
                    </Link>
                  </td>
                  <td className="py-3 pr-3 text-right font-bold tabular-nums text-[#4C1D95]">
                    {p.totalScore.toFixed(2)} / 50
                  </td>
                  <td className="py-3 pr-3 text-right font-semibold tabular-nums text-slate-900">
                    {formatPln(p.totalPertCostPln)}
                  </td>
                  <td className="py-3 pr-3 text-right tabular-nums text-slate-700">
                    {p.criticalRiskPercent.toFixed(1)}%
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${tableBadge(p.targetTable)}`}
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
