"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Transition } from "motion/react";
import { useRef } from "react";

/**
 * Huit petits schémas animés (un par colonne et par ligne du comparatif), en SVG de 220 × 72.
 * Chacun démarre quand il entre à l'écran, boucle doucement, et se fige sur son état final
 * quand l'utilisateur a demandé moins d'animations. Humain en gris, machine en --machine.
 */

const DUREE = 9;

type Scene = { joue: boolean; reduit: boolean };

/**
 * Une étape de la boucle : entre les fractions t0 et t1 du cycle, chaque propriété passe de son état
 * de départ à son état final, puis tient jusqu'à 88 % du cycle et revient doucement au départ.
 * Hors animation (pas encore à l'écran, ou mouvement réduit), l'élément reste à l'état voulu.
 */
function etape(
  sc: Scene,
  t0: number,
  t1: number,
  props: Record<string, readonly [depart: number, fin: number]>,
  ease: Transition["ease"] = "easeInOut",
) {
  const initial: Record<string, number> = {};
  const fixe: Record<string, number> = {};
  const boucle: Record<string, number[]> = {};
  for (const [cle, [depart, fin]] of Object.entries(props)) {
    initial[cle] = depart;
    fixe[cle] = sc.reduit ? fin : depart;
    boucle[cle] = [depart, depart, fin, fin, depart];
  }
  return {
    initial: initial as TargetAndTransition,
    animate: (sc.joue ? boucle : fixe) as TargetAndTransition,
    transition: (sc.reduit || !sc.joue
      ? { duration: 0 }
      : { duration: DUREE, times: [0, t0, t1, 0.88, 1], repeat: Infinity, ease }) as Transition,
  };
}

