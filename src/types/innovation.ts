import type {
  Domain,
  Pathway,
  SimilarityStatus,
  SourceAvailability,
  SourceType,
} from "@prisma/client";

export type { Domain, Pathway, SimilarityStatus, SourceAvailability, SourceType };

export type PersonaId =
  | "JST"
  | "SZKOLY"
  | "UCZELNIE"
  | "INWESTORZY"
  | "STARTUPY"
  | "WYNALAZCY";

export interface VerifiedFacts {
  institution: string | null;
  publicationDate: string | null;
  sourceUrl: string | null;
  formalIdentifier: string | null;
  verbatimQuotes: string[];
  authorMetrics: string[];
  budgetOrCost: string | null;
  hasSupplementaryDocs: boolean;
}

export interface CredibilityAttribute {
  key:
    | "officialDomain"
    | "identifiedCreator"
    | "formalIdentifier"
    | "measurableResults"
    | "supplementaryDocs";
  label: string;
  met: boolean;
  evidence: string;
}

export interface CredibilityDetails {
  score: number;
  maxScore: 5;
  attributes: CredibilityAttribute[];
}

export interface AiEstimates {
  domainRationale: string;
  implementationRationale: string;
  trlRationale: string;
  innovativenessRationale: string;
  transferPotentialRationale: string;
  modelUsed: string;
  isOfflineFallback?: boolean;
}

export interface TransferKpi {
  metric: string;
  target: string;
  timeframe: string;
}

export interface InnovationSourceDTO {
  id: string;
  url: string;
  registryName: string;
  institutionType: SourceType;
  lastScannedAt: string;
  availability: SourceAvailability;
}

export interface ScoringBreakdownDTO {
  id: string;
  innovationId: string;
  implementationLevel: number;
  trl: number | null;
  innovativeness: number;
  transferPotential: number;
  credibilityIndex: number;
  credibilityDetails: CredibilityDetails;
  aiEstimates: AiEstimates;
}

export interface SimilarityMatchDTO {
  id: string;
  innovationId: string;
  registry: string;
  matchedTitle: string;
  matchedReferenceId: string;
  matchPercent: number;
  status: SimilarityStatus;
  functionalDifferences: string;
}

export interface TransferPathwayDTO {
  id: string;
  innovationId: string;
  pathway: Pathway;
  rationale: string;
  targetGroups: string[];
  kpis: TransferKpi[];
}

export interface InnovationDTO {
  id: string;
  title: string;
  summary: string;
  problem: string;
  solution: string;
  domain: Domain;
  creator: string | null;
  institution: string | null;
  isPreIndexed: boolean;
  verifiedFacts: VerifiedFacts;
  sourceId: string;
  source: InnovationSourceDTO;
  scoring: ScoringBreakdownDTO | null;
  similarities: SimilarityMatchDTO[];
  pathways: TransferPathwayDTO[];
  evaluationsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScanJobDTO {
  id: string;
  kind: string;
  target: string;
  status: string;
  startedAt: string;
  durationMs: number;
  recordsFound: number;
  innovationId: string | null;
  errors: unknown;
}

export const DOMAIN_LABELS: Record<Domain, string> = {
  TECHNOLOGICZNY: "Technologiczna",
  EDUKACYJNY: "Edukacyjna",
  ADMINISTRACYJNY: "Administracyjna",
};

export const PATHWAY_LABELS: Record<Pathway, string> = {
  REPLIKACJA: "Replikacja w sektorze publicznym",
  TRANSFER_TECHNOLOGII: "Transfer technologii",
  BADANIA_ROZWOJ: "Badania i rozwój (B+R)",
  KOMERCJALIZACJA: "Komercjalizacja rynkowa",
};

export const SIMILARITY_STATUS_LABELS: Record<SimilarityStatus, string> = {
  UNIKALNE: "Unikalne (< 55%)",
  POKREWNE: "Pokrewne (55–79%)",
  POTENCJALNY_DUPLIKAT: "Potencjalny duplikat (≥ 80%)",
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  UCZELNIA: "Uczelnia / Jednostka naukowa",
  SZKOLA: "Szkoła / Placówka oświatowa",
  JST: "Jednostka Samorządu Terytorialnego (JST)",
  REJESTR_PATENTOWY: "Rejestr patentowy",
  BAZA_GRANTOWA: "Baza grantowa",
  INKUBATOR_CTT: "Inkubator / Centrum Transferu Technologii",
  INNE: "Inne źródło otwarte",
};

export const MISSING_SOURCE_DATA_LABEL = "Brak danych w źródle";

export function formatSourceValue(value: string | null | undefined): string {
  if (!value || value.trim().length === 0) {
    return MISSING_SOURCE_DATA_LABEL;
  }
  return value;
}

export function formatTrl(domain: Domain, trl: number | null): string {
  if (domain !== "TECHNOLOGICZNY" || trl === null) {
    return "TRL: N/D";
  }
  return `TRL ${trl}/9`;
}
