"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { candidateParId } from "@/lib/candidates";
import { cn } from "@/lib/utils";

/*
 * Deux autres propositions d'emblème (B et C) pour chaque IA candidate, dans le même langage que
 * src/components/emblemes.tsx : grille de 120 × 120, trait de 5 unités, extrémités coupées, cercles,
 * arcs et droites. Le trait se dessine à l'apparition, un détail vit au survol, et tout mouvement est
 * coupé avec prefers-reduced-motion.
 */

const TRAIT = 5;

export type Lettre = "B" | "C";

/* ------------------------------------------------------------------ */
/* Géométrie                                                            */
/* ------------------------------------------------------------------ */

const n2 = (v: number) => Number(v.toFixed(2));
const RAD = Math.PI / 180;

/** Le point d'un cercle à un angle donné, en degrés (0 = à droite, 90 = en bas). */
function sur(cx: number, cy: number, r: number, deg: number): [number, number] {
  return [n2(cx + r * Math.cos(deg * RAD)), n2(cy + r * Math.sin(deg * RAD))];
}

/** Un arc de cercle tracé dans le sens horaire, de l'angle a0 à l'angle a1 (a1 > a0). */
function arc(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const [x0, y0] = sur(cx, cy, r, a0);
  const [x1, y1] = sur(cx, cy, r, a1);
  return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

/** Une feuille ou un grain : la lentille formée par deux quarts de cercle entre A et B. */
function lentille(ax: number, ay: number, bx: number, by: number): string {
  const dx = bx - ax;
  const dy = by - ay;
  const corde = Math.hypot(dx, dy);
  const r = n2(corde / Math.SQRT2);
  const fleche = (corde / Math.SQRT2) * (1 - Math.SQRT1_2);
  const mx = n2((ax + bx) / 2 + (dy / corde) * fleche);
  const my = n2((ay + by) / 2 - (dx / corde) * fleche);
  const a = `A${r} ${r} 0 0 1`;
  return `M${mx} ${my} ${a} ${n2(bx)} ${n2(by)} ${a} ${n2(ax)} ${n2(ay)} ${a} ${mx} ${my}`;
}

/** Un cœur : deux demi-cercles de rayon r, centrés à ±r de cx, et une pointe en bas. */
function coeur(cx: number, cy: number, r: number, pointe: number): string {
  return `M${cx} ${cy} A${r} ${r} 0 0 0 ${cx - 2 * r} ${cy} L${cx} ${pointe} L${cx + 2 * r} ${cy} A${r} ${r} 0 0 0 ${cx} ${cy}`;
}

/** Fait tourner un vecteur d'un angle donné, en degrés (sens horaire à l'écran). */
function tourne([x, y]: [number, number], deg: number): [number, number] {
  const c = Math.cos(deg * RAD);
  const s = Math.sin(deg * RAD);
  return [x * c - y * s, x * s + y * c];
}

/* ------------------------------------------------------------------ */
/* Animation (les mêmes réglages que le premier jeu d'emblèmes)         */
/* ------------------------------------------------------------------ */

const EASE_TRACE = [0.65, 0, 0.35, 1] as const;

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

const POINT: Variants = {
  cache: { opacity: 0, scale: 0 },
  visible: (rang: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.08 + rang * 0.11 + 0.5, duration: 0.35, ease: "backOut" },
  }),
};

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
  const d = `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx} ${cy + r} A${r} ${r} 0 1 1 ${cx} ${cy - r}`;
  return <Trace d={d} rang={rang} />;
}

function Point({ cx, cy, r, rang = 0 }: { cx: number; cy: number; r: number; rang?: number }) {
  return <motion.circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" variants={POINT} custom={rang} />;
}

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
/* Gaïa                                                                 */
/* ------------------------------------------------------------------ */