/** Le cadre commun : SVG accessible, déclenché une fois à l'entrée à l'écran. */
function Schema({
  label,
  children,
}: {
  label: string;
  children: (sc: Scene) => React.ReactNode;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const vu = useInView(ref, { once: true, amount: 0.5 });
  const reduit = useReducedMotion() ?? false;
  const sc: Scene = { joue: vu && !reduit, reduit };
  return (
    <svg
      ref={ref}
      viewBox="0 0 220 72"
      role="img"
      aria-label={label}
      className="block h-auto w-full max-w-[220px] overflow-visible"
    >
      {children(sc)}
    </svg>
  );
}

const ORIGINE_CENTRE = { transformBox: "fill-box", transformOrigin: "center" } as const;

/* ---------- Mandat : la frise de cinq années ---------- */

const X0 = 12;
const X1 = 208;
const Y_FRISE = 34;
const REPERES = Array.from({ length: 6 }, (_, i) => X0 + ((X1 - X0) / 5) * i);

function Frise({ couleur }: { couleur: "humain" | "ia" }) {
  const trait = couleur === "ia" ? "stroke-machine" : "stroke-attenue";
  const texte = couleur === "ia" ? "fill-machine" : "fill-attenue";
  return (
    <>
      <line x1={X0} y1={Y_FRISE} x2={X1} y2={Y_FRISE} className="stroke-trait" strokeWidth={2} strokeLinecap="round" />
      {REPERES.map((x) => (
        <line key={x} x1={x} y1={Y_FRISE - 4} x2={x} y2={Y_FRISE + 4} className={trait} strokeWidth={1.2} opacity={0.5} />
      ))}
      {REPERES.slice(0, 5).map((x, i) => (
        <text key={x} x={x + (X1 - X0) / 10} y={58} textAnchor="middle" className={texte} fontSize={9} opacity={0.8}>
          {`An ${i + 1}`}
        </text>
      ))}
    </>
  );
}

export function MandatHumain() {
  return (
    <Schema label="Frise de cinq années : un seul vote des électeurs, au tout début du mandat, puis plus aucun jusqu'à la fin.">
      {(sc) => (
        <>
          <Frise couleur="humain" />
          <circle cx={X0} cy={Y_FRISE} r={6} className="fill-attenue" />
          <circle cx={X0} cy={Y_FRISE} r={10} className="fill-none stroke-attenue" strokeWidth={1} opacity={0.4} />
          <motion.g {...etape(sc, 0.04, 0.8, { x: [0, X1 - X0] }, "linear")}>
            <line x1={X0} y1={Y_FRISE - 16} x2={X0} y2={Y_FRISE + 16} className="stroke-attenue" strokeWidth={1.5} strokeDasharray="2 3" />
          </motion.g>
        </>
      )}
    </Schema>
  );
}

const NB_IMPULSIONS = 9;
const POSITIONS = Array.from({ length: NB_IMPULSIONS }, (_, k) => X0 + ((X1 - X0) / (NB_IMPULSIONS - 1)) * k);

export function MandatIA() {
  return (
    <Schema label="Frise de cinq années : une pulsation de vote régulière tout au long du mandat, les citoyens pouvant voter à tout moment.">
      {(sc) => (
        <>
          <Frise couleur="ia" />
          {POSITIONS.map((x, k) => {
            const t0 = 0.04 + (0.76 * k) / (NB_IMPULSIONS - 1);
            return (
              <motion.g key={x} {...etape(sc, t0, t0 + 0.03, { opacity: [0.15, 1] })}>
                <circle cx={x} cy={Y_FRISE} r={3.4} className="fill-machine" />
                {!sc.reduit && sc.joue ? (
                  <motion.circle
                    cx={x}
                    cy={Y_FRISE}
                    r={4}
                    className="fill-none stroke-machine"
                    strokeWidth={1.2}
                    style={ORIGINE_CENTRE}
                    initial={{ scale: 0.6, opacity: 0.8 }}
                    animate={{ scale: [0.6, 2.6], opacity: [0.8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: k * 0.22 }}
                  />
                ) : null}
              </motion.g>
            );
          })}
          <motion.g {...etape(sc, 0.04, 0.8, { x: [0, X1 - X0] }, "linear")}>
            <line x1={X0} y1={Y_FRISE - 16} x2={X0} y2={Y_FRISE + 16} className="stroke-machine" strokeWidth={1.5} strokeDasharray="2 3" />
          </motion.g>
        </>
      )}
    </Schema>
  );
}

/* ---------- Programme : des promesses qui s'effacent, une règle qui s'applique ---------- */

const PROMESSES = [
  { y: 12, largeur: 150 },
  { y: 28, largeur: 118 },
  { y: 44, largeur: 160 },
  { y: 60, largeur: 96 },
] as const;

export function ProgrammeHumain() {
  return (
    <Schema label="Une liste de promesses de campagne dont les lignes se barrent et s'effacent une à une : elles n'engagent à rien.">
      {(sc) => (
        <>
          {PROMESSES.map((p, i) => {
            const t0 = 0.1 + 0.17 * i;
            return (
              <g key={p.y}>
                <motion.g {...etape(sc, t0, t0 + 0.1, { opacity: [1, 0.35] })}>
                  <circle cx={12} cy={p.y} r={2.6} className="fill-attenue" />
                  <rect x={24} y={p.y - 2.75} width={p.largeur} height={5.5} rx={2.75} className="fill-attenue" opacity={0.55} />
                </motion.g>
                <motion.line
                  x1={8}
                  y1={p.y}
                  x2={28 + p.largeur}
                  y2={p.y}
                  className="stroke-attenue"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  {...etape(sc, t0, t0 + 0.1, { pathLength: [0, 1], opacity: [0, 1] })}
                />
              </g>
            );
          })}
        </>
      )}
    </Schema>
  );
}

const CARTES = [124, 158, 192] as const;

export function ProgrammeIA() {
  return (
    <Schema label="Une règle publique, « si poids supérieur à 65 : pour », appliquée à des cartes de textes qui défilent : chacune reçoit une coche.">
      {(sc) => (
        <>
          <rect x={3} y={14} width={104} height={44} rx={8} className="fill-none stroke-machine" strokeWidth={1.4} />
          <text x={13} y={33} className="fill-machine font-mono" fontSize={10.5}>
            si poids &gt; 65
          </text>
          <text x={13} y={47} className="fill-machine font-mono" fontSize={10.5}>
            : pour
          </text>
          <path d="M108 36 H119 m-4 -4 l4 4 l-4 4" className="fill-none stroke-machine" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
          {CARTES.map((x, i) => {
            const t0 = 0.08 + 0.22 * i;
            return (
              <g key={x}>
                <motion.g {...etape(sc, t0, t0 + 0.07, { x: [28, 0], opacity: [0, 1] })}>
                  <rect x={x} y={16} width={26} height={40} rx={5} className="fill-fond stroke-trait" strokeWidth={1.4} />
                  <rect x={x + 5} y={23} width={16} height={3} rx={1.5} className="fill-attenue" opacity={0.4} />
                  <rect x={x + 5} y={30} width={11} height={3} rx={1.5} className="fill-attenue" opacity={0.4} />
                </motion.g>
                <motion.path
                  d={`M${x + 7} ${47} l4 4 l8 -9`}
                  className="fill-none stroke-machine"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  {...etape(sc, t0 + 0.08, t0 + 0.14, { pathLength: [0, 1], opacity: [0, 1] })}
                />
              </g>
            );
          })}
        </>
      )}
    </Schema>
  );
}

/* ---------- Décisions : une porte qui se ferme, un registre ouvert ---------- */

const TETES = [78, 99, 121, 142] as const;

export function DecisionsHumain() {
  return (
    <Schema label="Des participants autour d'une table, puis un rideau qui se ferme : les délibérations du Conseil des ministres ne sont pas publiques.">
      {(sc) => (
        <>
          {TETES.map((x) => (
            <g key={x}>
              <circle cx={x + 4} cy={28} r={4.6} className="fill-attenue" opacity={0.6} />
              <path d={`M${x - 3} 42 a7 7 0 0 1 14 0 z`} className="fill-attenue" opacity={0.6} />
            </g>
          ))}
          <rect x={64} y={42} width={92} height={5} rx={2.5} className="fill-attenue" />
          <line x1={76} y1={47} x2={76} y2={62} className="stroke-attenue" strokeWidth={2} strokeLinecap="round" />
          <line x1={144} y1={47} x2={144} y2={62} className="stroke-attenue" strokeWidth={2} strokeLinecap="round" />
          <motion.g style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }} {...etape(sc, 0.2, 0.34, { scaleX: [0.1, 1] })}>
            <rect x={44} y={4} width={66} height={64} rx={3} className="fill-trait stroke-attenue" strokeWidth={1.2} />
            <line x1={66} y1={8} x2={66} y2={64} className="stroke-attenue" strokeWidth={1} opacity={0.35} />
            <line x1={88} y1={8} x2={88} y2={64} className="stroke-attenue" strokeWidth={1} opacity={0.35} />
          </motion.g>
          <motion.g style={{ transformBox: "fill-box", transformOrigin: "100% 50%" }} {...etape(sc, 0.2, 0.34, { scaleX: [0.1, 1] })}>
            <rect x={110} y={4} width={66} height={64} rx={3} className="fill-trait stroke-attenue" strokeWidth={1.2} />
            <line x1={132} y1={8} x2={132} y2={64} className="stroke-attenue" strokeWidth={1} opacity={0.35} />
            <line x1={154} y1={8} x2={154} y2={64} className="stroke-attenue" strokeWidth={1} opacity={0.35} />
          </motion.g>
        </>
      )}
    </Schema>
  );
}

