"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  User,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Radar,
  ScanSearch,
  History,
  Scale,
  PlusCircle,
  Cpu,
  GraduationCap,
  Landmark,
  SlidersHorizontal,
  ShieldCheck,
  Building2,
  TrendingUp,
  Rocket,
  Lightbulb,
  X,
} from "lucide-react";
import { PERSONAS } from "@/lib/personas";
import { usePersona } from "@/components/PersonaContext";
import type { PersonaId } from "@/types/innovation";

const PERSONA_ICONS: Record<
  PersonaId,
  React.ComponentType<{ className?: string }>
> = {
  JST: Landmark,
  SZKOLY: GraduationCap,
  UCZELNIE: Building2,
  INWESTORZY: TrendingUp,
  STARTUPY: Rocket,
  WYNALAZCY: Lightbulb,
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { personaId, persona, setPersonaId } = usePersona();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [topDropdownOpen, setTopDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState("");

  const ActivePersonaIcon = PERSONA_ICONS[personaId];

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickQuery.trim();
    setQuickSearchOpen(false);
    if (q) {
      router.push(`/?q=${encodeURIComponent(q)}#tor-a`);
    } else {
      router.push("/#tor-a");
    }
  };

  const isNavActive = (match: "dashboard" | "oceny" | "admin") => {
    if (match === "dashboard") {
      return pathname === "/" || pathname.startsWith("/innovations");
    }
    if (match === "oceny") return pathname.startsWith("/oceny");
    return pathname.startsWith("/admin");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#282c34] text-[#b4bcc8] select-none">
      {/* Profil aktywnej perspektywy (1:1 jak blok „John Doe / UX Designer ▾”) */}
      <div className="border-b border-[#363c48] bg-[#303540] px-4 py-4">
        <button
          type="button"
          onClick={() => setProfileMenuOpen((v) => !v)}
          className="flex w-full items-center gap-3 text-left transition hover:text-white"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#434a59] text-white ring-2 ring-[#7c3aed]/70">
            <ActivePersonaIcon className="h-5 w-5 text-[#c4b5fd]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-white">
              {persona.shortLabel}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#9ca3af]">
              <span className="truncate">Perspektywa RODO</span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                  profileMenuOpen ? "rotate-180 text-[#a78bfa]" : ""
                }`}
              />
            </div>
          </div>
        </button>

        {profileMenuOpen && (
          <div className="mt-3 space-y-1 border-t border-[#3e4552] pt-2.5">
            <div className="px-1 text-[10px] font-semibold uppercase tracking-wider text-[#a78bfa]">
              Wybierz perspektywę (6 grup)
            </div>
            {PERSONAS.map((item) => {
              const Icon = PERSONA_ICONS[item.id];
              const active = item.id === personaId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPersonaId(item.id);
                    setProfileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-[2px] px-2 py-1.5 text-left text-xs transition ${
                    active
                      ? "bg-[#7c3aed] font-semibold text-white"
                      : "text-[#c3cad5] hover:bg-[#3a404d] hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sekcje menu bocznego (1:1 jak Navigation / UI Element / Forms & Table / Chart & Maps / Pages) */}
      <nav
        aria-label="Menu boczne OPEN TRACE"
        className="flex-1 overflow-y-auto py-3 text-[13px]"
      >
        {/* Sekcja 1: Nawigacja */}
        <div className="mb-3">
          <div className="px-5 py-1.5 text-[11px] font-semibold tracking-wide text-[#a78bfa]">
            Nawigacja
          </div>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-5 py-2.5 transition ${
              isNavActive("dashboard")
                ? "bg-[#7c3aed] font-medium text-white shadow-xs"
                : "text-[#c3cad5] hover:bg-[#323742] hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">Panel Radaru</span>
          </Link>
          <Link
            href="/#tor-a"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between gap-3 px-5 py-2.5 text-[#c3cad5] transition hover:bg-[#323742] hover:text-white"
          >
            <span className="flex items-center gap-3 truncate">
              <Radar className="h-4 w-4 shrink-0 text-[#9ca3af]" />
              <span className="truncate">Baza Tor A (&lt;200 ms)</span>
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-[#6b7280]" />
          </Link>
        </div>

        {/* Sekcja 2: Skaner OSINT */}
        <div className="mb-3">
          <div className="px-5 py-1.5 text-[11px] font-semibold tracking-wide text-[#a78bfa]">
            Skaner OSINT (Tor B)
          </div>
          <Link
            href="/#skaner-tor-b"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between gap-3 px-5 py-2.5 text-[#c3cad5] transition hover:bg-[#323742] hover:text-white"
          >
            <span className="flex items-center gap-3 truncate">
              <ScanSearch className="h-4 w-4 shrink-0 text-[#9ca3af]" />
              <span className="truncate">Skan URL / PDF / Tekst</span>
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-[#6b7280]" />
          </Link>
          <Link
            href="/#skaner-tor-b"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-5 py-2.5 text-[#c3cad5] transition hover:bg-[#323742] hover:text-white"
          >
            <History className="h-4 w-4 shrink-0 text-[#9ca3af]" />
            <span className="truncate">Dziennik ScanJob</span>
          </Link>
        </div>

        {/* Sekcja 3: Oceny Wieloagentowe */}
        <div className="mb-3">
          <div className="px-5 py-1.5 text-[11px] font-semibold tracking-wide text-[#a78bfa]">
            Oceny Wieloagentowe
          </div>
          <Link
            href="/oceny"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-5 py-2.5 transition ${
              isNavActive("oceny")
                ? "bg-[#7c3aed] font-medium text-white shadow-xs"
                : "text-[#c3cad5] hover:bg-[#323742] hover:text-white"
            }`}
          >
            <Scale className="h-4 w-4 shrink-0" />
            <span className="truncate">Debata 4 AI (3 Tabele)</span>
          </Link>
          <Link
            href="/oceny#nowa-debata"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-5 py-2.5 text-[#c3cad5] transition hover:bg-[#323742] hover:text-white"
          >
            <PlusCircle className="h-4 w-4 shrink-0 text-[#9ca3af]" />
            <span className="truncate">Nowa Ocena Projektu</span>
          </Link>
        </div>

        {/* Sekcja 4: Domeny Oslo 2018 */}
        <div className="mb-3">
          <div className="px-5 py-1.5 text-[11px] font-semibold tracking-wide text-[#a78bfa]">
            Domeny Oslo 2018
          </div>
          <Link
            href="/?domain=TECHNOLOGICZNY#tor-a"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-5 py-2 text-[#c3cad5] transition hover:bg-[#323742] hover:text-white"
          >
            <Cpu className="h-4 w-4 shrink-0 text-[#9ca3af]" />
            <span className="truncate">Technologiczne (TRL)</span>
          </Link>
          <Link
            href="/?domain=EDUKACYJNY#tor-a"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-5 py-2 text-[#c3cad5] transition hover:bg-[#323742] hover:text-white"
          >
            <GraduationCap className="h-4 w-4 shrink-0 text-[#9ca3af]" />
            <span className="truncate">Edukacyjne (TRL: N/D)</span>
          </Link>
          <Link
            href="/?domain=ADMINISTRACYJNY#tor-a"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-5 py-2 text-[#c3cad5] transition hover:bg-[#323742] hover:text-white"
          >
            <Landmark className="h-4 w-4 shrink-0 text-[#9ca3af]" />
            <span className="truncate">Administracyjne (N/D)</span>
          </Link>
        </div>

        {/* Sekcja 5: Administracja */}
        <div>
          <div className="px-5 py-1.5 text-[11px] font-semibold tracking-wide text-[#a78bfa]">
            Administracja
          </div>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between gap-3 px-5 py-2.5 transition ${
              isNavActive("admin")
                ? "bg-[#7c3aed] font-medium text-white shadow-xs"
                : "text-[#c3cad5] hover:bg-[#323742] hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3 truncate">
              <SlidersHorizontal className="h-4 w-4 shrink-0" />
              <span className="truncate">Budżet B_max (120%)</span>
            </span>
            <ChevronRight className="h-3.5 w-3.5 opacity-70" />
          </Link>
          <div className="mx-4 mt-3 rounded-[2px] border border-[#3e4552] bg-[#21252d] px-3 py-2 text-[11px] text-[#9ca3af]">
            <div className="flex items-center gap-1.5 font-semibold text-[#c4b5fd]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>EUPL-1.2 · Zero PII</span>
            </div>
            <p className="mt-1 leading-snug text-[#8b94a3]">
              Podkarpackie Centrum Innowacji · HackNation 2026
            </p>
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eef0f4] text-[#374151]">
      {/* GÓRNY PASEK NAWIGACJI (1:1 jak ciemny pasek „FLAT ABLE ≡  🔍 Dropdown Mega ... 🔔5 👤”) */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center bg-[#21252d] text-white shadow-sm">
        {/* Blok logo o szerokości sidebaru */}
        <div
          className={`flex h-full shrink-0 items-center justify-between border-r border-[#303540] px-4 transition-all ${
            sidebarCollapsed ? "w-auto lg:w-16" : "w-[235px]"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#21252d] shadow-xs">
              <svg
                viewBox="0 0 32 32"
                className="h-5 w-5"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  stroke="#7c3aed"
                  strokeWidth="2.2"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="6"
                  stroke="#374151"
                  strokeWidth="1.8"
                />
                <path
                  d="M16 16L24 9"
                  stroke="#7c3aed"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="16" cy="16" r="2.2" fill="#21252d" />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <span className="truncate text-[15px] font-bold tracking-wider uppercase">
                OPEN TRACE
              </span>
            )}
          </Link>

          {/* Hamburger dla desktopu */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            aria-label="Zwiń lub rozwiń panel boczny"
            className="hidden rounded p-1 text-[#c3cad5] hover:bg-[#323742] hover:text-white lg:inline-flex"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Hamburger dla mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Otwórz menu nawigacji"
            className="inline-flex rounded p-1 text-[#c3cad5] hover:bg-[#323742] hover:text-white lg:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Prawa część paska górnego (🔍  Perspektywa ▾  Skaner Tor B  ...  🔔 👤) */}
        <div className="flex flex-1 items-center justify-between px-4 sm:px-5">
          <div className="flex items-center gap-4 text-[13px] text-[#c3cad5]">
            {/* Szybkie wyszukiwanie */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setQuickSearchOpen((v) => !v)}
                aria-label="Szybkie wyszukiwanie OSINT"
                className="flex items-center gap-1.5 rounded px-2 py-1 hover:bg-[#303540] hover:text-white"
              >
                <Search className="h-4 w-4" />
              </button>
              {quickSearchOpen && (
                <form
                  onSubmit={handleQuickSearchSubmit}
                  className="absolute left-0 top-10 z-50 flex w-72 items-center gap-1.5 rounded-[2px] border border-gray-200 bg-white p-2 text-gray-800 shadow-lg"
                >
                  <input
                    type="search"
                    value={quickQuery}
                    onChange={(e) => setQuickQuery(e.target.value)}
                    placeholder="Szukaj w Tor A (np. Boguchwała)..."
                    autoFocus
                    className="w-full rounded-[2px] border border-gray-300 px-2.5 py-1.5 text-xs focus:border-[#7c3aed] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-[2px] bg-[#7c3aed] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#6d28d9]"
                  >
                    Szukaj
                  </button>
                </form>
              )}
            </div>

            {/* Dropdown Perspektywy (1:1 jak „Dropdown” w Flat Able) */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setTopDropdownOpen((v) => !v)}
                className="flex items-center gap-1 rounded px-2 py-1 hover:bg-[#303540] hover:text-white"
              >
                <span>Perspektywa: {persona.shortLabel}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {topDropdownOpen && (
                <div className="absolute left-0 top-10 z-50 w-64 rounded-[2px] border border-gray-200 bg-white py-1 text-xs text-gray-700 shadow-lg">
                  <div className="border-b border-gray-100 px-3 py-2 text-[11px] font-semibold text-[#7c3aed]">
                    Przełącznik perspektywy (RODO)
                  </div>
                  {PERSONAS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPersonaId(item.id);
                        setTopDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50 ${
                        item.id === personaId
                          ? "bg-purple-50 font-semibold text-[#6d28d9]"
                          : ""
                      }`}
                    >
                      <span>{item.shortLabel}</span>
                      <span className="text-[10px] text-gray-400">
                        {item.id}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Szybkie skróty (1:1 jak „Mega”) */}
            <Link
              href="/oceny"
              className="hidden rounded px-2 py-1 hover:bg-[#303540] hover:text-white md:inline-block"
            >
              Debata 4 AI
            </Link>
            <Link
              href="/admin"
              className="hidden rounded px-2 py-1 hover:bg-[#303540] hover:text-white md:inline-block"
            >
              Budżet B_max
            </Link>
          </div>

          {/* Ikony po prawej (dzwonek z licznikiem + ikona profilu/statusu) */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Powiadomienia systemowe"
                className="relative rounded p-1.5 text-[#c3cad5] hover:bg-[#303540] hover:text-white"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#7c3aed] px-1 text-[10px] font-bold text-white">
                  3
                </span>
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-10 z-50 w-72 rounded-[2px] border border-gray-200 bg-white text-xs text-gray-700 shadow-lg">
                  <div className="border-b border-gray-100 bg-[#282c34] px-3 py-2 font-semibold text-white">
                    Status platformy OPEN TRACE
                  </div>
                  <div className="divide-y divide-gray-100">
                    <div className="px-3 py-2.5">
                      <div className="font-semibold text-gray-900">
                        Tor A pre-indeksowany
                      </div>
                      <div className="text-[11px] text-gray-500">
                        15 polskich innowacji gotowych do wyszukiwania &lt; 200 ms.
                      </div>
                    </div>
                    <div className="px-3 py-2.5">
                      <div className="font-semibold text-gray-900">
                        Ochrona SSRF i RODO aktywne
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Blokada adresów wewnętrznych oraz tryb Zero PII.
                      </div>
                    </div>
                    <div className="px-3 py-2.5">
                      <div className="font-semibold text-gray-900">
                        Debata 4 AI + wzory PERT
                      </div>
                      <div className="text-[11px] text-gray-500">
                        3 tabele routingu aktywne względem 120% B_max.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/admin"
              title="Panel Administratora (Budżet B_max)"
              className="rounded p-1.5 text-[#c3cad5] hover:bg-[#303540] hover:text-white"
            >
              <User className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* LEWY SIDEBAR DESKTOP */}
      {!sidebarCollapsed && (
        <aside className="fixed bottom-0 left-0 top-14 z-30 hidden w-[235px] lg:block">
          {sidebarContent}
        </aside>
      )}

      {/* LEWY SIDEBAR MOBILE (DRAWER) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <aside
            className="relative z-10 mt-14 w-[245px]"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* GŁÓWNA PRZESTRZEŃ ROBOCZA */}
      <div
        className={`flex min-h-screen flex-col pt-14 transition-all ${
          sidebarCollapsed ? "lg:pl-0" : "lg:pl-[235px]"
        }`}
      >
        <main className="flex-1 p-4 sm:p-6">{children}</main>

        <footer className="border-t border-gray-200/80 bg-white px-6 py-3.5 text-[11px] text-gray-500">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <strong className="font-semibold text-gray-700">
                OPEN TRACE — Radar Innowacji
              </strong>{" "}
              · HackNation 2026 · Podkarpackie Centrum Innowacji (PCI) · Zespół:
              Podkarpacki Impuls (Stolik 5B)
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-[#6d28d9]">Licencja EUPL-1.2</span>
              <span>·</span>
              <span>Podręcznik Oslo 2018</span>
              <span>·</span>
              <span>RODO: Zero PII</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
