"use client";

import type { Teintes } from "@/components/sphere";
import { CANDIDATES, type Candidate } from "@/lib/candidates";
import { useClassement } from "@/lib/ma-candidate";

/** Couleurs mêlées de plusieurs candidates : la sphère de quelqu'un qui n'a pas encore passé le test. */
const [IRIS, , MAELLE, , NOE] = CANDIDATES;
export const TEINTES_MELEES: Teintes = ["#f6f4f1", IRIS.teintes[1], MAELLE.teintes[1], NOE.teintes[3]];

/**
 * La sphère du citoyen : celle de l'IA qui lui correspond le mieux une fois le test commencé,
 * sinon un mélange des couleurs des candidates.
 */
export function useMaSphere(): { regle: boolean; candidate: Candidate | null; teintes: Teintes } {
  const { classement, regle } = useClassement();
  const candidate = regle ? (classement[0]?.candidate ?? null) : null;
  return { regle, candidate, teintes: candidate ? candidate.teintes : TEINTES_MELEES };
}
