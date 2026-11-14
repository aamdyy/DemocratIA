"use client";

import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Transition } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

import { SCHEMAS } from "@/app/(app)/accueils/_composants/schemas";

/**
 * Propositions de schémas animés pour la section « Ce qu'un humain promet, une IA le tient. ».
 * Pour chaque ligne : A = le schéma actuel, B et C = deux idées nouvelles, en SVG de 240 × 90.
 * Chaque schéma démarre à son entrée à l'écran, boucle doucement, et se fige sur un état parlant
 * si l'utilisateur a demandé moins d'animations. Humain en gris, IA en --machine.
 */

const DUREE = 9;

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
      : { duration: duree, times: [...times], repeat: Infinity, ease }) as Transition,
  };
}

/** Le cadre commun : SVG accessible, déclenché une fois à l'entrée à l'écran. */
function Cadre({ label, children }: { label: string; children: (sc: Scene) => React.ReactNode }) {
  const ref = useRef<SVGSVGElement>(null);
  const vu = useInView(ref, { once: true, amount: 0.5 });
  const reduit = useReducedMotion() ?? false;
  const sc: Scene = { joue: vu && !reduit, reduit };
  return (
    <svg
      ref={ref}
      viewBox="0 0 240 90"
      role="img"
      aria-label={label}
      className="block h-auto w-full max-w-[240px] overflow-visible"
    >
      {children(sc)}
    </svg>
  );
}

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
const PAS = 15;
const CAL_X = 30;
const CAL_Y = 9;
const CASES = Array.from({ length: COLONNES * LIGNES }, (_, i) => ({
  i,
  x: CAL_X + (i % COLONNES) * PAS,
  y: CAL_Y + Math.floor(i / COLONNES) * PAS,
  /** Un ordre d'allumage qui paraît aléatoire mais ne change jamais (37 est premier avec 60). */
  ordre: (i * 37) % (COLONNES * LIGNES),
}));

function Calendrier({ ia }: { ia: boolean }) {
  return (
    <>
      {CASES.map((c) => (
        <rect key={c.i} x={c.x} y={c.y} width={11} height={11} rx={2.5} className="fill-none stroke-trait" strokeWidth={1} />
      ))}
      {Array.from({ length: LIGNES }, (_, r) => (
        <text
          key={r}
          x={CAL_X - 5}
          y={CAL_Y + r * PAS + 9}
          textAnchor="end"
          className={ia ? "fill-machine" : "fill-attenue"}
          fontSize={8}
          opacity={0.8}
        >
          {`An ${r + 1}`}
        </text>
      ))}
    </>
  );
}

export function MandatCHumain() {
  return (
    <Cadre label="Un calendrier de cinq ans, soixante mois : une seule case s'allume, celle du vote au tout début, puis le temps passe sans aucun autre vote.">
      {(sc) => (
        <>
          <Calendrier ia={false} />
          <motion.rect
            x={CAL_X - 2}
            y={CAL_Y - 2}
            width={COLONNES * PAS - 1}
            height={PAS}
            rx={4}
            className="fill-attenue"
            opacity={0.12}
            {...kf(sc, [0, 0.05, 0.85, 0.92, 1], { y: [0, 0, PAS * 4, PAS * 4, 0] }, { ease: "linear", repos: 0 })}
          />
          <rect x={CAL_X} y={CAL_Y} width={11} height={11} rx={2.5} className="fill-attenue" />
          {sc.joue ? (
            <motion.rect
              x={CAL_X}
              y={CAL_Y}
              width={11}
              height={11}
              rx={2.5}
              className="fill-none stroke-attenue"
              strokeWidth={1.2}
              style={CENTRE}
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            />
          ) : null}
        </>
      )}
    </Cadre>
  );
}

