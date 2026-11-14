"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { candidateParId } from "@/lib/candidates";
import { cn } from "@/lib/utils";

/*
 * Les emblèmes des sept IA candidates : des dessins au trait, monolignes, tous construits sur la même
 * grille de 120 × 120 avec le même trait (5 unités, environ 4 % de la hauteur), des extrémités coupées
 * et le même vocabulaire de formes : cercles, demi-cercles, quarts de cercle, droites et quelques obliques.
 *
 * À l'apparition, le trait se dessine ; au survol, un détail vit (la balance oscille, la chouette
 * cligne des yeux, l'épi se balance…). Tout mouvement est coupé avec prefers-reduced-motion.
 */

const TRAIT = 5;

/** Ce que représente chaque emblème, lu par les lecteurs d'écran. */
const SUJETS: Record<string, string> = {
  gaia: "une pousse sur la Terre",
  themis: "une balance",
  hygie: "une coupe et un serpent",
  plutus: "une pièce sur une pile de pièces",
  athena: "une chouette",
  harmonie: "une lyre",
  demeter: "un épi de blé",
};

/* ------------------------------------------------------------------ */
/* Géométrie                                                            */
/* ------------------------------------------------------------------ */

const n2 = (v: number) => Number(v.toFixed(2));

/**
 * Un grain ou une feuille : la lentille formée par deux quarts de cercle entre A et B. Le tracé part du
 * milieu d'un arc (un point lisse) pour que la couture du trait ne coupe pas une pointe.
 */
function lentille(ax: number, ay: number, bx: number, by: number): string {
  const dx = bx - ax;
  const dy = by - ay;
  const corde = Math.hypot(dx, dy);
  const r = n2(corde / Math.SQRT2);
  const fleche = (corde / Math.SQRT2) * (1 - Math.SQRT1_2);
  // Avec sweep = 1, l'arc de A vers B bombe à gauche du sens de marche : vers (dy, -dx).
  const mx = n2((ax + bx) / 2 + (dy / corde) * fleche);
  const my = n2((ay + by) / 2 - (dx / corde) * fleche);
  const arc = `A${r} ${r} 0 0 1`;
  return `M${mx} ${my} ${arc} ${bx} ${by} ${arc} ${ax} ${ay} ${arc} ${mx} ${my}`;
}

/* ------------------------------------------------------------------ */
/* Animation                                                            */
/* ------------------------------------------------------------------ */

const EASE_TRACE = [0.65, 0, 0.35, 1] as const;

/** Le trait se dessine, chaque élément un peu après le précédent (son rang est passé dans `custom`). */
const TRACE: Variants = {
  cache: { pathLength: 0, opacity: 0 },
  visible: (rang: number = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay: 0.08 + rang * 0.11, duration: 0.9, ease: EASE_TRACE },
      opacity: { delay: 0.08 + rang * 0.11, duration: 0.01 },
    },
  }),
};

/** Les petits aplats (pupilles) apparaissent à la fin du tracé. */
const POINT: Variants = {
  cache: { opacity: 0, scale: 0 },
  visible: (rang: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.08 + rang * 0.11 + 0.5, duration: 0.35, ease: "backOut" },
  }),
};

/** Une animation de survol : `survol` joue une fois, `visible` ramène au repos. */
function vivant(survol: Record<string, number[]>, duree: number, repos: Record<string, number>, delai = 0): Variants {
  return {
    cache: repos,
    visible: { ...repos, transition: { duration: 0.4, ease: "easeOut" } },
    survol: { ...survol, transition: { duration: duree, delay: delai, ease: "easeInOut" } },
  };
}

/* ------------------------------------------------------------------ */
/* Primitives                                                           */
/* ------------------------------------------------------------------ */

function Trace({ d, rang = 0 }: { d: string; rang?: number }) {
  return <motion.path d={d} variants={TRACE} custom={rang} />;
}

function Cercle({ cx, cy, r, rang = 0 }: { cx: number; cy: number; r: number; rang?: number }) {
  // Un cercle tracé en chemin, qui commence en haut : le dessin part de midi.
  const d = `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx} ${cy + r} A${r} ${r} 0 1 1 ${cx} ${cy - r}`;
  return <Trace d={d} rang={rang} />;
}

function Point({ cx, cy, r, rang = 0 }: { cx: number; cy: number; r: number; rang?: number }) {
  return <motion.circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" variants={POINT} custom={rang} />;
}

