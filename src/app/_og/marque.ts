import { CANDIDATES } from "@/lib/candidates";
import type { Teintes } from "@/components/sphere";

/** La sphère de la marque : les couleurs mêlées de trois candidates, comme celle de l'accueil. */
const [GAIA, , HYGIE, , ATHENA] = CANDIDATES;
export const TEINTES_MARQUE: Teintes = ["#f6f4f1", GAIA.teintes[1], HYGIE.teintes[1], ATHENA.teintes[3]];
