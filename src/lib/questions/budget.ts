import type { ThemeId } from "@/lib/themes";

/** « Le budget de la République » : 100 milliards à répartir entre six postes, le total reste 100. */
export interface Poste {
  id: string;
  libelle: string;
  theme: ThemeId;
}

export const POSTES: Poste[] = [
  { id: "soins", libelle: "Hôpitaux et soins", theme: "sante" },
  { id: "transition", libelle: "Transition écologique", theme: "ecologie" },
  { id: "ecole", libelle: "École et recherche", theme: "education" },
  { id: "securite", libelle: "Sécurité et justice", theme: "securite" },
  { id: "logement", libelle: "Logement", theme: "logement" },
  { id: "dette", libelle: "Rembourser la dette", theme: "budget" },
];

export const TOTAL_BUDGET = 100;
/** Un poste ne peut pas tout prendre : au plus 60 milliards. */
export const MAX_POSTE = 60;
export const PART_EGALE = TOTAL_BUDGET / POSTES.length;
/** Chaque milliard au-dessus de la part égale vaut 1,2 point de priorité, borné à ±25. */
export const POINTS_PAR_MILLIARD = 1.2;
export const BORNE_BUDGET = 25;

export type Repartition = Record<string, number>;

/** Répartition de départ : la part égale, arrondie pour que le total fasse 100. */
export function repartitionEgale(): Repartition {
  return arrondir(Object.fromEntries(POSTES.map((p) => [p.id, PART_EGALE])), TOTAL_BUDGET);
}

/** Arrondit à l'entier en gardant le total voulu (méthode du plus fort reste). */
function arrondir(brut: Record<string, number>, total: number): Repartition {
  const ids = Object.keys(brut);
  const entiers: Repartition = Object.fromEntries(ids.map((id) => [id, Math.floor(brut[id])]));
  let reste = total - ids.reduce((s, id) => s + entiers[id], 0);
  const parReste = [...ids].sort((a, b) => brut[b] - Math.floor(brut[b]) - (brut[a] - Math.floor(brut[a])));
  for (const id of parReste) {
    if (reste <= 0) break;
    entiers[id] += 1;
    reste -= 1;
  }
  return entiers;
}

/**
 * Curseurs liés : fixe un poste, puis répartit le reste entre les autres au prorata de leur montant
 * (à parts égales s'ils sont tous à zéro). Aucun poste ne dépasse 60 ; le total reste 100.
 */
export function fixerPoste(actuelle: Repartition, id: string, valeur: number): Repartition {
  const v = Math.max(0, Math.min(MAX_POSTE, Math.round(valeur)));
  const autres = POSTES.filter((p) => p.id !== id).map((p) => p.id);
  const somme = autres.reduce((s, a) => s + (actuelle[a] ?? 0), 0);
  const reste = TOTAL_BUDGET - v;
  const brut: Record<string, number> = {};
  for (const a of autres) brut[a] = somme > 0 ? ((actuelle[a] ?? 0) / somme) * reste : reste / autres.length;
  // L'excédent d'un poste plafonné repart sur ceux qui ont encore de la marge.
  for (let tour = 0; tour < autres.length; tour++) {
    let surplus = 0;
    for (const a of autres) {
      if (brut[a] > MAX_POSTE) {
        surplus += brut[a] - MAX_POSTE;
        brut[a] = MAX_POSTE;
      }
    }
    const libres = autres.filter((a) => brut[a] < MAX_POSTE);
    if (surplus <= 0 || libres.length === 0) break;
    for (const a of libres) brut[a] += surplus / libres.length;
  }
  return { ...arrondir(brut, reste), [id]: v };
}

/** Points de priorité d'un poste : écart à la part égale × 1,2, borné à ±25. */
export const pointsDuPoste = (milliards: number) =>
  Math.max(-BORNE_BUDGET, Math.min(BORNE_BUDGET, (milliards - PART_EGALE) * POINTS_PAR_MILLIARD));
