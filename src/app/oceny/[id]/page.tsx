import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/oceny"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#4C1D95]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Powrót do listy Ocen Wieloagentowych (3 Tabele)</span>
      </Link>

      <EvaluationDetail evaluation={evaluation} />
    </div>
  );
}
