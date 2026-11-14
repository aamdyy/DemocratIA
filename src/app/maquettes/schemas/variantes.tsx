"use client";

import { animate, motion, useInView, useMotionValue, useMotionValueEvent } from "motion/react";
import type { TargetAndTransition, Transition } from "motion/react";
import { createContext, useContext, useEffect, useId, useRef, useState } from "react";

import { SCHEMAS } from "@/app/(app)/accueils/_composants/schemas";
import { useMouvementReduit } from "@/components/accueil/hooks";

/**
 * Propositions de schémas animés pour la section « Ce qu'un humain promet, une IA le tient. ».
 * Pour chaque ligne : A = le schéma actuel, B et C = deux idées nouvelles, en SVG de 240 × 90.
 * Chaque schéma démarre à son entrée à l'écran, boucle doucement, et se fige sur un état parlant
 * si l'utilisateur a demandé moins d'animations. Humain en gris, IA en --machine.
 *
 * Les quatre schémas retenus pour l'accueil (Mandat C, Programme C, Décisions B, Assemblée B) racontent
 * leur idée en un cycle court de CYCLE secondes : un début, une action, une résolution, une pause.
 * L'humain et l'IA d'une même ligne partagent le même départ (LigneSynchro) : leurs cycles battent ensemble.
 */

const DUREE = 9;
/** Le cycle des quatre schémas retenus, en secondes. */
const CYCLE = 6;
/** Le court temps de pose avant le premier cycle, le temps que la ligne finisse d'entrer à l'écran. */
const DEPART = 0.35;

type Scene = { joue: boolean; reduit: boolean };
type Valeurs = readonly (number | string)[];

type OptionsKf = {
  /** L'adoucissement de chaque segment de la boucle. */
  ease?: Transition["ease"];
  /** L'indice de la valeur montrée quand le mouvement est réduit. */
  repos?: number;
  duree?: number;
};

/**
 * Une boucle d'images clés : chaque propriété suit ses valeurs aux instants `times` (fractions du cycle).
 * Hors animation (pas encore à l'écran), l'élément reste à sa première valeur ; avec le mouvement
 * réduit, il se fige sur la valeur d'indice `repos`.
 */
function kf(sc: Scene, times: readonly number[], props: Record<string, Valeurs>, options: OptionsKf = {}) {
  const { ease = "easeInOut", repos = 0, duree = DUREE } = options;
  const initial: Record<string, number | string> = {};
  const fixe: Record<string, number | string> = {};
  const boucle: Record<string, (number | string)[]> = {};
  for (const [cle, valeurs] of Object.entries(props)) {
    initial[cle] = valeurs[0];
    fixe[cle] = sc.reduit ? valeurs[repos] : valeurs[0];
    boucle[cle] = [...valeurs];
  }
  return {
    initial: initial as TargetAndTransition,
    animate: (sc.joue ? boucle : fixe) as TargetAndTransition,
    transition: (sc.reduit || !sc.joue
      ? { duration: 0 }
      : { duration: duree, times: [...times], repeat: Infinity, ease, delay: DEPART }) as Transition,
  };
}

/** Raccourci pour les schémas retenus : une boucle de CYCLE secondes. */
function cy(sc: Scene, times: readonly number[], props: Record<string, Valeurs>, options: Omit<OptionsKf, "duree"> = {}) {
  return kf(sc, times, props, { ...options, duree: CYCLE });
}

/** L'entrée à l'écran d'une ligne du comparatif, partagée par ses deux schémas. */
const SynchroLigne = createContext<boolean | null>(null);

/**
 * Enveloppe une ligne du comparatif : ses deux schémas démarrent à la même image, au moment où la ligne
 * entre à l'écran, et bouclent ensuite au même rythme.
 */
