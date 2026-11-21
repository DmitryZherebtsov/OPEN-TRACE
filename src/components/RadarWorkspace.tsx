"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Zap,
  ShieldCheck,
  Filter,
  X,
  ArrowRight,
  Database,
  Scale,
  Sparkles,
} from "lucide-react";
import {
  DOMAIN_LABELS,
  PATHWAY_LABELS,
  formatTrl,
  type Domain,
  type InnovationDTO,
  type PersonaId,
} from "@/types/innovation";
import { getPersonaConfig } from "@/lib/personas";
import { usePersona } from "@/components/PersonaContext";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { ScannerPanel } from "@/components/ScannerPanel";
import { InnovationCard } from "@/components/InnovationCard";

interface RadarWorkspaceProps {
  initialInnovations: InnovationDTO[];
  initialLatencyMs: number;
}

const DOMAIN_TABS: Array<{ value: Domain | "ALL"; label: string }> = [
  { value: "ALL", label: "Wszystkie" },
  { value: "TECHNOLOGICZNY", label: "Technologiczna" },
  { value: "EDUKACYJNY", label: "Edukacyjna" },
  { value: "ADMINISTRACYJNY", label: "Administracyjna" },
];

export function RadarWorkspace({
  initialInnovations,
  initialLatencyMs,
}: RadarWorkspaceProps) {
  const router = useRouter();
  const { persona } = usePersona();

  const [innovations, setInnovations] =
    useState<InnovationDTO[]>(initialInnovations);
  const [latencyMs, setLatencyMs] = useState<number>(initialLatencyMs);
  const [query, setQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState<Domain | "ALL">("ALL");
  const [minCredibility, setMinCredibility] = useState<number>(0);
  const [minImplementation, setMinImplementation] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const [selectedInnovation, setSelectedInnovation] =
    useState<InnovationDTO | null>(null);

  const fetchInnovations = useCallback(
    async (opts?: {
      q?: string;
      domain?: Domain | "ALL";
      minCred?: number;
      minImpl?: number;
    }) => {
      const qVal = opts?.q ?? query;
      const domVal = opts?.domain ?? domainFilter;
      const credVal = opts?.minCred ?? minCredibility;
      const implVal = opts?.minImpl ?? minImplementation;

      setLoading(true);
      const t0 = performance.now();
      try {
        const params = new URLSearchParams();
        if (qVal.trim()) params.set("q", qVal.trim());
        if (domVal !== "ALL") params.set("domain", domVal);
        if (credVal > 0) params.set("minCredibility", String(credVal));
        if (implVal > 0) params.set("minImplementation", String(implVal));

        const res = await fetch(`/api/innovations?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setInnovations(data.items || []);
          setLatencyMs(
            typeof data.latencyMs === "number"
              ? data.latencyMs
              : Math.round(performance.now() - t0)
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [query, domainFilter, minCredibility, minImplementation]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchInnovations();
    }, 180);
    return () => clearTimeout(timer);
  }, [query, domainFilter, minCredibility, minImplementation, fetchInnovations]);

  const handlePersonaChange = (id: PersonaId) => {
    const cfg = getPersonaConfig(id);
    setDomainFilter(cfg.defaultDomain);
  };

  const handleInnovationCreated = (created: InnovationDTO) => {
    setInnovations((prev) => [created, ...prev]);
    setSelectedInnovation(created);
  };

  return (
    <div className="space-y-6">
      {/* Baner instytucjonalny z subtelną geometrią radaru SVG */}
      <section className="radar-hero-bg relative overflow-hidden rounded-3xl p-6 text-white shadow-lg sm:p-8">
        <svg
          aria-hidden="true"
          viewBox="0 0 420 260"
          className="pointer-events-none absolute -right-10 -top-8 h-72 w-96 opacity-25"
          fill="none"
        >
          <circle cx="240" cy="130" r="118" stroke="#C4B5FD" strokeWidth="1" />
          <circle cx="240" cy="130" r="82" stroke="#C4B5FD" strokeWidth="1" />
          <circle cx="240" cy="130" r="46" stroke="#C4B5FD" strokeWidth="1" />
          <line
            x1="110"
            y1="130"
            x2="370"
            y2="130"
            stroke="#C4B5FD"
            strokeOpacity="0.45"
          />
          <line
            x1="240"
            y1="0"
            x2="240"
            y2="260"
            stroke="#C4B5FD"
            strokeOpacity="0.45"
          />
          <path
            d="M240 130 L328 54"
            stroke="#34D399"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="305" cy="74" r="5" fill="#34D399" />
          <circle cx="195" cy="95" r="4" fill="#FBBF24" />
          <circle cx="278" cy="166" r="4" fill="#A78BFA" />
        </svg>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/15 px-3 py-1 text-violet-100 ring-1 ring-white/20">
              Hybrydowy Silnik OSINT: Tor A + Tor B
            </span>
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-200 ring-1 ring-emerald-300/30">
              Protokół „Fakty vs AI”
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-violet-100">
              Podręcznik Oslo 2018
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            OPEN TRACE — Radar Innowacji
          </h1>
          <p className="text-sm leading-relaxed text-violet-100/90 sm:text-base">
            Błyskawiczne odkrywanie zweryfikowanych innowacji technologicznych,
            edukacyjnych i administracyjnych z polskich i europejskich rejestrów
            oraz bezstronna wieloagentowa ocena projektów (Debata 4 AI + koszty
            PERT).
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/oceny"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#4C1D95] shadow-sm hover:bg-violet-50 sm:text-sm"
            >
              <Scale className="h-4 w-4" />
              <span>Przejdź do Ocen Wieloagentowych (Debata 4 AI)</span>
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs text-violet-200">
              <Database className="h-3.5 w-3.5" />
              Pre-indeksowana baza Tor A: {initialInnovations.length} rekordów
            </span>
          </div>
        </div>
      </section>

      {/* Przełącznik 6 perspektyw użytkownika */}
      <RoleSwitcher onSelectPersona={handlePersonaChange} />

      {/* Skaner doraźny Tor B */}
      <ScannerPanel onInnovationCreated={handleInnovationCreated} />

      {/* Odkrywanie Tor A + Filtry */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
                TOR A
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Wyszukiwarka pre-indeksowanej bazy wiedzy
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold tabular-nums text-emerald-800">
                <Zap className="h-3.5 w-3.5 text-emerald-600" />
                {latencyMs} ms {latencyMs < 200 ? "(< 200 ms)" : ""}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Przeszukuje rejestry UPRP, EPO, PBN, PPM, PAN, NCBR, PARP, NCN,
              CORDIS, Interreg Europe oraz BIP JST.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-600">
            Znaleziono:{" "}
            <span className="text-[#4C1D95]">{innovations.length}</span>{" "}
            innowacji
          </div>
        </div>

        {/* Pasek wyszukiwania + filtry */}
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="relative lg:col-span-6">
            <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj po tytule, instytucji, rejestrze (np. Boguchwała, Politechnika, UPRP, posiłki, dron)..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6D28D9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </div>

          <div className="flex items-center gap-2 lg:col-span-3">
            <Filter className="h-4 w-4 shrink-0 text-slate-400" />
            <select
              aria-label="Minimalny indeks wiarygodności źródła"
              value={minCredibility}
              onChange={(e) => setMinCredibility(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 focus:border-[#6D28D9] focus:outline-none"
            >
              <option value={0}>Wiarygodność źródła: Wszystkie</option>
              <option value={3}>Wiarygodność ≥ 3 / 5</option>
              <option value={4}>Wiarygodność ≥ 4 / 5</option>
              <option value={5}>Tylko najwyższa (5 / 5)</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <select
              aria-label="Minimalny poziom wdrożenia"
              value={minImplementation}
              onChange={(e) => setMinImplementation(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 focus:border-[#6D28D9] focus:outline-none"
            >
              <option value={0}>Poziom wdrożenia: Wszystkie</option>
              <option value={3}>Wdrożenie ≥ 3 / 5</option>
              <option value={4}>Pilotaż / operacyjne (≥ 4 / 5)</option>
              <option value={5}>Pełne wdrożenie (5 / 5)</option>
            </select>
          </div>
        </div>

        {/* Zakładki domen Oslo 2018 */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {DOMAIN_TABS.map((t) => {
            const active = domainFilter === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setDomainFilter(t.value)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-[#4C1D95] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-violet-50 hover:text-[#4C1D95]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Siatka kart innowacji */}
        {loading && innovations.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Przeszukiwanie bazy Tor A...
          </div>
        ) : innovations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
            Brak innowacji spełniających wybrane kryteria. Zmień filtry lub
            zeskanuj nowe źródło w Torze B.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {innovations.map((item) => {
              const matchesPersonaPathway = item.pathways.some((pw) =>
                persona.preferredPathways.includes(pw.pathway)
              );

              return (
                <div
                  key={item.id}
                  className={`flex flex-col justify-between rounded-2xl border bg-white p-4 shadow-sm transition hover:border-violet-300 hover:shadow-md ${
                    matchesPersonaPathway
                      ? "border-violet-200"
                      : "border-slate-200"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          item.domain === "TECHNOLOGICZNY"
                            ? "bg-violet-100 text-[#4C1D95]"
                            : item.domain === "EDUKACYJNY"
                              ? "bg-sky-100 text-sky-900"
                              : "bg-emerald-100 text-emerald-900"
                        }`}
                      >
                        {DOMAIN_LABELS[item.domain]}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {formatTrl(item.domain, item.scoring?.trl ?? null)}
                      </span>
                    </div>

                    <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900">
                      {item.title}
                    </h3>

                    <p className="line-clamp-3 text-xs leading-relaxed text-slate-600">
                      {item.summary}
                    </p>

                    <div className="text-[11px] text-slate-500">
                      <strong className="text-slate-700">Instytucja:</strong>{" "}
                      {item.institution || "Brak danych w źródle"}
                      <br />
                      <strong className="text-slate-700">Rejestr:</strong>{" "}
                      {item.source.registryName}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
                    {item.scoring && (
                      <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                        <div className="rounded-lg bg-emerald-50 px-1.5 py-1">
                          <div className="text-emerald-700">Wiarygodność</div>
                          <div className="font-extrabold tabular-nums text-emerald-900">
                            {item.scoring.credibilityIndex}/5
                          </div>
                        </div>
                        <div className="rounded-lg bg-violet-50 px-1.5 py-1">
                          <div className="text-[#4C1D95]">Wdrożenie</div>
                          <div className="font-extrabold tabular-nums text-[#4C1D95]">
                            {item.scoring.implementationLevel}/5
                          </div>
                        </div>
                        <div className="rounded-lg bg-slate-100 px-1.5 py-1">
                          <div className="text-slate-600">Transfer</div>
                          <div className="font-extrabold tabular-nums text-slate-900">
                            {item.scoring.transferPotential}/5
                          </div>
                        </div>
                      </div>
                    )}

                    {item.pathways[0] && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        {matchesPersonaPathway ? (
                          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#6D28D9]" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        )}
                        <span className="truncate font-medium">
                          {PATHWAY_LABELS[item.pathways[0].pathway]}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInnovation(item)}
                        className="flex-1 rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-[#4C1D95] transition hover:bg-violet-100"
                      >
                        Podgląd „Fakty vs AI”
                      </button>
                      <Link
                        href={`/innovations/${item.id}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-violet-300 hover:text-[#4C1D95]"
                      >
                        <span>Karta</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal szczegółowej Karty Innowacji */}
      {selectedInnovation && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Szczegóły innowacji: ${selectedInnovation.title}`}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-xs sm:p-6"
          onClick={() => setSelectedInnovation(null)}
        >
          <div
            className="relative my-4 w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedInnovation(null)}
              aria-label="Zamknij podgląd karty innowacji"
              className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
            <InnovationCard
              innovation={selectedInnovation}
              showFullPageLink
              onEvaluated={(evaluationId) => {
                setSelectedInnovation(null);
                router.push(`/oceny/${evaluationId}`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
