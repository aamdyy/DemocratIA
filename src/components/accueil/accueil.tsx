"use client";

import Link from "next/link";
import { MotionConfig, motion, type Variants } from "motion/react";

import { useMaSphere } from "@/components/accueil/ma-sphere";
import { Logo } from "@/components/logo";
import { FiltreSphere, Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { REGLE_POSITION } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";

const ARGUMENTS = [
  "Elle vote exactement son programme.",
  "Chacun de ses votes s'audite.",
  "Aucun lobby, aucune carrière à protéger.",
  "Elle lit chaque texte en entier.",
] as const;

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-texte";

/** L'unique entrée de la page : le logo, la phrase et le bouton arrivent l'un après l'autre. */
const ENTREE: Variants = {
  cache: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const ELEMENT: Variants = {
  cache: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
};
const SPHERE_ENTREE: Variants = {
  cache: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: [0.2, 0.8, 0.2, 1] } },
};

export function Accueil() {
  const { regle, candidate, teintes } = useMaSphere();

  return (
    <MotionConfig reducedMotion="user">
      <FiltreSphere />

      <motion.section
        aria-labelledby="titre-accueil"
        className="relative flex min-h-[calc(100dvh-10rem)] flex-col items-center justify-center text-center"
        variants={ENTREE}
        initial="cache"
        animate="visible"
      >
        {/* La sphère reste en fond, très douce : le logo garde la vedette. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 w-[min(72vw,32rem)] -translate-x-1/2 -translate-y-1/2"
          variants={SPHERE_ENTREE}
        >
          <div className="opacity-25">
            <Sphere teintes={teintes} aquarelle />
          </div>
        </motion.div>

        <motion.h1 id="titre-accueil" variants={ELEMENT} className="relative">
          <Logo titre className="text-[clamp(3.5rem,11vw,9rem)]" point={teintes[1]} />
        </motion.h1>
        <motion.p variants={ELEMENT} className="relative mt-6 text-balance text-lg text-attenue sm:text-xl">
          En 2050, la France élit une IA.
          {candidate ? <span className="sr-only"> Votre IA : {candidate.prenom}.</span> : null}
        </motion.p>
        <motion.div variants={ELEMENT} className="relative mt-10">
          <Link
            href={regle ? "/resultat" : "/test"}
            className={`inline-flex h-14 items-center justify-center rounded-full bg-texte px-8 text-base font-medium text-fond transition-opacity duration-150 hover:opacity-80 ${FOCUS}`}
          >
            {regle ? "Revoir mon résultat" : "Trouver mon IA"}
          </Link>
        </motion.div>
      </motion.section>

      <section aria-labelledby="titre-pourquoi" className="mx-auto mt-16 max-w-4xl pb-8 sm:mt-24">
        <h2 id="titre-pourquoi" className="text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.03em] sm:text-4xl">
          Pourquoi une IA plutôt qu&apos;un humain
        </h2>
        <ul role="list" className="mt-10 grid gap-x-12 gap-y-6 sm:grid-cols-2">
          {ARGUMENTS.map((titre) => (
            <li key={titre} className="border-t border-trait pt-4 text-lg font-semibold leading-6 tracking-[-0.02em]">
              {titre}
            </li>
          ))}
        </ul>
        <SourceBadge source={sourceCalcul(REGLE_POSITION)} className="mt-8 max-w-[56ch]" />
      </section>
    </MotionConfig>
  );
}