export function LigneSynchro({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const vu = useInView(ref, { once: true, amount: 0.45 });
  return (
    <div ref={ref}>
      <SynchroLigne.Provider value={vu}>{children}</SynchroLigne.Provider>
    </div>
  );
}

/** Le cadre commun : SVG accessible, déclenché une fois à l'entrée à l'écran (celle de sa ligne, s'il en a une). */
function Cadre({ label, children }: { label: string; children: (sc: Scene) => React.ReactNode }) {
  const ref = useRef<SVGSVGElement>(null);
  const vu = useInView(ref, { once: true, amount: 0.5 });
  const ligne = useContext(SynchroLigne);
  // Faux au rendu serveur comme au premier rendu client : pas d'écart d'hydratation.
  const reduit = useMouvementReduit();
  const sc: Scene = { joue: (ligne ?? vu) && !reduit, reduit };
  return (
    <svg
      ref={ref}
      viewBox="0 0 240 90"
      role="img"
      aria-label={label}
      className="block h-auto w-full max-w-[280px] overflow-visible"
    >
      {children(sc)}
    </svg>
  );
}

/**
 * Suit le cycle en cours (progression de 0 à 1, et nombre de tours déjà accomplis) pour en tirer
 * une valeur discrète : un compteur, une étiquette. `calcul` doit être une fonction de module.
 * Le cycle démarre en même temps que les images clés de `cy` : compteur et dessin restent accordés.
 */
function useSuivi<T extends string | number>(sc: Scene, calcul: (p: number, tour: number) => T, repos: T): T {
  const progression = useMotionValue(0);
  const tour = useRef(0);
  const avant = useRef(0);
  const [valeur, setValeur] = useState<T>(() => calcul(0, 0));
  useMotionValueEvent(progression, "change", (v) => {
    if (v < avant.current - 0.5) tour.current += 1;
    avant.current = v;
    setValeur(calcul(v, tour.current));
  });
  useEffect(() => {
    if (!sc.joue) return;
    const lecture = animate(progression, [0, 1], { duration: CYCLE, ease: "linear", repeat: Infinity, delay: DEPART });
    return () => lecture.stop();
  }, [sc.joue, progression]);
  return sc.reduit ? repos : valeur;
}

/** Un texte SVG dont le contenu suit le cycle (voir useSuivi). */
function TexteSuivi({
  sc,
  calcul,
  repos,
  ...props
}: { sc: Scene; calcul: (p: number, tour: number) => string; repos: string } & Omit<React.SVGProps<SVGTextElement>, "children">) {
  const valeur = useSuivi(sc, calcul, repos);
  return <text {...props}>{valeur}</text>;
}

/** « 1 vote », « 3 votes » : le pluriel français, zéro compris au singulier. */
const pluriel = (n: number, mot: string) => `${n} ${n > 1 ? `${mot}s` : mot}`;

/** Un identifiant utilisable dans un url(#…) SVG. */
function useIdSvg() {
  return useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

const CENTRE = { transformBox: "fill-box", transformOrigin: "center" } as const;
const arrondi = (n: number) => Math.round(n * 100) / 100;

/** Les sièges d'un mini hémicycle, rangés de la gauche vers la droite. */
function sieges(cx: number, cy: number, rangs: readonly { rayon: number; nombre: number }[]) {
  return rangs
    .flatMap(({ rayon, nombre }) =>
      Array.from({ length: nombre }, (_, j) => {
        const angle = Math.PI - (Math.PI * j) / (nombre - 1);
        return {
          x: arrondi(cx + rayon * Math.cos(angle)),
          y: arrondi(cy - rayon * Math.sin(angle)),
          angle: arrondi(angle * 1000),
        };
      }),
    )
    .sort((a, b) => b.angle - a.angle);
}

/* =====================================================================================
   MANDAT
   ===================================================================================== */

/* ---------- Mandat B : un sablier contre une jauge qui respire ---------- */

export function MandatBHumain() {
  const id = useIdSvg();
  return (
    <Cadre label="Un sablier qui se vide en cinq ans : un seul vote au début du mandat, puis plus aucun retour devant les électeurs.">
      {(sc) => (
        <>
          <clipPath id={`${id}-haut`}>
            <path d="M100 8 H140 L123 45 H117 Z" />
          </clipPath>
          <clipPath id={`${id}-bas`}>
            <path d="M117 45 H123 L140 82 H100 Z" />
          </clipPath>
          <motion.g
            style={CENTRE}
            {...kf(sc, [0, 0.04, 0.86, 0.95, 1], { rotate: [0, 0, 0, 180, 180] }, { repos: 2 })}
          >
            <g clipPath={`url(#${id}-haut)`}>
              <motion.rect
                x={100}
                y={8}
                width={40}
                height={37}
                className="fill-attenue"
                opacity={0.55}
                style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
                {...kf(sc, [0, 0.04, 0.86, 0.95, 1], { scaleY: [1, 1, 0, 0, 0] }, { ease: "linear", repos: 2 })}
              />
            </g>
            <g clipPath={`url(#${id}-bas)`}>
              <motion.rect
                x={100}
                y={45}
                width={40}
                height={37}
                className="fill-attenue"
                opacity={0.55}
                style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
                {...kf(sc, [0, 0.04, 0.86, 0.95, 1], { scaleY: [0, 0, 1, 1, 1] }, { ease: "linear", repos: 2 })}
              />
            </g>
            <motion.g {...kf(sc, [0, 0.04, 0.08, 0.84, 0.88, 1], { opacity: [0, 0, 1, 1, 0, 0] }, { repos: 4 })}>
              <line
                x1={120}
                y1={44}
                x2={120}
                y2={80}
                className="stroke-attenue"
                strokeWidth={1.4}
                strokeDasharray="2 3"
                strokeLinecap="round"
              />
            </motion.g>
            <path
              d="M100 8 H140 L123 45 L140 82 H100 L117 45 Z"
              className="fill-none stroke-attenue"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <line x1={96} y1={8} x2={144} y2={8} className="stroke-attenue" strokeWidth={3} strokeLinecap="round" />
            <line x1={96} y1={82} x2={144} y2={82} className="stroke-attenue" strokeWidth={3} strokeLinecap="round" />
          </motion.g>
          <motion.g {...kf(sc, [0, 0.04, 0.4, 1], { opacity: [1, 1, 0.3, 0.3] }, { repos: 0 })}>
            <circle cx={52} cy={45} r={6} className="fill-attenue" />
            <circle cx={52} cy={45} r={11} className="fill-none stroke-attenue" strokeWidth={1} opacity={0.4} />
            <text x={52} y={70} textAnchor="middle" className="fill-attenue" fontSize={10}>
              1 vote
            </text>
          </motion.g>
          <text x={188} y={49} textAnchor="middle" className="fill-attenue" fontSize={11}>
            5 ans
          </text>
        </>
      )}
    </Cadre>
  );
}

export function MandatBIA() {
  const largeur = [90, 140, 70, 125, 90] as const;
  return (
    <Cadre label="Une jauge qui respire en continu : le réglage de l'IA monte et descend au fil des votes des citoyens, à tout moment.">
      {(sc) => (
        <>
          <rect x={30} y={34} width={180} height={12} rx={6} className="fill-trait" />
          {[30, 75, 120, 165, 210].map((x) => (
            <line key={x} x1={x} y1={52} x2={x} y2={57} className="stroke-machine" strokeWidth={1} opacity={0.4} />
          ))}
          <motion.rect
            x={30}
            y={34}
            height={12}
            rx={6}
            className="fill-machine"
            opacity={0.85}
            {...kf(sc, [0, 0.25, 0.5, 0.75, 1], { width: largeur }, { repos: 1 })}
          />
          <motion.circle
            cy={40}
            r={9}
            className="fill-fond stroke-machine"
            strokeWidth={2}
            {...kf(sc, [0, 0.25, 0.5, 0.75, 1], { cx: largeur.map((l) => 30 + l) }, { repos: 1 })}
          />
          <motion.circle
            cy={40}
            r={9}
            className="fill-none stroke-machine"
            strokeWidth={1}
            style={CENTRE}
            {...kf(sc, [0, 0.25, 0.5, 0.75, 1], { cx: largeur.map((l) => 30 + l), scale: [1, 1.5, 1, 1.5, 1], opacity: [0.5, 0.15, 0.5, 0.15, 0.5] }, { repos: 1 })}
          />
          <text x={120} y={80} textAnchor="middle" className="fill-machine" fontSize={10}>
            réglée à tout moment
          </text>
        </>
      )}
    </Cadre>
  );
}

/* ---------- Mandat C : un calendrier, une case contre un flux de cases ---------- */

const COLONNES = 12;
const LIGNES = 5;
const PAS = 14;
const COTE = 10.5;
const CAL_X = 44;
const CAL_Y = 4;
/** Le curseur parcourt les cinq années, mois après mois, entre ces deux instants du cycle. */
const CURSEUR_DEBUT = 0.06;
const CURSEUR_FIN = 0.8;
const ANNEE = (CURSEUR_FIN - CURSEUR_DEBUT) / LIGNES;
/** L'instant où le curseur atteint le mois `col` de l'année `rang`. */
const passage = (rang: number, col: number) => CURSEUR_DEBUT + rang * ANNEE + (col * ANNEE) / COLONNES;

const CASES = Array.from({ length: COLONNES * LIGNES }, (_, i) => ({
  i,
  rang: Math.floor(i / COLONNES),
  col: i % COLONNES,
  x: CAL_X + (i % COLONNES) * PAS,
  y: CAL_Y + Math.floor(i / COLONNES) * PAS,
  /** Une intensité qui varie d'une case à l'autre, sans jamais changer (le flux paraît vivant). */
  intensite: arrondi(0.5 + (0.5 * ((i * 37) % 7)) / 6),
}));

/** Le trajet du curseur : il glisse le long d'une année, puis saute au début de la suivante. */
const TRAJET = (() => {
  const times: number[] = [0];
  const x: number[] = [0];
  const y: number[] = [0];
  for (let r = 0; r < LIGNES; r++) {
    const debut = passage(r, 0);
    const fin = passage(r, COLONNES - 1);
    times.push(debut, fin, r < LIGNES - 1 ? passage(r + 1, 0) - 0.004 : 0.88);
    x.push(0, (COLONNES - 1) * PAS, (COLONNES - 1) * PAS);
    y.push(r * PAS, r * PAS, r * PAS);
  }
  times.push(0.94, 1);
  x.push(0, 0);
  y.push(0, 0);
  return { times, x, y };
})();

function Calendrier({ sc, ia }: { sc: Scene; ia: boolean }) {
  return (
    <>
      {CASES.map((c) => (
        <rect key={c.i} x={c.x} y={c.y} width={COTE} height={COTE} rx={2.5} className="fill-none stroke-trait" strokeWidth={1} />
      ))}
      {Array.from({ length: LIGNES }, (_, r) => {
        const debut = passage(r, 0);
        const fin = r < LIGNES - 1 ? passage(r + 1, 0) : CURSEUR_FIN + 0.04;
        return (
          <motion.text
            key={r}
            x={CAL_X - 6}
            y={CAL_Y + r * PAS + 8.5}
            textAnchor="end"
            className={ia ? "fill-machine" : "fill-attenue"}
            fontSize={8.5}
            fontWeight={500}
            {...cy(sc, [0, debut - 0.01, debut + 0.01, fin - 0.01, fin + 0.01, 1], { opacity: [0.45, 0.45, 1, 1, 0.45, 0.45] }, { repos: 2 })}
          >
            {`An ${r + 1}`}
          </motion.text>
        );
      })}
      {/* Le curseur : une case cerclée qui avance d'un mois à l'autre, et s'efface pour revenir au début. */}
      <motion.g {...cy(sc, [0, CURSEUR_DEBUT - 0.02, 0.88, 0.92, 1], { opacity: [0, 1, 1, 0, 0] }, { repos: 3 })}>
      <motion.rect
        x={CAL_X - 2}
        y={CAL_Y - 2}
        width={COTE + 4}
        height={COTE + 4}
        rx={4}
        className={ia ? "fill-none stroke-machine" : "fill-none stroke-attenue"}
        strokeWidth={1.6}
        {...cy(
          sc,
          TRAJET.times,
          { x: TRAJET.x, y: TRAJET.y },
          { ease: "linear" },
        )}
      />
      </motion.g>
    </>
  );
}

export function MandatCHumain() {
  return (
    <Cadre label="Un calendrier de cinq ans : la case du vote s'allume au premier mois de l'An 1, puis le curseur parcourt les quatre années suivantes sans rien allumer. Aucun autre vote avant la fin du mandat.">
      {(sc) => (
        <>
          <Calendrier sc={sc} ia={false} />
          {/* La seule case allumée : le vote de l'élection, au tout début. */}
          <motion.rect
            x={CAL_X}
            y={CAL_Y}
            width={COTE}
            height={COTE}
            rx={2.5}
            className="fill-attenue"
            style={CENTRE}
            {...cy(sc, [0, CURSEUR_DEBUT, CURSEUR_DEBUT + 0.04, 0.92, 0.97, 1], { opacity: [0, 0, 1, 1, 0, 0], scale: [0.4, 0.4, 1, 1, 0.8, 0.4] }, { repos: 3 })}
          />
          <motion.rect
            x={CAL_X}
            y={CAL_Y}
            width={COTE}
            height={COTE}
            rx={2.5}
            className="fill-none stroke-attenue"
            strokeWidth={1.2}
            style={CENTRE}
            {...cy(sc, [0, CURSEUR_DEBUT + 0.02, CURSEUR_DEBUT + 0.2, 1], { opacity: [0, 0.8, 0, 0], scale: [1, 1, 2.4, 2.4] }, { ease: "easeOut", repos: 3 })}
          />
          <motion.text
            x={CAL_X}
            y={86}
            className="fill-attenue"
            fontSize={9.5}
            fontWeight={600}
            {...cy(sc, [0, CURSEUR_DEBUT + 0.02, CURSEUR_DEBUT + 0.06, 0.92, 0.97, 1], { opacity: [0, 0, 1, 1, 0, 0] }, { repos: 3 })}
          >
            1 vote
          </motion.text>
          {/* Dès l'An 2, la mention : le temps passe, rien ne s'allume. */}
          <motion.g
            {...cy(
              sc,
              [0, passage(1, 0), passage(1, 0) + 0.05, 0.92, 0.97, 1],
              { opacity: [0, 0, 1, 1, 0, 0], x: [-4, -4, 0, 0, 0, -4] },
              { repos: 3 },
            )}
          >
            <line x1={84} y1={83} x2={124} y2={83} className="stroke-trait" strokeWidth={1.2} strokeDasharray="2 3" strokeLinecap="round" />
            <text x={CAL_X + (COLONNES - 1) * PAS + COTE} y={86} textAnchor="end" className="fill-attenue" fontSize={9.5}>
              puis aucun vote
            </text>
          </motion.g>
        </>
      )}
    </Cadre>
  );
}

/** Le nombre de cases déjà allumées par le curseur, à cet instant du cycle. */
function votesAllumes(p: number): number {
  if (p >= 0.93) return 0;
  return CASES.filter((c) => passage(c.rang, c.col) <= p).length;
}
const libelleVotes = (p: number) => pluriel(votesAllumes(p), "vote");

export function MandatCIA() {
  return (
    <Cadre label="Le même calendrier de cinq ans : à chaque mois que le curseur traverse, une case s'allume. Les votes des citoyens arrivent en flux continu, du premier au dernier jour.">
      {(sc) => (
        <>
          <Calendrier sc={sc} ia />
          {CASES.map((c) => {
            const t = passage(c.rang, c.col);
            return (
              <motion.rect
                key={c.i}
                x={c.x}
                y={c.y}
                width={COTE}
                height={COTE}
                rx={2.5}
                className="fill-machine"
                style={CENTRE}
                {...cy(
                  sc,
                  [0, t, t + 0.02, t + 0.1, 0.93, 0.98, 1],
                  { opacity: [0, 0, 1, c.intensite, c.intensite, 0, 0], scale: [0.4, 0.4, 1.12, 1, 1, 0.8, 0.4] },
                  { repos: 4 },
                )}
              />
            );
          })}
          <TexteSuivi sc={sc} calcul={libelleVotes} repos={pluriel(CASES.length, "vote")} x={CAL_X} y={86} className="fill-machine font-mono" fontSize={9.5} fontWeight={600} />
          <text x={CAL_X + (COLONNES - 1) * PAS + COTE} y={86} textAnchor="end" className="fill-machine" fontSize={9.5}>
            à tout moment
          </text>
        </>
      )}
    </Cadre>
  );
}

/* =====================================================================================
   PROGRAMME
   ===================================================================================== */

/* ---------- Programme B : une bulle de promesse qui éclate contre un contrat tamponné ---------- */

const FRAGMENTS = Array.from({ length: 7 }, (_, k) => {
  const angle = (Math.PI * 2 * k) / 7 - Math.PI / 2;
  return { dx: arrondi(Math.cos(angle) * 58), dy: arrondi(Math.sin(angle) * 40) };
});

export function ProgrammeBHumain() {
  return (
    <Cadre label="Une bulle de promesse qui gonfle puis éclate en petits éclats : une promesse de campagne, sans valeur juridique.">
      {(sc) => (
        <>
          <motion.g
            style={CENTRE}
            {...kf(sc, [0, 0.04, 0.5, 0.56, 0.9, 1], { scale: [0.35, 0.35, 1.12, 1.3, 0.35, 0.35], opacity: [0, 1, 1, 0, 0, 0] }, { repos: 2 })}
          >
            <rect x={80} y={14} width={80} height={44} rx={16} className="fill-trait stroke-attenue" strokeWidth={1.4} />
            <path d="M98 56 L92 73 L115 57 Z" className="fill-trait stroke-attenue" strokeWidth={1.4} strokeLinejoin="round" />
            <path d="M99 55.4 L116 55.4" className="stroke-trait" strokeWidth={2.4} />
            <text x={120} y={40} textAnchor="middle" className="fill-attenue" fontSize={13} fontWeight={500}>
              promis
            </text>
          </motion.g>
          {FRAGMENTS.map((f, k) => (
            <motion.circle
              key={k}
              cx={120}
              cy={36}
              r={k % 2 === 0 ? 3.2 : 2.2}
              className="fill-attenue"
              {...kf(sc, [0, 0.5, 0.56, 0.8, 1], { x: [0, 0, 0, f.dx, f.dx], y: [0, 0, 0, f.dy, f.dy], opacity: [0, 0, 1, 0, 0] }, { ease: "easeOut", repos: 0 })}
            />
          ))}
        </>
      )}
    </Cadre>
  );
}

export function ProgrammeBIA() {
  return (
    <Cadre label="Un contrat sur lequel un tampon s'abaisse et laisse l'empreinte « appliqué » : la règle publique est engagée sur chaque texte.">
      {(sc) => (
        <>
          <rect x={58} y={8} width={76} height={74} rx={7} className="fill-fond stroke-machine" strokeWidth={1.6} />
          <rect x={68} y={18} width={40} height={5} rx={2.5} className="fill-machine" opacity={0.55} />
          <rect x={68} y={30} width={56} height={4} rx={2} className="fill-attenue" opacity={0.3} />
          <rect x={68} y={39} width={50} height={4} rx={2} className="fill-attenue" opacity={0.3} />
          <rect x={68} y={48} width={54} height={4} rx={2} className="fill-attenue" opacity={0.3} />
          <g transform="rotate(-7 96 62)">
            <motion.g
              style={CENTRE}
              {...kf(sc, [0, 0.08, 0.3, 0.38, 0.6, 0.88, 1], { opacity: [0, 0, 0, 1, 1, 1, 0], scale: [1, 1, 1.25, 1, 1, 1, 1] }, { repos: 5 })}
            >
              <rect x={62} y={52} width={68} height={20} rx={4} className="fill-fond stroke-machine" strokeWidth={2} />
              <text x={96} y={66} textAnchor="middle" className="fill-machine font-mono" fontSize={10.5} fontWeight={700}>
                appliqué
              </text>
            </motion.g>
          </g>
          <motion.g
            {...kf(sc, [0, 0.08, 0.3, 0.38, 0.6, 0.88, 1], { x: [62, 62, 0, 0, 62, 62, 62], y: [-30, -30, 0, 0, -30, -30, -30] }, { repos: 5 })}
          >
            <rect x={110} y={32} width={20} height={8} rx={4} className="fill-machine" />
            <rect x={116} y={40} width={8} height={16} className="fill-machine" opacity={0.85} />
            <rect x={106} y={56} width={28} height={6} rx={2} className="fill-machine" />
          </motion.g>
        </>
      )}
    </Cadre>
  );
}

/* ---------- Programme C : des promesses qui se barrent et se brouillent, contre un code qui s'exécute ---------- */

/** Trois promesses de campagne génériques (aucune n'est attribuée à quiconque), avec la largeur estimée du texte. */
const PROMESSES_C = [
  { texte: "Baisser les impôts", largeur: 116 },
  { texte: "Créer des emplois", largeur: 112 },
  { texte: "Rénover les écoles", largeur: 120 },
] as const;
const PROMESSE_X = 44;
/** L'instant où la promesse `i` est barrée ; elle se brouille juste après. */
const barre = (i: number) => 0.1 + i * 0.24;

export function ProgrammeCHumain() {
  return (
    <Cadre label="Trois promesses de campagne lisibles, « Baisser les impôts », « Créer des emplois », « Rénover les écoles », se barrent puis se brouillent l'une après l'autre : rien ne les rend obligatoires.">
      {(sc) => (
        <>
          {PROMESSES_C.map((p, i) => {
            const y = 22 + i * 25;
            const t = barre(i);
            return (
              <g key={p.texte}>
                {/* La puce : un engagement qui pâlit. */}
                <motion.circle
                  cx={PROMESSE_X - 14}
                  cy={y - 4.5}
                  r={3}
                  className="fill-attenue"
                  {...cy(sc, [0, t, t + 0.08, 0.9, 0.97, 1], { opacity: [1, 1, 0.3, 0.3, 1, 1] }, { repos: 3 })}
                />
                {/* Le texte net, puis sa copie floue qui le remplace : le brouillage se fait en fondu. */}
                <motion.text
                  x={PROMESSE_X}
                  y={y}
                  className="fill-texte"
                  fontSize={14}
                  fontWeight={500}
                  {...cy(sc, [0, t + 0.08, t + 0.17, 0.9, 0.97, 1], { opacity: [1, 1, 0, 0, 1, 1] }, { repos: 0 })}
                >
                  {p.texte}
                </motion.text>
                <motion.text
                  x={PROMESSE_X}
                  y={y}
                  className="fill-attenue"
                  fontSize={14}
                  fontWeight={500}
                  style={{ filter: "blur(2.4px)" }}
                  aria-hidden
                  {...cy(
                    sc,
                    [0, t + 0.08, t + 0.17, 0.9, 0.97, 1],
                    { opacity: [0, 0, 0.55, 0.55, 0, 0], x: [0, 0, 3, 3, 0, 0] },
                    { repos: 0 },
                  )}
                >
                  {p.texte}
                </motion.text>
                {/* Le trait qui barre la promesse, tiré de gauche à droite. */}
                <motion.rect
                  x={PROMESSE_X - 3}
                  y={y - 5.5}
                  width={p.largeur + 6}
                  height={1.8}
                  rx={0.9}
                  className="fill-attenue"
                  style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }}
                  {...cy(
                    sc,
                    [0, t, t + 0.07, t + 0.17, 0.9, 0.95, 1],
                    { scaleX: [0, 0, 1, 1, 1, 1, 0], opacity: [1, 1, 1, 0.45, 0.45, 0, 0] },
                    { repos: 2 },
                  )}
                />
              </g>
            );
          })}
        </>
      )}
    </Cadre>
  );
}

