import type { EtatSiege } from "@/components/hemicycle";
import { NOMBRE_SIEGES } from "@/components/hemicycle";
import { rangDuGroupe } from "@/lib/sieges";
import type { Position, PositionVote, VoteNominatif } from "@/lib/types";

/** Ordre des sièges d'un même groupe : les pour, les abstentions, les contre, puis les absents. */
const ORDRE_POSITION: Record<PositionVote, number> = { pour: 0, abstention: 1, contre: 2, non_votant: 3 };

/**
 * Un siège par vote réel, rangé de la gauche vers la droite : chaque groupe forme un quartier,
 * et à l'intérieur d'un quartier les positions se suivent. Les sièges sans vote restent éteints.
 */
export function etatsDeLAssemblee2026(votes: VoteNominatif[]): EtatSiege[] {
  return [...votes]
    .sort(
      (a, b) =>
        rangDuGroupe(a.groupe) - rangDuGroupe(b.groupe) ||
        ORDRE_POSITION[a.position] - ORDRE_POSITION[b.position],
    )
    .slice(0, NOMBRE_SIEGES)
    .map((vote) => vote.position);
}

/** En 2050, les 577 sièges sont tenus par la sphère de l'IA présidente. */
export const ETATS_2050: EtatSiege[] = Array.from({ length: NOMBRE_SIEGES }, () => "machine");

export interface Simulation2050 {
  pour: number;
  contre: number;
  abstention: number;
  adopte: boolean;
}

/**
 * Les 577 sièges de 2050 votent comme l'IA présidente. Le texte est adopté si les pour l'emportent
 * sur les contre ; les abstentions ne comptent pas, comme dans un vote à la majorité des suffrages exprimés.
 */
export function simuler2050(position: Position, sieges = NOMBRE_SIEGES): Simulation2050 {
  const pour = position === "pour" ? sieges : 0;
  const contre = position === "contre" ? sieges : 0;
  const abstention = position === "abstention" ? sieges : 0;
  return { pour, contre, abstention, adopte: pour > contre };
}

/** La définition courte, toujours visible sous le résultat simulé. */
export const definitionSimulation = (prenom: string) =>
  `Simulation : les ${NOMBRE_SIEGES} sièges votent comme ${prenom}, selon sa règle publique.`;

/** Le détail du calcul, replié par défaut : la règle de position, puis la règle d'adoption. */
export const ADOPTION_SIMULEE =
  "Le texte est adopté si les pour dépassent les contre ; les abstentions ne comptent pas, comme pour un vote à la majorité des suffrages exprimés.";
