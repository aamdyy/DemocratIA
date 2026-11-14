"use client";

import Link from "next/link";
import { useEffect } from "react";

import { BOUTON, LIEN, MessagePage } from "@/app/_etats/message-page";

export default function Erreur({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <MessagePage titre="Quelque chose s'est mal passé." texte="Rien n'est perdu : vos choix restent sur cet appareil. Réessayez, ou revenez à l'accueil.">
      <button type="button" onClick={reset} className={`${BOUTON} cursor-pointer`}>
        Réessayer
      </button>
      <Link href="/" className={LIEN}>
        Revenir à l&apos;accueil
      </Link>
    </MessagePage>
  );
}
