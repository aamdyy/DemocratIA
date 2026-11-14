"use client";

import { useScrutins } from "@/lib/api";
import { classerCandidates, type Affinite } from "@/lib/candidates";
import { useMandat } from "@/lib/mandat";

/**
 * Le classement des IA candidates pour le citoyen. `regle` est faux tant que le citoyen n'a ni
 * tranché de texte ni bougé de priorité : il faut alors l'inviter à passer le test.
 */
export function useClassement(): { classement: Affinite[]; regle: boolean; chargement: boolean } {
  const mandat = useMandat();
  const { data, isLoading } = useScrutins();
  const regle = Object.keys(mandat.votes).length > 0 || Object.keys(mandat.priorites).length > 0;
  return { classement: classerCandidates(mandat, data?.data ?? []), regle, chargement: isLoading };
}
