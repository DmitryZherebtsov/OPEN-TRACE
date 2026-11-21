import type {
  CredibilityAttribute,
  CredibilityDetails,
  Domain,
  Pathway,
  SimilarityStatus,
  SourceType,
  TransferKpi,
  VerifiedFacts,
} from "@/types/innovation";

const OFFICIAL_DOMAIN_PATTERNS = [
  /\.gov\.pl$/i,
  /\.edu\.pl$/i,
  /\.pan\.pl$/i,
  /\.europa\.eu$/i,
  /\.interregeurope\.eu$/i,
  /\.uprp\.gov\.pl$/i,
  /\.epo\.org$/i,
  /\.ncbr\.gov\.pl$/i,
  /\.parp\.gov\.pl$/i,
  /\.ncn\.gov\.pl$/i,
  /\.nauka\.gov\.pl$/i,
  /\.pbn\.nauka\.gov\.pl$/i,
  /\.cordis\.europa\.eu$/i,
  /(?:^|\.)bip\./i,
  /(?:^|\.)espacenet\.com$/i,
  /(?:^|\.)interregeurope\.eu$/i,
];

const POLISH_STOPWORDS = new Set([
  "oraz",
  "przez",
  "który",
  "która",
  "które",
  "których",
  "tego",
  "tej",
  "dla",
  "jest",
  "są",
  "być",
  "jako",
  "przy",
  "pod",
  "nad",
  "bez",
  "nie",
  "tak",
  "lub",
  "albo",
  "się",
  "ich",
  "tym",
  "taki",
  "taka",
  "takie",
  "system",
  "projekt",
  "rozwiązanie",
  "wdrożenie",
  "innowacja",
  "polska",
  "polski",
  "polsce",
  "roku",
  "dane",
  "danych",
]);

export function inferSourceTypeFromUrl(url: string): {
  institutionType: SourceType;
  registryName: string;
} {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("uprp") || host.includes("epo.org") || host.includes("espacenet")) {
      return { institutionType: "REJESTR_PATENTOWY", registryName: "Rejestr Patentowy (UPRP / EPO)" };
    }
    if (
      host.includes("ncbr") ||
      host.includes("parp") ||
      host.includes("ncn") ||
      host.includes("cordis") ||
      host.includes("interreg")
    ) {
      return { institutionType: "BAZA_GRANTOWA", registryName: "Baza Grantowa (NCBR / PARP / UE)" };
    }
    if (host.endsWith(".edu.pl") || host.includes("pan.pl") || host.includes("pbn.")) {
      return { institutionType: "UCZELNIA", registryName: "Repozytorium Uczelni / PBN" };
    }
    if (host.includes("szkola") || host.includes("kuratorium") || host.includes("edukacja")) {
      return { institutionType: "SZKOLA", registryName: "Portal Oświatowy / Szkoła" };
    }
    if (host.includes("bip.") || host.endsWith(".gov.pl") || host.includes("um.") || host.includes("ug.")) {
      return { institutionType: "JST", registryName: "Biuletyn Samorządowy JST / BIP" };
    }
    if (host.includes("ctt") || host.includes("inkubator") || host.includes("pci") || host.includes("park")) {
      return { institutionType: "INKUBATOR_CTT", registryName: "Inkubator / CTT" };
    }
    return { institutionType: "INNE", registryName: `Źródło zewnętrzne (${host})` };
  } catch {
    return { institutionType: "INNE", registryName: "Źródło bezpośrednie (Skan doraźny)" };
  }
}