const LIGNES_CODE = [
  { x: 14, texte: "pour chaque texte :" },
  { x: 28, texte: "appliquer(règle)" },
  { x: 28, texte: "voter(position)" },
  { x: 28, texte: "publier()" },
] as const;
const CODE_Y = 15;
const CODE_PAS = 18;
/** Les instants où le curseur arrive sur chaque ligne de code. */
const ARRIVEES = [0.04, 0.2, 0.38, 0.56] as const;
const FIN_TEXTE = 0.74;
function textesTraites(p: number, tour: number): string {
  const n = tour + (p >= FIN_TEXTE ? 1 : 0);
  return `${n} ${n > 1 ? "textes traités" : "texte traité"}`;
}

export function ProgrammeCIA() {
  // Le curseur : il reste sur une ligne le temps de l'exécuter, puis glisse à la suivante.
  const times = [0, ...ARRIVEES.flatMap((t, i) => (i === 0 ? [t + 0.12] : [t, t + 0.12])), 0.84, 0.88, 0.94, 1];
  const y = [0, 0, ...[1, 2, 3].flatMap((i) => [i * CODE_PAS, i * CODE_PAS]), 3 * CODE_PAS, 3 * CODE_PAS, 0, 0];
  const opacite = times.map((t) => (t >= 0.86 && t < 0.97 ? 0 : 1));
  return (
    <Cadre label="Quatre lignes de code public exécutées l'une après l'autre : un curseur passe sur chaque ligne, une coche s'inscrit, et le compteur de textes traités avance d'un cran à chaque tour.">
      {(sc) => (
        <>
          <motion.g {...cy(sc, times, { y, opacity: opacite }, { repos: 0 })}>
            <rect x={4} y={CODE_Y - 12} width={232} height={17} rx={5} className="fill-machine" opacity={0.1} />
            <rect x={4} y={CODE_Y - 12} width={3} height={17} rx={1.5} className="fill-machine" />
          </motion.g>
          {LIGNES_CODE.map((l, i) => {
            const ligneY = CODE_Y + i * CODE_PAS;
            const fin = ARRIVEES[i] + 0.12;
            return (
              <g key={l.texte}>
                <text x={l.x} y={ligneY} className="fill-machine font-mono" fontSize={11}>
                  {l.texte}
                </text>
                {i > 0 ? (
                  <motion.path
                    d={`M210 ${ligneY - 4} l4 4 l8 -9`}
                    className="fill-none stroke-machine"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    {...cy(sc, [0, fin - 0.04, fin, 0.86, 0.9, 1], { pathLength: [0, 0, 1, 1, 0, 0], opacity: [0, 0, 1, 1, 0, 0] }, { repos: 3 })}
                  />
                ) : null}
              </g>
            );
          })}
          <line x1={4} y1={74} x2={236} y2={74} className="stroke-trait" strokeWidth={1} />
          <motion.g
            style={CENTRE}
            {...cy(sc, [0, FIN_TEXTE, FIN_TEXTE + 0.03, FIN_TEXTE + 0.08, 1], { scale: [1, 1, 1.08, 1, 1] }, { repos: 0 })}
          >
            <circle cx={9} cy={83} r={2.6} className="fill-machine" />
            <TexteSuivi sc={sc} calcul={textesTraites} repos="1 texte traité" x={17} y={86.5} className="fill-machine font-mono" fontSize={9.5} fontWeight={600} />
          </motion.g>
          <text x={236} y={86.5} textAnchor="end" className="fill-attenue font-mono" fontSize={9}>
            code public
          </text>
        </>
      )}
    </Cadre>
  );
}

