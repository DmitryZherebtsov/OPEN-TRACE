import { z } from "zod";
import type { AiEstimates, Domain, VerifiedFacts } from "@/types/innovation";

const ExtractedFactsSchema = z.object({
  title: z.string().min(5),
  summary: z.string().min(15),
  problem: z.string().min(10),
  solution: z.string().min(10),
  creator: z.string().nullable(),
  institution: z.string().nullable(),
  verifiedFacts: z.object({
    institution: z.string().nullable(),
    publicationDate: z.string().nullable(),
    sourceUrl: z.string().nullable(),
    formalIdentifier: z.string().nullable(),
    verbatimQuotes: z.array(z.string()).max(6),
    authorMetrics: z.array(z.string()).max(6),
    budgetOrCost: z.string().nullable(),
    hasSupplementaryDocs: z.boolean(),
  }),
  aiEstimates: z.object({
    domain: z.enum(["TECHNOLOGICZNY", "EDUKACYJNY", "ADMINISTRACYJNY"]),
    implementationLevel: z.number().int().min(1).max(5),
    trl: z.number().int().min(1).max(9).nullable(),
    innovativeness: z.number().int().min(1).max(5),
    transferPotential: z.number().int().min(1).max(5),
    domainRationale: z.string().min(10),
    implementationRationale: z.string().min(10),
    trlRationale: z.string().min(5),
    innovativenessRationale: z.string().min(10),
    transferPotentialRationale: z.string().min(10),
  }),
});

export interface ExtractedInnovationResult {
  title: string;
  summary: string;
  problem: string;
  solution: string;
  domain: Domain;
  creator: string | null;
  institution: string | null;
  verifiedFacts: VerifiedFacts;
  implementationLevel: number;
  trl: number | null;
  innovativeness: number;
  transferPotential: number;
  aiEstimates: AiEstimates;
}

export function isLlmConfigured(): boolean {
  const key = process.env.LLM_API_KEY?.trim();
  const url = process.env.LLM_API_URL?.trim();
  if (!key || !url) return false;
  if (
    key === "sk-your-server-side-api-key" ||
    key.startsWith("sk-your-") ||
    key.length < 12
  ) {
    return false;
  }
  return true;
}