/** Un chêne : un houppier en trois lobes de cercle, qui ploie au vent au survol. */
function GaiaChene() {
  // Les lobes : gauche (44, 54), droite (76, 54), haut (60, 36), tous de rayon 18.
  const r = 18;
  const g = [44, 54] as const;
  const d = [76, 54] as const;
  const h = [60, 36] as const;
  // Points de raccord, calculés une fois : creux du bas, puis épaules gauche et droite.
  const creux = [60, n2(54 + Math.sqrt(r * r - 16 * 16))];
  const epaule = (c: readonly [number, number], signe: 1 | -1) => {
    const [mx, my] = [(c[0] + h[0]) / 2, (c[1] + h[1]) / 2];
    const [vx, vy] = [h[0] - c[0], h[1] - c[1]];
    const l = Math.hypot(vx, vy);
    const k = Math.sqrt(r * r - (l / 2) ** 2) / l;
    return [n2(mx + signe * vy * k), n2(my - signe * vx * k)];
  };
  const eg = epaule(g, 1);
  const ed = epaule(d, -1);
  // Tracé depuis le sommet du lobe du haut (un point lisse), dans le sens horaire.
  const houppier = `M${h[0]} ${h[1] - r} A${r} ${r} 0 0 1 ${ed[0]} ${ed[1]} A${r} ${r} 0 1 1 ${creux[0]} ${creux[1]} A${r} ${r} 0 1 1 ${eg[0]} ${eg[1]} A${r} ${r} 0 0 1 ${h[0]} ${h[1] - r}`;
  return (
    <>
      <Trace d={`M60 ${creux[1]} V102`} rang={0} />
      <Trace d="M40 102 H80" rang={1} />
      <Vivant variants={vivant({ rotate: [0, -4, 3, -1.5, 0] }, 1.8, { rotate: 0 })} ox={0.5} oy={1}>
        <Trace d={houppier} rang={1} />
      </Vivant>
    </>
  );
}

