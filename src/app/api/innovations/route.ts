import { NextRequest, NextResponse } from "next/server";
import type { Domain, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { serializeInnovation } from "@/lib/serializers";

const VALID_DOMAINS: Domain[] = [
  "TECHNOLOGICZNY",
  "EDUKACYJNY",
  "ADMINISTRACYJNY",
];

export async function GET(request: NextRequest) {
  const startedAt = performance.now();

  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim() || "";
    const domainParam = searchParams.get("domain")?.trim().toUpperCase() || "";
    const minCredibility = Number(searchParams.get("minCredibility") || "0");
    const minImplementation = Number(
      searchParams.get("minImplementation") || "0"
    );
    const onlyPreIndexed = searchParams.get("preIndexed") === "true";

    const where: Prisma.InnovationWhereInput = {};

    if (
      domainParam &&
      domainParam !== "ALL" &&
      VALID_DOMAINS.includes(domainParam as Domain)
    ) {
      where.domain = domainParam as Domain;
    }

    if (onlyPreIndexed) {
      where.isPreIndexed = true;
    }

    if (q.length > 0) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { problem: { contains: q, mode: "insensitive" } },
        { solution: { contains: q, mode: "insensitive" } },
        { institution: { contains: q, mode: "insensitive" } },
        { creator: { contains: q, mode: "insensitive" } },
        { source: { registryName: { contains: q, mode: "insensitive" } } },
      ];
    }

    if (minCredibility > 0 || minImplementation > 0) {
      where.scoring = {
        ...(minCredibility > 0
          ? { credibilityIndex: { gte: minCredibility } }
          : {}),
        ...(minImplementation > 0
          ? { implementationLevel: { gte: minImplementation } }
          : {}),
      };
    }

    const items = await prisma.innovation.findMany({
      where,
      include: {
        source: true,
        scoring: true,
        similarities: { orderBy: { matchPercent: "desc" } },
        pathways: true,
        _count: { select: { evaluations: true } },
      },
      orderBy: [{ isPreIndexed: "desc" }, { createdAt: "desc" }],
    });

    const latencyMs = Math.max(1, Math.round(performance.now() - startedAt));

    return NextResponse.json({
      items: items.map(serializeInnovation),
      total: items.length,
      latencyMs,
    });
  } catch (error) {
    console.error("[GET /api/innovations]", error);
    return NextResponse.json(
      {
        error:
          "Nie udało się pobrać listy innowacji z bazy danych. Sprawdź połączenie z PostgreSQL.",
      },
      { status: 500 }
    );
  }
}
