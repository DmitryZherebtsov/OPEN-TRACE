import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeScanJob } from "@/lib/serializers";

export async function GET() {
  try {
    const jobs = await prisma.scanJob.findMany({
      orderBy: { startedAt: "desc" },
      take: 25,
    });
    return NextResponse.json({
      jobs: jobs.map(serializeScanJob),
    });
  } catch (error) {
    console.error("[GET /api/jobs]", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać historii zadań skanowania." },
      { status: 500 }
    );
  }
}
