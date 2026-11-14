import type { Metadata } from "next";
import Link from "next/link";

import { BoutonIA } from "@/components/bouton-ia";
import { LIEN, MessagePage } from "@/app/_etats/message-page";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

export default function NonTrouvee() {
  return (
    <MessagePage titre="Cette page n'existe pas." texte="L'adresse est peut-être mal écrite, ou la page a changé de place.">
      <BoutonIA href="/">Revenir à l&apos;accueil</BoutonIA>
      <Link href="/candidates" className={LIEN}>
        Voir les candidates
      </Link>
    </MessagePage>
  );
}
