"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  FileUp,
  FileText,
  ShieldAlert,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import type { InnovationDTO, ScanJobDTO } from "@/types/innovation";

type ScanTab = "url" | "pdf" | "text";

const POLISH_TEXT_PRESETS = [
  {
    id: "preset-tech",
    label: "Przykład 1: Technologiczny (Sieć ciepłownicza + termowizja)",
    title: "Predykcyjny monitoring sieci ciepłowniczej z analizą termowizyjną",
    text: `Raport B+R Politechnika Rzeszowska im. Ignacego Łukasiewicza, data publikacji: 2025-11-18, numer umowy grantowej: NCBR/LIDER/14/0099/2025.
Zespół badawczy opracował system wczesnego wykrywania wycieków w miejskich sieciach ciepłowniczych oparty o naloty dronów z kamerą radiometryczną oraz algorytm korelacji strat ciepła.
W trakcie testów terenowych w 2 gminach przebadano 28 km magistrali ciepłowniczej i zidentyfikowano 14 ukrytych uszkodzeń izolacji na etapie przedawaryjnym (skuteczność detekcji 93,5%, redukcja czasu przeglądów o 60%).
System osiągnął poziom gotowości technologicznej TRL 6 i posiada kompletną dokumentację techniczną oraz raport z walidacji polowej.`,
  },
  {
    id: "preset-admin",
    label: "Przykład 2: Administracyjny / Edukacyjny (Stołówki szkolne JST)",
    title: "Cyfrowe bilansowanie obiadów i redukcja odpadów w szkołach gminnych",
    text: `Biuletyn Samorządowy Urząd Gminy Trzebownisko, data publikacji: 2025-10-15.
Wydział Edukacji i Obsługi Szkół wdrożył w 5 szkołach podstawowych procedurę codziennego bilansowania zgłoszeń nieobecności uczniów do godziny 8:15 z automatycznym podsumowaniem dla kuchni i intendentów.
W pierwszym semestrze pilotażu ograniczono marnowanie żywności o 31%, generując oszczędność 44 tys. zł rocznie na jedną placówkę. Wdrożenie w kolejnej gminie trwa poniżej 3 tygodni bez dodatkowych nakładów na zakup systemów IT.
Raport ewaluacyjny oraz wzór zarządzenia stanowią załącznik do uchwały rady gminy.`,
  },
];

interface ScannerPanelProps {
  onInnovationCreated: (innovation: InnovationDTO) => void;
}