/* =====================================================================================
   DÉCISIONS
   ===================================================================================== */

/* ---------- Décisions B : une boîte noire qui se referme contre une boîte de verre qui publie ---------- */

/** Les trois temps de la ligne : un dossier entre (humain) ou une position sort (IA), au même rythme. */
const TEMPS_DECISION = [0.08, 0.3, 0.52] as const;

/** Un petit document : une feuille au coin plié, deux lignes de texte. */
function Dossier({ x, y, classe }: { x: number; y: number; classe: string }) {
  return (
    <g>
      <path d={`M${x} ${y} h11 l5 5 v15 h-16 z`} className={`${classe} stroke-attenue`} strokeWidth={1.2} strokeLinejoin="round" />
      <path d={`M${x + 11} ${y} v5 h5`} className="fill-none stroke-attenue" strokeWidth={1} strokeLinejoin="round" />
      <rect x={x + 3} y={y + 9} width={9} height={1.8} rx={0.9} className="fill-attenue" opacity={0.6} />
      <rect x={x + 3} y={y + 13} width={7} height={1.8} rx={0.9} className="fill-attenue" opacity={0.6} />
    </g>
  );
}

const BOITE = { x: 110, y: 30, l: 64, h: 42 } as const;

export function DecisionsBHumain() {
  return (
    <Cadre label="Une boîte noire : trois dossiers y entrent l'un après l'autre, le couvercle se referme et rien n'en sort. Le délibéré n'est pas public.">
      {(sc) => (
        <>
          {/* Les dossiers attendent en pile, puis sautent un à un dans la boîte ouverte. */}
          {TEMPS_DECISION.map((t, i) => {
            const x = 14 + i * 4;
            const y = 40 - i * 4;
            const dx = BOITE.x + BOITE.l / 2 - 8 - x;
            const dy = BOITE.y + 10 - y;
            return (
              <motion.g
                key={t}
                {...cy(
                  sc,
                  [0, t, t + 0.07, t + 0.13, t + 0.14, 0.92, 0.98, 1],
                  {
                    x: [0, 0, dx * 0.55, dx, dx, 0, 0, 0],
                    y: [0, 0, -30 + (dy * 0.2), dy, dy, 0, 0, 0],
                    opacity: [1, 1, 1, 1, 0, 0, 1, 1],
                  },
                  { repos: 4 },
                )}
              >
                <Dossier x={x} y={y} classe="fill-fond" />
              </motion.g>
            );
          }).reverse()}
          {/* La boîte : son corps, puis son couvercle, ouvert, qui se rabat après le dernier dossier. */}
          <motion.g style={CENTRE} {...cy(sc, [0, 0.72, 0.745, 0.78, 1], { y: [0, 0, 1.5, 0, 0] }, { repos: 0 })}>
            <rect x={BOITE.x} y={BOITE.y} width={BOITE.l} height={BOITE.h} rx={6} className="fill-attenue" />
            <motion.text
              x={BOITE.x + BOITE.l / 2}
              y={BOITE.y + 30}
              textAnchor="middle"
              className="fill-fond"
              fontSize={22}
              fontWeight={600}
              {...cy(sc, [0, 0.74, 0.79, 0.92, 0.96, 1], { opacity: [0, 0, 1, 1, 0, 0] }, { repos: 3 })}
            >
              ?
            </motion.text>
          </motion.g>
          <motion.rect
            x={BOITE.x - 3}
            y={BOITE.y - 6}
            width={BOITE.l + 6}
            height={6}
            rx={2.5}
            className="fill-attenue"
            style={{ transformBox: "fill-box", transformOrigin: "100% 100%" }}
            {...cy(sc, [0, 0.66, 0.73, 0.93, 0.99, 1], { rotate: [38, 38, 0, 0, 38, 38] }, { repos: 3 })}
          />
          {/* La sortie attendue reste vide. */}
          <path d={`M${BOITE.x + BOITE.l + 8} 51 h16`} className="fill-none stroke-trait" strokeWidth={1.4} strokeDasharray="2 3" strokeLinecap="round" />
          <path d={`M${BOITE.x + BOITE.l + 21} 47 l4 4 l-4 4`} className="fill-none stroke-trait" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
          <rect x={206} y={41} width={18} height={21} rx={2.5} className="fill-none stroke-trait" strokeWidth={1.2} strokeDasharray="2.5 2.5" />
          <motion.text
            x={BOITE.x + BOITE.l / 2}
            y={87}
            textAnchor="middle"
            className="fill-attenue"
            fontSize={9.5}
            {...cy(sc, [0, 0.76, 0.82, 0.92, 0.96, 1], { opacity: [0, 0, 1, 1, 0, 0], y: [3, 3, 0, 0, 0, 3] }, { repos: 3 })}
          >
            délibéré non public
          </motion.text>
        </>
      )}
    </Cadre>
  );
}

