import type { Metadata } from "next";
import "./globals.css";
import { PersonaProvider } from "@/components/PersonaContext";
import { AppShell } from "@/components/AppShell";

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
        <body className="min-h-screen bg-[#eef0f4] text-[#374151] antialiased">
          <PersonaProvider>
            <AppShell>{children}</AppShell>
          </PersonaProvider>
        </body>
    </html>
  );
}
