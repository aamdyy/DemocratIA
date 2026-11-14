"use client";

import Link from "next/link";
import { motion, type Transition } from "motion/react";
import { useEffect, useEffectEvent, useRef } from "react";

import { BoutonIA } from "@/components/bouton-ia";
import { Sphere } from "@/components/sphere";
import { CHAPITRES, type Chapitre, type ChapitreId } from "@/lib/questions/chapitres";

/* Le vocabulaire commun des chapitres du test. */

export const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-republique";

export const BOUTON_DISCRET = `inline-flex min-h-11 items-center px-3 text-[15px] text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current disabled:pointer-events-none disabled:opacity-60 ${FOCUS}`;

export const CADRE = "flex flex-col rounded-2xl border border-trait bg-surface p-6 sm:p-8";

export const TITRE_CARTE =
  "text-balance font-titre text-[clamp(1.375rem,3vw,1.875rem)] font-semibold leading-[1.15] tracking-[-0.025em]";

export const DOUX = [0.2, 0.8, 0.2, 1] as const;

/** Ressort sans rebond : le mouvement arrive et se pose, sans osciller. */
export const RESSORT: Transition = { type: "spring", bounce: 0, duration: 0.5 };
export const RESSORT_VIF: Transition = { type: "spring", bounce: 0, duration: 0.32 };

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? "s" : ""}`;

export interface Avancement {
  fait: number;
  total: number;
}

/**
 * Le sommaire : un segment par chapitre, qui se remplit avec les réponses. Chaque segment mène à son chapitre.
 * Dès que le classement a assez de matière, un lien permet de voir son IA sans finir le test.
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
  return (
    <nav aria-label="Chapitres du test" className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-attenue">
          {chapitre ? (
            <>
              <span className="font-medium tabular-nums text-texte">
                Chapitre {courant + 1} sur {CHAPITRES.length}
              </span>
              <span aria-hidden> · </span>
              <span className="sr-only">, </span>
              {chapitre.titre}
            </>
          ) : (
            <span className="font-medium text-texte">Fin du test</span>
          )}
        </p>
        {peutVoir ? (
          <Link href="/resultat" className={`-mr-3 shrink-0 ${BOUTON_DISCRET}`}>
            Voir mon IA
          </Link>
        ) : null}
      </div>
      <ol className="mt-1 grid grid-cols-7 gap-1.5">
        {CHAPITRES.map((c, i) => {
          const { fait, total } = avancements[c.id];
          const part = total > 0 ? Math.min(1, fait / total) : 0;
          const actif = i === courant;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onAller(i)}
                aria-current={actif ? "step" : undefined}
                aria-label={`Chapitre ${i + 1} : ${c.titre}${c.bonus ? " (bonus)" : ""}, ${fait} sur ${total}`}
                className={`group flex h-11 w-full items-center rounded-md ${FOCUS}`}
              >
                <span
                  className={`relative block w-full overflow-hidden rounded-full bg-relief transition-[height] duration-200 ${
                    actif ? "h-1.5" : "h-1 group-hover:h-1.5"
                  }`}
                >
                  <motion.span
                    className={`absolute inset-y-0 left-0 block w-full origin-left rounded-full ${actif ? "bg-texte" : "bg-attenue"}`}
                    initial={false}
                    animate={{ scaleX: part }}
                    transition={RESSORT}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * La carte d'introduction d'un chapitre : sa sphère se forme, le titre, une phrase, la durée estimée.
 * La sphère porte un layoutId : au départ du chapitre, elle se rétracte dans l'en-tête.
 */
export function IntroChapitre({
  chapitre,
  numero,
  dejaFait,
  onCommencer,
  onPasser,
}: {
  chapitre: Chapitre;
  numero: number;
  dejaFait: Avancement;
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
      className="flex flex-col items-center py-6 text-center sm:py-10"
      initial="cache"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
    >
      <motion.div
        layoutId={`sphere-${chapitre.id}`}
        transition={RESSORT}
        className="size-28 sm:size-36"
        variants={{
          cache: { opacity: 0, scale: 0.4, rotate: -50, "--p1": 0.45, "--p2": 0.45, "--p3": 0.45 },
          visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            "--p1": chapitre.forme[0],
            "--p2": chapitre.forme[1],
            "--p3": chapitre.forme[2],
            transition: { type: "spring", bounce: 0, duration: 1.1 },
          },
        }}
      >
        <Sphere teintes={chapitre.teintes} duree={7} className="size-full" />
      </motion.div>

      <motion.p variants={ETAPE} className="mt-7 text-sm tabular-nums text-attenue">
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
      <motion.p variants={ETAPE} className="mt-4 max-w-md text-balance text-lg leading-7 text-attenue">
        {chapitre.phrase}
      </motion.p>
      <motion.p variants={ETAPE} className="mt-3 inline-flex items-center gap-1.5 text-sm text-attenue">
        <IconeHorloge />
        Environ {chapitre.duree}
        {enCours ? ` · ${pluriel(dejaFait.fait, "réponse")} déjà` : termine ? " · déjà fait" : ""}
      </motion.p>

      <motion.div variants={ETAPE} className="mt-9 flex flex-col items-center gap-1">
        <BoutonIA onClick={onCommencer} teintes={chapitre.teintes}>
          {termine ? "Revoir" : enCours ? "Reprendre" : "Commencer"}
        </BoutonIA>
        <button type="button" onClick={onPasser} className={BOUTON_DISCRET}>
          Passer ce chapitre
        </button>
      </motion.div>
    </motion.section>
  );
}

const ETAPE = {
  cache: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0, duration: 0.6 } },
} as const;

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
        {total > 1 ? (
          <p className="shrink-0 text-sm tabular-nums text-attenue">
            <span className="sr-only">{libelleEtape ? `${libelleEtape} ` : "Étape "}</span>
            <AnimNombre valeur={affichee} /> sur {total}
          </p>
        ) : null}
      </div>
      <div className="mt-1 flex justify-end">
        <button type="button" onClick={onPasser} className={`-mr-3 ${BOUTON_DISCRET} text-sm`}>
          Passer ce chapitre
        </button>
      </div>
    </div>
  );
}

/** Un chiffre qui glisse vers le haut quand il change. */
function AnimNombre({ valeur }: { valeur: number }) {
  return (
    <span className="relative inline-flex overflow-hidden align-bottom">
      <motion.span
        key={valeur}
        initial={{ y: "70%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={RESSORT_VIF}
        className="inline-block"
      >
        {valeur}
      </motion.span>
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

/** La carte de fin d'un chapitre : une phrase, un éventuel récapitulatif, et la suite. */
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
      className={`${CADRE} min-h-[14rem]`}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={RESSORT}
    >
      <h3 ref={ref} tabIndex={-1} className={`${TITRE_CARTE} outline-none`}>
        {titre}
      </h3>
      {children}
      <div className="mt-auto pt-8">
        <BoutonIA onClick={onSuite} teintes={teintes}>
          {suite}
        </BoutonIA>
      </div>
    </motion.div>
  );
}