export async function callOpenAiCompatibleJson<T>(options: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  schema: z.ZodType<T>;
  temperature?: number;
  timeoutMs?: number;
}): Promise<{ data: T; modelUsed: string }> {
  const apiUrl =
    process.env.LLM_API_URL?.trim() ||
    "https://api.openai.com/v1/chat/completions";
  const apiKey = process.env.LLM_API_KEY?.trim();
  const modelUsed =
    options.model || process.env.LLM_MODEL?.trim() || "gpt-4o-mini";

  if (!apiKey || !isLlmConfigured()) {
    throw new Error("Klucz LLM_API_KEY nie został skonfigurowany.");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    signal: AbortSignal.timeout(options.timeoutMs ?? 45_000),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelUsed,
      temperature: options.temperature ?? 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(
      `Błąd serwera LLM (HTTP ${response.status}): ${errText.slice(0, 200)}`
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Model LLM zwrócił pustą odpowiedź.");
  }

  const cleaned = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  const parsedJson: unknown = JSON.parse(cleaned);
  const validated = options.schema.parse(parsedJson);
  return { data: validated, modelUsed };
}

function runDeterministicPolishFallback(params: {
  rawText: string;
  sourceUrl: string | null;
  hintTitle: string | null;
}): ExtractedInnovationResult {
  const text = params.rawText.trim();
  const lower = text.toLowerCase();

  // Klasyfikacja domeny Oslo 2018
  const eduKeywords = [
    "szkoł",
    "uczni",
    "nauczyciel",
    "edukac",
    "dydakty",
    "oświat",
    "lekcj",
    "przedszkol",
    "kompetencj",
    "student",
  ];
  const adminKeywords = [
    "gmin",
    "urząd",
    "urzęd",
    "samorząd",
    "jst",
    "bip",
    "obywatel",
    "administrac",
    "stołówk",
    "posiłk",
    "marnowani",
    "decyzj",
    "wniosk",
    "budżet obywatelski",
    "usług publicznych",
  ];
  const techKeywords = [
    "dron",
    "sensor",
    "algorytm",
    "sieć energetycz",
    "termowiz",
    "patent",
    "prototyp",
    "trl",
    "iot",
    "materiał",
    "bateria",
    "fotowoltaik",
    "laser",
    "robot",
    "biotechnolog",
    "satelit",
    "radar",
    "czujnik",
    "kompozyt",
    "diagnostyk",
  ];

  const countHits = (words: string[]) =>
    words.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0);

  const techHits = countHits(techKeywords);
  const eduHits = countHits(eduKeywords);
  const adminHits = countHits(adminKeywords);

  let domain: Domain = "TECHNOLOGICZNY";
  if (adminHits >= techHits && adminHits >= eduHits && adminHits > 0) {
    domain = "ADMINISTRACYJNY";
  } else if (eduHits > techHits && eduHits > adminHits) {
    domain = "EDUKACYJNY";
  }

  // Ekstrakcja zdań i cytatów dosłownych
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 25);

  const firstLine = text.split("\n")[0]?.trim() || "";
  const title =
    params.hintTitle && params.hintTitle.length >= 8
      ? params.hintTitle.slice(0, 140)
      : firstLine.length >= 10 && firstLine.length <= 130
        ? firstLine
        : sentences[0]?.slice(0, 110) || "Innowacja zidentyfikowana w skanie OSINT";

  // Wykrywanie instytucji
  const instMatch = text.match(
    /(Politechnika [A-ZŁŚŻŹĆŃÓ][^\n,.;]{2,65}|Uniwersytet [A-ZŁŚŻŹĆŃÓ][^\n,.;]{2,65}|Urząd (?:Gminy|Miasta|Marszałkowski)[^\n,.;]{2,60}|Gmina [A-ZŁŚŻŹĆŃÓ][^\n,.;]{2,45}|Instytut [A-ZŁŚŻŹĆŃÓ][^\n,.;]{2,65}|Szkoła Podstawowa[^\n,.;]{2,65}|Zespół Szkół[^\n,.;]{2,65})/
  );
  const institution = instMatch ? instMatch[1].trim() : null;

  // Wykrywanie daty publikacji
  const dateMatch = text.match(
    /\b(202[0-9]-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])|(?:0[1-9]|[12]\d|3[01])\.(?:0[1-9]|1[0-2])\.202[0-9])\b/
  );
  const publicationDate = dateMatch ? dateMatch[1] : null;

  // Wykrywanie formalnego identyfikatora (patent/grant)
  const idMatch = text.match(
    /\b((?:NCBR|PARP|NCN|FENG|POIR|CORDIS|IE-PGI)[/\-A-Z0-9]{4,35}|(?:P|EP|PL|W)\.\d{5,7})\b/
  );
  const formalIdentifier = idMatch ? idMatch[1] : null;

  // Wykrywanie budżetu/kosztu wprost w tekście
  const budgetMatch = text.match(
    /(?:budżet|koszt|dofinansowanie|nakłady|wartość projektu)[^.\n]{0,35}?(\d[\d\s.,]*\s*(?:zł|PLN|tys\.\s*zł|mln\s*zł|EUR))/i
  );
  const budgetOrCost = budgetMatch ? budgetMatch[0].trim() : null;

  // Wykrywanie metryk liczbowych z tekstu
  const metricMatches = Array.from(
    text.matchAll(
      /([^.\n]{0,45}\b\d+(?:[.,]\d+)?\s*(?:%|km|tys\.\s*zł|mln\s*zł|szkół|budynków|tygodni|miesięcy|godzin|ton|kWh|MWh)[^.\n]{0,45})/gi
    )
  )
    .map((m) => m[1].trim())
    .filter((m) => m.length >= 10);

  const authorMetrics = Array.from(new Set(metricMatches)).slice(0, 4);
  const verbatimQuotes = sentences.slice(0, 3).map((s) => s.slice(0, 260));

  const hasSupplementaryDocs =
    lower.includes("raport") ||
    lower.includes("załącznik") ||
    lower.includes("dokumentacj") ||
    lower.includes("pdf") ||
    lower.includes("specyfikacj");

  // Wykrycie TRL wyłącznie dla domeny TECHNOLOGICZNY
  const trlMatch = text.match(/\bTRL\s*[:\-]?\s*([1-9])\b/i);
  const hasPilot =
    lower.includes("pilotaż") ||
    lower.includes("wdrożon") ||
    lower.includes("przetestowan") ||
    lower.includes("działa w");
  const hasScale =
    lower.includes("replikac") ||
    lower.includes("skalowan") ||
    lower.includes("kilku gmin") ||
    lower.includes("szkół");

  const implementationLevel = hasScale ? 5 : hasPilot ? 4 : 3;
  const trl: number | null =
    domain === "TECHNOLOGICZNY"
      ? trlMatch
        ? Number(trlMatch[1])
        : implementationLevel >= 4
          ? 6
          : 4
      : null;

  const summary =
    sentences.slice(0, 2).join(" ").slice(0, 420) || text.slice(0, 400);
  const problemSentence =
    sentences.find((s) =>
      /(problem|wyzwani|marnowan|awari|brak|koszt|opóźnien|ryzyk)/i.test(s)
    ) ||
    sentences[0] ||
    "Rozwiązanie odpowiada na zidentyfikowaną lukę operacyjną opisaną w materiale źródłowym.";
  const solutionSentence =
    sentences.find((s) =>
      /(rozwiązani|system|metod|narzędzi|algorytm|model|wdrożeni|platform)/i.test(s)
    ) ||
    sentences[1] ||
    sentences[0] ||
    "Zastosowano zintegrowane podejście opisane w przeanalizowanym dokumencie źródłowym.";

  return {
    title,
    summary,
    problem: problemSentence.slice(0, 380),
    solution: solutionSentence.slice(0, 380),
    domain,
    creator: institution ? `Zespół projektowy (${institution})` : null,
    institution,
    verifiedFacts: {
      institution,
      publicationDate,
      sourceUrl: params.sourceUrl,
      formalIdentifier,
      verbatimQuotes,
      authorMetrics,
      budgetOrCost,
      hasSupplementaryDocs,
    },
    implementationLevel,
    trl,
    innovativeness: authorMetrics.length >= 2 || formalIdentifier ? 4 : 3,
    transferPotential: hasScale || hasPilot ? 4 : 3,
    aiEstimates: {
      domainRationale:
        domain === "TECHNOLOGICZNY"
          ? "Zaklasyfikowano jako innowację technologiczną (Oslo 2018) na podstawie komponentów inżynieryjnych, pomiarowych lub B+R obecnych w źródle."
          : domain === "EDUKACYJNY"
            ? "Zaklasyfikowano jako innowację edukacyjną (Oslo 2018) z uwagi na bezpośredni wpływ na proces kształcenia i placówki oświatowe."
            : "Zaklasyfikowano jako innowację administracyjną / procesową (Oslo 2018) z uwagi na usprawnienie usług publicznych lub procesów JST.",
      implementationRationale: hasPilot
        ? "W źródle wskazano potwierdzone testy pilotażowe lub wdrożenie w warunkach rzeczywistych (poziom 4–5/5)."
        : "Materiał opisuje gotową koncepcję lub prototyp na wczesnym etapie wdrożenia (poziom 3/5).",
      trlRationale:
        domain === "TECHNOLOGICZNY"
          ? `Oszacowano gotowość technologiczną TRL ${trl}/9 na podstawie opisu testów i zaawansowania technicznego w źródle.`
          : "TRL: N/D — zgodnie z Podręcznikiem Oslo 2018 wskaźnik TRL nie ma zastosowania dla innowacji edukacyjnych i administracyjnych.",
      innovativenessRationale:
        "Ocena poziomu nowości uwzględnia obecność mierzalnych rezultatów oraz odrębność podejścia względem standardowych praktyk.",
      transferPotentialRationale:
        "Potencjał transferu oszacowano na podstawie powtarzalności problemu w skali regionalnej/krajowej oraz opisanych barier wdrożeniowych.",
      modelUsed: "Analizator deterministyczny OSINT (tryb offline PL)",
      isOfflineFallback: true,
    },
  };
}

