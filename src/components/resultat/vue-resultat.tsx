"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, MotionConfig, animate, motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useState } from "react";

import { AvisExemple } from "@/components/avis-exemple";
import { BoutonIA } from "@/components/bouton-ia";
import { BlocPartage } from "@/components/partage/bloc-partage";
import { FiltreSphere, Sphere } from "@/components/sphere";
import { CASCADE, DOUX, DUREE, ENTREE, RESSORT_LENT, VUE } from "@/lib/animation";
import { useScrutins } from "@/lib/api";
import { CANDIDATES } from "@/lib/candidates";
import { pourcent } from "@/lib/format";
import { useClassement } from "@/lib/ma-candidate";
import { mandat, useMandat } from "@/lib/mandat";
import { precision as calculerPrecision } from "@/lib/precision";
import { TEXTES_CHAPITRE } from "@/lib/questions/chapitres";
import { resumeDuMandat } from "@/lib/questions/poids";

import { AutresCandidates } from "./autres-candidates";
import { Pourquoi } from "./pourquoi";

const TITRE = "text-balance font-titre text-[clamp(1.875rem,4.2vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em]";

const LIEN = `inline-flex min-h-11 items-center text-[15px] text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-republique`;

/** Sous cet écart, en points d'affinité, le classement est présenté comme serré. */
const ECART_SERRE = 3;

