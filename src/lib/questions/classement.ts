import type { ThemeId } from "@/lib/themes";

/** « Classez » : six thèmes à ordonner du plus au moins important. L'ordre de départ ne compte pas tant qu'il n'est pas validé. */
export const THEMES_A_CLASSER: ThemeId[] = ["travail", "agriculture", "numerique", "institutions", "education", "securite"];

/** Points de priorité du 1er au 6e rang. */
export const POINTS_RANG = [15, 9, 3, -3, -9, -15] as const;

/** Un classement enregistré n'est gardé que s'il contient exactement les six thèmes. */
export function classementValide(ordre: readonly ThemeId[] | undefined): ordre is ThemeId[] {
  return (
    Array.isArray(ordre) &&
    ordre.length === THEMES_A_CLASSER.length &&
    THEMES_A_CLASSER.every((t) => ordre.includes(t))
  );
}
