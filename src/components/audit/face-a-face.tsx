"use client";

import { motion } from "motion/react";

import { SourceBadge } from "@/components/source-badge";
import { Sphere } from "@/components/sphere";
import { sourceCalcul } from "@/lib/concordance";
import type { Candidate } from "@/lib/candidates";
import type { Depute } from "@/lib/types";

import { nomComplet } from "./calcul";

/** L'élu choisi, un disque gris neutre pour portrait, face à la sphère de votre IA. */
export function FaceAFace({ depute, candidate }: { depute: Depute; candidate: Candidate }) {

  return (
    <motion.div
      className="grid gap-10 md:grid-cols-2 md:gap-12"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <article className="flex gap-5">
        <div aria-hidden className="size-24 shrink-0 rounded-full border border-trait bg-relief sm:size-28" />
        <div className="min-w-0">
          <h3 className="font-titre text-2xl font-semibold leading-8 tracking-[-0.03em] text-texte">
            {depute.civilite ? `${depute.civilite} ` : ""}
            {nomComplet(depute)}
          </h3>
          <p className="mt-1 text-sm leading-6 text-attenue">Élu humain, discipline de groupe</p>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[15px] leading-6">
            <dt className="text-attenue">Groupe</dt>
            <dd>{depute.groupe ?? "Non renseigné"}</dd>
            <dt className="text-attenue">Profession</dt>
            <dd>{depute.profession ?? "Non renseignée"}</dd>
          </dl>
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
      </article>

      <article className="flex gap-5">
        <Sphere teintes={candidate.teintes} className="size-24 shrink-0 sm:size-28" />
        <div className="min-w-0">
          <h3 className="font-titre text-2xl font-semibold leading-8 tracking-[-0.03em] text-texte">{candidate.prenom}</h3>
          <p className="mt-1 font-donnee text-sm leading-6 text-machine">Votre IA, candidate à la présidence</p>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[15px] leading-6">
            <dt className="text-attenue">Groupe</dt>
            <dd>Aucun</dd>
            <dt className="text-attenue">Profession</dt>
            <dd>Applique son programme, texte par texte</dd>
          </dl>
          <SourceBadge
            className="mt-3"
            source={sourceCalcul(
              `${candidate.prenom} est une candidate de fiction : sa sphère est la sienne, et son programme est public. Elle est la mieux placée pour vous selon le test.`,
            )}
          />
        </div>
      </article>
    </motion.div>
  );
}
