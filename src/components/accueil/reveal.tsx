"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

/** Titre de section : un seul style pour toute la page. */
export const TITRE_SECTION =
  "text-balance text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.04em]";

/** Cible de 44 px et contour de focus visible, pour les liens et boutons de la page. */
export const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-texte";

export const BOUTON_PILULE = `inline-flex h-14 items-center justify-center rounded-full bg-texte px-8 text-base font-medium text-fond transition-transform duration-150 hover:scale-[1.03] ${FOCUS}`;

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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, delay: delai, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
