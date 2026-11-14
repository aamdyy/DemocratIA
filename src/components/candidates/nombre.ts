import { CANDIDATES } from "@/lib/candidates";
import { enLettres } from "@/lib/format";

/** « sept » : le nombre de candidates suit la liste, il n'est jamais écrit en dur. */
export const NOMBRE_CANDIDATES = enLettres(CANDIDATES.length);

/** « Les sept IA candidates ». */
export const TITRE_CANDIDATES = `Les ${NOMBRE_CANDIDATES} IA candidates`;

/** « Iris, Léon, Maëlle, Sacha, Noé, Inès et Jules ». */
export const PRENOMS_CANDIDATES = CANDIDATES.map((c) => c.prenom)
  .join(", ")
  .replace(/, ([^,]+)$/, " et $1");
