"use client";

import { motion } from "motion/react";

import { CASCADE, ENTREE, VUE } from "@/lib/animation";
import type { Affinite } from "@/lib/candidates";
import { affiniteEntiere, cheminImageInvitation, cheminInvitation, texteMonIA } from "@/lib/partage";

import { ApercuPartage, PanneauPartage } from "./panneau-partage";

/**
 * « Partager mon IA », sur /resultat : le lien d'invitation ne porte que la candidate et le pourcentage.
 * Celui qui l'ouvre voit l'IA de son ami, puis peut passer le test et comparer.
 */
export function BlocPartage({ affinite }: { affinite: Affinite }) {
  const { candidate } = affinite;
  const pourcent = affiniteEntiere(affinite.score);

  return (
    <motion.section
      aria-labelledby="titre-partage"
      className="mt-24 rounded-3xl border border-trait p-6 sm:p-8"
      initial={ENTREE.initial}
      whileInView={ENTREE.animate}
      viewport={VUE}
      transition={ENTREE.transition}
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="min-w-0 flex-1">
          <h2 id="titre-partage" className="font-titre text-3xl font-semibold leading-[1.1] tracking-[-0.03em] sm:text-4xl">
            Partager mon IA
          </h2>
          <p className="mt-2 max-w-md text-pretty text-base leading-7 text-attenue">
            Vos amis voient {candidate.prenom}, puis passent le test pour comparer. Le lien ne contient que son nom et votre
            pourcentage.
          </p>
          <div className="mt-6">
            <PanneauPartage
              key={`${candidate.id}-${pourcent}`}
              chemin={cheminInvitation(candidate.id, pourcent)}
              texteInitial={texteMonIA(candidate, pourcent)}
              teintes={candidate.teintes}
              libelleNatif="Partager mon IA"
            />
          </div>
        </div>
        <motion.div
          className="lg:w-[22rem] lg:shrink-0"
          initial={{ opacity: 0, y: 10, rotate: -1.5 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={VUE}
          transition={{ ...ENTREE.transition, delay: CASCADE * 3 }}
        >
          <ApercuPartage src={cheminImageInvitation(candidate.id, pourcent)} />
        </motion.div>
      </div>
    </motion.section>
  );
}
