import type { ThemeId } from "@/lib/themes";

/**
 * « D'accord ou pas » : six affirmations générales, sans lien avec une personne ou un parti réels.
 * Le citoyen se place sur cinq crans, de −2 (pas du tout) à +2 (tout à fait).
 */
export interface Affirmation {
  id: string;
  texte: string;
  /** Ce que vaut l'accord pour chaque thème : +1, l'accord relève le thème ; −1, il l'abaisse. */
  effets: Partial<Record<ThemeId, number>>;
}

export const AFFIRMATIONS: Affirmation[] = [
  { id: "dette", texte: "Réduire la dette doit passer avant toute dépense nouvelle.", effets: { budget: 1 } },
  { id: "carbone", texte: "Il faut accepter de payer plus cher pour polluer moins.", effets: { ecologie: 1 } },
  { id: "quotidien", texte: "La sécurité du quotidien est la première mission de l'État.", effets: { securite: 1 } },
  { id: "paysans", texte: "Les agriculteurs doivent être mieux payés, même si l'alimentation coûte plus cher.", effets: { agriculture: 1 } },
  { id: "referendum", texte: "Les citoyens devraient décider plus souvent par référendum.", effets: { institutions: 1 } },
  { id: "ia-ecole", texte: "L'IA doit entrer dans chaque classe, dès l'école primaire.", effets: { numerique: 1, education: 0.5 } },
];

/** Les cinq crans, de −2 à +2. */
export const CRANS = [
  { valeur: -2, libelle: "Pas du tout" },
  { valeur: -1, libelle: "Plutôt pas" },
  { valeur: 0, libelle: "Sans avis" },
  { valeur: 1, libelle: "Plutôt d'accord" },
  { valeur: 2, libelle: "Tout à fait" },
] as const;

export const libelleCran = (valeur: number) => CRANS.find((c) => c.valeur === valeur)?.libelle ?? "Sans avis";

/** Points de priorité par cran : « tout à fait » vaut +14 sur un thème d'effet 1. */
export const POINTS_PAR_CRAN = 7;
