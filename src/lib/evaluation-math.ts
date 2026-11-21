import { z } from "zod";
import type {
  DeterministicEvaluationMetrics,
  EvaluationAgentReport,
  EvaluationTable,
} from "@/types/evaluation";

export const SubcategoryScoreSchema = z.object({
  punkty: z.number().int().min(1).max(10),
  uzasadnienie: z.string().min(10),
});

export const EvaluationSubcategoriesSchema = z.object({
  kat_1_zwiazek_z_wyzwaniem: z.object({
    "1_1_trafnosc_diagnozy": SubcategoryScoreSchema,
    "1_2_adekwatnosc_rozwiazania": SubcategoryScoreSchema,
    "1_3_mierzalnosc_efektow": SubcategoryScoreSchema,
  }),
  kat_2_pomysl_i_oryginalnosc: z.object({
    "2_1_poziom_nowosci": SubcategoryScoreSchema,
    "2_2_wyroznik_antyduplikacja": SubcategoryScoreSchema,
    "2_3_kreatywnosc_podejscia": SubcategoryScoreSchema,
  }),
  kat_3_uzytecznosc_i_ux: z.object({
    "3_1_prostota_wdrozenia": SubcategoryScoreSchema,
    "3_2_dostepnosc_inkluzywnosc": SubcategoryScoreSchema,
    "3_3_wartosc_dla_odbiorcy": SubcategoryScoreSchema,
  }),
  kat_4_kompletnosc_prototypu: z.object({
    "4_1_dojrzalosc_mvp": SubcategoryScoreSchema,
    "4_2_spojnosc_architektury": SubcategoryScoreSchema,
    "4_3_realizm_techniczny": SubcategoryScoreSchema,
  }),
  kat_5_potencjal_wdrozeniowy: z.object({
    "5_1_skalowalnosc": SubcategoryScoreSchema,
    "5_2_transfer_komercjalizacja": SubcategoryScoreSchema,
    "5_3_bezpieczenstwo_prawo": SubcategoryScoreSchema,
  }),
});

export const SimilarProblemSchema = z.object({
  nazwa_projektu: z.string().min(3),
  link_url: z.string().url(),
  opis_problemu: z.string().min(10),
  czy_krytyczny: z.boolean(),
  jak_rozwiazano: z.string().min(5),
  czy_zaadresowany_w_projekcie: z.boolean().optional(),
});

export const EvaluationAgentReportSchema = z.object({
  rola: z.enum(["ADWOKAT", "SCEPTYK", "ARBITER"]),
  oceny_podkategorii: EvaluationSubcategoriesSchema,
  koszty_pln: z.object({
    koszt_mvp: z.number().nonnegative(),
    uzasadnienie_mvp: z.string().min(5),
    koszt_pilotazu: z.number().nonnegative(),
    uzasadnienie_pilotazu: z.string().min(5),
  }),
  podobne_problemy: z.array(SimilarProblemSchema).min(1),
  podsumowanie_decyzji: z.string().min(10),
});

export const VerifierResultSchema = z.object({
  link_url: z.string().url(),
  nazwa_projektu: z.string().optional(),
  zrodlo_agenta: z
    .enum(["ADWOKAT", "SCEPTYK", "UZUPELNIENIE_TOR_A"])
    .optional(),
  status: z.enum(["ZWERYFIKOWANY", "CZĘŚCIOWO_ZGODNY", "HALUCYNACJA"]),
  czy_projekt_istnieje: z.boolean(),
  zgodnosc_nazwy_i_opisu_procent: z.number().min(0).max(100),
  krotkie_uzasadnienie: z.string().min(5),
});

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function routeEvaluationTable(
  totalScore: number,
  totalPertCostPln: number,
  maxBudgetPln: number,
  toleranceMultiplier = 1.2
): { targetTable: EvaluationTable; budgetLimitPln: number } {
  const budgetLimitPln = round2(maxBudgetPln * toleranceMultiplier);
  if (totalScore < 25) {
    return { targetTable: "ARCHIWUM_ODRZUCONE", budgetLimitPln };
  }
  if (totalPertCostPln <= budgetLimitPln) {
    return { targetTable: "TABELA_GLOWNA", budgetLimitPln };
  }
  return { targetTable: "TABELA_DRUGORZEDNA", budgetLimitPln };
}