/** Le globe à méridiens et sa feuille ; au survol, la Terre tourne sur elle-même. */
function GaiaGlobe() {
  return (
    <>
      <Cercle cx={60} cy={68} r={32} rang={0} />
      <Trace d="M28 68 H92" rang={1} />
      <Vivant variants={vivant({ rotate: [0, 18, -12, 6, 0] }, 1.6, { rotate: 0 })}>
        <Trace d="M60 36 A14 32 0 0 1 60 100 A14 32 0 0 1 60 36" rang={1.5} />
      </Vivant>
      <Vivant variants={vivant({ rotate: [0, 10, -4, 0] }, 1.4, { rotate: 0 })} ox={0} oy={1}>
        <Trace d={lentille(60, 36, 84, 12)} rang={2.5} />
      </Vivant>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Thémis                                                               */
/* ------------------------------------------------------------------ */

/** Un glaive dressé ; au survol, il se lève. */
function ThemisGlaive() {
  return (
    <Vivant variants={vivant({ y: [0, -6, 0, -2.5, 0] }, 1.2, { y: 0 })}>
      <Trace d="M49 76 V26 L60 11 L71 26 V76" rang={0} />
      <Trace d="M34 68 V78 H86 V68" rang={1} />
      <Trace d="M60 80 V93" rang={2} />
      <Cercle cx={60} cy={100} r={6} rang={2.5} />
    </Vivant>
  );
}

/** Un fronton de temple à quatre colonnes ; au survol, le fronton se soulève. */
function ThemisTemple() {
  const colonnes = [34, 51.33, 68.67, 86];
  return (
    <>
      <Vivant variants={vivant({ y: [0, -5, 0, -2, 0] }, 1.3, { y: 0 })}>
        <Trace d="M24 41 L60 18 L96 41" rang={0} />
        <Trace d="M18 43 H102" rang={0.6} />
      </Vivant>
      <Trace d="M24 53 H96" rang={1} />
      {colonnes.map((x, i) => (
        <Trace key={x} d={`M${x} 53 V87`} rang={1.6 + i * 0.25} />
      ))}
      <Trace d="M24 87 H96" rang={2.6} />
      <Trace d="M16 98 H104" rang={3} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Hygie                                                                */
/* ------------------------------------------------------------------ */

const battement = vivant({ scale: [1, 1.1, 1, 1.06, 1] }, 0.9, { scale: 1 });

/** Un cœur portant une croix ; au survol, il bat. */
function HygieCoeur() {
  return (
    <Vivant variants={battement}>
      <Trace d={coeur(60, 44, 18, 92)} rang={0} />
      <Trace d="M60 54 V78" rang={1.5} />
      <Trace d="M48 66 H72" rang={1.8} />
    </Vivant>
  );
}

/** Une maison qui abrite un cœur ; au survol, le cœur bat. */
function HygieMaison() {
  return (
    <>
      <Trace d="M18 58 L60 21 L102 58" rang={0} />
      <Trace d="M30 48 V100 H90 V48" rang={1} />
      <Vivant variants={battement}>
        <Trace d={coeur(60, 68, 9, 89)} rang={2} />
      </Vivant>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Plutus                                                               */
/* ------------------------------------------------------------------ */

/** Une clé ; au survol, elle tourne dans la serrure (un quart de tour aller-retour, sans jamais disparaître). */
function PlutusCle() {
  return (
    <Vivant variants={vivant({ rotate: [0, -24, 16, -8, 0] }, 1.4, { rotate: 0 })} ox={0.5} oy={0.27}>
      <Cercle cx={60} cy={32} r={18} rang={0} />
      <Cercle cx={60} cy={32} r={6} rang={0.6} />
      <Trace d="M60 50 V106" rang={1} />
      <Trace d="M60 84 H78" rang={2} />
      <Trace d="M60 97 H74" rang={2.3} />
    </Vivant>
  );
}

/** Un coffre-fort ; au survol, sa molette tourne. */
function PlutusCoffre() {
  return (
    <>
      <Trace d="M60 24 H96 V90 H24 V24 H60" rang={0} />
      <Trace d="M34 90 V101 M86 90 V101" rang={1} />
      <Cercle cx={58} cy={57} r={17} rang={1.5} />
      <Vivant variants={vivant({ rotate: [0, 140, 60, 200, 0] }, 1.6, { rotate: 0 })}>
        <Trace d="M58 57 V45" rang={2.2} />
        <Point cx={58} cy={57} r={2.5} rang={2.2} />
      </Vivant>
      <Trace d="M86 46 V68" rang={2.6} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Athéna                                                               */
/* ------------------------------------------------------------------ */

/** Un casque à cimier vu de face ; au survol, le cimier ondule. */
function AthenaCasque() {
  // Le cimier : un éventail de crins, centré sur le dôme, dont les bords reposent sur le casque.
  const cy = n2(60 - Math.sqrt(32 * 32 - 26 * 26));
  const crins = [240, 270, 300].map((a) => {
    const [x0, y0] = sur(60, cy, 15, a);
    const [x1, y1] = sur(60, cy, 24, a);
    return `M${x0} ${y0} L${x1} ${y1}`;
  });
  return (
    <>
      <Trace d="M28 104 V60 A32 32 0 0 1 92 60 V104" rang={0} />
      {/* La fente des yeux et de la bouche, d'un seul trait. */}
      <Trace d="M53 104 V84 L38 75 V65 H82 V75 L67 84 V104" rang={1} />
      <Vivant variants={vivant({ rotate: [0, -7, 5, -2, 0] }, 1.4, { rotate: 0 })} ox={0.5} oy={1}>
        <Trace d={`M34 ${cy} A26 26 0 0 1 86 ${cy}`} rang={2} />
        {crins.map((d, i) => (
          <Trace key={d} d={d} rang={2.4 + i * 0.15} />
        ))}
      </Vivant>
    </>
  );
}

/** Un rameau d'olivier ; au survol, il se balance. */
function AthenaOlivier() {
  // La tige : un arc de cercle de centre (118, 98) et de rayon 72, de 180° à 238°.
  const C = [118, 98, 72] as const;
  const tangente = (deg: number): [number, number] => [-Math.sin(deg * RAD), Math.cos(deg * RAD)];
  const feuille = (deg: number, cote: number, longueur = 24) => {
    const [px, py] = sur(C[0], C[1], C[2], deg);
    const [vx, vy] = tourne(tangente(deg), cote * 48);
    return lentille(px, py, px + vx * longueur, py + vy * longueur);
  };
  const [tx, ty] = sur(C[0], C[1], C[2], 238);
  const [ux, uy] = tangente(238);
  const feuilles: [number, number][] = [
    [190, 1],
    [198, -1],
    [208, 1],
    [218, -1],
    [228, 1],
  ];
  return (
    <g transform="translate(2 0)">
      <Vivant variants={vivant({ rotate: [0, 6, -4, 1.5, 0] }, 1.8, { rotate: 0 })} ox={0.2} oy={1}>
        <Trace d={`M46 106 V98 ${arc(C[0], C[1], C[2], 180, 238).replace(/^M[^A]+/, "")}`} rang={0} />
        {feuilles.map(([deg, cote], i) => (
          <Trace key={deg} d={feuille(deg, cote)} rang={1 + i * 0.4} />
        ))}
        <Trace d={lentille(tx, ty, tx + ux * 22, ty + uy * 22)} rang={3} />
      </Vivant>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Harmonie                                                             */
/* ------------------------------------------------------------------ */

/** Deux anneaux entrelacés ; au survol, ils se balancent. */
function HarmonieAnneaux() {
  const r = 26;
  const croisement = Math.acos(14 / r) / RAD; // ≈ 57,4°
  const marge = 12;
  return (
    <Vivant variants={vivant({ rotate: [0, -10, 7, -3, 0] }, 1.6, { rotate: 0 })}>
      {/* L'anneau de gauche passe sous l'autre en bas, celui de droite passe dessous en haut. */}
      <Trace d={arc(46, 60, r, croisement + marge, croisement - marge + 360)} rang={0} />
      <Trace d={arc(74, 60, r, 180 + croisement + marge, 180 + croisement - marge + 360)} rang={1} />
    </Vivant>
  );
}

/** Une colombe en vol ; au survol, elle bat de l'aile. */
function HarmonieColombe() {
  return (
    <g transform="translate(2 12)">
      <Cercle cx={30} cy={50} r={9} rang={0} />
      <motion.path d="M21.5 46.5 L12 52 L22 55 Z" fill="currentColor" stroke="none" variants={POINT} custom={0.4} />
      <Trace d="M39 47 L100 60 A34 34 0 0 1 38 57" rang={1} />
      <Vivant variants={vivant({ rotate: [0, -14, 6, -8, 0] }, 1.1, { rotate: 0 })} ox={0} oy={1}>
        <Trace d="M50 49.4 A48 48 0 0 1 94 14 L74 54.5" rang={2} />
      </Vivant>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Déméter                                                              */
/* ------------------------------------------------------------------ */

/** Une gerbe de blé liée ; au survol, les épis se balancent. */
function DemeterGerbe() {
  const lien = [60, 72] as const;
  const pieds = [-30.9, -12.9, 0, 12.9, 30.9];
  const tiges = pieds.map((dx) => {
    const [bx, by] = [60 + dx, 104];
    const [vx, vy] = [lien[0] - bx, lien[1] - by];
    const l = Math.hypot(vx, vy);
    const [ux, uy] = [vx / l, vy / l];
    const haut = 30 - Math.abs(dx) * 0.2;
    const [ex, ey] = [lien[0] + ux * haut, lien[1] + uy * haut];
    return {
      tige: `M${bx} ${by} L${n2(ex)} ${n2(ey)}`,
      epi: lentille(ex, ey, ex + ux * 19, ey + uy * 19),
    };
  });
  return (
    <>
      {tiges.map((t, i) => (
        <Trace key={t.tige} d={t.tige} rang={i * 0.25} />
      ))}
      <Vivant variants={vivant({ rotate: [0, 4, -3, 1, 0] }, 1.7, { rotate: 0 })} ox={0.5} oy={1}>
        {tiges.map((t, i) => (
          <Trace key={t.epi} d={t.epi} rang={1.5 + i * 0.25} />
        ))}
      </Vivant>
      <Trace d="M45 65 H75 M45 79 H75" rang={2.8} />
    </>
  );
}

/** Un soleil qui se lève sur des sillons ; au survol, ses rayons s'allongent. */
function DemeterSoleil() {
  const rayons = [210, 240, 270, 300, 330];
  const sillons = [
    [48, 24],
    [54, 42],
    [60, 60],
    [66, 78],
    [72, 96],
  ];
  return (
    <>
      <Trace d="M16 62 H104" rang={0} />
      <Trace d="M40 62 A20 20 0 0 1 80 62" rang={1} />
      <Vivant variants={vivant({ scale: [1, 1.14, 1, 1.08, 1] }, 1.3, { scale: 1 })} ox={0.5} oy={1}>
        {rayons.map((a, i) => {
          const [x0, y0] = sur(60, 62, 28, a);
          const [x1, y1] = sur(60, 62, 39, a);
          return <Trace key={a} d={`M${x0} ${y0} L${x1} ${y1}`} rang={1.6 + i * 0.15} />;
        })}
      </Vivant>
      {sillons.map(([haut, bas], i) => (
        <Trace key={bas} d={`M${haut} 72 L${bas} 102`} rang={2 + i * 0.15} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Catalogue                                                            */
/* ------------------------------------------------------------------ */

interface Proposition {
  /** Deux ou trois mots, affichés sous la sphère. */
  legende: string;
  /** Ce que représente le dessin, lu par les lecteurs d'écran. */
  sujet: string;
  Dessin: () => ReactNode;
}

/** La légende de l'emblème actuel (proposition A), pour chaque candidate. */
export const LEGENDES_A: Record<string, string> = {
  gaia: "pousse sur la Terre",
  themis: "balance",
  hygie: "coupe et serpent",
  plutus: "pile de pièces",
  athena: "chouette",
  harmonie: "lyre",
  demeter: "épi de blé",
};

export const VARIANTES: Record<string, Record<Lettre, Proposition>> = {
  gaia: {
    B: { legende: "chêne géométrique", sujet: "un chêne", Dessin: GaiaChene },
    C: { legende: "globe et feuille", sujet: "un globe à méridiens et une feuille", Dessin: GaiaGlobe },
  },
  themis: {
    B: { legende: "glaive dressé", sujet: "un glaive dressé", Dessin: ThemisGlaive },
    C: { legende: "fronton de temple", sujet: "un fronton de temple à colonnes", Dessin: ThemisTemple },
  },
  hygie: {
    B: { legende: "cœur et croix", sujet: "un cœur portant une croix", Dessin: HygieCoeur },
    C: { legende: "maison et cœur", sujet: "une maison qui abrite un cœur", Dessin: HygieMaison },
  },
  plutus: {
    B: { legende: "clé", sujet: "une clé", Dessin: PlutusCle },
    C: { legende: "coffre-fort", sujet: "un coffre-fort", Dessin: PlutusCoffre },
  },
  athena: {
    B: { legende: "casque à cimier", sujet: "un casque à cimier", Dessin: AthenaCasque },
    C: { legende: "rameau d'olivier", sujet: "un rameau d'olivier", Dessin: AthenaOlivier },
  },
  harmonie: {
    B: { legende: "anneaux entrelacés", sujet: "deux anneaux entrelacés", Dessin: HarmonieAnneaux },
    C: { legende: "colombe", sujet: "une colombe", Dessin: HarmonieColombe },
  },
  demeter: {
    B: { legende: "gerbe liée", sujet: "une gerbe de blé liée", Dessin: DemeterGerbe },
    C: { legende: "soleil sur sillons", sujet: "un soleil qui se lève sur des sillons", Dessin: DemeterSoleil },
  },
};

/* ------------------------------------------------------------------ */
/* Le composant                                                         */
/* ------------------------------------------------------------------ */

export function EmblemeVariante({
  id,
  lettre,
  className,
  couleur = "currentColor",
  animer = true,
  etat,
}: {
  /** L'identifiant de la candidate (voir src/lib/candidates.ts). */
  id: string;
  lettre: Lettre;
  className?: string;
  couleur?: string;
  animer?: boolean;
  /** Pilote l'animation de l'extérieur : « survol » joue le détail vivant sans que le pointeur soit dessus. */
  etat?: "visible" | "survol";
}) {
  const reduit = useReducedMotion() ?? false;
  const proposition = VARIANTES[id]?.[lettre];
  const candidate = candidateParId(id);
  if (!proposition || !candidate) return null;

  const { Dessin, sujet } = proposition;
  const anime = animer && !reduit;

  return (
    <motion.svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={`Emblème de ${candidate.prenom}, proposition ${lettre} : ${sujet}`}
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
