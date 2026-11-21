import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { serializeEvaluation } from "@/lib/serializers";
import { EvaluationDetail } from "@/components/EvaluationDetail";

export const dynamic = "force-dynamic";

export default async function EvaluationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const row = await prisma.projectEvaluation.findUnique({
    where: { id },
  });

  if (!row) {
    notFound();
  }

  const evaluation = serializeEvaluation(row);

  return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[19px] font-semibold tracking-tight text-[#374151]">
              Raport Debaty 4 AI
            </h1>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
              <Link href="/" className="hover:text-[#7c3aed]">
                <Home className="h-3.5 w-3.5" />
              </Link>
              <span>/</span>
              <Link href="/oceny" className="hover:text-[#7c3aed]">
                Oceny Wieloagentowe
              </Link>
              <span>/</span>
              <span className="truncate font-medium text-gray-600">
                {evaluation.projectTitle}
              </span>
            </div>
          </div>

          <Link
            href="/oceny"
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#7c3aed] hover:text-[#7c3aed]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Powrót do 3 Tabel</span>
          </Link>
        </div>

        <EvaluationDetail evaluation={evaluation} />
      </div>
      );
}
