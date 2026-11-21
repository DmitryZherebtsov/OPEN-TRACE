"use client";

import {
  Building2,
  GraduationCap,
  Landmark,
  Lightbulb,
  Rocket,
  TrendingUp,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";
import { PERSONAS } from "@/lib/personas";
import { usePersona } from "@/components/PersonaContext";
import { PATHWAY_LABELS, type PersonaId } from "@/types/innovation";

  const PERSONA_ICONS: Record<
    PersonaId,
    React.ComponentType < { className?: string } >
> = {
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
      className="flat-card"
    >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-3.5">
          <div>
              <h2 className="text-[15px] font-semibold text-[#374151]">
                Przełącznik perspektywy użytkownika (6 grup docelowych)
              </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Dostosowuje domyślne filtry domeny Oslo 2018, wyróżnione wskaźniki
                  KPI i ścieżki transferu (zapis wyłącznie lokalny — RODO Zero PII).
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-[2px] bg-purple-50 px-2.5 py-1 text-xs font-semibold text-[#6d28d9]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Aktywny: {persona.shortLabel}
                </span>
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </div>
          </div>

                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {PERSONAS.map((item) => {
                          const Icon = PERSONA_ICONS[item.id];
                          const active = item.id === personaId;
                          return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`flex flex-col items-start rounded-[2px] border p-3 text-left transition ${
                  active
                    ? "border-[#7c3aed] bg-[#7c3aed] text-white shadow-xs"
                    : "border-gray-200 bg-[#f9fafb] text-[#374151] hover:border-purple-300 hover:bg-white"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <Icon
                    className={`h-4 w-4 ${active ? "text-purple-100" : "text-[#7c3aed]"}`}
                  />
                  <span
                    className={`rounded-[2px] px-1.5 py-0.5 text-[10px] font-bold ${
                      active
                        ? "bg-[#5b21b6] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {item.id}
                  </span>
                </div>
                <span className="mt-2 text-xs font-semibold leading-snug">
                  {item.shortLabel}
                </span>
                <span
                  className={`mt-0.5 text-[11px] leading-tight ${
                    active ? "text-purple-100" : "text-gray-500"
                  }`}
                >
                  {item.accentBadge}
                </span>
              </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex flex-col gap-3 rounded-[2px] border border-gray-200 bg-[#f9fafb] p-3.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-[#374151]">{persona.label}</div>
                          <p className="text-gray-500">{persona.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                          {persona.highlightedKpis.map((kpi) => (
              <span
                key={kpi}
                className="rounded-[2px] border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-[#374151]"
              >
                KPI: {kpi}
              </span>
            ))}
            {persona.preferredPathways.map((pw) => (
              <span
                key={pw}
                className="rounded-[2px] bg-purple-100 px-2 py-1 text-[11px] font-semibold text-[#5b21b6]"
              >
                Ścieżka: {PATHWAY_LABELS[pw]}
              </span>
            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                    );
}
