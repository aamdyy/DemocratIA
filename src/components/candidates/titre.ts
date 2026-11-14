import { titreLisible } from "@/lib/format";

/**
 * Le titre d'un texte, débarrassé de ses mentions de procédure : « (texte de la commission mixte paritaire). »,
 * « (lecture définitive) » ou le point final n'aident pas le citoyen à savoir de quoi parle le texte.
 */
export function titreCourt(titre: string): string {
  return titreLisible(titre)
    .replace(/\s*\((texte de la commission mixte paritaire|lecture définitive|texte de la commission|nouvelle lecture)\)\.?$/i, "")
    .replace(/\s*\.$/, "")
    .trim();
}

const NATURE = /^(projet|proposition) de loi( constitutionnelle| organique)?\s+/i;
/** Les tournures qui n'apportent rien entre la nature du texte et son sujet. */
const LIAISON = /^(visant à |relative? (à la |à l['’]|aux? |à )|relatif (à la |à l['’]|aux? |à )|portant |pour (une? |la |le |l['’]|les )?|sur (la |le |l['’]|les )?)/i;

/** « Proposition de loi », « Projet de loi constitutionnelle » : la nature du texte, à afficher à part. */
export function natureTexte(titre: string): string | null {
  const nature = NATURE.exec(titreCourt(titre));
  if (!nature) return null;
  const texte = nature[0].trim();
  return texte.charAt(0).toUpperCase() + texte.slice(1).toLowerCase();
}

/**
 * L'essentiel d'un titre : « Proposition de loi visant à renforcer l'effectivité… » devient « Renforcer l'effectivité… ».
 * Un titre qui ne se raccourcit pas proprement (« Projet de loi de finances… ») reste entier.
 */
export function titreEssentiel(titre: string): string {
  const court = titreCourt(titre);
  const nature = NATURE.exec(court);
  if (!nature) return court;
  const reste = court.slice(nature[0].length);
  const liaison = LIAISON.exec(reste);
  if (!liaison) return court;
  const sujet = reste.slice(liaison[0].length).trim();
  return sujet ? sujet.charAt(0).toUpperCase() + sujet.slice(1) : court;
}