const REGISTRE = [
  { heure: "09:14", avis: "pour" },
  { heure: "09:31", avis: "contre" },
  { heure: "10:02", avis: "pour" },
] as const;
const VERRE = { x: 6, y: 16, l: 78, h: 58 } as const;
const REGISTRE_X = 100;
const ETAPES_VERRE = [44, 58, 72] as const;

/** Les pulsations d'une étape de la boîte de verre : elle s'allume brièvement pour chaque position traitée. */
function pulsations(decalage: number) {
  const times: number[] = [0];
  const opacity: number[] = [0.25];
  for (const t of TEMPS_DECISION) {
    const a = t + decalage;
    times.push(a, a + 0.025, a + 0.11);
    opacity.push(0.25, 1, 0.25);
  }
  times.push(1);
  opacity.push(0.25);
  return { times, opacity };
}

export function DecisionsBIA() {
  return (
    <Cadre label="Une boîte de verre : on voit le dossier à l'intérieur et chaque étape s'allumer, puis chaque position en sort et s'inscrit, horodatée, dans un registre public.">
      {(sc) => (
        <>
          {/* La boîte de verre : on voit le dossier et les étapes qui s'allument. */}
          <rect x={VERRE.x} y={VERRE.y} width={VERRE.l} height={VERRE.h} rx={8} className="fill-machine stroke-machine" fillOpacity={0.06} strokeWidth={1.6} />
          <path d="M16 30 h11 l5 5 v15 h-16 z" className="fill-fond stroke-machine" strokeWidth={1.2} strokeLinejoin="round" />
          <rect x={19} y={39} width={9} height={1.8} rx={0.9} className="fill-machine" opacity={0.5} />
          <rect x={19} y={43} width={7} height={1.8} rx={0.9} className="fill-machine" opacity={0.5} />
          {ETAPES_VERRE.map((x, k) => {
            const { times, opacity } = pulsations(k * 0.035);
            return (
              <g key={x}>
                <circle cx={x} cy={40} r={4.2} className="fill-none stroke-machine" strokeWidth={1} opacity={0.35} />
                <motion.circle cx={x} cy={40} r={4.2} className="fill-machine" {...cy(sc, times, { opacity }, { ease: "easeOut", repos: 2 })} />
              </g>
            );
          })}
          <text x={VERRE.x + VERRE.l / 2} y={64} textAnchor="middle" className="fill-machine font-mono" fontSize={8.5} opacity={0.8}>
            règle · vote
          </text>
          {/* Le registre public, où chaque position s'empile avec son heure. */}
          <text x={REGISTRE_X} y={10} className="fill-machine" fontSize={9} fontWeight={600}>
            Registre public
          </text>
          {REGISTRE.map((r, i) => {
            const y = 18 + i * 22;
            const t = TEMPS_DECISION[i] + 0.11;
            return (
              <g key={r.heure}>
                <rect x={REGISTRE_X} y={y} width={136} height={17} rx={8.5} className="fill-none stroke-trait" strokeWidth={1} strokeDasharray="2 3" />
                <motion.g
                  {...cy(
                    sc,
                    [0, t, t + 0.09, 0.9, 0.96, 1],
                    { x: [-58, -58, 0, 0, 0, -58], opacity: [0, 0, 1, 1, 0, 0], scale: [0.8, 0.8, 1, 1, 1, 0.8] },
                    { repos: 3 },
                  )}
                  style={CENTRE}
                >
                  <rect x={REGISTRE_X} y={y} width={136} height={17} rx={8.5} className="fill-fond stroke-machine" strokeWidth={1.2} />
                  <circle cx={REGISTRE_X + 10} cy={y + 8.5} r={3.2} className="fill-machine" />
                  <text x={REGISTRE_X + 19} y={y + 12} className="fill-attenue font-mono" fontSize={9.5}>
                    {r.heure}
                  </text>
                  <text x={REGISTRE_X + 52} y={y + 12} className="fill-machine font-mono" fontSize={9.5} fontWeight={600}>
                    {r.avis}
                  </text>
                  <text x={REGISTRE_X + 128} y={y + 12} textAnchor="end" className="fill-machine font-mono" fontSize={8.5} opacity={0.8}>
                    publié
                  </text>
                </motion.g>
              </g>
            );
          })}
        </>
      )}
    </Cadre>
  );
}

