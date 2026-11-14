"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MotionConfig, animate, motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useState } from "react";

import { AvisExemple } from "@/components/avis-exemple";
import { FiltreSphere, Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { useScrutins } from "@/lib/api";
import { DEFINITION_AFFINITE } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";
import { pourcent } from "@/lib/format";
import { useClassement } from "@/lib/ma-candidate";
import { mandat, useMandat } from "@/lib/mandat";

import { AutresCandidates } from "./autres-candidates";
import { Pourquoi } from "./pourquoi";

const BOUTON_PRINCIPAL =
  "inline-flex h-14 items-center rounded-full bg-texte px-8 font-medium text-fond transition-opacity duration-150 hover:opacity-80";
const BOUTON_SECONDAIRE =
  "inline-flex h-14 items-center rounded-full border border-trait px-8 font-medium transition-colors duration-150 hover:border-texte";
const TITRE = "text-balance font-titre text-[clamp(1.875rem,4.2vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em]";

const DOUX = [0.2, 0.8, 0.2, 1] as const;

/**
 * La révélation, une seule séquence : la sphère apparaît, puis le prénom, puis le pourcentage qui monte,
 * puis la doctrine, le portrait et les boutons.
 */
const REVELATION: Variants = {
  cache: {},
  visible: { transition: { staggerChildren: 0.16, delayChildren: 0.1 } },
};
const ETAPE: Variants = {
  cache: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: DOUX } },
};
const SPHERE_ETAPE: Variants = {
  cache: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: DOUX } },
};

/** Le pourcentage monte de 0 à sa valeur. Sans mouvement (préférence système), il s'affiche d'emblée. */
function PourcentQuiMonte({ valeur }: { valeur: number }) {
  const sansMouvement = useReducedMotion();
  const [affiche, setAffiche] = useState(sansMouvement ? valeur : 0);

  useEffect(() => {
    if (sansMouvement) return;
    const lecture = animate(0, valeur, { duration: 1.4, delay: 0.7, ease: [0.2, 0.8, 0.2, 1], onUpdate: setAffiche });
    return () => lecture.stop();
  }, [valeur, sansMouvement]);

  return <span aria-hidden>{pourcent(sansMouvement ? valeur : affiche)}</span>;
}

/** La révélation : l'IA faite pour vous, pourquoi elle, puis les autres candidates. */
export function VueResultat() {
  const reglages = useMandat();
  const lecture = useScrutins();
  const { classement, regle, chargement } = useClassement();
  const router = useRouter();

  function refaire() {
    mandat.effacer();
    router.push("/test");
  }

  if (chargement) {
    return (
      <div role="status" className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center gap-6 text-center">
        <div aria-hidden className="size-20 rounded-full bg-relief motion-safe:animate-pulse" />
        <p className="text-lg text-attenue">Recherche de l&apos;IA qui vous ressemble…</p>
      </div>
    );
  }

  if (lecture.error) {
    return (
      <div role="alert" className="mx-auto max-w-2xl py-16 text-center">
        <h1 className={TITRE}>Les textes de loi n&apos;ont pas pu être lus.</h1>
        <p className="mx-auto mt-4 max-w-md text-lg leading-8 text-attenue">
          Sans eux, impossible de comparer vos réponses aux candidates. Vérifiez votre connexion.
        </p>
        <p className="mt-8">
          <button type="button" onClick={() => void lecture.mutate()} className={BOUTON_SECONDAIRE}>
            Réessayer
          </button>
        </p>
      </div>
    );
  }

  if (!regle) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center py-16 text-center">
        <h1 className={TITRE}>Votre IA vous attend.</h1>
        <p className="mt-4 max-w-md text-lg leading-8 text-attenue">
          Pour la trouver, tranchez quelques textes de loi et réglez vos priorités. Deux étapes, quelques minutes.
        </p>
        <p className="mt-10">
          <Link href="/test" className={BOUTON_PRINCIPAL}>
            Passer le test
          </Link>
        </p>
      </div>
    );
  }

  const [meilleure, ...autres] = classement;

  return (
    <MotionConfig reducedMotion="user">
      <FiltreSphere />
      <AvisExemple meta={lecture.data?.meta} />

      <motion.section
        aria-labelledby="titre-resultat"
        className="mx-auto flex max-w-4xl flex-col items-center text-center lg:flex-row lg:gap-20 lg:text-left"
        variants={REVELATION}
        initial="cache"
        animate="visible"
      >
        <motion.div className="w-[min(260px,56vw)] shrink-0 lg:w-[min(340px,30vw)]" variants={SPHERE_ETAPE}>
          <Sphere
            teintes={meilleure.candidate.teintes}
            aquarelle
            duree={13}
            description={`La sphère de ${meilleure.candidate.prenom}, l'IA candidate la plus proche de vous`}
          />
        </motion.div>

        <div className="mt-10 flex min-w-0 flex-col items-center lg:mt-0 lg:items-start">
          <motion.p variants={ETAPE} className="text-lg text-attenue">
            L&apos;IA faite pour vous
          </motion.p>
          <motion.h1
            id="titre-resultat"
            variants={ETAPE}
            className="mt-1 font-titre text-[clamp(3.5rem,10vw,6rem)] font-semibold leading-none tracking-[-0.03em]"
          >
            {meilleure.candidate.prenom}
          </motion.h1>
          <motion.p
            variants={ETAPE}
            className="mt-5 flex items-baseline gap-3 text-4xl font-semibold tabular-nums leading-none tracking-[-0.03em] sm:text-5xl"
          >
            <PourcentQuiMonte valeur={meilleure.score} />
            <span className="sr-only">{pourcent(meilleure.score)}</span>
            <span className="text-base font-normal tracking-normal text-attenue">d&apos;affinité avec vous</span>
          </motion.p>

          <motion.div variants={ETAPE} className="flex flex-col items-center lg:items-start">
            <p className="mt-6 max-w-md text-balance text-xl leading-8 tracking-[-0.01em]">{meilleure.candidate.doctrine}</p>
            <p className="mt-3 max-w-md text-base leading-7 text-attenue">{meilleure.candidate.portrait}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link href="/seance" className={BOUTON_PRINCIPAL}>
                La voir au pouvoir
              </Link>
              <button type="button" onClick={refaire} className={BOUTON_SECONDAIRE}>
                Refaire le test
              </button>
            </div>
            <p className="mt-1">
              <Link
                href={`/candidates/${meilleure.candidate.id}`}
                className="inline-flex min-h-11 items-center text-[15px] text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current lg:-ml-0"
              >
                Sa fiche complète
              </Link>
            </p>
            <SourceBadge source={sourceCalcul(DEFINITION_AFFINITE)} className="mt-4 max-w-[52ch]" />
          </motion.div>
        </div>
      </motion.section>

      <div className="mx-auto max-w-2xl">
        <Pourquoi affinite={meilleure} mandat={reglages} />
        <AutresCandidates autres={autres} />
        <div className="mt-20 flex flex-wrap items-center justify-center gap-3">
          <Link href="/seance" className={BOUTON_PRINCIPAL}>
            La voir au pouvoir
          </Link>
          <button type="button" onClick={refaire} className={BOUTON_SECONDAIRE}>
            Refaire le test
          </button>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        Votre IA : {meilleure.candidate.prenom}, affinité {pourcent(meilleure.score)}.
      </p>
    </MotionConfig>
  );
}
