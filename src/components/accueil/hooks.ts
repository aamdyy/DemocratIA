"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const REQUETE = "(prefers-reduced-motion: reduce)";

const abonner = (rappel: () => void) => {
  const media = window.matchMedia(REQUETE);
  media.addEventListener("change", rappel);
  return () => media.removeEventListener("change", rappel);
};

/** Vrai si l'utilisateur a demandé moins d'animations. Faux côté serveur : le premier rendu reste identique. */
export const useMouvementReduit = (): boolean =>
  useSyncExternalStore(
    abonner,
    () => window.matchMedia(REQUETE).matches,
    () => false,
  );

/**
 * Fait défiler des étapes minutées, en boucle, tant que `actif` est vrai (la section est à l'écran).
 * Si l'utilisateur a demandé moins d'animations, on reste sur `repos` (la dernière étape par défaut).
 * `durees` doit être une constante de module.
 */
export function useEtapeVue(durees: readonly number[], actif: boolean, repos = durees.length - 1): number {
  const reduit = useMouvementReduit();
  const [etape, setEtape] = useState(0);
  useEffect(() => {
    if (reduit || !actif) return;
    const minuterie = setTimeout(() => setEtape((e) => (e + 1) % durees.length), durees[etape]);
    return () => clearTimeout(minuterie);
  }, [etape, durees, actif, reduit]);
  return reduit ? repos : etape;
}
