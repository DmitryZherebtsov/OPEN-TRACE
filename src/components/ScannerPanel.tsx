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
  MoreHorizontal,
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
          throw new Error(
            "Wybierz plik PDF (maks. 10 MB) przed uruchomieniem skanu."
          );
        }
        const formData = new FormData();
        formData.append("file", pdfFile);
        response = await fetch("/api/scan", {
          method: "POST",
          body: formData,
        });
      } else if (tab === "url") {
        if (!urlInput.trim()) {
          throw new Error(
            "Wpisz pełny adres URL (https://...) do przeskanowania."
          );
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
          data.error ||
          "Nie udało się przeanalizować wskazanego materiału źródłowego."
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
          <section aria-label="Skaner doraźny Tor B" className="flat-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-[2px] bg-[#7c3aed] px-2 py-0.5 text-[11px] font-bold text-white">
                  TOR B
                </span>
                <h2 className="text-[15px] font-semibold text-[#374151]">
                  Skan doraźny OSINT (Adres URL · Plik PDF · Tekst źródłowy)
                </h2>
              </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-[2px] bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
                    <ShieldAlert className="h-3.5 w-3.5 text-[#7c3aed]" />
                    <span>Ochrona SSRF + limit 10 MB</span>
                  </span>
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </div>
              </div>

      <div className="p-5">
        {/* Zakładki trybu skanera */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3.5">
          <button
            type="button"
            onClick={() => {
              setTab("url");
              setErrorMsg(null);
            }}
            className={`inline-flex items-center gap-1.5 rounded-[2px] px-3.5 py-2 text-xs font-semibold transition ${
              tab === "url"
                ? "bg-[#7c3aed] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-[#6d28d9]"
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
            className={`inline-flex items-center gap-1.5 rounded-[2px] px-3.5 py-2 text-xs font-semibold transition ${
              tab === "pdf"
                ? "bg-[#7c3aed] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-[#6d28d9]"
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
            className={`inline-flex items-center gap-1.5 rounded-[2px] px-3.5 py-2 text-xs font-semibold transition ${
              tab === "text"
                ? "bg-[#7c3aed] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-[#6d28d9]"
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
                            className="block text-xs font-semibold text-gray-700"
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
                            className="w-full rounded-[2px] border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none"
                          />
                          <p className="text-[11px] text-gray-500">
                            Adresy wewnętrzne (<code>localhost</code>, sieci prywatne,
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
                            className="block text-xs font-semibold text-gray-700"
                          >
                            Prześlij raport badawczy, uchwałę lub opis patentowy w formacie
                            PDF (maks. 10 MB)
                          </label>
                          <input
                            id="scan-pdf-input"
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                            className="block w-full cursor-pointer rounded-[2px] border border-dashed border-gray-300 bg-[#f9fafb] p-3 text-xs text-gray-700 file:mr-3 file:rounded-[2px] file:border-0 file:bg-[#7c3aed] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#6d28d9]"
                          />
                          {pdfFile && (
                            <p className="text-xs text-[#6d28d9]">
                              Wybrano plik: <strong>{pdfFile.name}</strong> (
                              {(pdfFile.size / 1024).toFixed(1)} KB)
                            </p>
                          )}
                        </div>
                      )}

                      {tab === "text" && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold text-gray-500">
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
                                className="inline-flex items-center gap-1 rounded-[2px] border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-[#6d28d9] hover:bg-purple-100"
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
                            className="w-full rounded-[2px] border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none"
                          />
                          <textarea
                            rows={4}
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Wklej pełny opis z raportu uczelnianego, BIP samorządu, bazy patentowej lub dokumentacji grantowej..."
                            className="w-full rounded-[2px] border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none"
                          />
                        </div>
                      )}

                      {errorMsg && (
                        <div
                          role="alert"
                          className="flex items-start gap-2 rounded-[2px] border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800"
                        >
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      {successMsg && (
                        <div
                          role="status"
                          className="flex items-start gap-2 rounded-[2px] border border-purple-200 bg-purple-50 p-3 text-xs font-medium text-[#5b21b6]"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7c3aed]" />
                          <span>{successMsg}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="inline-flex items-center gap-2 rounded-[2px] bg-[#7c3aed] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-60"
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
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#7c3aed]"
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
          <div className="mt-4 rounded-[2px] border border-gray-200 bg-[#f9fafb] p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Ostatnie zadania skanowania OSINT
              </h3>
              <button
                type="button"
                onClick={() => void loadJobs()}
                className="text-[11px] font-semibold text-[#7c3aed] hover:underline"
              >
                Odśwież logi
              </button>
            </div>

            {loadingJobs ? (
              <p className="text-xs text-gray-500">Ładowanie logów...</p>
            ) : jobs.length === 0 ? (
              <p className="text-xs text-gray-500">
                Brak zarejestrowanych zadań skanowania.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-[11px] text-gray-500">
                      <th className="py-1.5 pr-3">Typ</th>
                      <th className="py-1.5 pr-3">Cel / źródło</th>
                      <th className="py-1.5 pr-3">Status</th>
                      <th className="py-1.5 pr-3">Czas</th>
                      <th className="py-1.5">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/70">
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td className="py-1.5 pr-3 font-mono text-[11px] font-semibold text-[#6d28d9]">
                          {job.kind}
                        </td>
                        <td className="max-w-xs truncate py-1.5 pr-3 text-gray-700">
                          {job.target}
                        </td>
                        <td className="py-1.5 pr-3">
                          <span
                            className={`rounded-[2px] px-2 py-0.5 text-[10px] font-bold ${
                              job.status === "ZAKONCZONO"
                                ? "bg-purple-100 text-[#5b21b6]"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="py-1.5 pr-3 tabular-nums text-gray-600">
                          {job.durationMs} ms
                        </td>
                        <td className="py-1.5 text-gray-500">
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
                </div>
    </section>
          );
}
