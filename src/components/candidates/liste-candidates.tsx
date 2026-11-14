"use client";

import Link from "next/link";
import { MotionConfig, motion } from "motion/react";

import { BoutonIA } from "@/components/bouton-ia";
import { AvisExemple } from "@/components/avis-exemple";
import { Barre } from "@/components/graphiques";
import { FiltreSphere, Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { useScrutins } from "@/lib/api";
import { CANDIDATES, DEFINITION_AFFINITE } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";
import { useClassement } from "@/lib/ma-candidate";

import { affinitePourcent } from "./prenom";

// Une seule entrée pour la page : le titre, puis les cinq sphères l'une après l'autre.
const ENTREE = {
  cache: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as const } },
};
const CASCADE = { cache: {}, visible: { transition: { staggerChildren: 0.07 } } };

/** /candidates : toutes les IA candidates à la présidence, côte à côte. */
export function ListeCandidates() {
  const { classement, regle } = useClassement();
  const scrutins = useScrutins();

  // Sans test, l'ordre est celui de la liste ; avec le test, la plus proche passe en premier.
  const lignes = regle
    ? classement.map((a, rang) => ({ candidate: a.candidate, score: a.score, premiere: rang === 0 }))
    : CANDIDATES.map((candidate) => ({ candidate, score: null as number | null, premiere: false }));

  return (
    <MotionConfig reducedMotion="user">
      <FiltreSphere />
      <AvisExemple meta={scrutins.data?.meta} />

      <motion.div initial="cache" animate="visible" variants={CASCADE}>
        <motion.header variants={ENTREE} className="mx-auto max-w-2xl text-center">
          <h1 className="font-titre text-[clamp(2.25rem,4.5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-texte">
            Les cinq IA candidates
          </h1>
        </motion.header>

        <ul role="list" className="mx-auto mt-16 flex max-w-6xl flex-col gap-10 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-16">
          {lignes.map(({ candidate, score, premiere }, i) => (
            <motion.li key={candidate.id} variants={ENTREE} className="sm:w-48 lg:w-[calc(20%-1.6rem)]">
              <Link
                href={`/candidates/${candidate.id}`}
                className="group flex min-h-11 items-center gap-6 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-texte sm:flex-col sm:gap-0 sm:text-center"
              >
                <span className="block w-24 shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:w-full">
                  <Sphere teintes={candidate.teintes} duree={13 + i * 2} />
                </span>
                <span className="flex flex-col sm:mt-8">
                  <span className="text-3xl font-semibold tracking-[-0.03em] text-texte underline decoration-transparent decoration-1 underline-offset-8 transition-colors duration-150 group-hover:decoration-trait">
                    {candidate.prenom}
                  </span>
                  <span className="mt-1.5 text-[15px] leading-6 text-attenue">{candidate.doctrine}</span>
                  {score !== null ? (
                    <span className="mt-3 block text-[15px] leading-6 tabular-nums text-texte">
                      {premiere ? <strong className="block font-semibold">Votre IA</strong> : null}
                      {affinitePourcent(score)}
                      <Barre
                        className="mt-1.5"
                        valeur={score * 100}
                        couleur={candidate.teintes[1]}
                        etiquette={`${candidate.prenom} : ${affinitePourcent(score)} d'affinité`}
                        delai={0.3 + i * 0.08}
                      />
                    </span>
                  ) : null}
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>

        <motion.div variants={ENTREE} aria-live="polite" className="mx-auto mt-20 flex max-w-xl flex-col items-center gap-6 text-center">
          {regle ? (
            <SourceBadge source={sourceCalcul(DEFINITION_AFFINITE)} className="justify-center" />
          ) : (
            <BoutonIA href="/test">Trouver mon IA</BoutonIA>
          )}
        </motion.div>
      </motion.div>
    </MotionConfig>
  );
}
