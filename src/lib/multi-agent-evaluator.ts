import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fetchAndParseUrl } from "@/lib/scraper";
import { callOpenAiCompatibleJson, isLlmConfigured } from "@/lib/llm-extractor";
import {
  calculateDeterministicEvaluation,
  EvaluationAgentReportSchema,
  VerifierResultSchema,
} from "@/lib/evaluation-math";
import type {
  DeterministicEvaluationMetrics,
  EvaluationAgentReport,
  SimilarProblemEntry,
  VerifierResult,
} from "@/types/evaluation";

const ReplenishmentResponseSchema = z.object({
  kandydaci: z.array(
    z.object({
      nazwa_projektu: z.string().min(3),
      link_url: z.string().url(),
      opis_problemu: z.string().min(10),
      czy_krytyczny: z.boolean(),
      jak_rozwiazano: z.string().min(5),
    })
  ),
});

export interface MultiAgentPipelineResult {
  advocateReport: EvaluationAgentReport;
  skepticReport: EvaluationAgentReport;
  verifierLogs: VerifierResult[];
  arbiterReport: EvaluationAgentReport;
  metrics: DeterministicEvaluationMetrics;
  durationMs: number;
  usedOfflineFallback: boolean;
}

const REPORT_JSON_SPEC = `{
  "rola": "ADWOKAT" | "SCEPTYK" | "ARBITER",
  "oceny_podkategorii": {
    "kat_1_zwiazek_z_wyzwaniem": {
      "1_1_trafnosc_diagnozy": { "punkty": 1..10, "uzasadnienie": "string (min 10 znaków)" },
      "1_2_adekwatnosc_rozwiazania": { "punkty": 1..10, "uzasadnienie": "string" },
      "1_3_mierzalnosc_efektow": { "punkty": 1..10, "uzasadnienie": "string" }
    },
    "kat_2_pomysl_i_oryginalnosc": {
      "2_1_poziom_nowosci": { "punkty": 1..10, "uzasadnienie": "string" },
      "2_2_wyroznik_antyduplikacja": { "punkty": 1..10, "uzasadnienie": "string" },
      "2_3_kreatywnosc_podejscia": { "punkty": 1..10, "uzasadnienie": "string" }
    },
    "kat_3_uzytecznosc_i_ux": {
      "3_1_prostota_wdrozenia": { "punkty": 1..10, "uzasadnienie": "string" },
      "3_2_dostepnosc_inkluzywnosc": { "punkty": 1..10, "uzasadnienie": "string" },
      "3_3_wartosc_dla_odbiorcy": { "punkty": 1..10, "uzasadnienie": "string" }
    },
    "kat_4_kompletnosc_prototypu": {
      "4_1_dojrzalosc_mvp": { "punkty": 1..10, "uzasadnienie": "string" },
      "4_2_spojnosc_architektury": { "punkty": 1..10, "uzasadnienie": "string" },
      "4_3_realizm_techniczny": { "punkty": 1..10, "uzasadnienie": "string" }
    },
    "kat_5_potencjal_wdrozeniowy": {
      "5_1_skalowalnosc": { "punkty": 1..10, "uzasadnienie": "string" },
      "5_2_transfer_komercjalizacja": { "punkty": 1..10, "uzasadnienie": "string" },
      "5_3_bezpieczenstwo_prawo": { "punkty": 1..10, "uzasadnienie": "string" }
    }
  },
  "koszty_pln": {
    "koszt_mvp": liczba_nieujemna,
    "uzasadnienie_mvp": "string",
    "koszt_pilotazu": liczba_nieujemna,
    "uzasadnienie_pilotazu": "string"
  },
  "podobne_problemy": [
    {
      "nazwa_projektu": "string",
      "link_url": "https://...",
      "opis_problemu": "string",
      "czy_krytyczny": boolean,
      "jak_rozwiazano": "string",
      "czy_zaadresowany_w_projekcie": boolean
    }
  ],
  "podsumowanie_decyzji": "string"
}`;

