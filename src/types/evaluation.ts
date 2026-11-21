import type { EvaluationTable } from "@prisma/client";

export type { EvaluationTable };

export type AgentRole = "ADWOKAT" | "SCEPTYK" | "ARBITER";

export interface SubcategoryScore {
  punkty: number;
  uzasadnienie: string;
}

export interface EvaluationSubcategories {
  kat_1_zwiazek_z_wyzwaniem: {
    "1_1_trafnosc_diagnozy": SubcategoryScore;
    "1_2_adekwatnosc_rozwiazania": SubcategoryScore;
    "1_3_mierzalnosc_efektow": SubcategoryScore;
  };
  kat_2_pomysl_i_oryginalnosc: {
    "2_1_poziom_nowosci": SubcategoryScore;
    "2_2_wyroznik_antyduplikacja": SubcategoryScore;
    "2_3_kreatywnosc_podejscia": SubcategoryScore;
  };
  kat_3_uzytecznosc_i_ux: {
    "3_1_prostota_wdrozenia": SubcategoryScore;
    "3_2_dostepnosc_inkluzywnosc": SubcategoryScore;
    "3_3_wartosc_dla_odbiorcy": SubcategoryScore;
  };
  kat_4_kompletnosc_prototypu: {
    "4_1_dojrzalosc_mvp": SubcategoryScore;
    "4_2_spojnosc_architektury": SubcategoryScore;
    "4_3_realizm_techniczny": SubcategoryScore;
  };
  kat_5_potencjal_wdrozeniowy: {
    "5_1_skalowalnosc": SubcategoryScore;
    "5_2_transfer_komercjalizacja": SubcategoryScore;
    "5_3_bezpieczenstwo_prawo": SubcategoryScore;
  };
}

export interface EvaluationCostsPln {
  koszt_mvp: number;
  uzasadnienie_mvp: string;
  koszt_pilotazu: number;
  uzasadnienie_pilotazu: string;
}

export interface SimilarProblemEntry {
  nazwa_projektu: string;
  link_url: string;
  opis_problemu: string;
  czy_krytyczny: boolean;
  jak_rozwiazano: string;
  czy_zaadresowany_w_projekcie?: boolean;
}

export interface EvaluationAgentReport {
  rola: AgentRole;
  oceny_podkategorii: EvaluationSubcategories;
  koszty_pln: EvaluationCostsPln;
  podobne_problemy: SimilarProblemEntry[];
  podsumowanie_decyzji: string;
}

export type VerifierStatus =
  | "ZWERYFIKOWANY"
  | "CZĘŚCIOWO_ZGODNY"
  | "HALUCYNACJA";

export interface VerifierResult {
  link_url: string;
  nazwa_projektu?: string;
  zrodlo_agenta?: "ADWOKAT" | "SCEPTYK" | "UZUPELNIENIE_TOR_A";
  status: VerifierStatus;
  czy_projekt_istnieje: boolean;
  zgodnosc_nazwy_i_opisu_procent: number;
  krotkie_uzasadnienie: string;
}

export interface DeterministicEvaluationMetrics {
  c1ChallengeFit: number;
  c2Originality: number;
  c3UsabilityUx: number;
  c4Completeness: number;
  c5Scalability: number;
  totalScore: number;
  avgScore: number;
  percentScore: number;
  pertMvpCostPln: number;
  pertPilotCostPln: number;
  totalPertCostPln: number;
  criticalRiskPercent: number;
  budgetLimitSnapshotPln: number;
  targetTable: EvaluationTable;
}