/* ---------- Décisions C : un mur contre un flux de positions horodatées ---------- */

const TETES_C = [84, 108, 132, 156] as const;

function ligneDeBriques(rang: number) {
  return rang % 2 === 0
    ? [
        { x: 66, l: 26 },
        { x: 93, l: 26 },
        { x: 120, l: 26 },
        { x: 147, l: 26 },
      ]
    : [
        { x: 66, l: 13 },
        { x: 80, l: 26 },
        { x: 107, l: 26 },
        { x: 134, l: 26 },
        { x: 161, l: 13 },
      ];
}

export function DecisionsCHumain() {
  return (
    <Cadre label="Des participants autour d'une table, puis un mur qui se monte brique après brique devant eux : le Conseil des ministres délibère à huis clos.">
      {(sc) => (
        <>
          {TETES_C.map((x) => (
            <g key={x} opacity={0.65}>
              <circle cx={x} cy={32} r={5} className="fill-attenue" />
              <path d={`M${x - 8} 50 a8 8 0 0 1 16 0 z`} className="fill-attenue" />
            </g>
          ))}
          <rect x={68} y={50} width={104} height={5} rx={2.5} className="fill-attenue" />
          <line x1={80} y1={55} x2={80} y2={72} className="stroke-attenue" strokeWidth={2} strokeLinecap="round" />
          <line x1={160} y1={55} x2={160} y2={72} className="stroke-attenue" strokeWidth={2} strokeLinecap="round" />
          {[4, 3, 2, 1, 0].map((rang, ordre) => {
            const t0 = 0.08 + ordre * 0.11;
            return (
              <motion.g
                key={rang}
                {...kf(sc, [0, t0, t0 + 0.07, 0.9, 1], { y: [10, 10, 0, 0, 10], opacity: [0, 0, 1, 1, 0] }, { repos: 3 })}
              >
                {ligneDeBriques(rang).map((b) => (
                  <rect key={b.x} x={b.x} y={16 + rang * 11} width={b.l - 1.5} height={10} rx={1.5} className="fill-trait stroke-attenue" strokeWidth={0.8} />
                ))}
              </motion.g>
            );
          })}
        </>
      )}
    </Cadre>
  );
}

const POSITIONS_HORODATEES = [
  { heure: "09:14", avis: "pour" },
  { heure: "09:31", avis: "contre" },
  { heure: "10:02", avis: "pour" },
  { heure: "10:47", avis: "pour" },
  { heure: "11:05", avis: "contre" },
] as const;
const HAUTEUR_LIGNE = 22;

export function DecisionsCIA() {
  const id = useIdSvg();
  const liste = [...POSITIONS_HORODATEES, ...POSITIONS_HORODATEES];
  return (
    <Cadre label="Un flux de positions qui défilent, chacune avec son heure et la mention « publié » : chaque position est publiée et vérifiable.">
      {(sc) => (
        <>
          <clipPath id={`${id}-vue`}>
            <rect x={0} y={0} width={240} height={90} />
          </clipPath>
          <linearGradient id={`${id}-fondu`} x1={0} y1={0} x2={0} y2={1}>
            <stop offset="0" style={{ stopColor: "var(--fond)" }} />
            <stop offset="1" style={{ stopColor: "var(--fond)", stopOpacity: 0 }} />
          </linearGradient>
          <g clipPath={`url(#${id}-vue)`}>
            <motion.g
              {...kf(sc, [0, 1], { y: [0, -HAUTEUR_LIGNE * POSITIONS_HORODATEES.length] }, { ease: "linear", duree: 12 })}
            >
              {liste.map((p, i) => {
                const y = 11 + i * HAUTEUR_LIGNE;
                return (
                  <g key={i}>
                    <rect x={6} y={y - 9} width={228} height={18} rx={9} className="fill-none stroke-machine" strokeWidth={1} opacity={0.3} />
                    <circle cx={18} cy={y} r={4} className="fill-machine" />
                    <text x={30} y={y + 3.6} className="fill-attenue font-mono" fontSize={10.5}>
                      {p.heure}
                    </text>
                    <text x={76} y={y + 3.6} className="fill-machine font-mono" fontSize={10.5} fontWeight={600}>
                      {p.avis}
                    </text>
                    <text x={224} y={y + 3.4} textAnchor="end" className="fill-machine font-mono" fontSize={9} opacity={0.8}>
                      publié
                    </text>
                  </g>
                );
              })}
            </motion.g>
            <rect x={0} y={0} width={240} height={16} fill={`url(#${id}-fondu)`} />
            <rect x={0} y={90} width={240} height={16} fill={`url(#${id}-fondu)`} transform="rotate(180 120 90)" />
          </g>
        </>
      )}
    </Cadre>
  );
}

