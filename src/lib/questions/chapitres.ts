import { teintesDepuis, type Teintes } from "@/components/sphere";

/** Les chapitres du test, dans l'ordre. Le dernier est un bonus : il ne pèse pas sur le résultat. */
export type ChapitreId = "textes" | "accords" | "budget" | "scenarios" | "dilemmes" | "classement" | "pronostics";

export interface Chapitre {
  id: ChapitreId;
  titre: string;
  phrase: string;
  duree: string;
  /** La même durée, en secondes : sert au temps restant estimé. */
  secondes: number;
  /** Les couleurs de la sphère d'introduction, propres au chapitre. */
  teintes: Teintes;
  /** Taille des nuages de la sphère : chaque chapitre lui donne une autre forme. */
  forme: readonly [number, number, number];
  bonus?: boolean;
}

export const CHAPITRES: Chapitre[] = [
  {
    id: "textes",
    titre: "Les vrais textes",
    phrase: "Tranchez des textes votés à l'Assemblée, puis découvrez ce qu'elle a décidé.",
    duree: "2 min",
    secondes: 120,
    teintes: teintesDepuis(228),
    forme: [1.25, 0.8, 0.9],
  },
  {
    id: "accords",
    titre: "D'accord ou pas",
    phrase: "Six affirmations, cinq crans pour dire à quel point.",
    duree: "1 min",
    secondes: 60,
    teintes: teintesDepuis(332),
    forme: [0.8, 1.3, 0.85],
  },
  {
    id: "budget",
    titre: "Le budget de la République",
    phrase: "100 milliards à répartir. Le total ne bouge pas : chaque choix se paie ailleurs.",
    duree: "1 min",
    secondes: 60,
    teintes: teintesDepuis(42),
    forme: [1.1, 1.1, 0.7],
  },
  {
    id: "scenarios",
    titre: "Scénarios 2050",
    phrase: "Quatre crises fictives tombent sur le bureau de l'Élysée. À vous de décider.",
    duree: "1 min",
    secondes: 60,
    teintes: teintesDepuis(14),
    forme: [0.75, 0.9, 1.35],
  },
  {
    id: "dilemmes",
    titre: "Dilemmes",
    phrase: "Deux causes, un seul choix.",
    duree: "40 s",
    secondes: 40,
    teintes: teintesDepuis(266),
    forme: [1.3, 0.7, 1.05],
  },
  {
    id: "classement",
    titre: "Classez",
    phrase: "Six thèmes à ordonner, du plus important au moins important.",
    duree: "30 s",
    secondes: 30,
    teintes: teintesDepuis(165),
    forme: [0.9, 1.2, 1.15],
  },
  {
    id: "pronostics",
    titre: "Devinez l'Assemblée",
    phrase: "Adopté ou rejeté ? Pariez avant la révélation. Bonus : ne compte pas dans le résultat.",
    duree: "1 min",
    secondes: 60,
    teintes: teintesDepuis(195),
    forme: [1.05, 1.05, 1.05],
    bonus: true,
  },
];

/** Nombre de textes du premier chapitre ; les suivants servent à « Devinez l'Assemblée ». */
export const TEXTES_CHAPITRE = 12;
/** Nombre de textes à deviner, au plus. */
export const TEXTES_PRONOSTIC = 5;
