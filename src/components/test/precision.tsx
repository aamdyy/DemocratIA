"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect } from "react";

import { DOUX, DUREE, RESSORT } from "@/lib/animation";
import { EXPLICATION_PRECISION } from "@/lib/precision";

/**
 * La précision du résultat, sobre : une phrase et une fine barre qui se remplit.
 * C'est un indicateur de complétude, pas une marge d'erreur : l'infobulle et l'aria-label le disent.
 */
export function Precision({ valeur }: { valeur: number }) {
  const texte = `${valeur} %`;
  const reduit = useReducedMotion();
  const courant = useMotionValue(valeur);
  const arrondi = useTransform(courant, (v) => Math.round(v));
  useEffect(() => {
    const lecture = animate(courant, valeur, { duration: reduit ? 0 : DUREE.entree, ease: DOUX });
    return () => lecture.stop();
  }, [courant, valeur, reduit]);

  return (
    <div title="Plus vous répondez, plus le classement est fiable" className="mt-6">
      <p className="flex items-baseline justify-between gap-4 text-sm text-attenue">
        <span>
          Précision du résultat :{" "}
          <span className="font-medium tabular-nums text-texte">
            <motion.span aria-hidden>{arrondi}</motion.span>
            <span aria-hidden> %</span>
            <span className="sr-only">{texte}</span>
          </span>
        </span>
        <span className="hidden text-xs sm:inline">plus vous répondez, plus elle monte</span>
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={valeur}
        aria-valuetext={texte}
        aria-label={`Précision du résultat. ${EXPLICATION_PRECISION}`}
        className="mt-2 h-1 overflow-hidden rounded-full bg-relief"
      >
        <motion.span
          className="block h-full origin-left rounded-full bg-republique"
          initial={false}
          animate={{ scaleX: valeur / 100 }}
          transition={RESSORT}
        />
      </div>
    </div>
  );
}