const POSITIONS_REGISTRE = [
  { y: 10, largeur: 92 },
  { y: 26, largeur: 70 },
  { y: 42, largeur: 104 },
  { y: 58, largeur: 80 },
] as const;

export function DecisionsIA() {
  return (
    <Schema label="Un registre ouvert où les positions apparaissent une à une, chacune avec sa pastille : tout est publié et vérifiable.">
      {(sc) => (
        <>
          <rect x={3} y={2} width={214} height={68} rx={8} className="fill-none stroke-machine" strokeWidth={1.2} opacity={0.4} />
          {POSITIONS_REGISTRE.map((p, i) => {
            const t0 = 0.1 + 0.18 * i;
            return (
              <motion.g key={p.y} {...etape(sc, t0, t0 + 0.07, { x: [-14, 0], opacity: [0, 1] })}>
                <circle cx={20} cy={p.y + 4} r={4.5} className="fill-machine" />
                <rect x={32} y={p.y + 1.5} width={p.largeur} height={5} rx={2.5} className="fill-machine" opacity={0.3} />
                <text x={206} y={p.y + 7} textAnchor="end" className="fill-machine font-mono" fontSize={9}>
                  publié
                </text>
              </motion.g>
            );
          })}
        </>
      )}
    </Schema>
  );
}

