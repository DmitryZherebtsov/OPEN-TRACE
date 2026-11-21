import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeEvaluation } from "@/lib/serializers";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const evaluation = await prisma.projectEvaluation.findUnique({
      where: { id },
    });

    if (!evaluation) {
      return NextResponse.json(
        { error: "Nie znaleziono raportu oceny o podanym identyfikatorze." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      evaluation: serializeEvaluation(evaluation),
    });
  } catch (error) {
    console.error("[GET /api/evaluations/[id]]", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas pobierania raportu oceny." },
      { status: 500 }
    );
  }
}
