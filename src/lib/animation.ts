/**
 * Le système de mouvement de DemocratIA : les mêmes courbes et les mêmes durées partout,
 * pour que le site bouge d'une seule voix. À importer plutôt que d'écrire des valeurs à la main.
 */

/** Courbe de sortie douce : rapide au départ, longue à se poser. Pour tout ce qui entre à l'écran. */
export const DOUX = [0.22, 1, 0.36, 1] as const;

/** Durées, en secondes. */
export const DUREE = {
  /** Retour d'une action : survol, pression, bascule. */
  micro: 0.15,
  /** Changement d'état d'un bloc : onglet, carte, étape. */
  etat: 0.3,
  /** Entrée d'un bloc à l'écran. */
  entree: 0.6,
  /** Moment fort : révélation, bascule de l'hémicycle. */
  scene: 1.1,
} as const;

/** Ressort sans rebond, pour ce qui se déplace (cartes, sphères, classements). */
export const RESSORT = { type: "spring", visualDuration: 0.5, bounce: 0 } as const;

/** Ressort lent, pour les grands déplacements (manège, sphère qui passe au centre). */
export const RESSORT_LENT = { type: "spring", visualDuration: 1.1, bounce: 0.08 } as const;

/** Décalage entre deux éléments d'une même série qui entrent l'un après l'autre. */
export const CASCADE = 0.07;

/** Entrée standard d'un bloc : il monte de quelques pixels en apparaissant. */
export const ENTREE = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DUREE.entree, ease: DOUX },
} as const;

/** Options de `whileInView` / `useInView` : une seule fois, un peu avant le bas de l'écran. */
export const VUE = { once: true, margin: "0px 0px -8% 0px" } as const;