/* ---------- Face à l'Assemblée : un mini hémicycle ---------- */

const CENTRE_X = 110;
const CENTRE_Y = 66;
const RANGS = [
  { rayon: 18, nombre: 8 },
  { rayon: 27, nombre: 12 },
  { rayon: 36, nombre: 16 },
  { rayon: 45, nombre: 20 },
  { rayon: 54, nombre: 24 },
  { rayon: 63, nombre: 28 },
] as const;

/** Les sièges, rangés de la gauche vers la droite pour s'allumer comme un vote qui avance. */
const SIEGES = RANGS.flatMap(({ rayon, nombre }) =>
  Array.from({ length: nombre }, (_, j) => {
    const angle = Math.PI - (Math.PI * j) / (nombre - 1);
    // Arrondi à 0,01 : serveur et navigateur ne calculent pas les cosinus au dernier chiffre près.
    const arrondi = (n: number) => Math.round(n * 100) / 100;
    return {
      x: arrondi(CENTRE_X + rayon * Math.cos(angle)),
      y: arrondi(CENTRE_Y - rayon * Math.sin(angle)),
      angle: arrondi(angle * 1000),
    };
  }),
).sort((a, b) => b.angle - a.angle);

function Contours() {
  return (
    <>
      {SIEGES.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={2.6} className="fill-none stroke-trait" strokeWidth={1} />
      ))}
    </>
  );
}

export function AssembleeHumain() {
  return (
    <Schema label="Un mini hémicycle dont tous les sièges s'éteignent d'un coup : le président peut dissoudre l'Assemblée.">
      {(sc) => (
        <>
          <Contours />
          <motion.g {...etape(sc, 0.4, 0.42, { opacity: [1, 0] }, "linear")}>
            {SIEGES.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={2.6} className="fill-attenue" />
            ))}
          </motion.g>
        </>
      )}
    </Schema>
  );
}

export function AssembleeIA() {
  return (
    <Schema label="Un mini hémicycle dont les sièges s'allument un par un : l'Assemblée vote, texte par texte.">
      {(sc) => (
        <>
          <Contours />
          {SIEGES.map((s, i) => {
            const t0 = 0.06 + (0.62 * i) / SIEGES.length;
            return (
              <motion.circle
                key={i}
                cx={s.x}
                cy={s.y}
                r={2.6}
                className="fill-machine"
                {...etape(sc, t0, t0 + 0.02, { opacity: [0, 1] }, "linear")}
              />
            );
          })}
        </>
      )}
    </Schema>
  );
}

/** Les schémas de chaque ligne du comparatif, par identifiant. */
export const SCHEMAS = {
  mandat: { humain: MandatHumain, ia: MandatIA },
  programme: { humain: ProgrammeHumain, ia: ProgrammeIA },
  decisions: { humain: DecisionsHumain, ia: DecisionsIA },
  assemblee: { humain: AssembleeHumain, ia: AssembleeIA },
} as const;
