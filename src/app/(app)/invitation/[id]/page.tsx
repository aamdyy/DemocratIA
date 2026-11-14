import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TAILLE_PARTAGE } from "@/app/_og/rendu";
import { InvitationEnAttente, VueInvitation } from "@/components/partage/vue-invitation";
import { candidateParId, CANDIDATES } from "@/lib/candidates";
import { cheminImageInvitation, enPourcent, lireAffinite } from "@/lib/partage";

export function generateStaticParams() {
  return CANDIDATES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params, searchParams }: PageProps<"/invitation/[id]">): Promise<Metadata> {
  const { id } = await params;
  const candidate = candidateParId(id);
  if (!candidate) return { title: "Invitation introuvable", robots: { index: false } };
  const affinite = lireAffinite((await searchParams).a);
  const titre = `Mon IA présidente : ${candidate.prenom}${affinite === null ? "" : ` (${enPourcent(affinite)})`}`;
  const description = `${candidate.prenom}, IA candidate fictive de 2050 : «\u00a0${candidate.doctrine}\u00a0» Et la vôtre ? Passez le test.`;
  const images = [
    {
      url: cheminImageInvitation(candidate.id, affinite),
      ...TAILLE_PARTAGE,
      alt: `Mon IA présidente : ${candidate.prenom}${affinite === null ? "" : `, ${enPourcent(affinite)} d'affinité`}. Et la vôtre ?`,
    },
  ];
  return {
    title: titre,
    description,
    // Une invitation est personnelle : elle n'a rien à faire dans les moteurs de recherche.
    robots: { index: false },
    openGraph: { type: "website", locale: "fr_FR", siteName: "DemocratIA", title: titre, description, images },
    twitter: { card: "summary_large_image", title: titre, description, images },
  };
}

/**
 * L'identifiant et l'affinité ne sont connus qu'avec l'adresse : leur lecture attend sous une Suspense.
 * Une candidate inconnue répond 404 dès le proxy (src/proxy.ts) ; notFound() reste ici en filet.
 */
async function Invitation({ params, searchParams }: PageProps<"/invitation/[id]">) {
  const { id } = await params;
  if (!candidateParId(id)) notFound();
  const affinite = lireAffinite((await searchParams).a);
  return <VueInvitation candidateId={id} affinite={affinite} />;
}

export default function PageInvitation({ params, searchParams }: PageProps<"/invitation/[id]">) {
  return (
    <Suspense fallback={<InvitationEnAttente />}>
      <Invitation params={params} searchParams={searchParams} />
    </Suspense>
  );
}