export function calculateCredibilityIndex(
  facts: VerifiedFacts,
  sourceUrl: string | null,
  creator: string | null
): CredibilityDetails {
  let host = "";
  let isOfficialDomain = false;
  const candidateUrl = sourceUrl || facts.sourceUrl;
  if (candidateUrl) {
    try {
      host = new URL(candidateUrl).hostname.toLowerCase();
      isOfficialDomain = OFFICIAL_DOMAIN_PATTERNS.some((rx) => rx.test(host));
    } catch {
      isOfficialDomain = false;
    }
  }

  const hasIdentifiedCreator = Boolean(
    (facts.institution && facts.institution.trim().length > 2) ||
      (creator && creator.trim().length > 2)
  );

  const hasFormalIdentifier = Boolean(
    facts.formalIdentifier && facts.formalIdentifier.trim().length > 2
  );

  const hasMeasurableResults =
    facts.authorMetrics.length > 0 ||
    facts.verbatimQuotes.some((q) => /\d+([.,]\d+)?\s*(%|km|tys\.|mln|zł|PLN|dni|tygodn|mies|szkół|budynk)/i.test(q));

  const hasSupplementaryDocs = Boolean(facts.hasSupplementaryDocs);

  const attributes: CredibilityAttribute[] = [
    {
      key: "officialDomain",
      label: "Oficjalna domena publiczna / naukowa / rejestr (.gov.pl, .edu.pl, UE)",
      met: isOfficialDomain,
      evidence: isOfficialDomain
        ? `Zweryfikowana domena źródłowa: ${host}`
        : host
          ? `Domena spoza wykazu rejestrów publicznych (${host})`
          : "Brak adresu URL oficjalnego rejestru",
    },
    {
      key: "identifiedCreator",
      label: "Zidentyfikowany twórca lub instytucja wdrażająca",
      met: hasIdentifiedCreator,
      evidence: hasIdentifiedCreator
        ? [facts.institution, creator].filter(Boolean).join(" — ")
        : "Brak jednoznacznej nazwy instytucji lub twórcy w źródle",
    },
    {
      key: "formalIdentifier",
      label: "Formalny numer patentu, zgłoszenia lub umowy grantowej",
      met: hasFormalIdentifier,
      evidence: hasFormalIdentifier
        ? `Identyfikator: ${facts.formalIdentifier}`
        : "Brak danych w źródle",
    },
    {
      key: "measurableResults",
      label: "Mierzalne wyniki liczbowe potwierdzone w dokumencie",
      met: hasMeasurableResults,
      evidence: hasMeasurableResults
        ? facts.authorMetrics.slice(0, 2).join("; ") || "Wykryto wskaźniki liczbowe w cytatach"
        : "Brak udokumentowanych metryk liczbowych w źródle",
    },
    {
      key: "supplementaryDocs",
      label: "Załączniki techniczne, raporty lub dokumentacja uzupełniająca",
      met: hasSupplementaryDocs,
      evidence: hasSupplementaryDocs
        ? "Potwierdzono dostępność dokumentacji źródłowej / raportu"
        : "Brak wskazania dokumentacji uzupełniającej",
    },
  ];

  const metCount = attributes.filter((a) => a.met).length;
  // Skala 1..5 (minimum 1 gdy dokument został sparsowany)
  const score = Math.max(1, Math.min(5, metCount));

  return {
    score,
    maxScore: 5,
    attributes,
  };
}

function tokenizePolish(text: string): Set<string> {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
  const words = normalized
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !POLISH_STOPWORDS.has(w))
    .map((w) => w.slice(0, 7)); // lekki stemming prefiksowy dla języka polskiego
  return new Set(words);
}

export interface SimilarityCandidate {
  id: string;
  title: string;
  summary: string;
  problem: string;
  solution: string;
  domain: Domain;
  registryName: string;
  referenceId: string;
}

export interface ComputedSimilarityMatch {
  registry: string;
  matchedTitle: string;
  matchedReferenceId: string;
  matchPercent: number;
  status: SimilarityStatus;
  functionalDifferences: string;
}

export function classifySimilarityStatus(matchPercent: number): SimilarityStatus {
  if (matchPercent >= 80) return "POTENCJALNY_DUPLIKAT";
  if (matchPercent >= 55) return "POKREWNE";
  return "UNIKALNE";
}

