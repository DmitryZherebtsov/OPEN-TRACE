"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Search,
  Eye,
  Zap,
  ShieldCheck,
  Layers,
  Cpu,
  GraduationCap,
  Landmark,
  Scale,
  Star,
  Trophy,
  MoreHorizontal,
  X,
  CheckCircle2,
  ScanSearch,
  ArrowUpRight,
} from "lucide-react";
import {
  DOMAIN_LABELS,
  formatTrl,
  type Domain,
  type InnovationDTO,
  type PersonaId,
  type ScanJobDTO,
} from "@/types/innovation";
import {
  EVALUATION_TABLE_LABELS,
  type AdminBudgetDTO,
  type ProjectEvaluationDTO,
} from "@/types/evaluation";
import { getPersonaConfig } from "@/lib/personas";
import { usePersona } from "@/components/PersonaContext";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { ScannerPanel } from "@/components/ScannerPanel";
import { InnovationCard } from "@/components/InnovationCard";

interface RadarWorkspaceProps {
  initialInnovations: InnovationDTO[];
  initialEvaluations: ProjectEvaluationDTO[];
  initialJobs: ScanJobDTO[];
  initialBudget: AdminBudgetDTO;
  initialLatencyMs: number;
  initialQuery?: string;
  initialDomain?: Domain | "ALL";
}

const DOMAIN_TABS: Array<{ value: Domain | "ALL"; label: string }> = [
  { value: "ALL", label: "Wszystkie" },
  { value: "TECHNOLOGICZNY", label: "Technologiczna" },
  { value: "EDUKACYJNY", label: "Edukacyjna" },
  { value: "ADMINISTRACYJNY", label: "Administracyjna" },
];

function formatCompactPln(val: number): string {
  return `${Math.round(val).toLocaleString("pl-PL")} zł`;
}

