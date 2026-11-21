import type { Domain, Pathway, PersonaId } from "@/types/innovation";

export interface PersonaConfig {
  id: PersonaId;
  shortLabel: string;
  label: string;
  description: string;
  defaultDomain: Domain | "ALL";
  preferredPathways: Pathway[];
  highlightedKpis: string[];
  accentBadge: string;
}

export const PERSONAS: PersonaConfig[] = [
  {
    id: "JST",
    shortLabel: "JST / Samorządy",
    label: "Jednostki Samorządu Terytorialnego (JST)",
    description:
      "Priorytet dla gotowych innowacji administracyjnych i replikacji niskokosztowej w gminach i powiatach.",
    defaultDomain: "ADMINISTRACYJNY",
    preferredPathways: ["REPLIKACJA", "TRANSFER_TECHNOLOGII"],
    highlightedKpis: [
      "Czas adaptacji < 4 tygodnie",
      "Oszczędność budżetu JST",
      "Brak vendor lock-in IT",
    ],
    accentBadge: "Replikacja w gminach",
  },
  {
    id: "SZKOLY",
    shortLabel: "Szkoły i Oświata",
    label: "Szkoły i Placówki Oświatowe",
    description:
      "Skupienie na innowacjach edukacyjnych (TRL: N/D), wsparciu nauczycieli, inkluzywności i efektywności stołówek/szkół.",
    defaultDomain: "EDUKACYJNY",
    preferredPathways: ["REPLIKACJA"],
    highlightedKpis: [
      "Liczba placówek pilotażowych",
      "Wpływ dydaktyczny w 1 semestrze",
      "Otwarte zasoby (OER)",
    ],
    accentBadge: "Innowacje dydaktyczne",
  },
  {
    id: "UCZELNIE",
    shortLabel: "Uczelnie i CTT",
    label: "Uczelnie, Instytuty PAN i Centra Transferu Technologii",
    description:
      "Monitoring patentów UPRP/EPO, grantów NCBR/NCN/CORDIS oraz wczesnych ścieżek B+R i transferu technologii.",
    defaultDomain: "TECHNOLOGICZNY",
    preferredPathways: ["TRANSFER_TECHNOLOGII", "BADANIA_ROZWOJ"],
    highlightedKpis: [
      "Awans gotowości TRL",
      "Ochrona IP (UPRP / EPO)",
      "Indeks wiarygodności źródła",
    ],
    accentBadge: "B+R i transfer IP",
  },
  {
    id: "INWESTORZY",
    shortLabel: "Inwestorzy / VC",
    label: "Inwestorzy, Fundusze VC i Instytucje Finansujące",
    description:
      "Weryfikacja antyduplikacyjna, twarde koszty PERT oraz potencjał komercjalizacji projektów technologicznych.",
    defaultDomain: "TECHNOLOGICZNY",
    preferredPathways: ["KOMERCJALIZACJA", "TRANSFER_TECHNOLOGII"],
    highlightedKpis: [
      "Koszt urealniony PERT",
      "Ryzyko krytyczne R_kryt",
      "Potencjał komercjalizacji",
    ],
    accentBadge: "Due diligence & PERT",
  },
  {
    id: "STARTUPY",
    shortLabel: "Startupy i MŚP",
    label: "Startupy Technologiczne i MŚP",
    description:
      "Szybkie rozpoznanie luki rynkowej, dostępnych licencji uczelnianych oraz programów pilotażowych (PARP/FENG).",
    defaultDomain: "TECHNOLOGICZNY",
    preferredPathways: ["KOMERCJALIZACJA", "TRANSFER_TECHNOLOGII"],
    highlightedKpis: [
      "Status antyduplikacji (< 55%)",
      "Gotowość do pilotażu (TRL ≥ 6)",
      "Pierwsze wdrożenia komercyjne",
    ],
    accentBadge: "Skalowanie i pilotaż",
  },
  {
    id: "WYNALAZCY",
    shortLabel: "Wynalazcy",
    label: "Wynalazcy i Zespoły Badawcze",
    description:
      "Porównanie pomysłu z bazami patentowymi, ścieżki ochrony IP oraz bezstronna wieloagentowa ocena gotowości.",
    defaultDomain: "ALL",
    preferredPathways: ["BADANIA_ROZWOJ", "TRANSFER_TECHNOLOGII"],
    highlightedKpis: [
      "Dopasowanie w bazach UPRP/EPO",
      "Wiarygodność dokumentacji",
      "Rekomendacja ścieżki B+R",
    ],
    accentBadge: "Antyduplikacja i IP",
  },
];

export function getPersonaConfig(id: PersonaId): PersonaConfig {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
}
