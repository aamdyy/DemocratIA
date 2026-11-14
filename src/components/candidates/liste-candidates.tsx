"use client";

import Link from "next/link";
import { MotionConfig, motion } from "motion/react";

import { AvisExemple } from "@/components/avis-exemple";
import { FiltreSphere, Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { useScrutins } from "@/lib/api";
import { CANDIDATES, DEFINITION_AFFINITE } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";
import { useClassement } from "@/lib/ma-candidate";

import { affinitePourcent } from "./prenom";

const PILULE_NOIRE =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-texte px-7 text-[15px] font-medium text-fond outline-none hover:bg-texte/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";

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

      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-titre text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-texte">
          Les cinq IA candidates
        </h1>
        <p className="mt-5 text-lg leading-8 text-attenue">
          Chacune a un prénom, une doctrine et un programme public. Leurs votes se vérifient, texte après texte.
        </p>
      </header>

      <ul role="list" className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 lg:grid-cols-5">
        {lignes.map(({ candidate, score, premiere }, i) => (
          <li key={candidate.id}>
            <Link
              href={`/candidates/${candidate.id}`}
              className="group flex min-h-11 flex-col items-center text-center outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-texte"
            >
              <motion.div
                className="w-full max-w-40"
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 5 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
              >
                <Sphere teintes={candidate.teintes} duree={13 + i * 2} />
              </motion.div>
              <span className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-texte underline decoration-transparent decoration-1 underline-offset-8 group-hover:decoration-trait">
                {candidate.prenom}
              </span>
              <span className="mt-1.5 text-[15px] leading-6 text-attenue">{candidate.doctrine}</span>
              {score !== null ? (
                <span className="mt-3 text-[15px] leading-6 tabular-nums text-texte">
                  {premiere ? <strong className="font-semibold">Votre IA · </strong> : null}
                  {affinitePourcent(score)} d&apos;affinité
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      <div aria-live="polite" className="mx-auto mt-16 flex max-w-xl flex-col items-center gap-5 text-center">
        {regle ? (
          <SourceBadge source={sourceCalcul(DEFINITION_AFFINITE)} className="justify-center" />
        ) : (
          <>
            <p className="text-lg leading-8 text-attenue">Passez le test pour savoir laquelle vous ressemble.</p>
            <Link href="/test" className={PILULE_NOIRE}>
              Faire le test
            </Link>
          </>
        )}
      </div>
    </MotionConfig>
  );
}
