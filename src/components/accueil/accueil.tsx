"use client";

import Link from "next/link";
import { MotionConfig, motion } from "motion/react";

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

export function Accueil() {
  const { regle, candidate, teintes } = useMaSphere();

  return (
    <MotionConfig reducedMotion="user">
      <FiltreSphere />

      <section aria-labelledby="titre-accueil" className="flex flex-col items-center py-4 text-center sm:py-8">
        <motion.div
          className="w-[min(56vw,34vh,300px)]"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <motion.div
            animate={{ scale: [1, 1.035, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
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
        </motion.div>

        <h1
          id="titre-accueil"
          className="mt-8 max-w-[16ch] text-balance text-[clamp(2.2rem,6vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.03em]"
        >
          En 2050, la France élit une IA.
        </h1>
        <p className="mt-5 max-w-[46ch] text-pretty text-base leading-7 text-attenue sm:text-lg">
          DemocratIA est une fiction. Des IA se présentent à la présidence. Vous tranchez de vrais textes de loi de
          l&apos;Assemblée, et vous découvrez celle qui vous ressemble.
        </p>

        <p aria-live="polite" className="mt-6 min-h-6 text-sm text-texte">
          {candidate ? `Votre IA : ${candidate.prenom}.` : ""}
        </p>

        <div className="mt-2 flex flex-col items-center gap-2">
          <Link
            href={regle ? "/resultat" : "/test"}
            className={`inline-flex h-14 items-center justify-center rounded-full bg-texte px-8 text-base font-medium text-fond transition-opacity duration-150 hover:opacity-80 ${FOCUS}`}
          >
            {regle ? "Revoir mon résultat" : "Trouver mon IA"}
          </Link>
          <Link
            href="/candidates"
            className={`inline-flex min-h-11 items-center px-3 text-sm text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current ${FOCUS}`}
          >
            Voir les candidates
          </Link>
        </div>
      </section>

      <section aria-labelledby="titre-pourquoi" className="mx-auto mt-16 max-w-4xl border-t border-trait pt-10 sm:mt-24">
        <h2 id="titre-pourquoi" className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
          Pourquoi une IA plutôt qu&apos;un humain
        </h2>
        <ul role="list" className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {ARGUMENTS.map((a) => (
            <li key={a.titre}>
              <h3 className="text-base font-semibold tracking-[-0.01em]">{a.titre}</h3>
              <p className="mt-1.5 text-[15px] leading-6 text-attenue">{a.texte}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-[60ch] text-sm leading-6 text-attenue">
          Une IA n&apos;est pas neutre pour autant : ses priorités sont écrites par des humains. C&apos;est pour cela
          qu&apos;elles sont publiques, et que la règle de vote l&apos;est aussi.
        </p>
        <SourceBadge source={sourceCalcul(REGLE_POSITION)} className="mt-4" />
      </section>
    </MotionConfig>
  );
}