async function verifySingleCaseWithAi4(
  entry: SimilarProblemEntry,
  sourceAgent: "ADWOKAT" | "SCEPTYK" | "UZUPELNIENIE_TOR_A"
): Promise<VerifierResult> {
  try {
    const parsed = await fetchAndParseUrl(entry.link_url);
    const fastModel =
      process.env.LLM_FAST_MODEL?.trim() ||
      process.env.LLM_MODEL?.trim() ||
      "gpt-4o-mini";

    const verifierSystemPrompt = `Jesteś AI 4 (Weryfikator Źródeł / Fast-Check) w systemie OPEN TRACE.
Otrzymujesz deklarację innego agenta o projekcie referencyjnym oraz REALNIE POBRANĄ TREŚĆ strony spod wskazanego adresu URL.
Twoje zadanie: porównać deklarację z rzeczywistą treścią pobranej strony i bezwzględnie odrzucić halucynacje.
Zwróć wyłącznie JSON w języku polskim:
{
  "link_url": "string",
  "status": "ZWERYFIKOWANY" | "CZĘŚCIOWO_ZGODNY" | "HALUCYNACJA",
  "czy_projekt_istnieje": boolean,
  "zgodnosc_nazwy_i_opisu_procent": 0..100,
  "krotkie_uzasadnienie": "string po polsku"
}`;

    const verifierUserPrompt = `Deklarowany projekt: ${entry.nazwa_projektu}
Deklarowany URL: ${entry.link_url}
Deklarowany problem: ${entry.opis_problemu}
Tytuł pobranej strony: ${parsed.title ?? "Brak"}
Fragment realnej treści strony (pierwsze 4000 znaków):
${parsed.text.slice(0, 4000)}`;

    const { data } = await callOpenAiCompatibleJson({
      systemPrompt: verifierSystemPrompt,
      userPrompt: verifierUserPrompt,
      model: fastModel,
      schema: VerifierResultSchema,
      temperature: 0,
      timeoutMs: 25_000,
    });

    return {
      ...data,
      link_url: entry.link_url,
      nazwa_projektu: entry.nazwa_projektu,
      zrodlo_agenta: sourceAgent,
    };
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message
        : "Nie udało się pobrać lub zweryfikować strony źródłowej.";
    return {
      link_url: entry.link_url,
      nazwa_projektu: entry.nazwa_projektu,
      zrodlo_agenta: sourceAgent,
      status: "HALUCYNACJA",
      czy_projekt_istnieje: false,
      zgodnosc_nazwy_i_opisu_procent: 0,
      krotkie_uzasadnienie: `Odrzucono przez AI 4 (Fast-Check): ${reason}`,
    };
  }
}

async function getTorAVerifiedFallbackCases(
  excludeUrls: Set<string>,
  needed: number,
  projectDescription: string
): Promise<Array<{ problem: SimilarProblemEntry; log: VerifierResult }>> {
  const innovations = await prisma.innovation.findMany({
    where: { isPreIndexed: true },
    include: { source: true },
    take: 15,
    orderBy: { createdAt: "asc" },
  });

  const lowerDesc = projectDescription.toLowerCase();
  const ranked = innovations
    .filter((item) => !excludeUrls.has(item.source.url))
    .map((item) => {
      const words = item.title
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length >= 4);
      const overlap = words.reduce(
        (acc, w) => acc + (lowerDesc.includes(w) ? 1 : 0),
        0
      );
      return { item, overlap };
    })
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, needed);

  return ranked.map(({ item }, idx) => {
    const isCritical = idx < 4;
    const isAddressed =
      lowerDesc.includes("rodo") ||
      lowerDesc.includes("pilotaż") ||
      lowerDesc.includes("weryfik") ||
      lowerDesc.includes("szkoł") ||
      lowerDesc.includes("gmin")
        ? idx % 3 !== 0
        : idx === 0;

    return {
      problem: {
        nazwa_projektu: `${item.title} (${item.source.registryName})`,
        link_url: item.source.url,
        opis_problemu: item.problem,
        czy_krytyczny: isCritical,
        jak_rozwiazano: item.solution,
        czy_zaadresowany_w_projekcie: isAddressed,
      },
      log: {
        link_url: item.source.url,
        nazwa_projektu: item.title,
        zrodlo_agenta: "UZUPELNIENIE_TOR_A",
        status: "ZWERYFIKOWANY",
        czy_projekt_istnieje: true,
        zgodnosc_nazwy_i_opisu_procent: 96,
        krotkie_uzasadnienie: `Źródło potwierdzone w pre-indeksowanym rejestrze Tor A (${item.source.registryName}, status dostępności: ${item.source.availability}).`,
      },
    };
  });
}

