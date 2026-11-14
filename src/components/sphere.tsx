import { cn } from "@/lib/utils";
import { EmblemeDeSphere } from "@/components/sphere-embleme";

export type Teintes = readonly [fond: string, nuage1: string, nuage2: string, nuage3: string];

/** Teintes d'une sphère à partir d'une seule couleur dominante, donnée par sa teinte (0 à 360). */
export const teintesDepuis = (teinte: number): Teintes => [
  `hsl(${teinte} 70% 93%)`,
  `hsl(${teinte} 72% 52%)`,
  `hsl(${teinte + 24} 68% 34%)`,
  `hsl(${teinte - 22} 85% 74%)`,
];

export const SPHERES = {
  olympe: { prenom: "Olympe", teintes: ["#f8dfe9", "#c2296f", "#7a1242", "#f29ac0"] },
  victor: { prenom: "Victor", teintes: ["#e1e9fb", "#3b6fd6", "#1f3f9a", "#9db9f2"] },
  simone: { prenom: "Simone", teintes: ["#fde5d2", "#f0562b", "#f59a3c", "#fbc48f"] },
} as const satisfies Record<string, { prenom: string; teintes: Teintes }>;

/**
 * La sphère : l'incarnation d'une IA candidate. Trois nuages de couleur et un voile blanc dérivent
 * lentement dans un disque. `poids` grossit ou réduit chaque nuage (1 = taille normale), ce qui
 * permet de faire dépendre les couleurs de la sphère du test passé par le citoyen.
 */
export function Sphere({
  teintes,
  poids,
  aquarelle = false,
  duree = 16,
  description,
  className,
  sansEmbleme = false,
  children,
}: {
  teintes: Teintes;
  poids?: readonly [number, number, number];
  /** Bords de nuages irréguliers, façon aquarelle. Plus coûteux : à réserver aux grandes sphères. */
  aquarelle?: boolean;
  /** Durée d'une dérive, en secondes. */
  duree?: number;
  /** Texte lu par les lecteurs d'écran. Sans lui, la sphère est décorative. */
  description?: string;
  className?: string;
  /** Vrai pour ne pas poser l'emblème de la candidate sur la sphère (il est posé par défaut). */
  sansEmbleme?: boolean;
  children?: React.ReactNode;
}) {
  const style = {
    "--s1": teintes[0],
    "--s2": teintes[1],
    "--s3": teintes[2],
    "--s4": teintes[3],
    "--duree": `${duree}s`,
    ...(poids ? { "--p1": poids[0], "--p2": poids[1], "--p3": poids[2] } : {}),
  } as React.CSSProperties;

  return (
    <div
      role={description ? "img" : undefined}
      aria-label={description}
      aria-hidden={description ? undefined : true}
      data-aquarelle={aquarelle ? "" : undefined}
      className={cn("sphere", className)}
      style={style}
    >
      <div className="sphere-nuages">
        <span className="sphere-nuage" />
        <span className="sphere-nuage" />
        <span className="sphere-nuage" />
        <span className="sphere-nuage" />
      </div>
      <div className="sphere-courant" />
      <div className="sphere-volume" />
      <div className="sphere-grain" />
      {sansEmbleme ? null : <EmblemeDeSphere teintes={teintes} />}
      {children}
    </div>
  );
}

/**
 * Filtres SVG des bords en aquarelle. À poser une fois sur toute page qui affiche une sphère `aquarelle`.
 * Le premier ondule très lentement (le grain du bruit se resserre puis se relâche), ce qui fait
 * remuer les bords de la matière ; le second est sa version immobile, utilisée quand l'utilisateur
 * a demandé moins d'animations.
 */
export function FiltreSphere() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id="sphere-aquarelle" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.010 0.013" numOctaves="3" seed="7" result="bruit">
          <animate
            attributeName="baseFrequency"
            dur="26s"
            values="0.010 0.013;0.013 0.010;0.010 0.013"
            calcMode="spline"
            keyTimes="0;0.5;1"
            keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="bruit" scale="60" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="sphere-aquarelle-fixe" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed="7" result="bruit" />
        <feDisplacementMap in="SourceGraphic" in2="bruit" scale="60" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
