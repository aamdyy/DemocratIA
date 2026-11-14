import type { Position, PositionsParScrutin, Provenance, Scrutin } from "@/lib/types";
import { prioriteDe, type Mandat } from "@/lib/mandat";
import { PRIORITE_PAR_DEFAUT, themeDe } from "@/lib/themes";

export interface Concordance {
  sigle: string;
  libelle: string;
  /** Part d'accord pondérée, de 0 à 1. */
  accord: number;
  /** Nombre de textes où le groupe avait une position majoritaire. */
  textes: number;
}

export const DEFINITION_CONCORDANCE =
  "Part des textes que vous avez arbitrés où la position majoritaire du groupe est la vôtre, pondérée par vos priorités.";

/** Accord entre le mandat citoyen et chaque groupe, sur les textes arbitrés. */
export function concordanceParGroupe(
  mandat: Mandat,
  positions: PositionsParScrutin,
  scrutins: Scrutin[],
): Concordance[] {
  const cumul = new Map<string, { libelle: string; accord: number; total: number; textes: number }>();
  for (const scrutin of scrutins) {
    const vote = mandat.votes[scrutin.id];
    const groupes = positions[scrutin.id];
    if (!vote || !groupes) continue;
    const poids = prioriteDe(mandat, themeDe(scrutin.titre)) / PRIORITE_PAR_DEFAUT;
    if (poids === 0) continue;
    for (const groupe of groupes) {
      if (!groupe.position) continue;
      const ligne = cumul.get(groupe.sigle) ?? { libelle: groupe.libelle, accord: 0, total: 0, textes: 0 };
      ligne.total += poids;
      ligne.textes += 1;
      if (groupe.position === vote) ligne.accord += poids;
      cumul.set(groupe.sigle, ligne);
    }
  }
  return [...cumul.entries()]
    .map(([sigle, l]) => ({ sigle, libelle: l.libelle, accord: l.total ? l.accord / l.total : 0, textes: l.textes }))
    .sort((a, b) => b.accord - a.accord || a.sigle.localeCompare(b.sigle));
}

export interface PositionMandat {
  position: Position;
  /** « mandat » : le citoyen a tranché. « extrapolee » : déduite du groupe le plus proche. */
  origine: "mandat" | "extrapolee" | "indetermine";
  groupeProche?: string;
}

/**
 * Ce que vote le Député IA sur un texte. Si le citoyen ne l'a pas arbitré, il suit le groupe
 * dont le mandat est le plus proche : une extrapolation, affichée comme telle.
 */
export function positionDuMandat(
  scrutinId: string,
  mandat: Mandat,
  positions: PositionsParScrutin,
  concordance: Concordance[],
): PositionMandat {
  const vote = mandat.votes[scrutinId];
  if (vote) return { position: vote, origine: "mandat" };
  const groupes = positions[scrutinId] ?? [];
  for (const proche of concordance) {
    const position = groupes.find((g) => g.sigle === proche.sigle)?.position;
    if (position) return { position, origine: "extrapolee", groupeProche: proche.sigle };
  }
  return { position: "abstention", origine: "indetermine" };
}

export const sourceCalcul = (definition: string, date: string | null = null): Provenance => ({
  editeur: "DemocratIA",
  url: null,
  licence: "Calcul sur données sous Licence Ouverte 2.0",
  date,
  nature: "calculee",
  definition,
});