export function computeSimilarityMatches(
  target: {
    title: string;
    summary: string;
    problem: string;
    solution: string;
    domain: Domain;
  },
  candidates: SimilarityCandidate[],
  limit = 3
): ComputedSimilarityMatch[] {
  const targetTokens = tokenizePolish(
    `${target.title} ${target.title} ${target.summary} ${target.problem} ${target.solution}`
  );

  const scored = candidates.map((cand) => {
    const candTokens = tokenizePolish(
      `${cand.title} ${cand.title} ${cand.summary} ${cand.problem} ${cand.solution}`
    );

    let intersection = 0;
    for (const token of targetTokens) {
      if (candTokens.has(token)) intersection++;
    }

    const minSize = Math.max(1, Math.min(targetTokens.size, candTokens.size));
    const unionSize = Math.max(1, targetTokens.size + candTokens.size - intersection);

    // Mieszanka indeksu Jaccarda i współczynnika pokrycia (overlap) dająca stabilne wartości 15–92%
    const jaccard = intersection / unionSize;
    const overlap = intersection / minSize;
    const domainBonus = cand.domain === target.domain ? 0.14 : 0;

    const rawScore = (jaccard * 0.55 + overlap * 0.45 + domainBonus) * 100;
    const matchPercent = Math.round(Math.max(12, Math.min(94, rawScore)) * 10) / 10;
    const status = classifySimilarityStatus(matchPercent);

    let functionalDifferences: string;
    if (status === "POTENCJALNY_DUPLIKAT") {
      functionalDifferences = `Bardzo wysoka zbieżność zakresu funkcjonalnego z rekordem „${cand.title}” (${cand.registryName}). Wymagana pogłębiona weryfikacja praw własności intelektualnej oraz wyróżników wdrożeniowych przed decyzją o finansowaniu.`;
    } else if (status === "POKREWNE") {
      functionalDifferences = `Zbliżony obszar problemowy względem „${cand.title}” (${cand.registryName}), jednak analizowane rozwiązanie wprowadza odmienną architekturę operacyjną, lokalne dostosowanie lub dodatkowy moduł analityczny.`;
    } else {
      functionalDifferences = `Niskie pokrycie funkcjonalne z rekordem „${cand.title}” (${cand.registryName}) — rozwiązanie adresuje odrębny proces lub wykorzystuje inną metodykę realizacji.`;
    }

    return {
      registry: cand.registryName,
      matchedTitle: cand.title,
      matchedReferenceId: cand.referenceId,
      matchPercent,
      status,
      functionalDifferences,
    };
  });

  scored.sort((a, b) => b.matchPercent - a.matchPercent);
  return scored.slice(0, limit);
}

export interface GeneratedPathway {
  pathway: Pathway;
  rationale: string;
  targetGroups: string[];
  kpis: TransferKpi[];
}

