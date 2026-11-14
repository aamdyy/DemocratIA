import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FicheCandidate } from "@/components/candidates/fiche-candidate";
import { candidateParId, CANDIDATES } from "@/lib/candidates";

export function generateStaticParams() {
  return CANDIDATES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/candidates/[id]">): Promise<Metadata> {
  const { id } = await params;
  const candidate = candidateParId(id);
  return candidate ? { title: candidate.prenom, description: `${candidate.prenom} : ${candidate.doctrine}` } : { title: "Candidate introuvable" };
}

export default async function PageCandidate({ params }: PageProps<"/candidates/[id]">) {
  const { id } = await params;
  const candidate = candidateParId(id);
  if (!candidate) notFound();
  return <FicheCandidate candidate={candidate} />;
}
