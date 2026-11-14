import type { Metadata } from "next";
import Link from "next/link";

import { BOUTON, MessagePage } from "@/app/_etats/message-page";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

/** Adresse inconnue : cette page vit hors de l'application, donc sans l'en-tête. */
export default function NonTrouvee() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <MessagePage titre="Cette page n'existe pas." texte="L'adresse est peut-être mal écrite, ou la page a changé de place.">
        <Link href="/" className={BOUTON}>
          Revenir à l&apos;accueil
        </Link>
      </MessagePage>
    </main>
  );
}