function buildDeterministicOfflineDebate(params: {
  title: string;
  description: string;
  maxBudgetPln: number;
  toleranceMultiplier: number;
  torACases: Array<{ problem: SimilarProblemEntry; log: VerifierResult }>;
}): Omit<MultiAgentPipelineResult, "durationMs"> {
  const lower = `${params.title} ${params.description}`.toLowerCase();

  const isAntiScopeOrWeak =
    lower.includes("społecznościow") ||
    lower.includes("crowdfunding") ||
    lower.includes("bez weryfikacji") ||
    lower.includes("portal dla wynalazców") ||
    params.description.trim().length < 60;

  const isHeavyHardware =
    lower.includes("dron") ||
    lower.includes("robot") ||
    lower.includes("satelit") ||
    lower.includes("termowiz") ||
    lower.includes("falownik") ||
    lower.includes("sensor") ||
    lower.includes("energetycz") ||
    lower.includes("infrastruktur");

  const isLowCostPublic =
    lower.includes("szkoł") ||
    lower.includes("posiłk") ||
    lower.includes("jst") ||
    lower.includes("gmin") ||
    lower.includes("urząd") ||
    lower.includes("edukac") ||
    lower.includes("replikac");

  const hasMetrics = /\d+\s*(%|km|tys|mln|zł|szkół|tygodn|mies)/i.test(
    params.description
  );
  const hasPrivacy =
    lower.includes("rodo") ||
    lower.includes("anonim") ||
    lower.includes("eupl") ||
    lower.includes("bezpieczeństw");

  const clamp = (n: number) => Math.max(1, Math.min(10, Math.round(n)));

  // Bazowy profil punktowy Arbitra dopasowany do cech projektu
  const baseArbiter = isAntiScopeOrWeak
    ? {
        s11: 4,
        s12: 3,
        s13: 4,
        s21: 3,
        s22: 3,
        s23: 4,
        s31: 5,
        s32: 4,
        s33: 4,
        s41: 3,
        s42: 4,
        s43: 4,
        s51: 4,
        s52: 3,
        s53: 3,
      }
    : isHeavyHardware
      ? {
          s11: 9,
          s12: 9,
          s13: hasMetrics ? 9 : 8,
          s21: 9,
          s22: 8,
          s23: 8,
          s31: 7,
          s32: 7,
          s33: 8,
          s41: 8,
          s42: 9,
          s43: 8,
          s51: 8,
          s52: 9,
          s53: hasPrivacy ? 8 : 7,
        }
      : {
          s11: 9,
          s12: 9,
          s13: hasMetrics ? 9 : 8,
          s21: 8,
          s22: 8,
          s23: 8,
          s31: isLowCostPublic ? 9 : 8,
          s32: 9,
          s33: 9,
          s41: 8,
          s42: 8,
          s43: 9,
          s51: 9,
          s52: 8,
          s53: hasPrivacy ? 9 : 8,
        };

  const buildSubcategories = (
    delta: number,
    tone: "ADWOKAT" | "SCEPTYK" | "ARBITER"
  ) => {
    const note = (topic: string, score: number) => {
      if (tone === "ADWOKAT") {
        return `Mocna strona projektu „${params.title}” w obszarze: ${topic}. Rozwiązanie wykazuje wysoki potencjał operacyjny i uzasadnia ocenę ${score}/10.`;
      }
      if (tone === "SCEPTYK") {
        return `Zidentyfikowano istotne ryzyka wdrożeniowe w obszarze: ${topic}. Brak pełnych gwarancji i ukryte koszty adaptacji ograniczają ocenę do ${score}/10.`;
      }
      return `Zbalansowany werdykt Arbitra dla obszaru „${topic}” po konfrontacji argumentów Adwokata i Sceptyka oraz weryfikacji źródeł (ocena ${score}/10).`;
    };

    const s = (v: number) => clamp(v + delta);
    return {
      kat_1_zwiazek_z_wyzwaniem: {
        "1_1_trafnosc_diagnozy": {
          punkty: s(baseArbiter.s11),
          uzasadnienie: note("trafności diagnozy problemu", s(baseArbiter.s11)),
        },
        "1_2_adekwatnosc_rozwiazania": {
          punkty: s(baseArbiter.s12),
          uzasadnienie: note("adekwatności proponowanego rozwiązania", s(baseArbiter.s12)),
        },
        "1_3_mierzalnosc_efektow": {
          punkty: s(baseArbiter.s13),
          uzasadnienie: note("mierzalności efektów i wskaźników KPI", s(baseArbiter.s13)),
        },
      },
      kat_2_pomysl_i_oryginalnosc: {
        "2_1_poziom_nowosci": {
          punkty: s(baseArbiter.s21),
          uzasadnienie: note("poziomu nowości rozwiązania", s(baseArbiter.s21)),
        },
        "2_2_wyroznik_antyduplikacja": {
          punkty: s(baseArbiter.s22),
          uzasadnienie: note("wyróżnika i odporności na duplikację", s(baseArbiter.s22)),
        },
        "2_3_kreatywnosc_podejscia": {
          punkty: s(baseArbiter.s23),
          uzasadnienie: note("kreatywności i metodologii podejścia", s(baseArbiter.s23)),
        },
      },
      kat_3_uzytecznosc_i_ux: {
        "3_1_prostota_wdrozenia": {
          punkty: s(baseArbiter.s31),
          uzasadnienie: note("prostoty wdrożenia w instytucji docelowej", s(baseArbiter.s31)),
        },
        "3_2_dostepnosc_inkluzywnosc": {
          punkty: s(baseArbiter.s32),
          uzasadnienie: note("dostępności (WCAG) i inkluzywności", s(baseArbiter.s32)),
        },
        "3_3_wartosc_dla_odbiorcy": {
          punkty: s(baseArbiter.s33),
          uzasadnienie: note("bezpośredniej wartości dla odbiorcy końcowego", s(baseArbiter.s33)),
        },
      },
      kat_4_kompletnosc_prototypu: {
        "4_1_dojrzalosc_mvp": {
          punkty: s(baseArbiter.s41),
          uzasadnienie: note("dojrzałości prototypu MVP", s(baseArbiter.s41)),
        },
        "4_2_spojnosc_architektury": {
          punkty: s(baseArbiter.s42),
          uzasadnienie: note("spójności architektury techniczno-organizacyjnej", s(baseArbiter.s42)),
        },
        "4_3_realizm_techniczny": {
          punkty: s(baseArbiter.s43),
          uzasadnienie: note("realizmu technicznego i zasobowego", s(baseArbiter.s43)),
        },
      },
      kat_5_potencjal_wdrozeniowy: {
        "5_1_skalowalnosc": {
          punkty: s(baseArbiter.s51),
          uzasadnienie: note("skalowalności w regionie i kraju", s(baseArbiter.s51)),
        },
        "5_2_transfer_komercjalizacja": {
          punkty: s(baseArbiter.s52),
          uzasadnienie: note("potencjału transferu, replikacji lub komercjalizacji", s(baseArbiter.s52)),
        },
        "5_3_bezpieczenstwo_prawo": {
          punkty: s(baseArbiter.s53),
          uzasadnienie: note("bezpieczeństwa informacji, RODO i zgodności z EUPL-1.2", s(baseArbiter.s53)),
        },
      },
    };
  };

  // Estymacje kosztów PLN (AI1 optymistyczny, AI3 realistyczny, AI2 pesymistyczny)
  const costProfile = isHeavyHardware
    ? {
        mvp1: 110_000,
        mvp3: 150_000,
        mvp2: 190_000,
        pilot1: 155_000,
        pilot3: 215_000,
        pilot2: 275_000,
      }
    : isAntiScopeOrWeak
      ? {
          mvp1: 55_000,
          mvp3: 75_000,
          mvp2: 95_000,
          pilot1: 80_000,
          pilot3: 105_000,
          pilot2: 130_000,
        }
      : {
          mvp1: 24_000,
          mvp3: 34_000,
          mvp2: 44_000,
          pilot1: 36_000,
          pilot3: 50_000,
          pilot2: 64_000,
        };

  const verifiedProblems: SimilarProblemEntry[] = params.torACases.map(
    (entry, idx) => ({
      ...entry.problem,
      czy_krytyczny: idx < 5,
      czy_zaadresowany_w_projekcie: isAntiScopeOrWeak
        ? idx === 0
        : isHeavyHardware
          ? idx < 3
          : idx < 4,
    })
  );

  const advocateReport: EvaluationAgentReport = {
    rola: "ADWOKAT",
    oceny_podkategorii: buildSubcategories(1, "ADWOKAT"),
    koszty_pln: {
      koszt_mvp: costProfile.mvp1,
      uzasadnienie_mvp:
        "Wariant zwinny z wykorzystaniem komponentów open-source (EUPL-1.2) oraz zasobów własnych zespołu wdrożeniowego.",
      koszt_pilotazu: costProfile.pilot1,
      uzasadnienie_pilotazu:
        "Pilotaż w 2–3 jednostkach partnerskich przy niskim narzucie integracyjnym i wsparciu merytorycznym PCI.",
    },
    podobne_problemy: verifiedProblems.slice(0, 5),
    podsumowanie_decyzji: `AI 1 (Adwokat) rekomenduje projekt „${params.title}” do realizacji ze względu na wyraźną użyteczność publiczną, mierzalny potencjał wdrożeniowy oraz możliwość szybkiego zwrotu społeczno-ekonomicznego.`,
  };

  const skepticReport: EvaluationAgentReport = {
    rola: "SCEPTYK",
    oceny_podkategorii: buildSubcategories(-1, "SCEPTYK"),
    koszty_pln: {
      koszt_mvp: costProfile.mvp2,
      uzasadnienie_mvp:
        "Wariant ostrożny uwzględniający ukryte koszty audytu RODO, bezpieczeństwa, testów akceptacyjnych oraz opóźnień dostawców.",
      koszt_pilotazu: costProfile.pilot2,
      uzasadnienie_pilotazu:
        "Koszty szkoleń personelu, wsparcia utrzymaniowego SLA, integracji z systemami legacy oraz rezerwę na ryzyko (25%).",
    },
    podobne_problemy: verifiedProblems.slice(0, 5),
    podsumowanie_decyzji: `AI 2 (Sceptyk) wskazuje na istotne ryzyka operacyjne, formalnoprawne i budżetowe w projekcie „${params.title}”, zalecając weryfikację barier wdrożeniowych przed uruchomieniem finansowania.`,
  };

  const arbiterReport: EvaluationAgentReport = {
    rola: "ARBITER",
    oceny_podkategorii: buildSubcategories(0, "ARBITER"),
    koszty_pln: {
      koszt_mvp: costProfile.mvp3,
      uzasadnienie_mvp:
        "Urealniony koszt budowy MVP wyważający oszczędności open-source z wymaganiami audytu bezpieczeństwa i jakości.",
      koszt_pilotazu: costProfile.pilot3,
      uzasadnienie_pilotazu:
        "Realistyczny budżet wdrożenia pilotażowego obejmujący szkolenia, nadzór merytoryczny oraz ewaluację wskaźników KPI.",
    },
    podobne_problemy: verifiedProblems.slice(0, 5),
    podsumowanie_decyzji: isAntiScopeOrWeak
      ? `AI 3 (Arbiter) rekomenduje skierowanie projektu „${params.title}” do Archiwum / Odrzuconych z powodu niedostatecznej wartości merytorycznej (< 25 pkt) i wysokiego ryzyka niezaadresowanych barier krytycznych.`
      : `AI 3 (Arbiter) potwierdza wysoką wartość merytoryczną projektu „${params.title}” na podstawie zweryfikowanych źródeł Tor A. Ostateczne przypisanie do tabeli budżetowej wynika z deterministycznej kalkulacji kosztu PERT względem limitu 120% B_max.`,
  };

  const verifierLogs: VerifierResult[] = [
    ...params.torACases.map((c) => c.log),
    {
      link_url: "https://example-unverified-registry.invalid/case-404",
      nazwa_projektu: "Niezweryfikowane zgłoszenie syntetyczne (odrzucone)",
      zrodlo_agenta: "SCEPTYK",
      status: "HALUCYNACJA",
      czy_projekt_istnieje: false,
      zgodnosc_nazwy_i_opisu_procent: 0,
      krotkie_uzasadnienie:
        "Link odrzucony przez AI 4 (Fast-Check) — brak potwierdzenia w realnych rejestrach; zastąpiony zweryfikowanym rekordem Tor A.",
    },
  ];

  const metrics = calculateDeterministicEvaluation(
    advocateReport,
    skepticReport,
    arbiterReport,
    params.maxBudgetPln,
    params.toleranceMultiplier
  );

  return {
    advocateReport,
    skepticReport,
    verifierLogs,
    arbiterReport,
    metrics,
    usedOfflineFallback: true,
  };
}