/* =====================================================================================
   FACE À L'ASSEMBLÉE
   ===================================================================================== */

/* ---------- Assemblée B : une vague grise qui éteint l'hémicycle contre un compteur de votes ---------- */

const SIEGES_B_HUMAIN = sieges(120, 80, [
  { rayon: 24, nombre: 8 },
  { rayon: 35, nombre: 12 },
  { rayon: 46, nombre: 16 },
  { rayon: 57, nombre: 20 },
  { rayon: 68, nombre: 24 },
]);
/** La vague traverse l'hémicycle de gauche à droite entre ces deux instants du cycle. */
const VAGUE_DEBUT = 0.14;
const VAGUE_FIN = 0.46;
const VAGUE_X0 = 30;
const VAGUE_X1 = 214;
const LARGEUR_VAGUE = 34;
/** L'instant où le front de la vague atteint l'abscisse x. */
const instantVague = (x: number) => VAGUE_DEBUT + ((VAGUE_FIN - VAGUE_DEBUT) * (x - VAGUE_X0)) / (VAGUE_X1 - VAGUE_X0);

export function AssembleeBHumain() {
  const id = useIdSvg();
  return (
    <Cadre label="Un hémicycle allumé, puis une vague grise le balaie de gauche à droite et éteint chaque siège : l'Assemblée est dissoute. Les sièges ne se rallument que lentement, après de nouvelles élections.">
      {(sc) => (
        <>
          <clipPath id={`${id}-hemi`}>
            <path d="M44 84 A76 76 0 0 1 196 84 Z" />
          </clipPath>
          <linearGradient id={`${id}-vague`} x1={0} y1={0} x2={1} y2={0}>
            <stop offset="0" style={{ stopColor: "var(--attenue)", stopOpacity: 0 }} />
            <stop offset="0.85" style={{ stopColor: "var(--attenue)", stopOpacity: 0.28 }} />
            <stop offset="1" style={{ stopColor: "var(--attenue)", stopOpacity: 0.55 }} />
          </linearGradient>
          {SIEGES_B_HUMAIN.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={3} className="fill-none stroke-trait" strokeWidth={1} />
          ))}
          {SIEGES_B_HUMAIN.map((s, i) => {
            const eteint = instantVague(s.x);
            // Le rallumage, lent et dans le désordre : un siège après l'autre, sur près d'un tiers du cycle.
            const rallume = 0.6 + (0.24 * ((i * 29) % SIEGES_B_HUMAIN.length)) / (SIEGES_B_HUMAIN.length - 1);
            return (
              <motion.circle
                key={i}
                cx={s.x}
                cy={s.y}
                r={3}
                className="fill-attenue"
                style={CENTRE}
                {...cy(
                  sc,
                  [0, eteint, eteint + 0.03, rallume, rallume + 0.12, 1],
                  { opacity: [1, 1, 0, 0, 1, 1], scale: [1, 1, 0.5, 0.5, 1, 1] },
                  { repos: 3 },
                )}
              />
            );
          })}
          <g clipPath={`url(#${id}-hemi)`}>
            <motion.g
              {...cy(
                sc,
                [0, VAGUE_DEBUT - 0.02, VAGUE_FIN, VAGUE_FIN + 0.05, 1],
                { x: [0, 0, VAGUE_X1 - VAGUE_X0, VAGUE_X1 - VAGUE_X0, 0], opacity: [0, 1, 1, 0, 0] },
                { ease: "linear", repos: 0 },
              )}
            >
              <rect x={VAGUE_X0 - LARGEUR_VAGUE} y={0} width={LARGEUR_VAGUE} height={90} fill={`url(#${id}-vague)`} />
              <rect x={VAGUE_X0 - 2} y={0} width={2} height={90} className="fill-attenue" opacity={0.6} />
            </motion.g>
          </g>
          <motion.text
            x={120}
            y={81}
            textAnchor="middle"
            className="fill-attenue"
            fontSize={9.5}
            fontWeight={600}
            {...cy(sc, [0, VAGUE_FIN, VAGUE_FIN + 0.05, 0.72, 0.8, 1], { opacity: [0, 0, 1, 1, 0, 0] }, { repos: 2 })}
          >
            dissoute
          </motion.text>
        </>
      )}
    </Cadre>
  );
}

const SIEGES_B_IA_BRUTS = sieges(70, 80, [
  { rayon: 18, nombre: 6 },
  { rayon: 29, nombre: 10 },
  { rayon: 40, nombre: 14 },
  { rayon: 51, nombre: 18 },
  { rayon: 62, nombre: 22 },
]);
const SIEGES_B_IA = SIEGES_B_IA_BRUTS.map((s, i) => ({
  ...s,
  /** Environ trois sièges sur dix votent contre : le résultat se lit, il n'est pas unanime. */
  pour: (i * 7) % 10 >= 3,
  /** L'instant du vote de ce siège, de la gauche vers la droite. */
  t: 0.08 + (0.58 * i) / (SIEGES_B_IA_BRUTS.length - 1),
}));
const POUR_B = SIEGES_B_IA.filter((s) => s.pour).length;
const RESULTAT = 0.7;
const FIN_VOTE = 0.92;

function votesPour(p: number): string {
  if (p >= FIN_VOTE + 0.02) return "0";
  return String(SIEGES_B_IA.filter((s) => s.pour && s.t <= p).length);
}
const numeroTexte = (_p: number, tour: number) => `texte n° ${tour + 1}`;

export function AssembleeBIA() {
  return (
    <Cadre label="Un hémicycle dont les sièges votent un à un, de gauche à droite : le compteur additionne les votes pour, s'arrête sur le résultat, le texte est adopté, puis le vote du texte suivant commence.">
      {(sc) => (
        <>
          {SIEGES_B_IA.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={3} className="fill-none stroke-trait" strokeWidth={1} />
          ))}
          {SIEGES_B_IA.map((s, i) => (
            <motion.circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={3}
              className={s.pour ? "fill-machine" : "fill-abstention"}
              style={CENTRE}
              {...cy(
                sc,
                [0, s.t, s.t + 0.015, s.t + 0.05, FIN_VOTE, FIN_VOTE + 0.05, 1],
                { opacity: [0, 0, 1, 1, 1, 0, 0], scale: [0.3, 0.3, 1.35, 1, 1, 0.6, 0.3] },
                { repos: 4 },
              )}
            />
          ))}
          <TexteSuivi sc={sc} calcul={numeroTexte} repos="texte n° 1" x={186} y={18} textAnchor="middle" className="fill-attenue font-mono" fontSize={9} />
          <TexteSuivi
            sc={sc}
            calcul={votesPour}
            repos={String(POUR_B)}
            x={186}
            y={50}
            textAnchor="middle"
            className="fill-machine font-mono tabular-nums"
            fontSize={30}
            fontWeight={600}
          />
          <text x={186} y={63} textAnchor="middle" className="fill-attenue" fontSize={9.5}>
            votes pour
          </text>
          <motion.g
            style={CENTRE}
            {...cy(sc, [0, RESULTAT, RESULTAT + 0.04, FIN_VOTE, FIN_VOTE + 0.04, 1], { opacity: [0, 0, 1, 1, 0, 0], scale: [0.7, 0.7, 1, 1, 0.9, 0.7] }, { repos: 3 })}
          >
            <rect x={158} y={71} width={56} height={16} rx={8} className="fill-machine" />
            <path d="M168 79 l2.6 2.6 l4.6 -5.2" className="fill-none stroke-fond" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            <text x={179} y={82.4} className="fill-fond" fontSize={9.5} fontWeight={600}>
              adopté
            </text>
          </motion.g>
        </>
      )}
    </Cadre>
  );
}

