"use client";

import { motion } from "motion/react";

import { BoutonIA } from "@/components/bouton-ia";
import { Sphere } from "@/components/sphere";
import type { Affinite } from "@/lib/candidates";
import { SEUIL_PRECISION } from "@/lib/precision";
import { CHAPITRES, type ChapitreId } from "@/lib/questions/chapitres";
import type { Resume } from "@/lib/questions/poids";

import { BOUTON_DISCRET, RESSORT, type Avancement } from "./chapitre";

/** La fin du test : la sphère de l'IA en tête grandit, la précision, et le chemin vers le résultat. */
export function FinDuTest({
  precision,
  classement,
  resume,
  aCommence,
  avancements,
  onAller,
}: {
  precision: number;
  classement: Affinite[];
  resume: Resume;
  aCommence: boolean;
  avancements: Record<ChapitreId, Avancement>;
  onAller: (indice: number) => void;
}) {
  const tete = classement[0];
  const incomplets = CHAPITRES.map((c, i) => ({ c, i })).filter(
    ({ c }) => !c.bonus && avancements[c.id].total > 0 && avancements[c.id].fait < avancements[c.id].total,
  );

  return (
    <section aria-labelledby="titre-fin" className="flex flex-col items-center py-8 text-center">
      <motion.div
        className="size-36 sm:size-44"
        initial={{ opacity: 0, scale: 0.3, rotate: -90 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0, duration: 1.2 }}
      >
        {tete && aCommence ? <Sphere teintes={tete.candidate.teintes} duree={9} className="size-full" /> : null}
      </motion.div>
      <motion.h2
        id="titre-fin"
        tabIndex={-1}
        className="mt-8 font-titre text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-[-0.035em] outline-none"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...RESSORT, delay: 0.3 }}
      >
        {aCommence ? "Votre IA est prête." : "Votre mandat est vide."}
      </motion.h2>
      <motion.p
        className="mt-3 max-w-md text-balance text-lg text-attenue"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...RESSORT, delay: 0.42 }}
      >
        {aCommence
          ? `Précision du résultat : ${precision} %.${resume.pronostics.total ? ` Pronostics : ${resume.pronostics.justes} sur ${resume.pronostics.total}.` : ""}`
          : "Répondez à quelques questions pour trouver votre IA."}
      </motion.p>
      <motion.div
        className="mt-9 flex flex-col items-center gap-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...RESSORT, delay: 0.55 }}
      >
        {aCommence ? (
          <BoutonIA href="/resultat" teintes={tete?.candidate.teintes}>
            Découvrir mon IA
          </BoutonIA>
        ) : (
          <BoutonIA onClick={() => onAller(0)}>Recommencer au début</BoutonIA>
        )}
        {aCommence && precision < SEUIL_PRECISION ? (
          <p className="mt-2 text-sm text-attenue">Quelques réponses de plus rendraient le classement plus fiable.</p>
        ) : null}
        {incomplets.length > 0 ? (
          <ul className="mt-3 flex flex-wrap justify-center gap-x-1" aria-label="Chapitres à compléter">
            {incomplets.map(({ c, i }) => (
              <li key={c.id}>
                <button type="button" onClick={() => onAller(i)} className={BOUTON_DISCRET}>
                  Compléter « {c.titre} »
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </motion.div>
    </section>
  );
}