/** Durée du suspense avant la révélation, en millisecondes. */
const DUREE_SUSPENSE = 1900;

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? "s" : ""}`;

/**
 * La révélation, une seule séquence : la sphère arrive, puis le prénom, puis le pourcentage qui monte,
 * puis l'explication, la doctrine et les boutons.
 */
const REVELATION: Variants = {
  cache: {},
  visible: { transition: { staggerChildren: CASCADE * 2, delayChildren: 0.25 } },
};
const ETAPE: Variants = {
  cache: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DUREE.entree, ease: DOUX } },
};

/** Le pourcentage monte de 0 à sa valeur. Sans mouvement (préférence système), il s'affiche d'emblée. */
function PourcentQuiMonte({ valeur }: { valeur: number }) {
  const sansMouvement = useReducedMotion();
  const [affiche, setAffiche] = useState(sansMouvement ? valeur : 0);

  useEffect(() => {
    if (sansMouvement) return;
    const lecture = animate(0, valeur, { duration: DUREE.scene, delay: 0.5, ease: DOUX, onUpdate: setAffiche });
    return () => lecture.stop();
  }, [valeur, sansMouvement]);

  return <span aria-hidden>{pourcent(sansMouvement ? valeur : affiche)}</span>;
}

/**
 * Le suspense : les sept sphères en ligne, une lumière passe de l'une à l'autre pendant le dépouillement.
 * La gagnante porte le même layoutId que la grande sphère : à la révélation, c'est elle qui grandit.
 */
function Depouillement({ gagnante }: { gagnante: string }) {
  return (
    <motion.div
      key="suspense"
      role="status"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center"
      exit={{ opacity: 0, transition: { duration: DUREE.etat } }}
    >
      <ol aria-hidden className="flex items-center gap-2 sm:gap-4">
        {CANDIDATES.map((candidate, i) => (
          <li key={candidate.id} className="size-10 sm:size-14">
            <motion.div
              layoutId={candidate.id === gagnante ? "sphere-gagnante" : undefined}
              className="size-full"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: [0, -8, 0], scale: [1, 1.15, 1] }}
              transition={{
                opacity: { duration: DUREE.etat, delay: i * CASCADE },
                y: { duration: 0.5, delay: 0.3 + i * 0.12, repeat: 1, repeatDelay: 0.5, ease: "easeInOut" },
                scale: { duration: 0.5, delay: 0.3 + i * 0.12, repeat: 1, repeatDelay: 0.5, ease: "easeInOut" },
                layout: RESSORT_LENT,
              }}
            >
              <Sphere teintes={candidate.teintes} duree={8 + i} className="size-full" />
            </motion.div>
          </li>
        ))}
      </ol>
      <p className="text-lg text-attenue">Dépouillement de vos réponses…</p>
    </motion.div>
  );
}

/** La révélation : l'IA faite pour vous, pourquoi elle, puis les autres candidates. */
export function VueResultat() {
  const reglages = useMandat();
  const lecture = useScrutins();
  const { classement, regle, chargement } = useClassement();
  const router = useRouter();
  const reduit = useReducedMotion();
  const [suspenseFini, setSuspenseFini] = useState(false);

  const pret = !chargement && !lecture.error && regle;
  useEffect(() => {
    if (!pret || reduit) return;
    const minuterie = setTimeout(() => setSuspenseFini(true), DUREE_SUSPENSE);
    return () => clearTimeout(minuterie);
  }, [pret, reduit]);

  function refaire() {
    mandat.effacer();
    router.push("/test");
  }

  if (chargement) {
    return (
      <div role="status" className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 text-center">
        <div aria-hidden className="size-20 rounded-full bg-relief motion-safe:animate-pulse" />
        <p className="text-lg text-attenue">Recherche de l&apos;IA qui vous ressemble…</p>
      </div>
    );
  }

  if (lecture.error) {
    return (
      <div role="alert" className="mx-auto max-w-2xl py-16 text-center">
        <h1 className={TITRE}>Les textes de loi n&apos;ont pas pu être lus.</h1>
        <div className="mt-8">
          <BoutonIA variante="contour" onClick={() => void lecture.mutate()}>
            Réessayer
          </BoutonIA>
        </div>
      </div>
    );
  }

  if (!regle) {
    return (
      <motion.div {...ENTREE} className="mx-auto flex max-w-2xl flex-col items-center py-16 text-center">
        <h1 className={TITRE}>Votre IA vous attend.</h1>
        <p className="mt-4 max-w-md text-balance text-lg text-attenue">
          Sept chapitres, environ 7 minutes : de vrais textes de loi, un budget, des dilemmes.
        </p>
        <div className="mt-10">
          <BoutonIA href="/test">Passer le test</BoutonIA>
        </div>
      </motion.div>
    );
  }

  const [meilleure, deuxieme] = classement;
  const enSuspense = !suspenseFini && !reduit;

  // Sur quoi repose le calcul, et ce qui sépare la première de la deuxième (en points d'affinité affichés).
  const scrutins = lecture.data?.data ?? [];
  const resume = resumeDuMandat(reglages, scrutins);
  const precision = calculerPrecision({
    textes: resume.textes,
    textesProposes: Math.min(TEXTES_CHAPITRE, scrutins.length),
    dilemmes: resume.dilemmes,
    accords: resume.accords,
    budget: resume.budget,
    scenarios: resume.scenarios,
    classement: resume.classement,
  });
  const reponses =
    resume.textes + resume.accords + (resume.budget ? 1 : 0) + resume.scenarios + resume.dilemmes + (resume.classement ? 1 : 0);
  const elements = [
    resume.textes > 0 ? pluriel(resume.textes, "texte") : null,
    resume.accords > 0 ? pluriel(resume.accords, "affirmation") : null,
    resume.budget ? "votre budget" : null,
    resume.scenarios > 0 ? pluriel(resume.scenarios, "scénario") : null,
    resume.dilemmes > 0 ? pluriel(resume.dilemmes, "dilemme") : null,
    resume.classement ? "votre classement des thèmes" : null,
  ].filter((e): e is string => e !== null);
  const { justes, total: paris } = resume.pronostics;
  const calcule =
    elements.length > 1
      ? `${elements.slice(0, -1).join(", ")} et ${elements[elements.length - 1]}`
      : (elements[0] ?? "vos priorités");
  const ecart = deuxieme ? Math.round(meilleure.score * 100) - Math.round(deuxieme.score * 100) : null;
  const serre = ecart !== null && ecart < ECART_SERRE;

  return (
    <MotionConfig reducedMotion="user">
      <FiltreSphere />
      <AvisExemple meta={lecture.data?.meta} />

      <LayoutGroup>
        <AnimatePresence mode="popLayout" initial={false}>
          {enSuspense ? (
            <Depouillement key="suspense" gagnante={meilleure.candidate.id} />
          ) : (
            <motion.section
              key="revelation"
              aria-labelledby="titre-resultat"
              className="mx-auto flex max-w-4xl flex-col items-center text-center lg:flex-row lg:gap-20 lg:text-left"
              variants={REVELATION}
              initial="cache"
              animate="visible"
            >
              <motion.div
                layoutId="sphere-gagnante"
                transition={RESSORT_LENT}
                className="relative w-[min(240px,56vw)] shrink-0 lg:w-[min(340px,30vw)]"
              >
                {/* Un halo de sa couleur s'ouvre derrière la sphère au moment de la révélation. */}
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute -inset-[18%] rounded-full blur-3xl"
                  style={{ background: `radial-gradient(closest-side, ${meilleure.candidate.teintes[1]}, transparent)` }}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 0.45, scale: 1 }}
                  transition={{ duration: DUREE.scene, delay: 0.3, ease: DOUX }}
                />
                <Sphere
                  aquarelle
                  teintes={meilleure.candidate.teintes}
                  description={`La sphère de ${meilleure.candidate.prenom}, l'IA candidate la plus proche de vous`}
                  className="relative"
                />
              </motion.div>

              <div className="mt-8 flex min-w-0 flex-col items-center lg:mt-0 lg:items-start">
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
                  className="mt-4 flex items-baseline gap-3 text-4xl font-semibold tabular-nums leading-none tracking-[-0.03em] sm:text-5xl"
                >
                  <PourcentQuiMonte valeur={meilleure.score} />
                  <span className="sr-only">{pourcent(meilleure.score)}</span>
                  <span className="text-base font-normal tracking-normal text-attenue">d&apos;affinité avec vous</span>
                </motion.p>
                <motion.p variants={ETAPE} className="mt-5 max-w-md text-balance text-xl leading-8 tracking-[-0.01em]">
                  {meilleure.candidate.doctrine}
                </motion.p>

                {/* L'explication en trois chiffres : l'écart avec la deuxième, le nombre de réponses, la précision. */}
                <motion.dl
                  variants={ETAPE}
                  className="mt-6 grid w-full max-w-md grid-cols-3 divide-x divide-trait border-y border-trait text-left"
                >
                  <div className="py-3 pr-3">
                    <dt className="text-xs leading-4 text-attenue">
                      Devant {deuxieme ? deuxieme.candidate.prenom : "les autres"}
                    </dt>
                    <dd className="mt-1 text-lg font-semibold tabular-nums">
                      {ecart === null ? "–" : ecart === 0 ? "égalité" : `+${pluriel(ecart, "pt")}`}
                    </dd>
                  </div>
                  <div className="px-3 py-3">
                    <dt className="text-xs leading-4 text-attenue">Vos réponses</dt>
                    <dd className="mt-1 text-lg font-semibold tabular-nums">{reponses}</dd>
                  </div>
                  <div className="py-3 pl-3">
                    <dt className="text-xs leading-4 text-attenue">Précision</dt>
                    <dd className="mt-1 text-lg font-semibold tabular-nums">{precision} %</dd>
                  </div>
                </motion.dl>
                <motion.p variants={ETAPE} className="mt-3 max-w-md text-balance text-sm leading-6 text-attenue">
                  Calculé sur {calcule}.
                  {serre && deuxieme ? (
                    <span className="text-texte">
                      {" "}
                      C&apos;est serré avec {deuxieme.candidate.prenom} : d&apos;autres réponses pourraient inverser le classement.
                    </span>
                  ) : null}
                  {paris > 0 ? ` Devinez l'Assemblée : ${justes} sur ${paris}.` : null}
                </motion.p>

                <motion.div variants={ETAPE} className="mt-7 flex flex-col items-center lg:items-start">
                  <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                    <BoutonIA href="/seance" teintes={meilleure.candidate.teintes}>
                      La voir au pouvoir
                    </BoutonIA>
                    <BoutonIA variante="contour" onClick={refaire}>
                      Refaire le test
                    </BoutonIA>
                  </div>
                  <p className="mt-1 flex flex-wrap justify-center gap-x-5 lg:justify-start">
                    <a href="#titre-pourquoi" className={LIEN}>
                      Pourquoi {meilleure.candidate.prenom} ?
                    </a>
                    <Link href={`/candidates/${meilleure.candidate.id}`} className={LIEN}>
                      Sa fiche complète
                    </Link>
                  </p>
                </motion.div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </LayoutGroup>

      {enSuspense ? null : (
        <div className="mx-auto max-w-4xl">
          <BlocPartage affinite={meilleure} />
        </div>
      )}

      {enSuspense ? null : (
        <div className="mx-auto max-w-2xl">
          <motion.div initial={ENTREE.initial} whileInView={ENTREE.animate} viewport={VUE} transition={ENTREE.transition}>
            <Pourquoi affinite={meilleure} mandat={reglages} />
          </motion.div>
          <motion.div initial={ENTREE.initial} whileInView={ENTREE.animate} viewport={VUE} transition={ENTREE.transition}>
            <AutresCandidates classement={classement} />
          </motion.div>
        </div>
      )}

      <p role="status" aria-live="polite" className="sr-only">
        {enSuspense ? "" : `Votre IA : ${meilleure.candidate.prenom}, affinité ${pourcent(meilleure.score)}.`}
      </p>
    </MotionConfig>
  );
}
