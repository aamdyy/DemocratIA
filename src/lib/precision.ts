import { DILEMMES } from "@/lib/dilemmes";

/**
 * La précision du résultat est un indicateur de complétude, pas une marge d'erreur statistique :
 * elle dit quelle part du test a été remplie. Textes 60 %, dilemmes 25 %, priorités 15 %.
 */
export const PART_TEXTES = 60;
export const PART_DILEMMES = 25;
export const PART_PRIORITES = 15;

export const MAX_PRIORITES = 3;

/** Nombre de textes visé par le test. */
export const CIBLE_TEXTES = 20;

export const EXPLICATION_PRECISION =
  "Plus vous répondez, plus le classement est fiable. Indicateur de complétude : textes tranchés pour 60 %, dilemmes pour 25 %, priorités pour 15 %.";

export interface Reponses {
  textes: number;
  /** Nombre de textes proposés (20 au plus) : la barre des textes se remplit jusque-là. */
  textesProposes: number;
  dilemmes: number;
  priorites: number;
}

/** De 0 à 100, arrondi à l'entier. */
export function precision({ textes, textesProposes, dilemmes, priorites }: Reponses): number {
  const cibleTextes = Math.max(1, Math.min(CIBLE_TEXTES, textesProposes));
  const part = (fait: number, cible: number) => Math.min(1, Math.max(0, fait / cible));
  return Math.round(
    PART_TEXTES * part(textes, cibleTextes) +
      PART_DILEMMES * part(dilemmes, DILEMMES.length) +
      PART_PRIORITES * part(priorites, MAX_PRIORITES),
  );
}

/** En dessous de ce seuil, le test invite à continuer. */
export const SEUIL_PRECISION = 60;
