import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FicheCandidate, FicheEnAttente } from "@/components/candidates/fiche-candidate";
import { candidateParId, CANDIDATES } from "@/lib/candidates";

export function generateStaticParams() {
  return CANDIDATES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/candidates/[id]">): Promise<Metadata> {
  const { id } = await params;
  const candidate = candidateParId(id);
  if (!candidate) return { title: "Candidate introuvable", robots: { index: false } };
  const titre = `${candidate.prenom}, IA candidate`;
  const description = `${candidate.prenom}, IA candidate fictive à la présidence de 2050. ${candidate.doctrine} Son programme et ses votes sur de vrais textes de loi.`;
  return { title: titre, description, openGraph: { title: titre, description } };
}

/** L'identifiant n'est connu qu'avec l'adresse : la lecture des paramètres attend sous une Suspense, la fiche grisée tient sa place. */
async function Fiche({ params }: { params: PageProps<"/candidates/[id]">["params"] }) {
  const { id } = await params;
  const candidate = candidateParId(id);
  if (!candidate) notFound();
  return <FicheCandidate candidate={candidate} />;
}

export default function PageCandidate({ params }: PageProps<"/candidates/[id]">) {
  return (
    <Suspense fallback={<FicheEnAttente />}>
      <Fiche params={params} />
    </Suspense>
  );
}
