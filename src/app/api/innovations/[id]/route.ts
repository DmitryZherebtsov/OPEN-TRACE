import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeEvaluation, serializeInnovation } from "@/lib/serializers";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const innovation = await prisma.innovation.findUnique({
      where: { id },
      include: {
        source: true,
        scoring: true,
        similarities: { orderBy: { matchPercent: "desc" } },
        pathways: true,
        evaluations: { orderBy: { createdAt: "desc" } },
        _count: { select: { evaluations: true } },
      },
    });

    if (!innovation) {
      return NextResponse.json(
        { error: "Nie znaleziono innowacji o podanym identyfikatorze." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      innovation: serializeInnovation(innovation),
      evaluations: innovation.evaluations.map(serializeEvaluation),
    });
  } catch (error) {
    console.error("[GET /api/innovations/[id]]", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania szczegółów innowacji." },
      { status: 500 }
    );
  }
}
