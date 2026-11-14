import { DILEMMES, ajustements, nombreDeDilemmes } from "@/lib/dilemmes";
import type { Mandat } from "@/lib/mandat";
import { PRIORITE_PAR_DEFAUT, THEMES, type ThemeId } from "@/lib/themes";
import type { Scrutin } from "@/lib/types";

import { AFFIRMATIONS, POINTS_PAR_CRAN } from "./accords";
import { POSTES, pointsDuPoste } from "./budget";
import { POINTS_RANG, classementValide } from "./classement";
import { SCENARIOS } from "./scenarios";

/**
 * Comment chaque format se traduit en poids. Tous aboutissent au même mandat (votes et priorités de 0 à 100),
 * et classerCandidates (lib/candidates) reste la seule source du classement.
 * Chaque thème part de 50 ; on additionne les points de tous les formats, puis on borne à 0-100.
 */
export const TRADUCTION = [
  { format: "Les vrais textes", regle: "Chaque vote est comparé à celui de chaque IA : 60 % de l'affinité." },
  { format: "D'accord ou pas", regle: "Chaque cran vaut 7 points sur le thème de l'affirmation, de −14 à +14." },
  { format: "Le budget", regle: "Chaque milliard au-dessus de la part égale (16,7) vaut +1,2 point sur le thème du poste, borné à ±25." },
  { format: "Scénarios 2050", regle: "La réponse choisie applique ses ajustements affichés, de −8 à +10 points." },
  { format: "Dilemmes", regle: "+12 au thème choisi et −8 à l'autre ; « Les deux » +6 chacun ; « Aucun » −6 chacun." },
  { format: "Classez", regle: "Du 1er au 6e rang : +15, +9, +3, −3, −9, −15 points." },
  { format: "Devinez l'Assemblée", regle: "Bonus : aucun poids sur le résultat." },
] as const;

type Reponses = Pick<Mandat, "dilemmes" | "accords" | "budget" | "scenarios" | "classement">;

/** Les points de chaque thème, format par format, additionnés. */
export function pointsParTheme(m: Reponses): Record<ThemeId, number> {
  const points = Object.fromEntries([...THEMES.map((t) => t.id), "autre"].map((id) => [id, 0])) as Record<ThemeId, number>;
  const ajouter = (theme: ThemeId, valeur: number) => {
    points[theme] += valeur;
  };

  for (const a of AFFIRMATIONS) {
    const cran = m.accords?.[a.id];
    if (cran === undefined) continue;
    for (const [theme, sens] of Object.entries(a.effets) as [ThemeId, number][]) ajouter(theme, cran * sens * POINTS_PAR_CRAN);
  }
  if (m.budget) {
    for (const p of POSTES) if (typeof m.budget[p.id] === "number") ajouter(p.theme, pointsDuPoste(m.budget[p.id]));
  }
  for (const s of SCENARIOS) {
    const option = s.options.find((o) => o.id === m.scenarios?.[s.id]);
    if (!option) continue;
    for (const [theme, valeur] of Object.entries(option.effets) as [ThemeId, number][]) ajouter(theme, valeur);
  }
  for (const d of DILEMMES) {
    const reponse = m.dilemmes[d.id];
    if (reponse) for (const [theme, valeur] of ajustements(d, reponse)) ajouter(theme, valeur);
  }
  if (classementValide(m.classement)) m.classement.forEach((theme, rang) => ajouter(theme, POINTS_RANG[rang]));
  return points;
}

/** Vrai dès qu'un format autre que les textes a reçu une réponse. */
export function aDesReponses(m: Reponses): boolean {
  return (
    nombreDeDilemmes(m.dilemmes) > 0 ||
    Object.keys(m.accords ?? {}).length > 0 ||
    m.budget !== undefined ||
    Object.keys(m.scenarios ?? {}).length > 0 ||
    classementValide(m.classement)
  );
}

/** Les priorités du mandat : 50 + les points de tous les formats, bornées à 0-100. Vide sans réponse. */
export function prioritesDuMandat(m: Reponses): Partial<Record<ThemeId, number>> {
  if (!aDesReponses(m)) return {};
  const points = pointsParTheme(m);
  return Object.fromEntries(
    THEMES.map((t) => [t.id, Math.round(Math.min(100, Math.max(0, PRIORITE_PAR_DEFAUT + points[t.id])))]),
  ) as Partial<Record<ThemeId, number>>;
}

/** Ce que le citoyen a rempli, format par format : sert à la précision et au « Calculé sur » du résultat. */
export interface Resume {
  textes: number;
  accords: number;
  budget: boolean;
  scenarios: number;
  dilemmes: number;
  classement: boolean;
  /** Pronostics justes et pronostics faits, sur les textes connus. */
  pronostics: { justes: number; total: number };
}

export function resumeDuMandat(m: Mandat, scrutins: Scrutin[]): Resume {
  const pronostiques = scrutins.filter((s) => m.pronostics?.[s.id]);
  return {
    textes: scrutins.filter((s) => m.votes[s.id]).length,
    accords: AFFIRMATIONS.filter((a) => m.accords?.[a.id] !== undefined).length,
    budget: m.budget !== undefined,
    scenarios: SCENARIOS.filter((s) => m.scenarios?.[s.id]).length,
    dilemmes: nombreDeDilemmes(m.dilemmes),
    classement: classementValide(m.classement),
    pronostics: { justes: pronostiques.filter((s) => m.pronostics?.[s.id] === s.resultat).length, total: pronostiques.length },
  };
}
