"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

import { DOUX, DUREE } from "@/lib/animation";

const FORMAT = new Intl.NumberFormat("fr-FR");

/**
 * Un nombre qui défile jusqu'à sa nouvelle valeur au lieu de sauter. Le texte final reste lisible
 * par les lecteurs d'écran (le défilement lui-même est masqué) ; sans animation si l'utilisateur l'a demandé.
 */
export function Chiffre({
  valeur,
  duree = DUREE.entree,
  delai = 0,
  suffixe = "",
  className,
}: {
  valeur: number;
  duree?: number;
  delai?: number;
  suffixe?: string;
  className?: string;
}) {
  const reduit = useReducedMotion();
  const courant = useMotionValue(valeur);
  const texte = useTransform(courant, (v) => `${FORMAT.format(Math.round(v))}${suffixe}`);

  useEffect(() => {
    if (reduit) {
      courant.set(valeur);
      return;
    }
    const controle = animate(courant, valeur, { duration: duree, delay: delai, ease: DOUX });
    return () => controle.stop();
  }, [valeur, duree, delai, reduit, courant]);

  return (
    <span className={className}>
      <motion.span aria-hidden className="tabular-nums">
        {texte}
      </motion.span>
      <span className="sr-only">
        {FORMAT.format(valeur)}
        {suffixe}
      </span>
    </span>
  );
}