/** Un groupe animé au survol, tournant ou se déplaçant autour d'un point donné de sa boîte (0 à 1). */
function Vivant({
  children,
  variants,
  ox = 0.5,
  oy = 0.5,
}: {
  children: ReactNode;
  variants: Variants;
  ox?: number;
  oy?: number;
}) {
  return (
    <motion.g variants={variants} style={{ originX: ox, originY: oy }}>
      {children}
    </motion.g>
  );
}

/* ------------------------------------------------------------------ */
/* Les sept dessins                                                     */
/* ------------------------------------------------------------------ */

/** Gaïa : la Terre, son horizon, et une pousse à deux feuilles qui se déploient au survol. */
function Gaia() {
  return (
    <>
      <Cercle cx={60} cy={60} r={42} rang={0} />
      <Trace d="M25.53 84 H94.47" rang={1} />
      <Trace d="M60 84 V32" rang={2} />
      <Vivant variants={vivant({ rotate: [0, -9, 3, 0] }, 1.3, { rotate: 0 })} ox={1} oy={1}>
        <Trace d={lentille(60, 72, 38, 50)} rang={3} />
      </Vivant>
      <Vivant variants={vivant({ rotate: [0, 9, -3, 0] }, 1.3, { rotate: 0 }, 0.08)} ox={0} oy={1}>
        <Trace d={lentille(60, 58, 82, 36)} rang={4} />
      </Vivant>
    </>
  );
}

/** Thémis : une balance ; au survol, le fléau oscille et les plateaux montent et descendent. */
function Themis() {
  const duree = 1.6;
  const plateau = (cx: number) =>
    `M${cx} 81 A13 13 0 0 1 ${cx - 13} 68 H${cx + 13} A13 13 0 0 1 ${cx} 81 M${cx - 13} 68 L${cx} 42 L${cx + 13} 68`;
  return (
    <>
      <Cercle cx={60} cy={24} r={6} rang={0} />
      <Trace d="M60 30 V98" rang={1} />
      <Trace d="M40 98 H80" rang={2} />
      <Vivant variants={vivant({ rotate: [0, -5, 3.5, -1.5, 0] }, duree, { rotate: 0 })}>
        <Trace d="M24 38 H96" rang={2} />
      </Vivant>
      <Vivant variants={vivant({ y: [0, 3.1, -2.2, 0.9, 0] }, duree, { y: 0 })}>
        <Trace d={plateau(30)} rang={3} />
      </Vivant>
      <Vivant variants={vivant({ y: [0, -3.1, 2.2, -0.9, 0] }, duree, { y: 0 })}>
        <Trace d={plateau(90)} rang={3} />
      </Vivant>
    </>
  );
}

/** Hygie : une coupe d'où monte un serpent, qui ondule au survol. */
function Hygie() {
  return (
    <>
      <Trace d="M60 88 A30 30 0 0 1 30 58 H90 A30 30 0 0 1 60 88" rang={0} />
      <Trace d="M60 88 V100" rang={1} />
      <Trace d="M44 100 H76" rang={1} />
      <Vivant variants={vivant({ rotate: [0, 7, -5, 2, 0] }, 1.5, { rotate: 0 })} ox={0.5} oy={1}>
        <Trace d="M60 58 A9 9 0 0 0 60 40 A9 9 0 0 1 60 22" rang={2} />
        <Trace d={lentille(60, 22, 76, 22)} rang={3} />
      </Vivant>
    </>
  );
}

/** Une pièce vue de profil : deux droites et deux demi-cercles, tracée à partir du milieu du haut. */
const piece = (cx: number, y: number) =>
  `M${cx} ${y} H${cx + 22} A6 6 0 0 1 ${cx + 22} ${y + 12} H${cx - 22} A6 6 0 0 1 ${cx - 22} ${y} H${cx}`;

/** Plutus : une pièce sur une pile de pièces ; au survol, la pièce tourne sur elle-même. */
function Plutus() {
  return (
    <>
      <Vivant variants={vivant({ scaleX: [1, 0.08, 1, 0.08, 1] }, 1.2, { scaleX: 1 })}>
        <Cercle cx={60} cy={36} r={18} rang={0} />
        <Cercle cx={60} cy={36} r={8} rang={1} />
      </Vivant>
      {/* Trois pièces vues de profil, empilées sans être tout à fait alignées. */}
      <Trace d={piece(64, 64)} rang={1} />
      <Trace d={piece(56, 76)} rang={2} />
      <Trace d={piece(61, 88)} rang={3} />
    </>
  );
}

