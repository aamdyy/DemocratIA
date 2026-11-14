import { CANDIDATES } from "@/lib/candidates";
import type { Teintes } from "@/components/sphere";

/** La sphère de la marque : les couleurs mêlées de trois candidates, comme celle de l'accueil. */
const [IRIS, , MAELLE, , NOE] = CANDIDATES;
export const TEINTES_MARQUE: Teintes = ["#f6f4f1", IRIS.teintes[1], MAELLE.teintes[1], NOE.teintes[3]];