export function MandatCIA() {
  return (
    <Cadre label="Le même calendrier de cinq ans : les cases s'allument en flux, partout et sans arrêt, au rythme des votes des citoyens.">
      {(sc) => (
        <>
          <Calendrier ia />
          {CASES.map((c) => {
            const t0 = 0.04 + (0.72 * c.ordre) / (CASES.length - 1);
            return (
              <motion.rect
                key={c.i}
                x={c.x}
                y={c.y}
                width={11}
                height={11}
                rx={2.5}
                className="fill-machine"
                {...kf(sc, [0, t0, t0 + 0.03, t0 + 0.16, 1], { opacity: [0, 0, 1, 0.55, 0] }, { repos: 3 })}
              />
            );
          })}
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

/* ---------- Programme C : un texte qui se brouille contre un code qui s'exécute ---------- */

export function ProgrammeCHumain() {
  return (
    <Cadre label="Un paragraphe de promesses qui se brouille peu à peu jusqu'à devenir illisible : ce qui est promis n'engage à rien.">
      {(sc) => (
        <>
          {[
            { y: 28, texte: "Je m'engage à", dx: -3 },
            { y: 52, texte: "tout changer,", dx: 4 },
            { y: 76, texte: "dès demain.", dx: -2 },
          ].map((l, i) => (
            <motion.text
              key={l.texte}
              x={120}
              y={l.y}
              textAnchor="middle"
              className="fill-attenue"
              fontSize={17}
              fontWeight={500}
              {...kf(
                sc,
                [0, 0.12 + i * 0.08, 0.4 + i * 0.08, 0.88, 1],
                { filter: ["blur(0px)", "blur(0px)", "blur(4px)", "blur(4px)", "blur(0px)"], opacity: [1, 1, 0.4, 0.4, 1], x: [0, 0, l.dx, l.dx, 0] },
                { repos: 2 },
              )}
            >
              {l.texte}
            </motion.text>
          ))}
        </>
      )}
    </Cadre>
  );
}

const LIGNES_CODE = [
  { x: 18, texte: "pour chaque texte :" },
  { x: 34, texte: "appliquer(règle)" },
  { x: 34, texte: "voter(position)" },
  { x: 34, texte: "publier()" },
] as const;

export function ProgrammeCIA() {
  return (
    <Cadre label="Quatre lignes de code public exécutées l'une après l'autre : la règle est appliquée à chaque texte, ligne à ligne.">
      {(sc) => (
        <>
          {LIGNES_CODE.map((l, i) => {
            const y = 22 + i * 21;
            const t0 = 0.08 + i * 0.19;
            return (
              <g key={l.texte}>
                <motion.g {...kf(sc, [0, t0, t0 + 0.03, t0 + 0.16, t0 + 0.19, 1], { opacity: [0, 0, 1, 1, 0, 0] }, { repos: 0 })}>
                  <rect x={6} y={y - 14} width={228} height={20} rx={5} className="fill-machine" opacity={0.1} />
                  <rect x={6} y={y - 14} width={3} height={20} rx={1.5} className="fill-machine" />
                </motion.g>
                <text x={l.x} y={y} className="fill-machine font-mono" fontSize={11.5}>
                  {l.texte}
                </text>
                {i > 0 ? (
                  <motion.path
                    d={`M212 ${y - 3} l4 4 l8 -9`}
                    className="fill-none stroke-machine"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    {...kf(sc, [0, t0 + 0.06, t0 + 0.1, 0.9, 1], { pathLength: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 1, 0] }, { repos: 3 })}
                  />
                ) : null}
              </g>
            );
          })}
        </>
      )}
    </Cadre>
  );
}

/* =====================================================================================
   DÉCISIONS
   ===================================================================================== */

/* ---------- Décisions B : une boîte noire contre une boîte de verre ---------- */

export function DecisionsBHumain() {
  return (
    <Cadre label="Une boîte noire : des dossiers y entrent, des décisions en sortent, et rien de ce qui s'y passe n'est visible.">
      {(sc) => (
        <>
          {[0, 1, 2].map((i) => {
            const t0 = 0.06 + i * 0.2;
            const t1 = t0 + 0.2;
            return (
              <g key={i}>
                <motion.circle
                  cx={14}
                  cy={45}
                  r={5}
                  className="fill-attenue"
                  {...kf(sc, [0, t0, t0 + 0.02, t0 + 0.12, t0 + 0.13, 1], { x: [0, 0, 0, 74, 74, 0], opacity: [0, 0, 1, 1, 0, 0] }, { repos: 0 })}
                />
                <motion.circle
                  cx={152}
                  cy={45}
                  r={4.6}
                  className="fill-fond stroke-attenue"
                  strokeWidth={1.6}
                  {...kf(sc, [0, t1, t1 + 0.02, t1 + 0.12, t1 + 0.16, 1], { x: [0, 0, 0, 62, 62, 0], opacity: [0, 0, 1, 1, 0, 0] }, { repos: 0 })}
                />
              </g>
            );
          })}
          <rect x={88} y={16} width={64} height={58} rx={9} className="fill-attenue" />
          <rect x={88} y={16} width={64} height={58} rx={9} className="fill-none stroke-fond" strokeWidth={1} opacity={0.25} />
          <text x={120} y={56} textAnchor="middle" className="fill-fond" fontSize={30} fontWeight={600}>
            ?
          </text>
        </>
      )}
    </Cadre>
  );
}

const PASTILLES = [96, 120, 144] as const;
const instantAuPassage = (x: number) => 0.05 + (0.8 * (x - 14)) / 198;

export function DecisionsBIA() {
  return (
    <Cadre label="Une boîte de verre : le dossier traverse, et chaque étape s'allume en pastille visible à l'intérieur. Tout est publié et vérifiable.">
      {(sc) => (
        <>
          <rect x={80} y={10} width={80} height={70} rx={9} className="fill-machine stroke-machine" fillOpacity={0.06} strokeWidth={1.6} />
          <line x1={80} y1={62} x2={160} y2={62} className="stroke-machine" strokeWidth={1} opacity={0.2} strokeDasharray="2 3" />
          {PASTILLES.map((x) => {
            const t = instantAuPassage(x);
            return (
              <g key={x}>
                <circle cx={x} cy={32} r={7.5} className="fill-none stroke-machine" strokeWidth={1.2} opacity={0.35} />
                <motion.g
                  style={CENTRE}
                  {...kf(sc, [0, t - 0.03, t, t + 0.05, 0.9, 1], { opacity: [0.25, 0.25, 1, 1, 1, 0.25], scale: [1, 1, 1.25, 1, 1, 1] }, { repos: 4 })}
                >
                  <circle cx={x} cy={32} r={7.5} className="fill-machine" />
                  <path d={`M${x - 3.2} 32 l2.6 2.8 l4.2 -5.2`} className="fill-none stroke-fond" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                </motion.g>
              </g>
            );
          })}
          <motion.circle
            cx={14}
            cy={62}
            r={5}
            className="fill-machine"
            {...kf(sc, [0, 0.05, 0.85, 0.9, 1], { x: [0, 0, 198, 198, 0], opacity: [0, 1, 1, 0, 0] }, { ease: "linear", repos: 0 })}
          />
          <text x={226} y={20} textAnchor="end" className="fill-machine font-mono" fontSize={9}>
            publié
          </text>
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

/* ---------- Assemblée B : une vague grise d'un coup contre un compteur de votes ---------- */

const SIEGES_B_HUMAIN = sieges(120, 82, [
  { rayon: 22, nombre: 8 },
  { rayon: 33, nombre: 12 },
  { rayon: 44, nombre: 16 },
  { rayon: 55, nombre: 20 },
  { rayon: 66, nombre: 24 },
]);

export function AssembleeBHumain() {
  const id = useIdSvg();
  return (
    <Cadre label="Un hémicycle balayé d'un seul coup par une vague grise : tous les sièges disparaissent, le président peut dissoudre l'Assemblée.">
      {(sc) => (
        <>
          <clipPath id={`${id}-hemi`}>
            <path d="M40 86 A80 80 0 0 1 200 86 Z" />
          </clipPath>
          {SIEGES_B_HUMAIN.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={3} className="fill-none stroke-trait" strokeWidth={1} />
          ))}
          <motion.g {...kf(sc, [0, 0.4, 0.5, 0.9, 1], { opacity: [1, 1, 0, 0, 1] }, { ease: "linear", repos: 2 })}>
            {SIEGES_B_HUMAIN.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={3} className="fill-attenue" />
            ))}
          </motion.g>
          <g clipPath={`url(#${id}-hemi)`}>
            <motion.g
              {...kf(sc, [0, 0.32, 0.46, 0.6, 1], { x: [-170, -170, 0, 0, 0], opacity: [0, 1, 1, 0, 0] }, { ease: "easeIn", repos: 4 })}
            >
              <rect x={36} y={0} width={168} height={90} className="fill-trait" />
              <rect x={200} y={0} width={4} height={90} className="fill-attenue" opacity={0.7} />
            </motion.g>
          </g>
        </>
      )}
    </Cadre>
  );
}

const SIEGES_B_IA = sieges(76, 82, [
  { rayon: 16, nombre: 6 },
  { rayon: 27, nombre: 10 },
  { rayon: 38, nombre: 14 },
  { rayon: 49, nombre: 18 },
  { rayon: 60, nombre: 22 },
]);
const TOTAL_B = SIEGES_B_IA.length;

/** Le compteur : sa valeur suit la même cadence que l'allumage des sièges. */
function Compteur({ sc }: { sc: Scene }) {
  const valeur = useMotionValue(sc.reduit ? TOTAL_B : 0);
  const [n, setN] = useState(sc.reduit ? TOTAL_B : 0);
  useMotionValueEvent(valeur, "change", (v) => setN(Math.round(v)));
  useEffect(() => {
    if (sc.reduit) {
      valeur.set(TOTAL_B);
      return;
    }
    if (!sc.joue) {
      valeur.set(0);
      return;
    }
    const lecture = animate(valeur, [0, 0, TOTAL_B, TOTAL_B, 0], {
      times: [0, 0.06, 0.68, 0.9, 1],
      duration: DUREE,
      ease: "linear",
      repeat: Infinity,
    });
    return () => lecture.stop();
  }, [sc.joue, sc.reduit, valeur]);
  return (
    <>
      <text x={188} y={56} textAnchor="middle" className="fill-machine font-mono" fontSize={34} fontWeight={600}>
        {n}
      </text>
      <text x={188} y={74} textAnchor="middle" className="fill-attenue" fontSize={10}>
        votes pour
      </text>
    </>
  );
}

export function AssembleeBIA() {
  return (
    <Cadre label="Un hémicycle dont les sièges s'allument un par un, avec un compteur qui additionne les votes : l'Assemblée vote, texte par texte.">
      {(sc) => (
        <>
          {SIEGES_B_IA.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={3} className="fill-none stroke-trait" strokeWidth={1} />
          ))}
          {SIEGES_B_IA.map((s, i) => {
            const t0 = 0.06 + (0.62 * (i + 1)) / TOTAL_B;
            return (
              <motion.circle
                key={i}
                cx={s.x}
                cy={s.y}
                r={3}
                className="fill-machine"
                {...kf(sc, [0, t0 - 0.01, t0, 0.9, 1], { opacity: [0, 0, 1, 1, 0] }, { ease: "linear", repos: 3 })}
              />
            );
          })}
          <Compteur sc={sc} />
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
