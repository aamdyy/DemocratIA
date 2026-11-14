import { PRIORITE_PAR_DEFAUT, THEMES, type ThemeId } from "@/lib/themes";

/**
 * Les dilemmes : six arbitrages rapides entre deux thèmes. Chaque réponse déplace les priorités du citoyen,
 * ce qui affine le classement sans lui demander de lire un texte de plus.
 */
export interface Dilemme {
  id: string;
  question: string;
  a: { theme: ThemeId; libelle: string };
  b: { theme: ThemeId; libelle: string };
}

/** « a » ou « b » : le thème choisi ; « deux » : les deux comptent ; « aucun » : aucun des deux ne prime. */
export type ReponseDilemme = "a" | "b" | "deux" | "aucun";

export const DILEMMES: Dilemme[] = [
  {
    id: "dette-transition",
    question: "Baisser la dette ou financer la transition écologique ?",
    a: { theme: "budget", libelle: "Baisser la dette" },
    b: { theme: "ecologie", libelle: "Financer la transition" },
  },
  {
    id: "police-soin",
    question: "Plus de policiers ou plus de soignants ?",
    a: { theme: "securite", libelle: "Plus de policiers" },
    b: { theme: "sante", libelle: "Plus de soignants" },
  },
  {
    id: "logement-terres",
    question: "Construire des logements ou préserver les terres agricoles ?",
    a: { theme: "logement", libelle: "Construire des logements" },
    b: { theme: "agriculture", libelle: "Préserver les terres" },
  },
  {
    id: "ecole-numerique",
    question: "Investir dans l'école ou dans le numérique et l'IA ?",
    a: { theme: "education", libelle: "Investir dans l'école" },
    b: { theme: "numerique", libelle: "Investir dans le numérique" },
  },
  {
    id: "emploi-environnement",
    question: "Protéger l'emploi ou protéger l'environnement ?",
    a: { theme: "travail", libelle: "Protéger l'emploi" },
    b: { theme: "ecologie", libelle: "Protéger l'environnement" },
  },
  {
    id: "referendum-fermete",
    question: "Plus de référendums ou plus de fermeté de l'État ?",
    a: { theme: "institutions", libelle: "Plus de référendums" },
    b: { theme: "securite", libelle: "Plus de fermeté" },
  },
];

/** Bonus du thème choisi, malus de l'autre : un arbitrage tranche, il ne déclasse pas. */
export const BONUS_CHOIX = 12;
export const MALUS_ECART = -8;
/** « Les deux » relève chaque thème un peu ; « Aucun » les abaisse un peu. */
export const BONUS_LES_DEUX = 6;
export const MALUS_AUCUN = -6;

/** Ce que change une réponse, thème par thème. */
export function ajustements(dilemme: Dilemme, reponse: ReponseDilemme): [ThemeId, number][] {
  const { a, b } = dilemme;
  switch (reponse) {
    case "a":
      return [[a.theme, BONUS_CHOIX], [b.theme, MALUS_ECART]];
    case "b":
      return [[b.theme, BONUS_CHOIX], [a.theme, MALUS_ECART]];
    case "deux":
      return [[a.theme, BONUS_LES_DEUX], [b.theme, BONUS_LES_DEUX]];
    case "aucun":
      return [[a.theme, MALUS_AUCUN], [b.theme, MALUS_AUCUN]];
  }
}

const borner = (valeur: number) => Math.min(100, Math.max(0, valeur));

/**
 * Les priorités qui ne viennent que des dilemmes : 50 pour chaque thème, puis chaque réponse appliquée
 * dans l'ordre des dilemmes, bornée à 0-100. Recalculée de zéro, elle reste exacte quand une réponse change.
 */
export function prioritesDeBase(reponses: Record<string, ReponseDilemme>): Record<ThemeId, number> {
  const base = Object.fromEntries(THEMES.map((t) => [t.id, PRIORITE_PAR_DEFAUT])) as Record<ThemeId, number>;
  base.autre = PRIORITE_PAR_DEFAUT;
  for (const dilemme of DILEMMES) {
    const reponse = reponses[dilemme.id];
    if (!reponse) continue;
    for (const [theme, delta] of ajustements(dilemme, reponse)) base[theme] = borner(base[theme] + delta);
  }
  return base;
}

/** Nombre de dilemmes répondus (les réponses à un dilemme inconnu ne comptent pas). */
export const nombreDeDilemmes = (reponses: Record<string, ReponseDilemme>) =>
  DILEMMES.filter((d) => reponses[d.id]).length;

/** Poids donné à la 1re, 2e et 3e priorité. Les autres thèmes gardent la valeur issue des dilemmes. */
export const POIDS_RANG = [95, 85, 75] as const;

/** Retrouve la sélection déjà enregistrée : les thèmes réglés à 95, 85 ou 75, dans cet ordre. */
export function selectionEnregistree(priorites: Partial<Record<ThemeId, number>>): ThemeId[] {
  return POIDS_RANG.flatMap((poids) => {
    const theme = THEMES.find((t) => priorites[t.id] === poids);
    return theme ? [theme.id as ThemeId] : [];
  });
}

/** Les dix poids : les trois choisis en tête, les autres tels que les dilemmes les ont réglés. */
export function prioritesFinales(
  choix: ThemeId[],
  reponses: Record<string, ReponseDilemme>,
): [ThemeId, number][] {
  const base = prioritesDeBase(reponses);
  return THEMES.map((t) => {
    const rang = choix.indexOf(t.id);
    return [t.id as ThemeId, rang >= 0 ? POIDS_RANG[rang] : base[t.id]];
  });
}