/** Athéna : une chouette aux aigrettes ; au survol, elle cligne des yeux. */
function Athena() {
  return (
    <>
      <Trace d="M60 104 A36 36 0 0 1 24 68 V26 L42 38 H78 L96 26 V68 A36 36 0 0 1 60 104" rang={0} />
      <Vivant variants={vivant({ scaleY: [1, 0.12, 1, 1, 0.12, 1] }, 0.9, { scaleY: 1 })}>
        <Cercle cx={44} cy={58} r={10} rang={1} />
        <Cercle cx={76} cy={58} r={10} rang={1} />
        <Point cx={44} cy={58} r={4} rang={1} />
        <Point cx={76} cy={58} r={4} rang={1} />
      </Vivant>
      <Trace d="M54 74 L60 84 L66 74" rang={2} />
    </>
  );
}

/** Harmonie : une lyre ; au survol, ses cordes vibrent. */
function Harmonie() {
  const corde = (delai: number) => vivant({ x: [0, 1.4, -1.4, 1, -1, 0.5, 0] }, 0.6, { x: 0 }, delai);
  return (
    <>
      <Trace d="M18 46 V38 A9 9 0 0 1 36 38 V74 A24 24 0 0 0 84 74 V38 A9 9 0 0 1 102 38 V46" rang={0} />
      <Trace d="M36 50 H84" rang={1} />
      <Trace d="M36 74 H84" rang={1} />
      <Vivant variants={corde(0)}>
        <Trace d="M48 50 V74" rang={2} />
      </Vivant>
      <Vivant variants={corde(0.1)}>
        <Trace d="M60 50 V74" rang={2} />
      </Vivant>
      <Vivant variants={corde(0.2)}>
        <Trace d="M72 50 V74" rang={2} />
      </Vivant>
    </>
  );
}

/** Déméter : un épi de blé, qui se balance au survol. */
function Demeter() {
  const paires = [87, 62, 37];
  return (
    <Vivant variants={vivant({ rotate: [0, 5, -3.5, 1.5, 0] }, 1.8, { rotate: 0 })} ox={0.5} oy={1}>
      <Trace d="M60 106 V37" rang={0} />
      {paires.map((y, i) => (
        <g key={y}>
          <Trace d={lentille(60, y, 44, y - 16)} rang={1 + i * 0.6} />
          <Trace d={lentille(60, y, 76, y - 16)} rang={1 + i * 0.6} />
        </g>
      ))}
      <Trace d={lentille(60, 33, 60, 13)} rang={2.8} />
    </Vivant>
  );
}

const DESSINS: Record<string, () => ReactNode> = {
  gaia: Gaia,
  themis: Themis,
  hygie: Hygie,
  plutus: Plutus,
  athena: Athena,
  harmonie: Harmonie,
  demeter: Demeter,
};

/* ------------------------------------------------------------------ */
/* Le composant                                                         */
/* ------------------------------------------------------------------ */

export function Embleme({
  id,
  className,
  couleur = "currentColor",
  animer = true,
  etat,
}: {
  /** L'identifiant de la candidate (voir src/lib/candidates.ts). */
  id: string;
  className?: string;
  /** La couleur du trait ; par défaut, celle du texte. */
  couleur?: string;
  /** Le trait se dessine à l'apparition et un détail vit au survol. */
  animer?: boolean;
  /** Pilote l'animation de l'extérieur : « survol » joue le détail vivant sans que le pointeur soit dessus. */
  etat?: "visible" | "survol";
}) {
  const reduit = useReducedMotion() ?? false;
  const Dessin = DESSINS[id];
  const candidate = candidateParId(id);
  if (!Dessin || !candidate) return null;

  const anime = animer && !reduit;

  return (
    <motion.svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={`Emblème de ${candidate.prenom} : ${SUJETS[id]}`}
      className={cn("block aspect-square", className)}
      style={{ color: couleur }}
      fill="none"
      stroke="currentColor"
      strokeWidth={TRAIT}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      strokeMiterlimit={4}
      initial={anime ? "cache" : false}
      animate={anime && etat ? etat : "visible"}
      whileHover={anime ? "survol" : undefined}
    >
      <Dessin />
    </motion.svg>
  );
}
