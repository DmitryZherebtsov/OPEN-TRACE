import type { Metadata } from "next";
import "./globals.css";
import { PersonaProvider } from "@/components/PersonaContext";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "OPEN TRACE — Radar Innowacji (HackNation 2026)",
  description:
    "Hybrydowa platforma OSINT (Tor A + Tor B) i Wieloagentowy System Oceny Projektów (Debata 4 AI) dla Podkarpackiego Centrum Innowacji. Licencja EUPL-1.2.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <PersonaProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="mt-12 border-t border-slate-200 bg-white">
              <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <div>
                  <strong className="font-semibold text-slate-700">
                    OPEN TRACE — Radar Innowacji
                  </strong>{" "}
                  · HackNation 2026 · Podkarpackie Centrum Innowacji (PCI) ·
                  Zespół: Podkarpacki Impuls (Stolik 5B)
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span>Licencja: EUPL-1.2</span>
                  <span>·</span>
                  <span>Podręcznik Oslo 2018</span>
                  <span>·</span>
                  <span>RODO: Zero PII (brak zbierania danych osobowych)</span>
                </div>
              </div>
            </footer>
          </div>
        </PersonaProvider>
      </body>
    </html>
  );
}
