"use client";

import Link from "next/link";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { createContext, use, useEffect, useEffectEvent, useRef } from "react";

import { BoutonIA } from "@/components/bouton-ia";
import { Sphere } from "@/components/sphere";
import { CASCADE, DOUX, DUREE, RESSORT } from "@/lib/animation";
import type { Affinite } from "@/lib/candidates";
import { CHAPITRES, type Chapitre, type ChapitreId } from "@/lib/questions/chapitres";

/* Le vocabulaire commun des chapitres du test. */

export { DOUX, RESSORT };

export const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-republique";

export const BOUTON_DISCRET = `inline-flex min-h-11 items-center px-3 text-[15px] text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current disabled:pointer-events-none disabled:opacity-60 ${FOCUS}`;

export const CADRE = "flex flex-col rounded-2xl border border-trait bg-surface p-6 sm:p-8";

export const TITRE_CARTE =
  "text-balance font-titre text-[clamp(1.375rem,3vw,1.875rem)] font-semibold leading-[1.15] tracking-[-0.025em]";

/** Ressort court, sans rebond : pour les petits changements d'état (chiffre, pastille, sortie de carte). */
export const RESSORT_VIF: Transition = { type: "spring", visualDuration: DUREE.etat, bounce: 0 };

/** Sortie d'un bloc : brève, elle laisse la place à ce qui arrive. */
export const SORTIE: Transition = { duration: DUREE.micro, ease: "easeIn" };

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? "s" : ""}`;

export interface Avancement {
  fait: number;
  total: number;
}

/** Ce que tous les écrans du test peuvent montrer sans le recevoir en propriété : l'IA en tête, la précision, la suite. */
export interface EtatTest {
  tete: Affinite | null;
  precision: number;
  /** Le chapitre qui suit celui en cours, ou null au dernier. */
  suivant: Chapitre | null;
}
export const ContexteTest = createContext<EtatTest>({ tete: null, precision: 0, suivant: null });

/** Le temps restant estimé, en secondes, d'après la durée de chaque chapitre et ce qui y est déjà répondu. */
export function tempsRestant(avancements: Record<ChapitreId, Avancement>, depuis: number): number {
  return CHAPITRES.reduce((s, c, i) => {
    if (i < depuis) return s;
    const { fait, total } = avancements[c.id];
    const reste = total > 0 ? Math.max(0, 1 - fait / total) : 1;
    return s + c.secondes * reste;
  }, 0);
}

function libelleTemps(secondes: number) {
  if (secondes < 20) return "presque fini";
  if (secondes < 60) return "moins d'1 min";
  return `encore ${Math.round(secondes / 60)} min`;
}

/**
 * Le sommaire : un segment par chapitre, qui se remplit avec les réponses. Chaque segment mène à son chapitre.
 * À droite, le temps restant estimé ; dès que le classement a assez de matière, un lien vers son IA.
 */
export function Sommaire({
  courant,
  avancements,
  peutVoir,
  onAller,
}: {
  courant: number;
  avancements: Record<ChapitreId, Avancement>;
  peutVoir: boolean;
  onAller: (indice: number) => void;
}) {
  const chapitre = CHAPITRES[courant];
  const restant = tempsRestant(avancements, chapitre ? courant : CHAPITRES.length);
  return (
    <nav aria-label="Chapitres du test" className="mt-6">
      <div className="flex min-h-11 items-center justify-between gap-4">
        <p className="min-w-0 truncate text-sm text-attenue">
          {chapitre ? (
            <>
              <span className="font-medium tabular-nums text-texte">
                Chapitre {courant + 1} sur {CHAPITRES.length}
              </span>
              <span className="hidden sm:inline">
                <span aria-hidden> · </span>
                <span className="sr-only">, </span>
                {chapitre.titre}
              </span>
            </>
          ) : (
            <span className="font-medium text-texte">Fin du test</span>
          )}
        </p>
        <div className="flex shrink-0 items-center text-sm text-attenue">
          {chapitre ? (
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={libelleTemps(restant)}
                className="inline-flex items-center gap-1.5 tabular-nums"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={RESSORT_VIF}
              >
                <IconeHorloge />
                {libelleTemps(restant)}
              </motion.span>
            </AnimatePresence>
          ) : null}
          <AnimatePresence initial={false}>
            {peutVoir ? (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={RESSORT}
                className="inline-flex"
              >
                <Link href="/resultat" className={`-mr-3 ml-1 shrink-0 ${BOUTON_DISCRET} text-sm text-texte`}>
                  Voir mon IA
                </Link>
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      <ol className="grid grid-cols-7 gap-1.5">
        {CHAPITRES.map((c, i) => {
          const { fait, total } = avancements[c.id];
          const part = total > 0 ? Math.min(1, fait / total) : 0;
          const actif = i === courant;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onAller(i)}
                title={c.titre}
                aria-current={actif ? "step" : undefined}
                aria-label={`Chapitre ${i + 1} : ${c.titre}${c.bonus ? " (bonus)" : ""}, ${fait} sur ${total}`}
                className={`group flex h-11 w-full items-center rounded-md ${FOCUS}`}
              >
                <motion.span
                  className="relative block h-1.5 w-full origin-center overflow-hidden rounded-full bg-relief"
                  initial={false}
                  animate={{ scaleY: actif ? 1 : 0.67 }}
                  whileHover={{ scaleY: 1 }}
                  transition={RESSORT_VIF}
                >
                  <motion.span
                    className={`absolute inset-y-0 left-0 block w-full origin-left rounded-full ${actif ? "bg-texte" : "bg-attenue"}`}
                    initial={false}
                    animate={{ scaleX: part }}
                    transition={RESSORT}
                  />
                </motion.span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const ETAPE = {
  cache: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: RESSORT },
} as const;

/**
 * La carte d'introduction d'un chapitre : sa sphère se forme, le titre, une phrase, la durée estimée.
 * La sphère porte un layoutId : au départ du chapitre, elle se rétracte dans l'en-tête.
 * `accueil` : la toute première fois, une phrase dit comment marche le test.
 */
export function IntroChapitre({
  chapitre,
  numero,
  dejaFait,
  accueil = false,
  onCommencer,
  onPasser,
}: {
  chapitre: Chapitre;
  numero: number;
  dejaFait: Avancement;
  accueil?: boolean;
  onCommencer: () => void;
  onPasser: () => void;
}) {
  const titre = useRef<HTMLHeadingElement>(null);
  const poserLeFocus = useEffectEvent(() => {
    if (numero > 1) titre.current?.focus({ preventScroll: true });
  });
  useEffect(() => poserLeFocus(), []);

  const enCours = dejaFait.fait > 0 && dejaFait.fait < dejaFait.total;
  const termine = dejaFait.total > 0 && dejaFait.fait >= dejaFait.total;

  return (
    <motion.section
      aria-labelledby={`intro-${chapitre.id}`}
      className="flex flex-col items-center py-4 text-center sm:py-8"
      initial="cache"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: CASCADE, delayChildren: 0.05 } } }}
    >
      <motion.div
        layoutId={`sphere-${chapitre.id}`}
        transition={RESSORT}
        className="size-24 sm:size-36"
        variants={{
          cache: { opacity: 0, scale: 0.4, rotate: -50, "--p1": 0.45, "--p2": 0.45, "--p3": 0.45 },
          visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            "--p1": chapitre.forme[0],
            "--p2": chapitre.forme[1],
            "--p3": chapitre.forme[2],
            transition: { type: "spring", bounce: 0, visualDuration: DUREE.scene },
          },
        }}
      >
        <Sphere teintes={chapitre.teintes} duree={7} className="size-full" />
      </motion.div>

      <motion.p variants={ETAPE} className="mt-6 text-sm tabular-nums text-attenue">
        Chapitre {numero} sur {CHAPITRES.length}
        {chapitre.bonus ? " · bonus" : ""}
      </motion.p>
      <motion.h2
        ref={titre}
        id={`intro-${chapitre.id}`}
        tabIndex={-1}
        variants={ETAPE}
        className="mt-2 text-balance font-titre text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-[-0.035em] outline-none"
      >
        {chapitre.titre}
      </motion.h2>
      <motion.p variants={ETAPE} className="mt-3 max-w-md text-balance text-lg leading-7 text-attenue">
        {chapitre.phrase}
      </motion.p>
      <motion.p variants={ETAPE} className="mt-3 inline-flex items-center gap-1.5 text-sm text-attenue">
        <IconeHorloge />
        Environ {chapitre.duree}
        {enCours ? ` · ${pluriel(dejaFait.fait, "réponse")} déjà` : termine ? " · déjà fait" : ""}
      </motion.p>

      <motion.div variants={ETAPE} className="mt-7 flex flex-col items-center gap-1 sm:mt-9">
        <BoutonIA onClick={onCommencer} teintes={chapitre.teintes}>
          {termine ? "Revoir" : enCours ? "Reprendre" : "Commencer"}
        </BoutonIA>
        <button type="button" onClick={onPasser} className={BOUTON_DISCRET}>
          Passer ce chapitre
        </button>
      </motion.div>

      {accueil ? (
        <motion.p
          variants={ETAPE}
          className="mt-5 max-w-sm text-balance rounded-2xl bg-relief/60 px-4 py-3 text-sm leading-6 text-attenue"
        >
          <span className="font-medium text-texte">7 chapitres, environ 7 minutes.</span> Chaque réponse fait bouger
          la course des IA, en haut. À la fin, la vôtre se révèle.
        </motion.p>
      ) : null}
    </motion.section>
  );
}

/** L'en-tête d'un chapitre en cours : la petite sphère (venue de l'introduction), le titre, l'étape. */
export function EnteteChapitre({
  chapitre,
  etape,
  total,
  libelleEtape,
  onPasser,
}: {
  chapitre: Chapitre;
  /** Étape en cours, à partir de 1. */
  etape: number;
  total: number;
  /** Ce que compte l'étape : « texte », « affirmation »… */
  libelleEtape?: string;
  onPasser: () => void;
}) {
  const titre = useRef<HTMLHeadingElement>(null);
  const poserLeFocus = useEffectEvent(() => titre.current?.focus({ preventScroll: true }));
  useEffect(() => poserLeFocus(), []);

  const affichee = Math.min(etape, total);
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <motion.div layoutId={`sphere-${chapitre.id}`} transition={RESSORT} className="size-9 shrink-0">
          <Sphere teintes={chapitre.teintes} duree={7} className="size-full" />
        </motion.div>
        <h2
          ref={titre}
          tabIndex={-1}
          className="min-w-0 flex-1 truncate font-titre text-xl font-semibold tracking-[-0.02em] outline-none"
        >
          {chapitre.titre}
        </h2>
        <button type="button" onClick={onPasser} className={`-mr-3 shrink-0 ${BOUTON_DISCRET} text-sm`}>
          Passer
          <span className="sr-only"> ce chapitre</span>
        </button>
      </div>
      {total > 1 ? (
        <div className="mt-3 flex items-center gap-3">
          {/* Les étapes du chapitre, en petits traits : celle en cours s'allonge. */}
          <ol aria-hidden className="flex flex-1 items-center gap-1">
            {Array.from({ length: total }, (_, i) => (
              <li
                key={i}
                className={`h-1 flex-1 rounded-full transition-[background-color,scale] duration-300 ease-out ${
                  i < affichee - 1 ? "bg-texte" : i === affichee - 1 ? "scale-y-150 bg-attenue" : "bg-relief"
                }`}
              />
            ))}
          </ol>
          <p className="shrink-0 text-sm tabular-nums text-attenue">
            <span className="sr-only">{libelleEtape ? `${libelleEtape} ` : "Étape "}</span>
            <AnimNombre valeur={affichee} /> sur {total}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** Un chiffre qui glisse vers le haut quand il change. */
export function AnimNombre({ valeur }: { valeur: number }) {
  return (
    <span className="relative inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={valeur}
          initial={{ y: "80%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-80%", opacity: 0 }}
          transition={RESSORT_VIF}
          className="inline-block"
        >
          {valeur}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function IconeHorloge() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.5V8l2.25 1.5" strokeLinecap="round" />
    </svg>
  );
}

/** La coche qui se trace à la fin d'un chapitre. */
function Coche() {
  return (
    <motion.span
      aria-hidden
      className="flex size-11 items-center justify-center rounded-full bg-texte text-fond"
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={RESSORT}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: DUREE.etat, delay: 0.15, ease: DOUX }}
        />
      </svg>
    </motion.span>
  );
}

/**
 * Le bilan d'un chapitre : qui mène la course, la précision atteinte, et ce qui vient ensuite.
 * Il lit l'état du test dans ContexteTest.
 */
export function BilanChapitre() {
  const { tete, precision, suivant } = use(ContexteTest);
  return (
    <motion.div
      className="mt-5 flex flex-col gap-3"
      initial="cache"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: CASCADE, delayChildren: 0.2 } } }}
    >
      <motion.div variants={ETAPE} className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px]">
        {tete ? (
          <span className="inline-flex items-center gap-2">
            <Sphere teintes={tete.candidate.teintes} duree={8} className="size-7" />
            <span className="text-attenue">En tête :</span>
            <span className="font-semibold">{tete.candidate.prenom}</span>
          </span>
        ) : null}
        <span>
          <span className="text-attenue">Précision : </span>
          <span className="font-semibold tabular-nums">{precision} %</span>
        </span>
      </motion.div>
      {suivant ? (
        <motion.p variants={ETAPE} className="text-sm text-attenue">
          Ensuite : <span className="text-texte">{suivant.titre}</span> · {suivant.duree}
        </motion.p>
      ) : null}
    </motion.div>
  );
}

/** La carte de fin d'un chapitre : une coche, une phrase, le bilan, et la suite. */
export function FinChapitre({
  titre,
  children,
  suite = "Chapitre suivant",
  teintes,
  onSuite,
}: {
  titre: string;
  children?: React.ReactNode;
  suite?: string;
  teintes?: Chapitre["teintes"];
  onSuite: () => void;
}) {
  // Les commandes de la dernière question disparaissent : le clavier se pose sur le message de fin.
  const ref = useRef<HTMLHeadingElement>(null);
  const poserLeFocus = useEffectEvent(() => ref.current?.focus({ preventScroll: true }));
  useEffect(() => poserLeFocus(), []);

  return (
    <motion.div
      className={`${CADRE} min-h-[22rem]`}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={RESSORT}
    >
      <Coche />
      <h3 ref={ref} tabIndex={-1} className={`mt-5 ${TITRE_CARTE} outline-none`}>
        {titre}
      </h3>
      {children}
      <BilanChapitre />
      <div className="mt-auto pt-8">
        <BoutonIA onClick={onSuite} teintes={teintes}>
          {suite}
        </BoutonIA>
      </div>
    </motion.div>
  );
}