export async function extractInnovationWithFactsVsAi(params: {
  rawText: string;
  sourceUrl: string | null;
  hintTitle: string | null;
}): Promise<ExtractedInnovationResult> {
  if (!isLlmConfigured()) {
    return runDeterministicPolishFallback(params);
  }

  const systemPrompt = `Jesteś głównym analitykiem OSINT platformy OPEN TRACE — Radar Innowacji (Podkarpackie Centrum Innowacji, HackNation 2026).
Obowiązuje BEZWZGLĘDNY Protokół „Fakty vs AI” oraz język POLSKI:
1. W sekcji "verifiedFacts" wpisuj WYŁĄCZNIE fakty występujące wprost w dostarczonym tekście źródłowym. Niczego nie dopowiadaj ani nie zgaduj. Jeżeli instytucja, data publikacji, identyfikator formalny lub budżet/koszt nie występują wprost w tekście, MUSISZ zwrócić null.
2. W "verbatimQuotes" umieść 2–4 krótkie, dosłowne cytaty ze źródła.
3. Zaklasyfikuj projekt do jednej z trzech równorzędnych domen Podręcznika Oslo 2018:
   - "TECHNOLOGICZNY" (wówczas trl = liczba całkowita 1–9),
   - "EDUKACYJNY" (wówczas trl MUSI być null!),
   - "ADMINISTRACYJNY" (wówczas trl MUSI być null!).
4. Zwróć wyłącznie poprawny obiekt JSON zgodny z podanym schematem (bez markdownu).

Wymagany schemat JSON:
{
  "title": "string",
  "summary": "string",
  "problem": "string",
  "solution": "string",
  "creator": "string | null",
  "institution": "string | null",
  "verifiedFacts": {
    "institution": "string | null",
    "publicationDate": "string | null",
    "sourceUrl": "string | null",
    "formalIdentifier": "string | null",
    "verbatimQuotes": ["string"],
    "authorMetrics": ["string"],
    "budgetOrCost": "string | null",
    "hasSupplementaryDocs": boolean
  },
  "aiEstimates": {
    "domain": "TECHNOLOGICZNY" | "EDUKACYJNY" | "ADMINISTRACYJNY",
    "implementationLevel": 1..5,
    "trl": 1..9 | null,
    "innovativeness": 1..5,
    "transferPotential": 1..5,
    "domainRationale": "string (po polsku)",
    "implementationRationale": "string (po polsku)",
    "trlRationale": "string (po polsku)",
    "innovativenessRationale": "string (po polsku)",
    "transferPotentialRationale": "string (po polsku)"
  }
}`;

  const userPrompt = `Adres źródłowy: ${params.sourceUrl ?? "Brak (tekst/PDF dostarczony bezpośrednio)"}
Sugerowany tytuł z metadanych: ${params.hintTitle ?? "Brak"}

--- POCZĄTEK TEKSTU ŹRÓDŁOWEGO ---
${params.rawText.slice(0, 16_000)}
--- KONIEC TEKSTU ŹRÓDŁOWEGO ---`;

  try {
    const { data, modelUsed } = await callOpenAiCompatibleJson({
      systemPrompt,
      userPrompt,
      schema: ExtractedFactsSchema,
      temperature: 0.1,
    });

    // Twarda blokada domenowa (guardrail): TRL zawsze null poza TECHNOLOGICZNY
    const enforcedTrl =
      data.aiEstimates.domain === "TECHNOLOGICZNY"
        ? data.aiEstimates.trl ?? 5
        : null;

    const enforcedTrlRationale =
      data.aiEstimates.domain === "TECHNOLOGICZNY"
        ? data.aiEstimates.trlRationale
        : "TRL: N/D — wskaźnik gotowości technologicznej nie ma zastosowania dla domeny edukacyjnej i administracyjnej (Podręcznik Oslo 2018).";

    return {
      title: data.title,
      summary: data.summary,
      problem: data.problem,
      solution: data.solution,
      domain: data.aiEstimates.domain,
      creator: data.creator,
      institution: data.institution ?? data.verifiedFacts.institution,
      verifiedFacts: {
        ...data.verifiedFacts,
        sourceUrl: params.sourceUrl ?? data.verifiedFacts.sourceUrl,
      },
      implementationLevel: data.aiEstimates.implementationLevel,
      trl: enforcedTrl,
      innovativeness: data.aiEstimates.innovativeness,
      transferPotential: data.aiEstimates.transferPotential,
      aiEstimates: {
        domainRationale: data.aiEstimates.domainRationale,
        implementationRationale: data.aiEstimates.implementationRationale,
        trlRationale: enforcedTrlRationale,
        innovativenessRationale: data.aiEstimates.innovativenessRationale,
        transferPotentialRationale: data.aiEstimates.transferPotentialRationale,
        modelUsed,
        isOfflineFallback: false,
      },
    };
  } catch (error) {
    console.warn(
      "[OPEN TRACE] Przełączono ekstraktor OSINT na deterministyczny tryb offline:",
      error instanceof Error ? error.message : String(error)
    );
    return runDeterministicPolishFallback(params);
  }
}
