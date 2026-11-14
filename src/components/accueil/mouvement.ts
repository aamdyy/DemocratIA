"use client";

import { useSyncExternalStore } from "react";

const MOINS_D_ANIMATIONS = "(prefers-reduced-motion: reduce)";

function abonner(prevenir: () => void) {
  const reglage = window.matchMedia(MOINS_D_ANIMATIONS);
  reglage.addEventListener("change", prevenir);
  return () => reglage.removeEventListener("change", prevenir);
}

/**
 * Vrai quand l'utilisateur a demandé moins d'animations.
 * Toujours faux pendant le rendu serveur : le réglage n'est connu que du navigateur, et la page
 * s'y accorde juste après, sans écart entre les deux rendus.
 */
export const useMouvementReduit = () =>
  useSyncExternalStore(
    abonner,
    () => window.matchMedia(MOINS_D_ANIMATIONS).matches,
    () => false,
  );