export function ScannerPanel({ onInnovationCreated }: ScannerPanelProps) {
  const [tab, setTab] = useState<ScanTab>("text");
  const [urlInput, setUrlInput] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textInput, setTextInput] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [jobsOpen, setJobsOpen] = useState(false);
  const [jobs, setJobs] = useState<ScanJobDTO[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    if (jobsOpen) {
      void loadJobs();
    }
  }, [jobsOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let response: Response;
      if (tab === "pdf") {
        if (!pdfFile) {
          throw new Error("Wybierz plik PDF (maks. 10 MB) przed uruchomieniem skanu.");
        }
        const formData = new FormData();
        formData.append("file", pdfFile);
        response = await fetch("/api/scan", {
          method: "POST",
          body: formData,
        });
      } else if (tab === "url") {
        if (!urlInput.trim()) {
          throw new Error("Wpisz pełny adres URL (https://...) do przeskanowania.");
        }
        response = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "url",
            url: urlInput.trim(),
          }),
        });
      } else {
        if (textInput.trim().length < 40) {
          throw new Error(
            "Wklej tekst źródłowy o długości co najmniej 40 znaków lub użyj jednego z gotowych przykładów."
          );
        }
        response = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "text",
            title: textTitle.trim() || undefined,
            text: textInput.trim(),
          }),
        });
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Nie udało się przeanalizować wskazanego materiału źródłowego."
        );
      }

      const created = data.innovation as InnovationDTO;
      setSuccessMsg(
        `Zakończono skan Tor B (${data.job?.durationMs ?? 0} ms). Dodano rekord: „${created.title}”.`
      );
      onInnovationCreated(created);
      if (jobsOpen) {
        void loadJobs();
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Wystąpił błąd podczas skanowania doraźnego."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-label="Skaner doraźny Tor B"
      className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#4C1D95] px-2 py-0.5 text-[11px] font-bold text-white">
              TOR B
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Skan doraźny OSINT (URL · PDF · Tekst źródłowy)
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Ekstrakcja wg Protokołu „Fakty vs AI”, deterministyczny Indeks
            wiarygodności, szybka antyduplikacja względem bazy Tor A oraz
            twarda blokada SSRF.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Ochrona SSRF + limit 10 MB</span>
        </div>
      </div>

      {/* Zakładki trybu skanera */}
      <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        <button
          type="button"
          onClick={() => {
            setTab("url");
            setErrorMsg(null);
          }}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            tab === "url"
              ? "bg-[#4C1D95] text-white"
              : "bg-slate-100 text-slate-700 hover:bg-violet-50 hover:text-[#4C1D95]"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Adres URL</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("pdf");
            setErrorMsg(null);
          }}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            tab === "pdf"
              ? "bg-[#4C1D95] text-white"
              : "bg-slate-100 text-slate-700 hover:bg-violet-50 hover:text-[#4C1D95]"
          }`}
        >
          <FileUp className="h-3.5 w-3.5" />
          <span>Plik PDF (do 10 MB)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("text");
            setErrorMsg(null);
          }}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
            tab === "text"
              ? "bg-[#4C1D95] text-white"
              : "bg-slate-100 text-slate-700 hover:bg-violet-50 hover:text-[#4C1D95]"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Tekst źródłowy</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
        {tab === "url" && (
          <div className="space-y-2">
            <label
              htmlFor="scan-url-input"
              className="block text-xs font-semibold text-slate-700"
            >
              Publiczny adres URL dokumentu HTML lub PDF (rejestry, BIP,
              uczelnie, bazy grantowe)
            </label>
            <input
              id="scan-url-input"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://bip.prz.edu.pl/raport-innowacji.pdf"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
            <p className="text-[11px] text-slate-500">
              Adresy wewnętrzne (<code>localhost</code>, sieci prywatne RFC1918,
              link-local <code>169.254.0.0/16</code>, IPv6 <code>::1</code>/
              <code>fc00::/7</code>) są automatycznie blokowane przez filtr
              SSRF.
            </p>
          </div>
        )}

        {tab === "pdf" && (
          <div className="space-y-2">
            <label
              htmlFor="scan-pdf-input"
              className="block text-xs font-semibold text-slate-700"
            >
              Prześlij raport badawczy, uchwałę lub opis patentowy w formacie
              PDF (maks. 10 MB)
            </label>
            <input
              id="scan-pdf-input"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              className="block w-full cursor-pointer rounded-xl border border-dashed border-violet-300 bg-violet-50/40 p-3 text-xs text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-[#4C1D95] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#6D28D9]"
            />
            {pdfFile && (
              <p className="text-xs text-emerald-700">
                Wybrano plik: <strong>{pdfFile.name}</strong> (
                {(pdfFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        )}

        {tab === "text" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">
                Gotowe przykłady źródłowe (1 kliknięcie):
              </span>
              {POLISH_TEXT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setTextTitle(preset.title);
                    setTextInput(preset.text);
                    setErrorMsg(null);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-[#4C1D95] hover:bg-violet-100"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            <input
              type="text"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              placeholder="Opcjonalny tytuł dokumentu / projektu"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
            <textarea
              rows={5}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Wklej pełny opis z raportu uczelnianego, BIP samorządu, bazy patentowej lub dokumentacji grantowej..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </div>
        )}

        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#4C1D95] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analizowanie źródła (Fakty vs AI)...</span>
              </>
            ) : (
              <span>Uruchom skan OSINT (Tor B)</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setJobsOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#4C1D95]"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Dziennik zadań skanowania (ScanJob)</span>
            {jobsOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>

      {/* Rozwijane logi ScanJob */}
      {jobsOpen && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Ostatnie zadania skanowania OSINT
            </h3>
            <button
              type="button"
              onClick={() => void loadJobs()}
              className="text-[11px] font-semibold text-[#6D28D9] hover:underline"
            >
              Odśwież logi
            </button>
          </div>

          {loadingJobs ? (
            <p className="text-xs text-slate-500">Ładowanie logów...</p>
          ) : jobs.length === 0 ? (
            <p className="text-xs text-slate-500">
              Brak zarejestrowanych zadań skanowania.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] text-slate-500">
                    <th className="py-1.5 pr-3">Typ</th>
                    <th className="py-1.5 pr-3">Cel / źródło</th>
                    <th className="py-1.5 pr-3">Status</th>
                    <th className="py-1.5 pr-3">Czas</th>
                    <th className="py-1.5">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td className="py-1.5 pr-3 font-mono text-[11px] font-semibold text-[#4C1D95]">
                        {job.kind}
                      </td>
                      <td className="max-w-xs truncate py-1.5 pr-3 text-slate-700">
                        {job.target}
                      </td>
                      <td className="py-1.5 pr-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            job.status === "ZAKONCZONO"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-1.5 pr-3 tabular-nums text-slate-600">
                        {job.durationMs} ms
                      </td>
                      <td className="py-1.5 text-slate-500">
                        {new Date(job.startedAt).toLocaleString("pl-PL")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
