import type {
  AdminSettings,
  DataSource,
  Innovation,
  ProjectEvaluation,
  ScanJob,
  ScoringBreakdown,
  SimilarityMatch,
  TransferPathway,
} from "@prisma/client";
import type {
  AiEstimates,
  CredibilityDetails,
  InnovationDTO,
  ScanJobDTO,
  TransferKpi,
  VerifiedFacts,
} from "@/types/innovation";
import type {
  AdminBudgetDTO,
  EvaluationAgentReport,
  ProjectEvaluationDTO,
  VerifierResult,
} from "@/types/evaluation";

export type InnovationWithRelations = Innovation & {
  source: DataSource;
  scoring: ScoringBreakdown | null;
  similarities: SimilarityMatch[];
  pathways: TransferPathway[];
  _count?: { evaluations: number };
};

export function serializeInnovation(
  item: InnovationWithRelations
): InnovationDTO {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    problem: item.problem,
    solution: item.solution,
    domain: item.domain,
    creator: item.creator,
    institution: item.institution,
    isPreIndexed: item.isPreIndexed,
    verifiedFacts: item.verifiedFacts as unknown as VerifiedFacts,
    sourceId: item.sourceId,
    source: {
      id: item.source.id,
      url: item.source.url,
      registryName: item.source.registryName,
      institutionType: item.source.institutionType,
      lastScannedAt: item.source.lastScannedAt.toISOString(),
      availability: item.source.availability,
    },
    scoring: item.scoring
      ? {
          id: item.scoring.id,
          innovationId: item.scoring.innovationId,
          implementationLevel: item.scoring.implementationLevel,
          trl: item.domain === "TECHNOLOGICZNY" ? item.scoring.trl : null,
          innovativeness: item.scoring.innovativeness,
          transferPotential: item.scoring.transferPotential,
          credibilityIndex: item.scoring.credibilityIndex,
          credibilityDetails: item.scoring
            .credibilityDetails as unknown as CredibilityDetails,
          aiEstimates: item.scoring.aiEstimates as unknown as AiEstimates,
        }
      : null,
    similarities: item.similarities.map((s) => ({
      id: s.id,
      innovationId: s.innovationId,
      registry: s.registry,
      matchedTitle: s.matchedTitle,
      matchedReferenceId: s.matchedReferenceId,
      matchPercent: s.matchPercent,
      status: s.status,
      functionalDifferences: s.functionalDifferences,
    })),
    pathways: item.pathways.map((p) => ({
      id: p.id,
      innovationId: p.innovationId,
      pathway: p.pathway,
      rationale: p.rationale,
      targetGroups: p.targetGroups,
      kpis: p.kpis as unknown as TransferKpi[],
    })),
    evaluationsCount: item._count?.evaluations,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializeScanJob(job: ScanJob): ScanJobDTO {
  return {
    id: job.id,
    kind: job.kind,
    target: job.target,
    status: job.status,
    startedAt: job.startedAt.toISOString(),
    durationMs: job.durationMs,
    recordsFound: job.recordsFound,
    innovationId: job.innovationId,
    errors: job.errors,
  };
}

export function serializeEvaluation(
  ev: ProjectEvaluation
): ProjectEvaluationDTO {
  return {
    id: ev.id,
    innovationId: ev.innovationId,
    projectTitle: ev.projectTitle,
    projectDescription: ev.projectDescription,
    advocateReport: ev.advocateReport as unknown as EvaluationAgentReport,
    skepticReport: ev.skepticReport as unknown as EvaluationAgentReport,
    verifierLogs: ev.verifierLogs as unknown as VerifierResult[],
    arbiterReport: ev.arbiterReport as unknown as EvaluationAgentReport,
    c1ChallengeFit: ev.c1ChallengeFit,
    c2Originality: ev.c2Originality,
    c3UsabilityUx: ev.c3UsabilityUx,
    c4Completeness: ev.c4Completeness,
    c5Scalability: ev.c5Scalability,
    totalScore: ev.totalScore,
    avgScore: ev.avgScore,
    percentScore: ev.percentScore,
    pertMvpCostPln: ev.pertMvpCostPln,
    pertPilotCostPln: ev.pertPilotCostPln,
    totalPertCostPln: ev.totalPertCostPln,
    criticalRiskPercent: ev.criticalRiskPercent,
    budgetLimitSnapshotPln: ev.budgetLimitSnapshotPln,
    targetTable: ev.targetTable,
    durationMs: ev.durationMs,
    createdAt: ev.createdAt.toISOString(),
    updatedAt: ev.updatedAt.toISOString(),
  };
}

export function serializeAdminBudget(settings: AdminSettings): AdminBudgetDTO {
  return {
    id: settings.id,
    maxBudgetPln: settings.maxBudgetPln,
    toleranceMultiplier: settings.toleranceMultiplier,
    budgetLimitPln:
      Math.round(settings.maxBudgetPln * settings.toleranceMultiplier * 100) /
      100,
    updatedAt: settings.updatedAt.toISOString(),
  };
}