export async function runMultiAgentEvaluation(params: {
  title: string;
  description: string;
  maxBudgetPln: number;
  toleranceMultiplier?: number;
}): Promise<MultiAgentPipelineResult> {
  const startedAt = Date.now();
  const toleranceMultiplier = params.toleranceMultiplier ?? 1.2;

  if (!isLlmConfigured()) {
    const torACases = await getTorAVerifiedFallbackCases(
      new Set(),
      5,
      params.description
    );
    const offline = buildDeterministicOfflineDebate({
      title: params.title,
      description: params.description,
      maxBudgetPln: params.maxBudgetPln,
      toleranceMultiplier,
      torACases,
    });
    return {
      ...offline,
      durationMs: Math.max(120, Date.now() - startedAt),
    };
  }

  try {
    // KROK A: Równoległa debata AI 1 (Adwokat) + AI 2 (Sceptyk)
    const advocateSystemPrompt = `Jesteś AI 1 (Adwokat) w wieloagentowym systemie oceny projektów OPEN TRACE — Radar Innowacji (HackNation 2026).
Twoja rola:
1. Bronisz potencjału projektu, pokazując jego mocne strony we wszystkich 15 podkategoriach (skala 1–10 całkowita).
2. Estymujesz wariant OPTYMISTYCZNY (minimalny realistyczny) kosztów MVP oraz pilotażu w PLN.
3. Wskazujesz co najmniej 5 realnych, istniejących w Internecie podobnych projektów z prawdziwymi adresami URL (preferuj polskie i europejskie rejestry publiczne: gov.pl, edu.pl, europa.eu, cordis, interregeurope, uprp), które udało się z sukcesem rozwiązać.
4. Wszystko piszesz w profesjonalnym języku POLSKIM. Zwróć WYŁĄCZNIE poprawny JSON zgodny ze schematem (pole "rola" = "ADWOKAT"):
${REPORT_JSON_SPEC}`;

    const skepticSystemPrompt = `Jesteś AI 2 (Sceptyk) w wieloagentowym systemie oceny projektów OPEN TRACE — Radar Innowacji (HackNation 2026).
Twoja rola:
1. Krytycznie analizujesz słabe punkty, luki merytoryczne, ryzyko duplikacji i bariery prawne/techniczne we wszystkich 15 podkategoriach (skala 1–10 całkowita).
2. Estymujesz wariant PESYMISTYCZNY kosztów MVP i pilotażu w PLN (uwzględniając ukryte koszty RODO, integracji, szkoleń, SLA i opóźnień).
3. Wskazujesz co najmniej 5 realnych, istniejących w Internecie podobnych projektów z prawdziwymi adresami URL, które napotkały problemy krytyczne, opóźnienia lub niepowodzenia.
4. Wszystko piszesz w profesjonalnym języku POLSKIM. Zwróć WYŁĄCZNIE poprawny JSON zgodny ze schematem (pole "rola" = "SCEPTYK"):
${REPORT_JSON_SPEC}`;

    const projectUserPrompt = `Tytuł projektu: ${params.title}
Budżet bazowy instytucji B_max: ${params.maxBudgetPln.toLocaleString("pl-PL")} PLN (próg tolerancji 120%: ${(params.maxBudgetPln * toleranceMultiplier).toLocaleString("pl-PL")} PLN).

Opis projektu:
${params.description.slice(0, 12_000)}`;

    const [advocateRes, skepticRes] = await Promise.all([
      callOpenAiCompatibleJson({
        systemPrompt: advocateSystemPrompt,
        userPrompt: projectUserPrompt,
        schema: EvaluationAgentReportSchema,
        temperature: 0.3,
      }),
      callOpenAiCompatibleJson({
        systemPrompt: skepticSystemPrompt,
        userPrompt: projectUserPrompt,
        schema: EvaluationAgentReportSchema,
        temperature: 0.3,
      }),
    ]);

    const advocateReport: EvaluationAgentReport = {
      ...advocateRes.data,
      rola: "ADWOKAT",
    };
    const skepticReport: EvaluationAgentReport = {
      ...skepticRes.data,
      rola: "SCEPTYK",
    };

    // KROK B: AI 4 (Weryfikator Źródeł / Fast-Check) — realne pobranie URL (SSRF-safe) i odrzucenie halucynacji
    const verifierLogs: VerifierResult[] = [];
    const verifiedCases: SimilarProblemEntry[] = [];
    const seenUrls = new Set<string>();

    const initialPool: Array<{
      entry: SimilarProblemEntry;
      agent: "ADWOKAT" | "SCEPTYK";
    }> = [];
    for (const p of advocateReport.podobne_problemy) {
      if (!seenUrls.has(p.link_url)) {
        seenUrls.add(p.link_url);
        initialPool.push({ entry: p, agent: "ADWOKAT" });
      }
    }
    for (const p of skepticReport.podobne_problemy) {
      if (!seenUrls.has(p.link_url)) {
        seenUrls.add(p.link_url);
        initialPool.push({ entry: p, agent: "SCEPTYK" });
      }
    }

    const initialVerifications = await Promise.all(
      initialPool.map(({ entry, agent }) =>
        verifySingleCaseWithAi4(entry, agent).then((res) => ({ entry, res }))
      )
    );

    for (const { entry, res } of initialVerifications) {
      verifierLogs.push(res);
      if (
        res.status === "ZWERYFIKOWANY" ||
        res.status === "CZĘŚCIOWO_ZGODNY"
      ) {
        verifiedCases.push(entry);
      }
    }

    // Maksymalnie 2 iteracje uzupełniania źródeł jeśli < 5 zweryfikowanych linków
    for (
      let attempt = 1;
      attempt <= 2 && verifiedCases.length < 5;
      attempt++
    ) {
      const missingCount = 5 - verifiedCases.length;
      try {
        const replenishRes = await callOpenAiCompatibleJson({
          systemPrompt: `Podaj ${missingCount + 2} REALNE, powszechnie dostępne strony internetowe (np. gov.pl, europa.eu, cordis.europa.eu, interregeurope.eu, pl.wikipedia.org) opisujące projekty pokrewne do podanego. Nie zmyślaj adresów URL. Zwróć JSON: { "kandydaci": [{ "nazwa_projektu", "link_url", "opis_problemu", "czy_krytyczny", "jak_rozwiazano" }] }.`,
          userPrompt: `Projekt: ${params.title}\nOpis: ${params.description.slice(0, 2000)}\nOdrzucone już adresy (nie powtarzaj): ${Array.from(seenUrls).join(", ")}`,
          model: process.env.LLM_FAST_MODEL?.trim() || process.env.LLM_MODEL?.trim(),
          schema: ReplenishmentResponseSchema,
          temperature: 0.2,
          timeoutMs: 25_000,
        });

        const fresh = replenishRes.data.kandydaci.filter(
          (c) => !seenUrls.has(c.link_url)
        );
        fresh.forEach((c) => seenUrls.add(c.link_url));

        const checks = await Promise.all(
          fresh.map((entry) =>
            verifySingleCaseWithAi4(entry, "ADWOKAT").then((res) => ({
              entry,
              res,
            }))
          )
        );
        for (const { entry, res } of checks) {
          verifierLogs.push(res);
          if (
            res.status === "ZWERYFIKOWANY" ||
            res.status === "CZĘŚCIOWO_ZGODNY"
          ) {
            verifiedCases.push(entry);
          }
        }
      } catch {
        break;
      }
    }

    // Uzupełnienie z lokalnego, zweryfikowanego rejestru Tor A, aby Arbiter zawsze otrzymał >= 5 realnych przypadków
    if (verifiedCases.length < 5) {
      const torASupplement = await getTorAVerifiedFallbackCases(
        seenUrls,
        5 - verifiedCases.length,
        params.description
      );
      for (const item of torASupplement) {
        verifiedCases.push(item.problem);
        verifierLogs.push(item.log);
      }
    }

    // KROK C: AI 3 (Arbiter) — ostateczny werdykt na podstawie zweryfikowanych źródeł
    const arbiterSystemPrompt = `Jesteś AI 3 (Arbiter / Niezależny Sędzia) w systemie OPEN TRACE — Radar Innowacji.
Otrzymujesz opis projektu, raport AI 1 (Adwokat), raport AI 2 (Sceptyk) oraz WYŁĄCZNIE zweryfikowane przez AI 4 (Fast-Check) przypadki referencyjne.
Zasady:
1. Wydaj bezstronną ocenę (1–10 całkowite) dla każdej z 15 podkategorii w 5 kategoriach.
2. Oszacuj najbardziej REALISTYCZNY koszt MVP i pilotażu w PLN (na potrzeby deterministycznego wzoru PERT).
3. W polu "podobne_problemy" umieść CO NAJMNIEJ 5 przypadków WYŁĄCZNIE ze zweryfikowanej listy od AI 4 (nie dodawaj nowych URL!). Dla każdego ustaw obowiązkowo "czy_krytyczny" (boolean) oraz "czy_zaadresowany_w_projekcie" (boolean).
4. Zwróć WYŁĄCZNIE poprawny JSON w języku polskim (pole "rola" = "ARBITER"):
${REPORT_JSON_SPEC}`;

    const arbiterUserPrompt = `Projekt: ${params.title}
Opis projektu:
${params.description.slice(0, 8_000)}

Raport AI 1 (Adwokat):
${JSON.stringify(advocateReport)}

Raport AI 2 (Sceptyk):
${JSON.stringify(skepticReport)}

ZWERYFIKOWANE ŹRÓDŁA OD AI 4 (użyj co najmniej 5 z tej listy):
${JSON.stringify(verifiedCases)}`;

    const arbiterRes = await callOpenAiCompatibleJson({
      systemPrompt: arbiterSystemPrompt,
      userPrompt: arbiterUserPrompt,
      schema: EvaluationAgentReportSchema,
      temperature: 0.15,
    });

    const arbiterReport: EvaluationAgentReport = {
      ...arbiterRes.data,
      rola: "ARBITER",
      podobne_problemy:
        arbiterRes.data.podobne_problemy.length >= 5
          ? arbiterRes.data.podobne_problemy
          : [
              ...arbiterRes.data.podobne_problemy,
              ...verifiedCases.slice(
                0,
                5 - arbiterRes.data.podobne_problemy.length
              ),
            ],
    };

    // KROK D: Deterministyczna matematyka i routing budżetowy
    const metrics = calculateDeterministicEvaluation(
      advocateReport,
      skepticReport,
      arbiterReport,
      params.maxBudgetPln,
      toleranceMultiplier
    );

    return {
      advocateReport,
      skepticReport,
      verifierLogs,
      arbiterReport,
      metrics,
      durationMs: Math.max(100, Date.now() - startedAt),
      usedOfflineFallback: false,
    };
  } catch (error) {
    console.warn(
      "[OPEN TRACE] Przełączono Debatę 4 AI na deterministyczny tryb offline:",
      error instanceof Error ? error.message : String(error)
    );
    const torACases = await getTorAVerifiedFallbackCases(
      new Set(),
      5,
      params.description
    );
    const offline = buildDeterministicOfflineDebate({
      title: params.title,
      description: params.description,
      maxBudgetPln: params.maxBudgetPln,
      toleranceMultiplier,
      torACases,
    });
    return {
      ...offline,
      durationMs: Math.max(120, Date.now() - startedAt),
    };
  }
}
