"use client";

import { motion } from "motion/react";

import { SourceBadge } from "@/components/source-badge";
import { DOUX, DUREE, ENTREE } from "@/lib/animation";
import { Sphere } from "@/components/sphere";
import { sourceCalcul } from "@/lib/concordance";
import type { Candidate } from "@/lib/candidates";
import type { Depute } from "@/lib/types";

import { nomComplet } from "./calcul";

/** L'élu choisi, un disque gris neutre pour portrait, face à la sphère de votre IA. */
export function FaceAFace({
  depute,
  candidate,
  groupeDuJour = null,
}: {
  depute: Depute;
  candidate: Candidate;
  /** Sigle du groupe lu dans les scrutins, quand la fiche du député ne le donne pas. */
  groupeDuJour?: string | null;
}) {
  const groupe = depute.groupe ?? groupeDuJour;
  return (
    <div className="relative grid gap-10 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-8">
      <motion.article
        className="flex gap-5"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={ENTREE.transition}
      >
        <div aria-hidden className="size-24 shrink-0 rounded-full border border-trait bg-relief sm:size-28" />
        <div className="min-w-0">
          <h3 className="font-titre text-2xl font-semibold leading-8 tracking-[-0.03em] text-texte">
            {depute.civilite ? `${depute.civilite} ` : ""}
            {nomComplet(depute)}
          </h3>
          <p className="mt-1 text-sm leading-6 text-attenue">
            {groupe ? (depute.groupe ? groupe : `Groupe ${groupe} lors des scrutins comparés`) : "Groupe non renseigné"}
          </p>
          {depute.hatvpUrl ? (
            <p className="mt-3">
              <a
                href={depute.hatvpUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center text-[15px] underline decoration-trait underline-offset-4 outline-none transition-colors duration-150 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte"
              >
                Déclarations déposées à la HATVP
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
            </p>
          ) : null}
          <SourceBadge source={depute.source} className="mt-4" />
        </div>
      </motion.article>

      {/* « face à » : le pivot de la comparaison, qui apparaît une fois les deux camps en place. */}
      <motion.p
        aria-hidden
        className="hidden font-donnee text-[13px] tracking-[0.04em] text-attenue uppercase md:block"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: DUREE.etat, ease: DOUX, delay: DUREE.etat }}
      >
        face à
      </motion.p>

      <motion.article
        className="flex gap-5"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...ENTREE.transition, delay: 0.1 }}
      >
        <Sphere teintes={candidate.teintes} className="size-24 shrink-0 sm:size-28" />
        <div className="min-w-0">
          <h3 className="font-titre text-2xl font-semibold leading-8 tracking-[-0.03em] text-texte">{candidate.prenom}</h3>
          <p className="mt-1 font-donnee text-sm leading-6 text-machine">Votre IA, sans groupe</p>
          <SourceBadge
            className="mt-4"
            source={sourceCalcul(`${candidate.prenom} est une candidate de fiction, la mieux placée pour vous selon le test.`)}
          />
        </div>
      </motion.article>
    </div>
  );
}