/* ---------- Assemblée C : un bouton rouge contre un métronome ---------- */

const SIEGES_C_HUMAIN = sieges(184, 76, [
  { rayon: 14, nombre: 6 },
  { rayon: 25, nombre: 10 },
  { rayon: 36, nombre: 14 },
]);

export function AssembleeCHumain() {
  return (
    <Cadre label="Un bouton rouge « Dissoudre » que l'on presse : d'un geste, l'hémicycle se vide. Le président peut dissoudre l'Assemblée.">
      {(sc) => (
        <>
          <rect x={22} y={62} width={116} height={9} rx={4.5} className="fill-trait" />
          <motion.g {...kf(sc, [0, 0.12, 0.3, 0.36, 0.5, 1], { y: [0, 0, 0, 5, 0, 0] }, { repos: 0 })}>
            <rect x={32} y={32} width={96} height={30} rx={15} className="fill-contre" />
            <text x={80} y={52} textAnchor="middle" className="fill-fond" fontSize={13} fontWeight={600}>
              Dissoudre
            </text>
          </motion.g>
          <motion.path
            d="M0 0 L0 17 L4.6 12.6 L8 20 L10.8 18.8 L7.4 11.6 L13.6 11.2 Z"
            className="fill-attenue stroke-fond"
            strokeWidth={1.2}
            strokeLinejoin="round"
            {...kf(sc, [0, 0.12, 0.3, 0.38, 0.55, 1], { x: [86, 86, 86, 86, 86, 86], y: [-4, -4, 30, 35, -4, -4], opacity: [0, 1, 1, 1, 0, 0] }, { repos: 0 })}
          />
          {SIEGES_C_HUMAIN.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={3} className="fill-none stroke-trait" strokeWidth={1} />
          ))}
          <motion.g {...kf(sc, [0, 0.36, 0.42, 0.9, 1], { opacity: [1, 1, 0, 0, 1] }, { ease: "linear", repos: 2 })}>
            {SIEGES_C_HUMAIN.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={3} className="fill-attenue" />
            ))}
          </motion.g>
        </>
      )}
    </Cadre>
  );
}

const BATTUES = [0, 0.0625, 0.1875, 0.3125, 0.4375, 0.5625, 0.6875, 0.8125, 0.9375, 1] as const;
const BALANCIER = [0, 24, -24, 24, -24, 24, -24, 24, -24, 0] as const;
const TEXTES = [0.1875, 0.3125, 0.4375, 0.5625, 0.6875] as const;

export function AssembleeCIA() {
  return (
    <Cadre label="Un métronome qui bat la mesure et fait avancer les textes un par un : chaque texte est voté à son tour, sans que l'Assemblée soit dissoute.">
      {(sc) => (
        <>
          <path d="M44 82 L76 82 L67 14 L53 14 Z" className="fill-machine stroke-machine" fillOpacity={0.05} strokeWidth={1.6} strokeLinejoin="round" />
          <motion.g
            style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
            {...kf(sc, BATTUES, { rotate: BALANCIER }, { repos: 0 })}
          >
            <rect x={58.5} y={10} width={3} height={66} rx={1.5} className="fill-machine" />
            <rect x={54} y={24} width={12} height={9} rx={2.5} className="fill-machine" />
          </motion.g>
          <circle cx={60} cy={76} r={4} className="fill-machine" />
          {TEXTES.map((t, k) => {
            const x = 100 + k * 27;
            return (
              <g key={t}>
                <rect x={x} y={24} width={21} height={42} rx={5} className="fill-none stroke-trait" strokeWidth={1.4} />
                <rect x={x + 5} y={31} width={11} height={3} rx={1.5} className="fill-attenue" opacity={0.35} />
                <rect x={x + 5} y={37} width={8} height={3} rx={1.5} className="fill-attenue" opacity={0.35} />
                <motion.g {...kf(sc, [0, t - 0.015, t + 0.015, 0.9, 1], { opacity: [0, 0, 1, 1, 0] }, { repos: 3 })}>
                  <rect x={x} y={24} width={21} height={42} rx={5} className="fill-machine stroke-machine" fillOpacity={0.09} strokeWidth={1.6} />
                  <path d={`M${x + 5.5} 55 l4 4 l6 -7.5`} className="fill-none stroke-machine" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </motion.g>
              </g>
            );
          })}
        </>
      )}
    </Cadre>
  );
}

/* =====================================================================================
   LE CATALOGUE : quatre lignes, trois variantes chacune
   ===================================================================================== */

type SchemaComposant = () => React.ReactNode;
export type Variante = { lettre: "A" | "B" | "C"; nom: string; humain: SchemaComposant; ia: SchemaComposant };
export type Ligne = {
  id: "mandat" | "programme" | "decisions" | "assemblee";
  titre: string;
  humain: string;
  ia: string;
  variantes: readonly Variante[];
};

export const LIGNES_COMPARATIF: readonly Ligne[] = [
  {
    id: "mandat",
    titre: "Mandat",
    humain: "Élu pour cinq ans, sans retour devant les électeurs avant la fin.",
    ia: "Réglée à chaque vote des citoyens, à tout moment.",
    variantes: [
      { lettre: "A", nom: "Frise de cinq ans", ...SCHEMAS.mandat },
      { lettre: "B", nom: "Sablier et jauge", humain: MandatBHumain, ia: MandatBIA },
      { lettre: "C", nom: "Calendrier", humain: MandatCHumain, ia: MandatCIA },
    ],
  },
  {
    id: "programme",
    titre: "Programme",
    humain: "Des promesses de campagne, sans aucune valeur juridique.",
    ia: "Une règle publique, appliquée à chaque texte.",
    variantes: [
      { lettre: "A", nom: "Promesses barrées, règle", ...SCHEMAS.programme },
      { lettre: "B", nom: "Bulle et tampon", humain: ProgrammeBHumain, ia: ProgrammeBIA },
      { lettre: "C", nom: "Texte flou, code", humain: ProgrammeCHumain, ia: ProgrammeCIA },
    ],
  },
  {
    id: "decisions",
    titre: "Décisions",
    humain: "Prises en Conseil des ministres, dont les délibérations ne sont pas publiques.",
    ia: "Chaque position publiée et vérifiable.",
    variantes: [
      { lettre: "A", nom: "Rideau et registre", ...SCHEMAS.decisions },
      { lettre: "B", nom: "Boîte noire, boîte de verre", humain: DecisionsBHumain, ia: DecisionsBIA },
      { lettre: "C", nom: "Mur et flux horodaté", humain: DecisionsCHumain, ia: DecisionsCIA },
    ],
  },
  {
    id: "assemblee",
    titre: "Face à l'Assemblée",
    humain: "Peut la dissoudre (article 12 de la Constitution).",
    ia: "Ne dissout rien : elle vote, texte par texte.",
    variantes: [
      { lettre: "A", nom: "Sièges éteints, allumés", ...SCHEMAS.assemblee },
      { lettre: "B", nom: "Vague et compteur", humain: AssembleeBHumain, ia: AssembleeBIA },
      { lettre: "C", nom: "Bouton et métronome", humain: AssembleeCHumain, ia: AssembleeCIA },
    ],
  },
];