export function calculateDeterministicEvaluation(
  advocate: EvaluationAgentReport,
  skeptic: EvaluationAgentReport,
  arbiter: EvaluationAgentReport,
  maxBudgetPln: number,
  toleranceMultiplier = 1.2
): DeterministicEvaluationMetrics {
  const k1 = arbiter.oceny_podkategorii.kat_1_zwiazek_z_wyzwaniem;
  const k2 = arbiter.oceny_podkategorii.kat_2_pomysl_i_oryginalnosc;
  const k3 = arbiter.oceny_podkategorii.kat_3_uzytecznosc_i_ux;
  const k4 = arbiter.oceny_podkategorii.kat_4_kompletnosc_prototypu;
  const k5 = arbiter.oceny_podkategorii.kat_5_potencjal_wdrozeniowy;

  const c1Raw =
    (k1["1_1_trafnosc_diagnozy"].punkty +
      k1["1_2_adekwatnosc_rozwiazania"].punkty +
      k1["1_3_mierzalnosc_efektow"].punkty) /
    3;
  const c2Raw =
    (k2["2_1_poziom_nowosci"].punkty +
      k2["2_2_wyroznik_antyduplikacja"].punkty +
      k2["2_3_kreatywnosc_podejscia"].punkty) /
    3;
  const c3Raw =
    (k3["3_1_prostota_wdrozenia"].punkty +
      k3["3_2_dostepnosc_inkluzywnosc"].punkty +
      k3["3_3_wartosc_dla_odbiorcy"].punkty) /
    3;
  const c4Raw =
    (k4["4_1_dojrzalosc_mvp"].punkty +
      k4["4_2_spojnosc_architektury"].punkty +
      k4["4_3_realizm_techniczny"].punkty) /
    3;
  const c5Raw =
    (k5["5_1_skalowalnosc"].punkty +
      k5["5_2_transfer_komercjalizacja"].punkty +
      k5["5_3_bezpieczenstwo_prawo"].punkty) /
    3;

  const totalRaw = c1Raw + c2Raw + c3Raw + c4Raw + c5Raw;
  const avgRaw = totalRaw / 5;
  const percentRaw = (totalRaw / 50) * 100;

  const pertMvpRaw =
    (advocate.koszty_pln.koszt_mvp +
      4 * arbiter.koszty_pln.koszt_mvp +
      skeptic.koszty_pln.koszt_mvp) /
    6;
  const pertPilotRaw =
    (advocate.koszty_pln.koszt_pilotazu +
      4 * arbiter.koszty_pln.koszt_pilotazu +
      skeptic.koszty_pln.koszt_pilotazu) /
    6;
  const totalPertRaw = pertMvpRaw + pertPilotRaw;

  const criticalProblems = arbiter.podobne_problemy.filter(
    (p) => p.czy_krytyczny
  );
  const unaddressedCritical = criticalProblems.filter(
    (p) => p.czy_zaadresowany_w_projekcie !== true
  );
  const criticalRiskRaw =
    criticalProblems.length > 0
      ? (unaddressedCritical.length / criticalProblems.length) * 100
      : 0;

  const totalScore = round2(totalRaw);
  const pertMvpCostPln = round2(pertMvpRaw);
  const pertPilotCostPln = round2(pertPilotRaw);
  const totalPertCostPln = round2(totalPertRaw);

  const { targetTable, budgetLimitPln } = routeEvaluationTable(
    totalScore,
    totalPertCostPln,
    maxBudgetPln,
    toleranceMultiplier
  );

  return {
    c1ChallengeFit: round2(c1Raw),
    c2Originality: round2(c2Raw),
    c3UsabilityUx: round2(c3Raw),
    c4Completeness: round2(c4Raw),
    c5Scalability: round2(c5Raw),
    totalScore,
    avgScore: round2(avgRaw),
    percentScore: round2(percentRaw),
    pertMvpCostPln,
    pertPilotCostPln,
    totalPertCostPln,
    criticalRiskPercent: round2(criticalRiskRaw),
    budgetLimitSnapshotPln: budgetLimitPln,
    targetTable,
  };
}