export function generateTransferPathways(input: {
  domain: Domain;
  implementationLevel: number;
  trl: number | null;
  transferPotential: number;
}): GeneratedPathway[] {
  const { domain, implementationLevel, trl, transferPotential } = input;

  if (domain === "ADMINISTRACYJNY") {
    return [
      {
        pathway: "REPLIKACJA",
        rationale:
          "Innowacja procesowa w administracji publicznej o wysokim potencjale powielenia w innych gminach i powiatach bez kosztownych licencji IT.",
        targetGroups: [
          "Jednostki Samorządu Terytorialnego (JST)",
          "Urzędy gmin i miast",
          "Centra Usług Wspólnych",
        ],
        kpis: [
          {
            metric: "Czas adaptacji w kolejnej JST",
            target: "< 4 tygodnie",
            timeframe: "Wdrożenie pilotażowe",
          },
          {
            metric: "Redukcja kosztów operacyjnych procesu",
            target: "15–30% rocznie",
            timeframe: "12 miesięcy od wdrożenia",
          },
        ],
      },
      ...(transferPotential >= 4
        ? [
            {
              pathway: "TRANSFER_TECHNOLOGII" as Pathway,
              rationale:
                "Możliwość udostępnienia otwartego podręcznika wdrożeniowego oraz szablonów procedur w ramach regionalnej sieci JST.",
              targetGroups: [
                "Związki gmin i powiatów",
                "Regionalne centra innowacji (PCI)",
              ],
              kpis: [
                {
                  metric: "Liczba replikujących jednostek",
                  target: "min. 5 JST w województwie",
                  timeframe: "12 miesięcy",
                },
              ],
            },
          ]
        : []),
    ];
  }

  if (domain === "EDUKACYJNY") {
    return [
      {
        pathway: "REPLIKACJA",
        rationale:
          "Metodyka i narzędzia dydaktyczne gotowe do skalowania w sieci szkół podstawowych, ponadpodstawowych i placówek doskonalenia nauczycieli.",
        targetGroups: [
          "Szkoły podstawowe i ponadpodstawowe",
          "Organy prowadzące szkoły (JST)",
          "Ośrodki Doskonalenia Nauczycieli",
        ],
        kpis: [
          {
            metric: "Liczba przeszkolonych nauczycieli",
            target: "≥ 40 osób w pilotażu regionalnym",
            timeframe: "1 semestr",
          },
          {
            metric: "Wzrost zaangażowania lub wyników uczniów",
            target: "+15–25% w ewaluacji semestralnej",
            timeframe: "Rok szkolny",
          },
        ],
      },
      {
        pathway: "TRANSFER_TECHNOLOGII",
        rationale:
          "Udostępnienie otwartych materiałów edukacyjnych (OER) i scenariuszy wdrożeniowych na licencji otwartej.",
        targetGroups: ["Uczelnie pedagogiczne", "Kuratoria oświaty"],
        kpis: [
          {
            metric: "Liczba placówek wdrażających model",
            target: "≥ 10 placówek",
            timeframe: "12 miesięcy",
          },
        ],
      },
    ];
  }

  // TECHNOLOGICZNY
  const effectiveTrl = trl ?? (implementationLevel >= 4 ? 6 : 4);
  if (effectiveTrl >= 6) {
    return [
      {
        pathway: "TRANSFER_TECHNOLOGII",
        rationale:
          "Wysoka dojrzałość technologiczna (TRL ≥ 6) umożliwia licencjonowanie technologii, wdrożenie pilotażowe u partnera przemysłowego lub w infrastrukturze publicznej.",
        targetGroups: [
          "Przedsiębiorstwa przemysłowe i MŚP",
          "Operatorzy infrastruktury krytycznej",
          "Centra Transferu Technologii (CTT)",
        ],
        kpis: [
          {
            metric: "Osiągnięcie gotowości wdrożeniowej",
            target: `TRL ${Math.min(9, effectiveTrl + 2)} w środowisku operacyjnym`,
            timeframe: "12 miesięcy",
          },
          {
            metric: "Redukcja czasu lub kosztów operacyjnych",
            target: "30–60% względem procesu bazowego",
            timeframe: "Pilotaż 6 mies.",
          },
        ],
      },
      {
        pathway: "KOMERCJALIZACJA",
        rationale:
          "Potencjał utworzenia spółki spin-off lub sprzedaży licencji komercyjnej przy wsparciu funduszy zalążkowych i grantów wdrożeniowych (FENG / PARP).",
        targetGroups: [
          "Inwestorzy VC / Aniołowie Biznesu",
          "Startupy technologiczne i spółki spin-off",
        ],
        kpis: [
          {
            metric: "Pierwsze umowy pilotażowe / komercyjne",
            target: "2–3 wdrożenia płatne",
            timeframe: "12–18 miesięcy",
          },
        ],
      },
    ];
  }

  return [
    {
      pathway: "BADANIA_ROZWOJ",
      rationale:
        "Rozwiązanie wymaga domknięcia walidacji laboratoryjnej i testów w warunkach zbliżonych do rzeczywistych (ścieżka B+R z finansowaniem NCBR / NCN / Horyzont Europa).",
      targetGroups: [
        "Uczelnie techniczne i instytuty PAN",
        "Konsorcja naukowo-przemysłowe",
        "Agencje grantowe (NCBR, NCN)",
      ],
      kpis: [
        {
          metric: "Awans gotowości technologicznej",
          target: `Podniesienie z TRL ${effectiveTrl} do TRL ${Math.min(7, effectiveTrl + 2)}`,
          timeframe: "12–18 miesięcy",
        },
        {
          metric: "Ochrona własności intelektualnej",
          target: "Zgłoszenie patentowe UPRP / EPO",
          timeframe: "9 miesięcy",
        },
      ],
    },
    {
      pathway: "TRANSFER_TECHNOLOGII",
      rationale:
        "Wczesne włączenie partnera wdrożeniowego z sektora gospodarki w celu zdefiniowania wymagań dla fazy demonstratora.",
      targetGroups: ["Centra Transferu Technologii", "Firmy badawczo-rozwojowe"],
      kpis: [
        {
          metric: "Listy intencyjne od odbiorców technologii",
          target: "min. 2 partnerów branżowych",
          timeframe: "6 miesięcy",
        },
      ],
    },
  ];
}
