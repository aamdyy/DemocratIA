import type { Metadata } from "next";
import Link from "next/link";

import { BOUTON, LIEN, MessagePage } from "@/app/_etats/message-page";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

export default function NonTrouvee() {
  return (
    <MessagePage titre="Cette page n'existe pas." texte="L'adresse est peut-être mal écrite, ou la page a changé de place.">
      <Link href="/" className={BOUTON}>
        Revenir à l&apos;accueil
      </Link>
      <Link href="/candidates" className={LIEN}>
        Voir les candidates
      </Link>
    </MessagePage>
  );
}
