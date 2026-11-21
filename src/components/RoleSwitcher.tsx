"use client";

import {
  Building2,
  GraduationCap,
  Landmark,
  Lightbulb,
  Rocket,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { PERSONAS } from "@/lib/personas";
import { usePersona } from "@/components/PersonaContext";
import { PATHWAY_LABELS, type PersonaId } from "@/types/innovation";

const PERSONA_ICONS: Record<PersonaId, React.ComponentType<{ className?: string }>> = {
  JST: Landmark,
  SZKOLY: GraduationCap,
  UCZELNIE: Building2,
  INWESTORZY: TrendingUp,
  STARTUPY: Rocket,
  WYNALAZCY: Lightbulb,
};

interface RoleSwitcherProps {
  onSelectPersona?: (personaId: PersonaId) => void;
}

export function RoleSwitcher({ onSelectPersona }: RoleSwitcherProps) {
  const { personaId, persona, setPersonaId } = usePersona();

  const handleSelect = (id: PersonaId) => {
    setPersonaId(id);
    onSelectPersona?.(id);
  };

  return (
    <section
      aria-label="Przełącznik perspektywy użytkownika"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#4C1D95]">
            Przełącznik perspektywy użytkownika (6 grup docelowych)
          </h2>
          <p className="mt-0.5 text-xs text-slate-600">
            Dostosowuje domyślne filtry domeny Oslo 2018, wyróżnione wskaźniki KPI i
            rekomendowane ścieżki transferu — przechowywane wyłącznie lokalnie w
            przeglądarce (zgodnie z RODO).
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-[#6D28D9] ring-1 ring-violet-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Aktywny profil: {persona.shortLabel}
        </span>
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {PERSONAS.map((item) => {
          const Icon = PERSONA_ICONS[item.id];
          const active = item.id === personaId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                active
                  ? "border-[#6D28D9] bg-violet-50/90 text-[#4C1D95] shadow-sm ring-1 ring-[#6D28D9]"
                  : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-violet-300 hover:bg-white"
              }`}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <Icon
                  className={`h-4 w-4 ${active ? "text-[#6D28D9]" : "text-slate-500"}`}
                />
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    active
                      ? "bg-[#6D28D9] text-white"
                      : "bg-slate-200/70 text-slate-600"
                  }`}
                >
                  {item.id}
                </span>
              </div>
              <span className="mt-1.5 text-xs font-bold leading-snug">
                {item.shortLabel}
              </span>
              <span className="mt-0.5 text-[11px] leading-tight text-slate-500">
                {item.accentBadge}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3.5 flex flex-col gap-3 rounded-xl border border-violet-100 bg-violet-50/40 p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="font-semibold text-slate-900">{persona.label}</div>
          <p className="text-slate-600">{persona.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
          {persona.highlightedKpis.map((kpi) => (
            <span
              key={kpi}
              className="rounded-lg border border-violet-200 bg-white px-2 py-1 text-[11px] font-medium text-[#4C1D95]"
            >
              KPI: {kpi}
            </span>
          ))}
          {persona.preferredPathways.map((pw) => (
            <span
              key={pw}
              className="rounded-lg bg-emerald-100/80 px-2 py-1 text-[11px] font-semibold text-emerald-800"
            >
              Ścieżka: {PATHWAY_LABELS[pw]}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
