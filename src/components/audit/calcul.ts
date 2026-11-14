import type { Depute, Position, PositionGroupe, PositionVote, Scrutin } from "@/lib/types";

import type { LectureResultats } from "./use-resultats";

export interface LigneAudit {
  scrutin: Scrutin;
  /** Position du citoyen : c'est aussi, par construction, le vote d'Olympe. */
  mandat: Position;
  etat: "attente" | "lu" | "echec";
  erreur?: string;
  /** Vote publié de l'élu, ou null s'il ne figure pas parmi les votants du scrutin. */
  voteElu: PositionVote | null;
  /** Sigle du groupe de l'élu le jour du scrutin (à défaut, son groupe actuel). */
  sigleGroupe: string | null;
  /** Décompte et position majoritaire de ce groupe sur le scrutin. */
  groupe: PositionGroupe | null;
}

/** Une ligne par texte arbitré : le mandat, le vote de l'élu et la position de son groupe ce jour-là. */
export function lignesAudit(
  textes: Scrutin[],
  votes: Record<string, Position>,
  depute: Depute,
  lecture: LectureResultats | undefined,
): LigneAudit[] {
  return textes.map((scrutin) => {
    const base = { scrutin, mandat: votes[scrutin.id], voteElu: null, sigleGroupe: depute.groupe, groupe: null };
    const resultat = lecture?.resultats[scrutin.id]?.data;
    if (!resultat) {
      const erreur = lecture?.echecs[scrutin.id];
      return erreur ? { ...base, etat: "echec", erreur } : { ...base, etat: "attente" };
    }
    const vote = resultat.votes.find((v) => v.acteurId === depute.id);
    const sigleGroupe = vote?.groupe ?? depute.groupe;
    return {
      scrutin: resultat.scrutin,
      mandat: votes[scrutin.id],
      etat: "lu",
      voteElu: vote?.position ?? null,
      sigleGroupe,
      groupe: resultat.groupes.find((g) => g.sigle === sigleGroupe) ?? null,
    };
  });
}

export interface SyntheseAudit {
  /** Textes arbitrés dont le résultat a été lu. */
  textes: number;
  /** Textes où l'élu a voté comme le mandat. */
  commeMandat: number;
  /** Textes où l'élu s'est exprimé et où son groupe avait une position majoritaire. */
  comparablesGroupe: number;
  /** Parmi eux, ceux où l'élu a voté comme son groupe. */
  commeGroupe: number;
}

const exprime = (vote: PositionVote | null): vote is Position => vote !== null && vote !== "non_votant";

export function syntheseAudit(lignes: LigneAudit[]): SyntheseAudit {
  const synthese: SyntheseAudit = { textes: 0, commeMandat: 0, comparablesGroupe: 0, commeGroupe: 0 };
  for (const ligne of lignes) {
    if (ligne.etat !== "lu") continue;
    synthese.textes += 1;
    if (ligne.voteElu === ligne.mandat) synthese.commeMandat += 1;
    if (exprime(ligne.voteElu) && ligne.groupe?.position) {
      synthese.comparablesGroupe += 1;
      if (ligne.voteElu === ligne.groupe.position) synthese.commeGroupe += 1;
    }
  }
  return synthese;
}

export const DEFINITION_AUDIT =
  "Périmètre : uniquement les textes que vous avez arbitrés dans votre mandat. « Comme votre mandat » compte les textes où le vote publié de l'élu est le vôtre ; un texte où il n'a pas pris part au vote ne compte pas comme un accord. « Comme son groupe » compte, parmi les textes où l'élu a voté pour, contre ou s'est abstenu, ceux où son vote est la position majoritaire de son groupe ce jour-là.";

export const nomComplet = (depute: Depute) => `${depute.prenom} ${depute.nom}`.trim();