function getInitials(text: string): string {
  const words = text
    .replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "OT";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function domainBadgeFlat(domain: Domain): string {
  if (domain === "TECHNOLOGICZNY") {
    return "bg-purple-100 text-[#5b21b6]";
  }
  if (domain === "EDUKACYJNY") {
    return "bg-gray-200 text-gray-700";
  }
  return "bg-violet-50 text-[#7c3aed]";
}

export function RadarWorkspace({
  initialInnovations,
  initialEvaluations,
  initialJobs,
  initialBudget,
  initialLatencyMs,
  initialQuery = "",
  initialDomain = "ALL",
}: RadarWorkspaceProps) {
  const router = useRouter();
  const { persona } = usePersona();

  const [innovations, setInnovations] =
    useState<InnovationDTO[]>(initialInnovations);
  const [latencyMs, setLatencyMs] = useState<number>(initialLatencyMs);
  const [query, setQuery] = useState(initialQuery);
  const [domainFilter, setDomainFilter] = useState<Domain | "ALL">(
    initialDomain
  );
  const [minCredibility, setMinCredibility] = useState<number>(0);
  const [minImplementation, setMinImplementation] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const [selectedInnovation, setSelectedInnovation] =
    useState<InnovationDTO | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setDomainFilter(initialDomain);
  }, [initialDomain]);

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

  // Statystyki do górnych kart (1:1 struktura Flat Able)
  const stats = useMemo(() => {
    const base = initialInnovations.length > 0 ? initialInnovations : innovations;
    const tech = base.filter((i) => i.domain === "TECHNOLOGICZNY").length;
    const edu = base.filter((i) => i.domain === "EDUKACYJNY").length;
    const admin = base.filter((i) => i.domain === "ADMINISTRACYJNY").length;
    const highCred = base.filter(
      (i) => (i.scoring?.credibilityIndex ?? 0) >= 4
    ).length;

    const evalMain = initialEvaluations.filter(
      (e) => e.targetTable === "TABELA_GLOWNA"
    ).length;
    const evalSec = initialEvaluations.filter(
      (e) => e.targetTable === "TABELA_DRUGORZEDNA"
    ).length;
    const evalArch = initialEvaluations.filter(
      (e) => e.targetTable === "ARCHIWUM_ODRZUCONE"
    ).length;
    const topScore = initialEvaluations[0]?.totalScore ?? 0;

    return {
      total: base.length,
      tech,
      edu,
      admin,
      highCred,
      evalTotal: initialEvaluations.length,
      evalMain,
      evalSec,
      evalArch,
      topScore,
    };
  }, [initialInnovations, innovations, initialEvaluations]);

  // Dane dla prawej karty „Ostatnie aktualizacje” (1:1 pionowa oś czasu z ikonami)
  const timelineUpdates = useMemo(() => {
    const entries: Array<{
      id: string;
      timeLabel: string;
      title: string;
      subtitle: string;
      iconKind: "eval" | "scan" | "registry";
      href?: string;
    }> = [];

    for (const ev of initialEvaluations.slice(0, 3)) {
      entries.push({
        id: `ev-${ev.id}`,
        timeLabel: EVALUATION_TABLE_LABELS[ev.targetTable].replace(
          "Tabela ",
          ""
        ),
        title: `${ev.totalScore.toFixed(1)}/50 pkt · ${ev.projectTitle}`,
        subtitle: `PERT: ${formatCompactPln(ev.totalPertCostPln)} · Ryzyko krytyczne ${ev.criticalRiskPercent.toFixed(0)}%`,
        iconKind: "eval",
        href: `/oceny/${ev.id}`,
      });
    }

    for (const job of initialJobs.slice(0, 2)) {
      entries.push({
        id: `job-${job.id}`,
        timeLabel: `${job.durationMs} ms`,
        title: `Skan ${job.kind} (${job.recordsFound} rek.)`,
        subtitle: job.target,
        iconKind: "scan",
      });
    }

    if (entries.length === 0) {
      entries.push({
        id: "init-tor-a",
        timeLabel: "Tor A",
        title: "Gotowy do synchronizacji z PostgreSQL",
        subtitle:
          "Uruchom docker compose up -d oraz npx prisma db seed, aby zasilić 15 rekordów Tor A.",
        iconKind: "registry",
      });
    }

    return entries;
  }, [initialEvaluations, initialJobs]);

  return (
              <div className="space-y-5">
                {/* NAGŁÓWEK I OKRUSZKI (1:1 jak „Dashboard Analytics” + „🏠 / Dashboard Analytics”) */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h1 className="text-[19px] font-semibold tracking-tight text-[#374151]">
                      Analityka Radaru Innowacji
                    </h1>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <Home className="h-3.5 w-3.5 text-gray-500" />
                      <span>/</span>
                      <span className="font-medium text-gray-600">
                        Analityka Radaru Innowacji
                      </span>
                        <span>/</span>
                        <span className="text-[#7c3aed]">
                          Profil: {persona.shortLabel}
                        </span>
                    </div>
                  </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-[2px] border border-purple-200 bg-white px-2.5 py-1 font-semibold tabular-nums text-[#6d28d9] shadow-2xs">
                    <Zap className="h-3.5 w-3.5 text-[#7c3aed]" />
                    Zapytanie Tor A: {latencyMs} ms{" "}
                    {latencyMs < 200 ? "(< 200 ms)" : ""}
                  </span>
                  <Link
                    href="/oceny"
                    className="inline-flex items-center gap-1.5 rounded-[2px] bg-[#7c3aed] px-3 py-1 font-semibold text-white transition hover:bg-[#6d28d9]"
                  >
                    <Scale className="h-3.5 w-3.5" />
                    <span>Debata 4 AI</span>
                  </Link>
                </div>
              </div>

              {/* GÓRNY WIERSZ KPI — DOKŁADNA SIATKA 3×4 KOLUMN (1:1 Z OBRAZKIEM FLAT ABLE) */}
              <section className="grid gap-5 lg:grid-cols-12">
                {/* LEWE 4 KOLUMNY: 2×2 stat card + Fioletowy banner z ikoną po lewej */}
                <div className="flex flex-col gap-5 lg:col-span-4">
                  <div className="flat-card grid grid-cols-2 divide-x divide-gray-100">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                      <Eye className="h-5 w-5 text-[#7c3aed]" />
                      <div className="text-right">
                        <div className="text-lg font-bold tabular-nums text-[#374151]">
                          {stats.total}
                        </div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          INNOWACJE TOR A
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                      <Zap className="h-5 w-5 text-gray-500" />
                      <div className="text-right">
                        <div className="text-lg font-bold tabular-nums text-[#374151]">
                          {latencyMs} ms
                        </div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          OPÓŹNIENIE
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-4">
                      <ShieldCheck className="h-5 w-5 text-[#7c3aed]" />
                      <div className="text-right">
                        <div className="text-lg font-bold tabular-nums text-[#374151]">
                          {stats.highCred}
                        </div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          WIARYG. ≥ 4/5
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-4">
                      <Layers className="h-5 w-5 text-[#9333ea]" />
                      <div className="text-right">
                        <div className="text-lg font-bold tabular-nums text-[#374151]">
                          3
                        </div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          DOMENY OSLO
                        </div>
                      </div>
                    </div>
                  </div>

                          {/* Fioletowa karta z kwadratowym blokiem ikony po lewej (1:1 jak „4000+ Ratings Received”) */}
                          <Link
                            href="/oceny"
                            className="flex overflow-hidden rounded-[2px] bg-[#7c3aed] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition hover:bg-[#6d28d9]"
                          >
                            <div className="flex w-20 shrink-0 items-center justify-center bg-[#5b21b6]">
                              <Star className="h-7 w-7 fill-white text-white" />
                            </div>
                            <div className="flex flex-col justify-center px-5 py-4">
                              <div className="text-2xl font-bold leading-tight tabular-nums">
                                {stats.topScore > 0 ? `${stats.topScore.toFixed(2)} / 50` : "4 AI"}
                              </div>
                              <div className="mt-0.5 text-xs text-purple-100">
                                Najwyższy wynik Debaty 4 AI
                              </div>
                            </div>
                          </Link>
                        </div>

                        {/* ŚRODKOWE 4 KOLUMNY: 2×2 stat card + Szaro-fioletowy banner z trofeum */}
                        <div className="flex flex-col gap-5 lg:col-span-4">
                          <div className="flat-card grid grid-cols-2 divide-x divide-gray-100">
                            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                              <Cpu className="h-5 w-5 text-[#7c3aed]" />
                              <div className="text-right">
                                <div className="text-lg font-bold tabular-nums text-[#374151]">
                                  {stats.tech}
                                </div>
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                  TECH (TRL 1–9)
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                              <GraduationCap className="h-5 w-5 text-[#8b5cf6]" />
                              <div className="text-right">
                                <div className="text-lg font-bold tabular-nums text-[#374151]">
                                  {stats.edu}
                                </div>
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                  EDUKACJA (N/D)
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-4">
                              <Landmark className="h-5 w-5 text-gray-500" />
                              <div className="text-right">
                                <div className="text-lg font-bold tabular-nums text-[#374151]">
                                  {stats.admin}
                                </div>
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                  ADMIN (N/D)
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-4">
                              <Scale className="h-5 w-5 text-[#7c3aed]" />
                              <div className="text-right">
                                <div className="text-lg font-bold tabular-nums text-[#374151]">
                                  {stats.evalTotal}
                                </div>
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                  OCENY 4 AI
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Ciemnoszara karta z blokiem trofeum po lewej (1:1 jak „17 Achievements”) */}
                          <Link
                            href="/admin"
                            className="flex overflow-hidden rounded-[2px] bg-[#4b5563] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition hover:bg-[#374151]"
                          >
                            <div className="flex w-20 shrink-0 items-center justify-center bg-[#374151]">
                              <Trophy className="h-7 w-7 text-[#c4b5fd]" />
                            </div>
                            <div className="flex flex-col justify-center px-5 py-4">
                              <div className="text-2xl font-bold leading-tight tabular-nums">
                                {formatCompactPln(initialBudget.budgetLimitPln)}
                              </div>
                              <div className="mt-0.5 text-xs text-gray-200">
                                Próg tolerancji 120% B_max
                              </div>
                            </div>
                          </Link>
                        </div>

                            {/* PRAWE 4 KOLUMNY: Karta z wykresem falowym i fioletową stopką 3-kolumnową (1:1 jak „350 Support Requests”) */}
                            <div className="flat-card flex flex-col justify-between overflow-hidden lg:col-span-4">
                              <div className="px-5 pt-5">
                                <div className="text-2xl font-bold tabular-nums text-[#374151]">
                                  {stats.total + stats.evalTotal}
                                </div>
                                <div className="mt-0.5 text-xs font-semibold text-[#7c3aed]">
                                  Zasoby i Oceny Projektów
                                </div>
                                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                                  Rozkład ocen wieloagentowych (Debata 4 AI) względem limitu 120%
                                  B_max ({formatCompactPln(initialBudget.budgetLimitPln)}).
                                </p>
                              </div>

                                  {/* Gładki wykres falowy SVG w odcieniach fioletu (1:1 z krzywą z obrazka) */}
          <div className="mt-2 w-full">
                                  <svg
                                    viewBox="0 0 360 76"
                                    className="block h-[74px] w-full"
                                    preserveAspectRatio="none"
                                    aria-hidden="true"
                                  >
                                  <defs>
                                    <linearGradient
                                      id="purpleWaveFill"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.34" />
                                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.03" />
                                    </linearGradient>
                                  </defs>
                                  <path
                                    d="M0,74 C22,68 38,44 62,50 C86,56 98,64 120,42 C142,20 162,24 182,36 C202,48 224,10 250,16 C276,22 288,52 312,48 C332,44 346,56 360,72 L360,76 L0,76 Z"
                                    fill="url(#purpleWaveFill)"
                                  />
                                  <path
                                    d="M0,74 C22,68 38,44 62,50 C86,56 98,64 120,42 C142,20 162,24 182,36 C202,48 224,10 250,16 C276,22 288,52 312,48 C332,44 346,56 360,72"
                                    fill="none"
                                    stroke="#7c3aed"
                                    strokeWidth="2.2"
                                  />
                                </svg>
                              </div>

                                {/* Dolny fioletowy pasek 3-kolumnowy (1:1 jak „10 Open | 5 Running | 3 Solved”) */}
                                <div className="grid grid-cols-3 bg-[#7c3aed] px-3 py-3.5 text-center text-white">
                                  <div>
                                    <div className="text-lg font-bold tabular-nums">
                                      {stats.evalMain}
                                    </div>
                                    <div className="text-[11px] text-purple-100">Główna</div>
                                  </div>
                                  <div className="border-x border-purple-500/50">
                                    <div className="text-lg font-bold tabular-nums">
                                      {stats.evalSec}
                                    </div>
                                    <div className="text-[11px] text-purple-100">Drugorzędna</div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold tabular-nums">
                                      {stats.evalArch}
                                    </div>
                                    <div className="text-[11px] text-purple-100">Archiwum</div>
                                  </div>
                                </div>
                              </div>
                            </section>

                                {/* DOLNY WIERSZ GŁÓWNY — 7 KOLUMN TABELA „INNOWACJE” + 5 KOLUMN „OSTATNIE AKTUALIZACJE” (1:1 Z OBRAZKIEM) */}
                                <section id="tor-a" className="grid gap-5 lg:grid-cols-12">
                                  {/* LEWE 7 KOLUMN: Tabela Innowacji (1:1 jak „Projects” table card) */}
                                  <div className="flat-card flex flex-col lg:col-span-7">
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-4">
                                      <div className="flex items-center gap-2">
                                        <h2 className="text-[15px] font-semibold text-[#374151]">
                                          Innowacje OSINT (Tor A + Tor B)
                                        </h2>
                                        <span className="rounded-[2px] bg-purple-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#7c3aed]">
                                          {innovations.length}
                                        </span>
                                      </div>
                                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                    </div>

          {/* Kompaktowy pasek filtrów Tor A wewnątrz karty tabeli */}
          <div className="space-y-3 border-b border-gray-100 bg-[#f9fafb] px-5 py-3">
            <div className="grid gap-2 sm:grid-cols-12">
              <div className="relative sm:col-span-6">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Szukaj po tytule, instytucji, rejestrze..."
                  className="w-full rounded-[2px] border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <select
                  aria-label="Minimalna wiarygodność"
                  value={minCredibility}
                  onChange={(e) => setMinCredibility(Number(e.target.value))}
                  className="w-full rounded-[2px] border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 focus:border-[#7c3aed] focus:outline-none"
                >
                  <option value={0}>Wiarygodność: All</option>
                  <option value={3}>Wiaryg. ≥ 3/5</option>
                  <option value={4}>Wiaryg. ≥ 4/5</option>
                  <option value={5}>Tylko 5/5</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <select
                  aria-label="Minimalny poziom wdrożenia"
                  value={minImplementation}
                  onChange={(e) => setMinImplementation(Number(e.target.value))}
                  className="w-full rounded-[2px] border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 focus:border-[#7c3aed] focus:outline-none"
                >
                  <option value={0}>Wdrożenie: All</option>
                  <option value={3}>Poziom ≥ 3/5</option>
                  <option value={4}>Pilotaż ≥ 4/5</option>
                  <option value={5}>Pełne (5/5)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {DOMAIN_TABS.map((t) => {
                const active = domainFilter === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setDomainFilter(t.value)}
                    className={`rounded-[2px] px-2.5 py-1 text-[11px] font-semibold transition ${
                      active
                        ? "bg-[#7c3aed] text-white"
                        : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-purple-50 hover:text-[#6d28d9]"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

                                              {/* Tabela rekordów w stylu Flat Able („ASSIGNED | NAME | DUE DATE | PRIORITY”) */}
                                              {loading && innovations.length === 0 ? (
                                                <div className="py-12 text-center text-xs text-gray-500">
                                                  Przeszukiwanie bazy Tor A...
                                                </div>
                                              ) : innovations.length === 0 ? (
                                                <div className="px-5 py-10 text-center text-xs text-gray-500">
                                                  Brak innowacji dla wybranych kryteriów. Zmień filtry lub dodaj
                                                  źródło w Skanerze Tor B poniżej.
                                                </div>
                                              ) : (
                                                <div className="overflow-x-auto">
                                                  <table className="w-full min-w-[560px] border-collapse text-left text-xs">
                                                    <thead>
                                                      <tr className="border-b border-gray-200 bg-[#f9fafb] text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                                        <th className="py-3 pl-5 pr-3">Innowacja / Instytucja</th>
                                                        <th className="px-3 py-3">Rejestr</th>
                                                        <th className="px-3 py-3">TRL / Wiar.</th>
                                                        <th className="py-3 pl-3 pr-5 text-right">Domena</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                      {innovations.map((item) => (
                                                        <tr
                                                          key={item.id}
                                                          onClick={() => setSelectedInnovation(item)}
                                                          className="cursor-pointer transition hover:bg-purple-50/40"
                                                        >
                                                          <td className="py-3.5 pl-5 pr-3">
                                                            <div className="flex items-center gap-3">
                                                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e5e7eb] text-[11px] font-bold text-[#374151] ring-1 ring-purple-200">
                                                                {getInitials(item.institution || item.title)}
                                                              </div>
                                                                <div className="min-w-0">
                                                                  <div className="line-clamp-1 font-semibold text-[#374151] hover:text-[#7c3aed]">
                                                                    {item.title}
                                                                  </div>
                                                                  <div className="line-clamp-1 text-[11px] text-gray-500">
                                                                    {item.institution || "Brak danych w źródle"}
                                                                  </div>
                                                                </div>
                                                              </div>
                                                              </td>
                                                              <td className="px-3 py-3.5 text-gray-600">
                                                                <div className="max-w-[130px] truncate font-medium">
                                                                  {item.source.registryName}
                                                                </div>
                                                            <div className="text-[10px] text-gray-400">
                                                              {item.isPreIndexed ? "Tor A" : "Tor B"}
                                                            </div>
                                                          </td>
                                                          <td className="px-3 py-3.5 tabular-nums text-gray-600">
                                                            <div className="font-semibold text-gray-800">
                                                              {formatTrl(item.domain, item.scoring?.trl ?? null)}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500">
                                                              Wiar: {item.scoring?.credibilityIndex ?? "-"}/5 · Wdr:{" "}
                                                              {item.scoring?.implementationLevel ?? "-"}/5
                                                            </div>
                                                          </td>
                                                          <td className="py-3.5 pl-3 pr-5 text-right">
                                                            <div className="flex flex-col items-end gap-1">
                                                              <span
                                                                className={`inline-block rounded-[2px] px-2 py-0.5 text-[10px] font-semibold ${domainBadgeFlat(item.domain)}`}
                                                              >
                                                                {DOMAIN_LABELS[item.domain]}
                                                              </span>
                                                              <Link
                                                                href={`/innovations/${item.id}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#7c3aed] hover:underline"
                                                              >
                                                                <span>Karta</span>
                                                                <ArrowUpRight className="h-3 w-3" />
                                                              </Link>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              )}
                                            </div>

        {/* PRAWE 5 KOLUMN: „Ostatnie aktualizacje” (1:1 jak „Latest Updates” timeline card) */}
                                                <div className="flat-card flex flex-col lg:col-span-5">
                                                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                                                    <h2 className="text-[15px] font-semibold text-[#374151]">
                                                      Ostatnie aktualizacje
                                                    </h2>
                                                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                                  </div>

                                                  <div className="flex-1 px-5 py-5">
                                                    <div className="relative space-y-5">
                                                      {timelineUpdates.map((entry, idx) => {
                                                        const circleBg =
                                                          entry.iconKind === "eval"
                                                            ? "bg-[#7c3aed]"
                                                            : entry.iconKind === "scan"
                                                              ? "bg-[#4b5563]"
                                                              : "bg-[#9333ea]";

                                                        return (
                                                          <div key={entry.id} className="relative flex items-start gap-3">
                                                            {/* Czas / etykieta po lewej (1:1 jak „2 hrs ago”) */}
                                                            <div className="w-16 shrink-0 pt-1 text-right text-[11px] font-medium text-gray-400">
                                                              {entry.timeLabel}
                                                            </div>

                                                            {/* Pionowa linia łącząca + okrągła ikona */}
                                                            <div className="relative flex flex-col items-center">
                                                              {idx < timelineUpdates.length - 1 && (
                                                                <span
                                                                  aria-hidden="true"
                                                                  className="absolute top-9 h-[calc(100%+14px)] w-px bg-gray-200"
                                                                />
                                                              )}
                                                              <div
                                                                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-xs ${circleBg}`}
                                                              >
                                                                {entry.iconKind === "eval" ? (
                                                                  <Scale className="h-4 w-4" />
                                                                ) : entry.iconKind === "scan" ? (
                                                                  <ScanSearch className="h-4 w-4" />
                                                                ) : (
                          <CheckCircle2 className="h-4 w-4" />
                                                                )}
                                                              </div>
                                                            </div>

                                                              {/* Treść zdarzenia */}
                                                              <div className="min-w-0 flex-1 pt-0.5">
                                                                {entry.href ? (
                                                                  <Link
                                                                    href={entry.href}
                                                                    className="line-clamp-1 text-[13px] font-semibold text-[#374151] hover:text-[#7c3aed]"
                                                                  >
                                                                    {entry.title}
                                                                  </Link>
                                                                ) : (
                                                                  <div className="line-clamp-1 text-[13px] font-semibold text-[#374151]">
                                                                    {entry.title}
                                                                  </div>
                                                                )}
                                                                <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                                                                  {entry.subtitle}
                                                                </p>
                                                              </div>
                                                            </div>
                                                      );
              })}
                                                    </div>
                                                  </div>

                                                  <div className="border-t border-gray-100 bg-[#f9fafb] px-5 py-3 text-center">
                                                    <Link
                                                      href="/oceny"
                                                      className="text-xs font-semibold text-[#7c3aed] hover:underline"
                                                    >
                                                      Zobacz wszystkie raporty Debaty 4 AI →
                                                    </Link>
                                                  </div>
                                                </div>
                                              </section>

                                            {/* PRZEŁĄCZNIK 6 PERSPEKTYW UŻYTKOWNIKA (w płaskim stylu szaro-fioletowym) */}
                                            <RoleSwitcher onSelectPersona={handlePersonaChange} />

                                            {/* SKANER DORAŹNY OSINT (TOR B) */}
                                            <div id="skaner-tor-b">
                                              <ScannerPanel onInnovationCreated={handleInnovationCreated} />
                                            </div>

                                            {/* Modal szczegółowej Karty Innowacji („Fakty vs AI”) */}
                                            {selectedInnovation && (
                                              <div
                                                role="dialog"
                                                aria-modal="true"
                                                aria-label={`Szczegóły innowacji: ${selectedInnovation.title}`}
                                                className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-xs sm:p-6"
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
                                                    className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-[2px] border border-gray-200 bg-white text-gray-600 shadow-xs hover:bg-gray-100 hover:text-gray-900"
                                                  >
                                                    <X className="h-4 w-4" />
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
