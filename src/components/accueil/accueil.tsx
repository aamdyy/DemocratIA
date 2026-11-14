"use client";

import Link from "next/link";
import { MotionConfig, motion, type Variants } from "motion/react";

import { useMaSphere } from "@/components/accueil/ma-sphere";
import { FiltreSphere, Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { REGLE_POSITION } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";

const ARGUMENTS = [
  {
    titre: "Elle vote exactement son programme.",
    texte: "Sa position sur un texte découle d'une règle écrite à l'avance, la même pour tous les textes. Pas de surprise au moment du vote.",
  },
  {
    titre: "Chacun de ses votes s'audite.",
    texte: "Vous pouvez refaire le calcul vous-même. Les raisons d'un humain restent souvent dans sa tête, celles d'une IA tiennent en une phrase.",
  },
  {
    titre: "Aucun lobby, aucune carrière à protéger.",
    texte: "Pas de déjeuner d'affaires, pas de réélection à préparer, pas de dîner où l'on ne dit pas non.",
  },
  {
    titre: "Elle lit chaque texte en entier.",
    texte: "Même l'amendement de minuit, même le vendredi soir, sans jamais se demander à quelle heure c'est fini.",
  },
] as const;

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-texte";

/** L'unique entrée de la page : la sphère, le titre, le texte et les boutons arrivent l'un après l'autre. */
const ENTREE: Variants = {
  cache: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const ELEMENT: Variants = {
  cache: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } },
};
const SPHERE_ENTREE: Variants = {
  cache: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.2, 0.8, 0.2, 1] } },
};

export function Accueil() {
  const { regle, candidate, teintes } = useMaSphere();

  return (
    <MotionConfig reducedMotion="user">
      <FiltreSphere />

      <motion.section
        aria-labelledby="titre-accueil"
        className="flex flex-col items-center pt-2 text-center sm:pt-6"
        variants={ENTREE}
        initial="cache"
        animate="visible"
      >
        <motion.div className="w-[min(52vw,30vh,280px)]" variants={SPHERE_ENTREE}>
          <Sphere
            teintes={teintes}
            aquarelle
            description={
              candidate
                ? `La sphère de ${candidate.prenom}, l'IA qui vous correspond le mieux`
                : "Une sphère aux couleurs mêlées des IA candidates"
            }
          />
        </motion.div>

        <motion.h1
          id="titre-accueil"
          variants={ELEMENT}
          className="mt-10 max-w-[16ch] text-balance text-[clamp(2.25rem,5.6vw,4rem)] font-semibold leading-[1.04] tracking-[-0.03em]"
        >
          En 2050, la France élit une IA.
        </motion.h1>
        <motion.p
          variants={ELEMENT}
          className="mt-5 max-w-[46ch] text-pretty text-base leading-7 text-attenue sm:text-lg sm:leading-8"
        >
          DemocratIA est une fiction. Des IA se présentent à la présidence. Vous tranchez de vrais textes de loi de
          l&apos;Assemblée, et vous découvrez celle qui vous ressemble.
        </motion.p>

        <motion.div variants={ELEMENT} className="mt-8 flex flex-col items-center gap-1">
          <Link
            href={regle ? "/resultat" : "/test"}
            className={`inline-flex h-14 items-center justify-center rounded-full bg-texte px-8 text-base font-medium text-fond transition-opacity duration-150 hover:opacity-80 ${FOCUS}`}
          >
            {regle ? "Revoir mon résultat" : "Trouver mon IA"}
          </Link>
          <Link
            href="/candidates"
            className={`inline-flex min-h-11 items-center px-3 text-[15px] text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current ${FOCUS}`}
          >
            Voir les candidates
          </Link>
        </motion.div>
      </motion.section>

      <section
        aria-labelledby="titre-pourquoi"
        className="mx-auto mt-24 grid max-w-5xl gap-x-16 gap-y-10 sm:mt-32 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
      >
        <div>
          <h2 id="titre-pourquoi" className="max-w-[14ch] text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.03em] sm:text-4xl">
            Pourquoi une IA plutôt qu&apos;un humain
          </h2>
          <p className="mt-5 max-w-[40ch] text-[15px] leading-6 text-attenue">
            Une IA n&apos;est pas neutre pour autant : ses priorités sont écrites par des humains. C&apos;est pour cela
            qu&apos;elles sont publiques, et que la règle de vote l&apos;est aussi.
          </p>
          <SourceBadge source={sourceCalcul(REGLE_POSITION)} className="mt-4 max-w-[48ch]" />
        </div>
        <ul role="list" className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {ARGUMENTS.map((a) => (
            <li key={a.titre}>
              <h3 className="text-lg font-semibold leading-6 tracking-[-0.02em]">{a.titre}</h3>
              <p className="mt-2 text-[15px] leading-6 text-attenue">{a.texte}</p>
            </li>
          ))}
        </ul>
      </section>
    </MotionConfig>
  );
}
