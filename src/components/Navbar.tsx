"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radar, Scale, SlidersHorizontal, ShieldCheck } from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Radar OSINT",
    sublabel: "Odkrywanie i Skaner",
    icon: Radar,
    isActive: (pathname: string) =>
      pathname === "/" || pathname.startsWith("/innovations"),
  },
  {
    href: "/oceny",
    label: "Oceny Wieloagentowe",
    sublabel: "Debata 4 AI",
    icon: Scale,
    isActive: (pathname: string) => pathname.startsWith("/oceny"),
  },
  {
    href: "/admin",
    label: "Panel Administratora",
    sublabel: "Budżet B_max",
    icon: SlidersHorizontal,
    isActive: (pathname: string) => pathname.startsWith("/admin"),
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-indigo-950/15 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4C1D95] to-[#6D28D9] text-white shadow-sm ring-1 ring-violet-900/20">
              <svg
                viewBox="0 0 36 36"
                className="h-6 w-6"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="currentColor"
                  strokeOpacity="0.35"
                  strokeWidth="1.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="9"
                  stroke="currentColor"
                  strokeOpacity="0.6"
                  strokeWidth="1.5"
                />
                <circle cx="18" cy="18" r="2.5" fill="currentColor" />
                <path
                  d="M18 18L28 10"
                  stroke="#34D399"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="25.5" cy="12" r="2" fill="#34D399" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-[#4C1D95]">
                  OPEN TRACE
                </span>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-[#4C1D95]">
                  Radar Innowacji
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Podkarpackie Centrum Innowacji · HackNation 2026
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 sm:flex lg:hidden">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>EUPL-1.2 · Zero PII</span>
          </div>
        </div>

        <nav
          aria-label="Główna nawigacja przestrzeni roboczej"
          className="flex flex-wrap items-center gap-1.5"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.isActive(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm transition-all ${
                  active
                    ? "bg-[#4C1D95] text-white shadow-sm"
                    : "text-slate-700 hover:bg-violet-50 hover:text-[#4C1D95]"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${active ? "text-violet-200" : "text-slate-500"}`}
                />
                <div className="leading-tight">
                  <div className="font-semibold">{item.label}</div>
                  <div
                    className={`text-[11px] ${active ? "text-violet-200" : "text-slate-500"}`}
                  >
                    {item.sublabel}
                  </div>
                </div>
              </Link>
            );
          })}

          <div className="ml-2 hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 xl:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>EUPL-1.2 · RODO Zero PII</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
