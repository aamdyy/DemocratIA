"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MotionConfig, motion } from "motion/react";

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
      <div role="status" className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center text-center">
        <p className="text-lg text-attenue">Recherche de l&apos;IA qui vous ressemble…</p>
      </div>
    );
  }

  if (lecture.error) {
    return (
      <div role="alert" className="mx-auto max-w-2xl py-16 text-center">
        <h1 className="font-titre text-3xl font-semibold tracking-[-0.03em]">Les textes de loi n&apos;ont pas pu être lus.</h1>
        <p className="mt-3 text-[17px] leading-7 text-attenue">
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
        <h1 className="text-balance font-titre text-[clamp(2rem,4.6vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
          Votre IA vous attend.
        </h1>
        <p className="mt-4 max-w-lg text-lg leading-8 text-attenue">
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

      <section aria-labelledby="titre-resultat" className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <motion.div
          className="w-[min(320px,70vw)]"
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Sphere
            teintes={meilleure.candidate.teintes}
            aquarelle
            duree={13}
            description={`La sphère de ${meilleure.candidate.prenom}, l'IA candidate la plus proche de vous`}
          />
        </motion.div>

        <p className="mt-10 text-lg text-attenue">L&apos;IA faite pour vous</p>
        <h1
          id="titre-resultat"
          className="mt-1 font-titre text-[clamp(3.25rem,10vw,6rem)] font-semibold leading-none tracking-[-0.03em]"
        >
          {meilleure.candidate.prenom}
        </h1>
        <p className="mt-4 text-balance text-xl leading-8">{meilleure.candidate.doctrine}</p>
        <p className="mt-6 text-2xl font-semibold tabular-nums tracking-[-0.02em]">
          Affinité : {pourcent(meilleure.score)}
        </p>
        <SourceBadge source={sourceCalcul(DEFINITION_AFFINITE)} className="mt-2 justify-center text-center" />
        <p className="mt-6 max-w-lg text-[17px] leading-7 text-attenue">{meilleure.candidate.portrait}</p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/seance" className={BOUTON_PRINCIPAL}>
            La voir au pouvoir
          </Link>
          <button type="button" onClick={refaire} className={BOUTON_SECONDAIRE}>
            Refaire le test
          </button>
        </div>
        <p className="mt-4">
          <Link
            href={`/candidates/${meilleure.candidate.id}`}
            className="inline-flex min-h-11 items-center text-[15px] text-attenue underline decoration-trait underline-offset-4 transition-colors hover:text-texte hover:decoration-current"
          >
            Sa fiche complète
          </Link>
        </p>
      </section>

      <div className="mx-auto max-w-2xl">
        <Pourquoi affinite={meilleure} mandat={reglages} />
        <AutresCandidates autres={autres} />
        <div className="mt-20 flex flex-wrap items-center gap-3 border-t border-trait pt-10">
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
