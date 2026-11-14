"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Graphiques de DemocratIA : barres et jauges qui se remplissent une seule fois, à l'apparition.
 * Les barres animent un `scaleX` (une transformation) : MotionConfig reducedMotion="user" les coupe
 * pour qui demande moins de mouvement. Chaque graphique porte son texte dans `aria-label` ; la valeur
 * chiffrée reste affichée à côté, la couleur ne dit jamais seule.
 */

const DOUX = [0.2, 0.8, 0.2, 1] as const;
const VUE = { once: true, margin: "0px 0px -8% 0px" } as const;

/**
 * Vrai quand le conteneur entre à l'écran. On observe le conteneur et non la barre : une barre à
 * `scaleX: 0` n'a aucune surface, l'observateur ne la voit jamais entrer et elle restait vide.
 */
function useVu() {
  const ref = useRef<HTMLSpanElement>(null);
  const vu = useInView(ref, VUE);
  return [ref, vu] as const;
}

/** Une barre horizontale de 0 à `max`, qui se remplit depuis la gauche. */
export function Barre({
  valeur,
  max = 100,
  couleur = "var(--texte)",
  etiquette,
  delai = 0,
  duree = 0.9,
  className,
}: {
  valeur: number;
  max?: number;
  couleur?: string;
  /** Phrase lue par les lecteurs d'écran, par exemple « Gaïa : 93 % d'affinité ». */
  etiquette: string;
  delai?: number;
  duree?: number;
  className?: string;
}) {
  const part = Math.max(0, Math.min(1, max > 0 ? valeur / max : 0));
  const [ref, vu] = useVu();
  return (
    <span ref={ref} role="img" aria-label={etiquette} className={cn("block h-2 overflow-hidden rounded-full bg-relief", className)}>
      <motion.span
        aria-hidden
        className="block h-full origin-left rounded-full"
        style={{ width: `${part * 100}%`, background: couleur }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: vu ? 1 : 0 }}
        transition={{ duration: duree, delay: delai, ease: DOUX }}
      />
    </span>
  );
}

export interface Segment {
  /** Libellé lu par les lecteurs d'écran, par exemple « Pour ». */
  libelle: string;
  valeur: number;
  /** Classe Tailwind de fond, par exemple « bg-pour ». */
  fond: string;
}

/** Une barre empilée : chaque segment prend sa part du total et se remplit l'un après l'autre. */
export function BarreEmpilee({
  segments,
  etiquette,
  className,
}: {
  segments: Segment[];
  etiquette: string;
  className?: string;
}) {
  const total = segments.reduce((somme, s) => somme + s.valeur, 0);
  const [ref, vu] = useVu();
  return (
    <span ref={ref} role="img" aria-label={etiquette} className={cn("flex h-4 w-full gap-px overflow-hidden rounded-full bg-relief", className)}>
      {total > 0
        ? segments
            .filter((s) => s.valeur > 0)
            .map((s, i) => (
              <motion.span
                key={s.libelle}
                aria-hidden
                className={cn("block h-full origin-left", s.fond)}
                style={{ width: `${(s.valeur / total) * 100}%` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: vu ? 1 : 0 }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: DOUX }}
              />
            ))
        : null}
    </span>
  );
}

/** Jauge circulaire : un anneau qui se ferme sur la part `valeur / total`, le chiffre au centre. */
export function Jauge({
  valeur,
  total,
  couleur,
  etiquette,
  className,
}: {
  valeur: number;
  total: number;
  couleur: string;
  etiquette: string;
  className?: string;
}) {
  const reduit = useReducedMotion();
  const part = total > 0 ? valeur / total : 0;
  const [ref, vu] = useVu();
  return (
    <span ref={ref} role="img" aria-label={etiquette} className={cn("relative block size-36 shrink-0", className)}>
      <svg viewBox="0 0 100 100" aria-hidden className="size-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--relief)" strokeWidth="9" />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={couleur}
          strokeWidth="9"
          strokeLinecap="butt"
          initial={{ pathLength: reduit ? part : 0 }}
          animate={{ pathLength: vu || reduit ? part : 0 }}
          transition={{ duration: reduit ? 0 : 1.1, ease: DOUX }}
        />
      </svg>
      <span aria-hidden className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-3xl font-semibold tabular-nums tracking-[-0.03em]">{Math.round(part * 100)} %</span>
        <span className="mt-1.5 text-xs tabular-nums text-attenue">
          {valeur} sur {total}
        </span>
      </span>
    </span>
  );
}
