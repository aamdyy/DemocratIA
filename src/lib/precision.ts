import { DILEMMES } from "@/lib/dilemmes";
import { AFFIRMATIONS } from "@/lib/questions/accords";
import { SCENARIOS } from "@/lib/questions/scenarios";

/**
 * La précision du résultat est un indicateur de complétude, pas une marge d'erreur statistique :
 * elle dit quelle part du test a été remplie. Textes 40 %, puis 12 % pour chacun des cinq autres formats
 * (affirmations, budget, scénarios, dilemmes, classement). « Devinez l'Assemblée » est un bonus : 0 %.
 */
export const PART_TEXTES = 40;
export const PART_ACCORDS = 12;
export const PART_BUDGET = 12;
export const PART_SCENARIOS = 12;
export const PART_DILEMMES = 12;
export const PART_CLASSEMENT = 12;
/** Conservé pour compatibilité : les trois priorités sont remplacées par « Classez ». */
export const PART_PRIORITES = 0;

export const MAX_PRIORITES = 3;

/** Nombre de textes visé par le test. */
export const CIBLE_TEXTES = 12;

export const EXPLICATION_PRECISION =
  "Plus vous répondez, plus le classement est fiable. Indicateur de complétude : textes tranchés pour 40 %, puis 12 % chacun pour les affirmations, le budget, les scénarios, les dilemmes et le classement.";

export interface Reponses {
  textes: number;
  /** Nombre de textes proposés (12 au plus) : la barre des textes se remplit jusque-là. */
  textesProposes: number;
  dilemmes: number;
  /** Ancien format (trois priorités) : ignoré. */
  priorites?: number;
  accords?: number;
  budget?: boolean;
  scenarios?: number;
  classement?: boolean;
}

/** De 0 à 100, arrondi à l'entier. */
export function precision({ textes, textesProposes, dilemmes, accords = 0, budget = false, scenarios = 0, classement = false }: Reponses): number {
  const cibleTextes = Math.max(1, Math.min(CIBLE_TEXTES, textesProposes));
  const part = (fait: number, cible: number) => Math.min(1, Math.max(0, fait / cible));
  return Math.round(
    PART_TEXTES * part(textes, cibleTextes) +
      PART_ACCORDS * part(accords, AFFIRMATIONS.length) +
      PART_BUDGET * (budget ? 1 : 0) +
      PART_SCENARIOS * part(scenarios, SCENARIOS.length) +
      PART_DILEMMES * part(dilemmes, DILEMMES.length) +
      PART_CLASSEMENT * (classement ? 1 : 0),
  );
}

/** En dessous de ce seuil, le test invite à continuer. */
export const SEUIL_PRECISION = 60;
