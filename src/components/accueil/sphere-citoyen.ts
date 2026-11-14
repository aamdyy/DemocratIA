"use client";

import { SPHERES, type Teintes } from "@/components/sphere";
import { useMandat } from "@/lib/mandat";
import { PRENOM_DEPUTE_IA, sphereDuMandat } from "@/lib/sphere-mandat";

export interface SphereCitoyen {
  /** Vrai dès que le citoyen a arbitré un texte ou réglé une priorité. */
  regle: boolean;
  /** Vrai dès qu'une priorité a été déplacée : avant cela, tous les thèmes pèsent autant. */
  prioritesReglees: boolean;
  teintes: Teintes;
  poids: readonly [number, number, number] | undefined;
  /** Nombre de textes sur lesquels le citoyen s'est prononcé. */
  textesArbitres: number;
  /** Libellés des trois priorités qui colorent la sphère ; vide tant que rien n'est réglé. */
  priorites: string[];
  /** Phrase lue par les lecteurs d'écran à la place de la sphère. */
  description: string;
}

/**
 * La sphère telle que le citoyen l'a réglée. Sans mandat, elle garde ses couleurs d'origine.
 * Un seul endroit décide de ce qu'est « avoir un mandat » : l'en-tête et l'accueil s'accordent.
 *
 * Le mandat est gardé dans le navigateur : le serveur rend toujours la sphère d'origine, et les
 * couleurs du mandat arrivent juste après, sans écart entre les deux rendus.
 */
export function useSphereCitoyen(): SphereCitoyen {
  const mandat = useMandat();
  const textesArbitres = Object.keys(mandat.votes).length;
  const prioritesReglees = Object.keys(mandat.priorites).length > 0;
  const regle = textesArbitres > 0 || prioritesReglees;

  if (!regle) {
    return {
      regle,
      prioritesReglees,
      teintes: SPHERES.olympe.teintes,
      poids: undefined,
      textesArbitres,
      priorites: [],
      description: `La sphère d’${PRENOM_DEPUTE_IA}, dans ses couleurs d’origine : des nuages roses et pourpres`,
    };
  }

  const sphere = sphereDuMandat(mandat);
  const priorites = sphere.dominantes.map((dominante) => dominante.libelle);
  return {
    regle,
    prioritesReglees,
    teintes: sphere.teintes,
    poids: sphere.poids,
    textesArbitres,
    priorites,
    description: `La sphère d’${PRENOM_DEPUTE_IA}, aux couleurs de votre mandat : ${priorites.join(", ")}`,
  };
}
