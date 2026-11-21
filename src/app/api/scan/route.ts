import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  fetchAndParseUrl,
  normalizeRawText,
  parsePdfBuffer,
} from "@/lib/scraper";
import { extractInnovationWithFactsVsAi } from "@/lib/llm-extractor";
import {
  calculateCredibilityIndex,
  computeSimilarityMatches,
  generateTransferPathways,
  inferSourceTypeFromUrl,
} from "@/lib/scoring-engine";
import { serializeInnovation, serializeScanJob } from "@/lib/serializers";
import type { VerifiedFacts } from "@/types/innovation";

const JsonScanSchema = z.object({
  mode: z.enum(["url", "text"]),
  url: z.string().trim().optional(),
  text: z.string().trim().optional(),
  title: z.string().trim().optional(),
  registryName: z.string().trim().optional(),
});

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  let jobKind = "TOR_B_URL";
  let jobTarget = "";

  try {
    const contentType = request.headers.get("content-type") || "";
    let rawText = "";
    let sourceUrl: string | null = null;
    let hintTitle: string | null = null;
    let registryOverride: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      jobKind = "TOR_B_PDF";
      const formData = await request.formData();
      const file = formData.get("file");
      const optionalRegistry = formData.get("registryName");

      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "Nie wybrano pliku PDF do przesłania." },
          { status: 400 }
        );
      }
      if (
        !file.name.toLowerCase().endsWith(".pdf") &&
        file.type !== "application/pdf"
      ) {
        return NextResponse.json(
          { error: "Skaner dokumentów obsługuje wyłącznie pliki w formacie PDF." },
          { status: 400 }
        );
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Rozmiar pliku PDF przekracza maksymalny limit 10 MB." },
          { status: 400 }
        );
      }

      jobTarget = file.name;
      const arrayBuffer = await file.arrayBuffer();
      const parsedPdf = await parsePdfBuffer(Buffer.from(arrayBuffer));
      rawText = parsedPdf.text;
      hintTitle =
        parsedPdf.title ||
        file.name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ");
      registryOverride =
        typeof optionalRegistry === "string" && optionalRegistry.trim()
          ? optionalRegistry.trim()
          : "Dokument PDF (Skan doraźny Tor B)";
    } else {
      const body: unknown = await request.json().catch(() => null);
      const parsed = JsonScanSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error:
              "Nieprawidłowe parametry skanowania. Wybierz tryb URL, PDF lub Tekst źródłowy.",
          },
          { status: 400 }
        );
      }

      const { mode, url, text, title, registryName } = parsed.data;
      registryOverride = registryName || null;

      if (mode === "url") {
        if (!url) {
          return NextResponse.json(
            { error: "Podaj poprawny adres URL strony lub dokumentu PDF." },
            { status: 400 }
          );
        }
        jobKind = "TOR_B_URL";
        jobTarget = url;
        const scraped = await fetchAndParseUrl(url);
        rawText = scraped.text;
        sourceUrl = scraped.url;
        hintTitle = title || scraped.title;
      } else {
        if (!text || text.length < 40) {
          return NextResponse.json(
            {
              error:
                "Wklejony tekst źródłowy jest zbyt krótki (wymagane minimum 40 znaków).",
            },
            { status: 400 }
          );
        }
        jobKind = "TOR_B_TEKST";
        jobTarget = title || text.slice(0, 90);
        rawText = normalizeRawText(text);
        hintTitle = title || null;
        registryOverride =
          registryName || "Tekst źródłowy (Skan doraźny Tor B)";
      }
    }

    // 1. Ekstrakcja „Fakty vs AI” (LLM lub deterministyczny tryb offline PL)
    const extracted = await extractInnovationWithFactsVsAi({
      rawText,
      sourceUrl,
      hintTitle,
    });

    // Twardy guardrail domenowy
    const enforcedTrl =
      extracted.domain === "TECHNOLOGICZNY" ? extracted.trl : null;

    // 2. Deterministyczny Indeks Wiarygodności (1..5)
    const credibility = calculateCredibilityIndex(
      extracted.verifiedFacts,
      sourceUrl,
      extracted.creator
    );

    // 3. Szybka analiza podobieństwa antyduplikacyjnego względem bazy Tor A (< 200 ms)
    const existingCandidates = await prisma.innovation.findMany({
      include: { source: true },
      take: 40,
    });

    const similarityMatches = computeSimilarityMatches(
      {
        title: extracted.title,
        summary: extracted.summary,
        problem: extracted.problem,
        solution: extracted.solution,
        domain: extracted.domain,
      },
      existingCandidates.map((c) => {
        const vf = c.verifiedFacts as unknown as VerifiedFacts;
        return {
          id: c.id,
          title: c.title,
          summary: c.summary,
          problem: c.problem,
          solution: c.solution,
          domain: c.domain,
          registryName: c.source.registryName,
          referenceId: vf?.formalIdentifier || c.id.slice(0, 10).toUpperCase(),
        };
      }),
      3
    );

    // 4. Deterministyczne ścieżki transferu i KPI
    const pathways = generateTransferPathways({
      domain: extracted.domain,
      implementationLevel: extracted.implementationLevel,
      trl: enforcedTrl,
      transferPotential: extracted.transferPotential,
    });

    // 5. Zapis DataSource + Innovation + powiązanych rekordów
    const syntheticHash = crypto
      .createHash("sha256")
      .update(`${jobKind}:${jobTarget}:${Date.now()}`)
      .digest("hex")
      .slice(0, 14);
    const persistedUrl =
      sourceUrl || `urn:opentrace:tor-b:${jobKind.toLowerCase()}:${syntheticHash}`;

    const inferred = sourceUrl
      ? inferSourceTypeFromUrl(sourceUrl)
      : {
          institutionType: "INNE" as const,
          registryName: registryOverride || "Skan doraźny Tor B",
        };

    const dataSource = await prisma.dataSource.upsert({
      where: { url: persistedUrl },
      update: {
        registryName: registryOverride || inferred.registryName,
        institutionType: inferred.institutionType,
        availability: "DOSTEPNE",
        lastScannedAt: new Date(),
      },
      create: {
        url: persistedUrl,
        registryName: registryOverride || inferred.registryName,
        institutionType: inferred.institutionType,
        availability: "DOSTEPNE",
      },
    });

    const createdInnovation = await prisma.innovation.create({
      data: {
        title: extracted.title,
        summary: extracted.summary,
        problem: extracted.problem,
        solution: extracted.solution,
        domain: extracted.domain,
        creator: extracted.creator,
        institution: extracted.institution,
        isPreIndexed: false,
        verifiedFacts:
          extracted.verifiedFacts as unknown as Prisma.InputJsonValue,
        sourceId: dataSource.id,
        scoring: {
          create: {
            implementationLevel: extracted.implementationLevel,
            trl: enforcedTrl,
            innovativeness: extracted.innovativeness,
            transferPotential: extracted.transferPotential,
            credibilityIndex: credibility.score,
            credibilityDetails:
              credibility as unknown as Prisma.InputJsonValue,
            aiEstimates:
              extracted.aiEstimates as unknown as Prisma.InputJsonValue,
          },
        },
        similarities: {
          create: similarityMatches.map((m) => ({
            registry: m.registry,
            matchedTitle: m.matchedTitle,
            matchedReferenceId: m.matchedReferenceId,
            matchPercent: m.matchPercent,
            status: m.status,
            functionalDifferences: m.functionalDifferences,
          })),
        },
        pathways: {
          create: pathways.map((p) => ({
            pathway: p.pathway,
            rationale: p.rationale,
            targetGroups: p.targetGroups,
            kpis: p.kpis as unknown as Prisma.InputJsonValue,
          })),
        },
      },
      include: {
        source: true,
        scoring: true,
        similarities: { orderBy: { matchPercent: "desc" } },
        pathways: true,
        _count: { select: { evaluations: true } },
      },
    });

    const scanJob = await prisma.scanJob.create({
      data: {
        kind: jobKind,
        target: jobTarget.slice(0, 240),
        status: "ZAKONCZONO",
        durationMs: Math.max(10, Date.now() - startedAt),
        recordsFound: 1,
        innovationId: createdInnovation.id,
      },
    });

    return NextResponse.json(
      {
        innovation: serializeInnovation(createdInnovation),
        job: serializeScanJob(scanJob),
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Wystąpił nieoczekiwany błąd podczas skanowania OSINT.";

    await prisma.scanJob
      .create({
        data: {
          kind: jobKind,
          target: (jobTarget || "Nieznany cel").slice(0, 240),
          status: "BLAD",
          durationMs: Math.max(10, Date.now() - startedAt),
          recordsFound: 0,
          errors: { message },
        },
      })
      .catch(() => null);

    const status = message.includes("ochrona SSRF") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
