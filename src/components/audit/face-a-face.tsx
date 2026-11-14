"use client";

import { motion } from "motion/react";

import { SourceBadge } from "@/components/source-badge";
import { Sphere } from "@/components/sphere";
import { sourceCalcul } from "@/lib/concordance";
import { PRENOM_DEPUTE_IA, type SphereMandat } from "@/lib/sphere-mandat";
import type { Depute } from "@/lib/types";

import { nomComplet } from "./calcul";

/** L'élu choisi, un disque gris neutre pour portrait, face à la sphère du Député IA. */
export function FaceAFace({ depute, sphere }: { depute: Depute; sphere: SphereMandat }) {
  const priorites = sphere.dominantes.map((d) => d.libelle.toLowerCase()).join(", ");

  return (
    <motion.div
      className="grid gap-10 border-t border-trait pt-8 md:grid-cols-2 md:gap-12"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <article className="flex gap-5">
        <div aria-hidden className="size-24 shrink-0 rounded-full border border-trait bg-relief sm:size-28" />
        <div className="min-w-0">
          <p className="text-sm text-attenue">Élu humain · discipline de groupe</p>
          <h3 className="mt-1 font-titre text-2xl leading-8 text-texte">
            {depute.civilite ? `${depute.civilite} ` : ""}
            {nomComplet(depute)}
          </h3>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[15px] leading-6">
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
                className="inline-flex min-h-11 items-center text-[15px] underline decoration-trait underline-offset-4 outline-none hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte"
              >
                Déclarations déposées à la HATVP
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
            </p>
          ) : null}
          <SourceBadge source={depute.source} className="mt-3" />
        </div>
      </article>

      <article className="flex gap-5">
        <Sphere teintes={sphere.teintes} poids={sphere.poids} className="size-24 shrink-0 sm:size-28" />
        <div className="min-w-0">
          <p className="font-donnee text-sm text-machine">Député IA · mandat citoyen</p>
          <h3 className="mt-1 font-titre text-2xl leading-8 text-texte">{PRENOM_DEPUTE_IA}</h3>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[15px] leading-6">
            <dt className="text-attenue">Groupe</dt>
            <dd>Aucun</dd>
            <dt className="text-attenue">Profession</dt>
            <dd>Applique votre mandat, texte par texte</dd>
          </dl>
          <SourceBadge
            className="mt-3"
            source={sourceCalcul(
              `Les couleurs de la sphère viennent de vos trois priorités les plus fortes : ${priorites}. ${PRENOM_DEPUTE_IA} est un personnage de fiction.`,
            )}
          />
        </div>
      </article>
    </motion.div>
  );
}
