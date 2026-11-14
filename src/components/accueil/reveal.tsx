"use client";

import { motion, stagger, type Variants } from "motion/react";

import { CASCADE, DOUX, DUREE, ENTREE, VUE } from "@/lib/animation";
import { cn } from "@/lib/utils";

/** Titre de section : un seul style pour toute la page. */
export const TITRE_SECTION =
  "text-balance text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.04em]";

/** Cible de 44 px et contour de focus visible, pour les liens et boutons de la page. */
export const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-texte";

/** Le bloc se lève et apparaît quand il entre à l'écran, une seule fois. */
export function Reveal({
  children,
  className,
  delai = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delai?: number;
}) {
  return (
    <motion.div
      className={cn(className)}
      initial={ENTREE.initial}
      whileInView={ENTREE.animate}
      viewport={VUE}
      transition={{ ...ENTREE.transition, delay: delai }}
    >
      {children}
    </motion.div>
  );
}

/** Les deux états d'un élément de série : caché sous sa place, puis posé. */
const ETATS: Variants = {
  cache: ENTREE.initial,
  visible: { ...ENTREE.animate, transition: { duration: DUREE.entree, ease: DOUX } },
};

/**
 * Une série qui entre à l'écran : ses `<Element>` apparaissent l'un après l'autre, au rythme de CASCADE.
 * Pour orchestrer un bloc (numéro, titre, phrase) plutôt que de le faire apparaître d'un seul tenant.
 */
export function Serie({
  children,
  className,
  delai = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delai?: number;
  as?: "div" | "ul" | "ol";
}) {
  const Balise = as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div;
  return (
    <Balise
      className={className}
      initial="cache"
      whileInView="visible"
      viewport={VUE}
      variants={{ cache: {}, visible: { transition: { delayChildren: stagger(CASCADE, { startDelay: delai }) } } }}
    >
      {children}
    </Balise>
  );
}

/** Un élément d'une `<Serie>`. */
export function Element({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "p";
}) {
  const Balise = as === "li" ? motion.li : as === "p" ? motion.p : motion.div;
  return (
    <Balise className={className} variants={ETATS}>
      {children}
    </Balise>
  );
}