export interface ProjectEvaluationDTO {
  id: string;
  innovationId: string | null;
  projectTitle: string;
  projectDescription: string;
  advocateReport: EvaluationAgentReport;
  skepticReport: EvaluationAgentReport;
  verifierLogs: VerifierResult[];
  arbiterReport: EvaluationAgentReport;
  c1ChallengeFit: number;
  c2Originality: number;
  c3UsabilityUx: number;
  c4Completeness: number;
  c5Scalability: number;
  totalScore: number;
  avgScore: number;
  percentScore: number;
  pertMvpCostPln: number;
  pertPilotCostPln: number;
  totalPertCostPln: number;
  criticalRiskPercent: number;
  budgetLimitSnapshotPln: number;
  targetTable: EvaluationTable;
  durationMs: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBudgetDTO {
  id: string;
  maxBudgetPln: number;
  toleranceMultiplier: number;
  budgetLimitPln: number;
  updatedAt: string;
}

export const EVALUATION_TABLE_LABELS: Record<EvaluationTable, string> = {
  TABELA_GLOWNA: "Tabela Główna",
  TABELA_DRUGORZEDNA: "Tabela Drugorzędna",
  ARCHIWUM_ODRZUCONE: "Archiwum / Odrzucone",
};

export const CATEGORY_METADATA = [
  {
    key: "kat_1_zwiazek_z_wyzwaniem" as const,
    code: "C1",
    label: "1. Związek z wyzwaniem i diagnoza problemu",
    weight: "20%",
    subcategories: [
      { key: "1_1_trafnosc_diagnozy" as const, label: "1.1 Trafność diagnozy" },
      {
        key: "1_2_adekwatnosc_rozwiazania" as const,
        label: "1.2 Adekwatność rozwiązania",
      },
      {
        key: "1_3_mierzalnosc_efektow" as const,
        label: "1.3 Mierzalność efektów",
      },
    ],
  },
  {
    key: "kat_2_pomysl_i_oryginalnosc" as const,
    code: "C2",
    label: "2. Pomysł, oryginalność i wyróżnik",
    weight: "20%",
    subcategories: [
      { key: "2_1_poziom_nowosci" as const, label: "2.1 Poziom nowości" },
      {
        key: "2_2_wyroznik_antyduplikacja" as const,
        label: "2.2 Wyróżnik i antyduplikacja",
      },
      {
        key: "2_3_kreatywnosc_podejscia" as const,
        label: "2.3 Kreatywność podejścia",
      },
    ],
  },
  {
    key: "kat_3_uzytecznosc_i_ux" as const,
    code: "C3",
    label: "3. Użyteczność, prostota i wartość UX",
    weight: "20%",
    subcategories: [
      {
        key: "3_1_prostota_wdrozenia" as const,
        label: "3.1 Prostota wdrożenia",
      },
      {
        key: "3_2_dostepnosc_inkluzywnosc" as const,
        label: "3.2 Dostępność i inkluzywność",
      },
      {
        key: "3_3_wartosc_dla_odbiorcy" as const,
        label: "3.3 Wartość dla odbiorcy",
      },
    ],
  },
  {
    key: "kat_4_kompletnosc_prototypu" as const,
    code: "C4",
    label: "4. Kompletność prototypu i realizm",
    weight: "20%",
    subcategories: [
      { key: "4_1_dojrzalosc_mvp" as const, label: "4.1 Dojrzałość MVP" },
      {
        key: "4_2_spojnosc_architektury" as const,
        label: "4.2 Spójność architektury",
      },
      {
        key: "4_3_realizm_techniczny" as const,
        label: "4.3 Realizm techniczny i organizacyjny",
      },
    ],
  },
  {
    key: "kat_5_potencjal_wdrozeniowy" as const,
    code: "C5",
    label: "5. Potencjał wdrożeniowy, skala i prawo",
    weight: "20%",
    subcategories: [
      { key: "5_1_skalowalnosc" as const, label: "5.1 Skalowalność" },
      {
        key: "5_2_transfer_komercjalizacja" as const,
        label: "5.2 Transfer i komercjalizacja",
      },
      {
        key: "5_3_bezpieczenstwo_prawo" as const,
        label: "5.3 Bezpieczeństwo, RODO i zgodność prawna",
      },
    ],
  },
] as const;
