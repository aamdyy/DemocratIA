/**
 * Thème d'un texte, estimé par mots-clés dans son intitulé.
 * C'est un calcul de DemocratIA, pas une donnée publiée : l'interface le signale comme tel.
 */
export const THEMES = [
  { id: "budget", libelle: "Budget et impôts", motif: /financ|budg|fiscal|imp[ôo]t|taxe|taxation|dette|superprofit/i },
  { id: "travail", libelle: "Travail et retraites", motif: /travail|retraite|emploi|ch[ôo]mage|salari|quatre jours/i },
  { id: "sante", libelle: "Santé", motif: /sant[ée]|soins|h[ôo]pital|m[ée]dic|fin de vie|aide à mourir/i },
  { id: "ecologie", libelle: "Écologie et énergie", motif: /[ée]colog|climat|[ée]nerg|environnement|nucl[ée]aire|sobri[ée]t[ée]|biodiversit/i },
  { id: "securite", libelle: "Sécurité et justice", motif: /s[ée]curit[ée] int[ée]rieure|justice|p[ée]nal|police|narcotrafic|d[ée]linquan|prison|terroris/i },
  { id: "logement", libelle: "Logement", motif: /logement|loyer|habitat|locati/i },
  { id: "agriculture", libelle: "Agriculture", motif: /agric|paysan|alimenta|p[êe]che/i },
  { id: "numerique", libelle: "Numérique et IA", motif: /num[ée]rique|intelligence artificielle|donn[ée]es|cyber|plateforme/i },
  { id: "education", libelle: "Éducation", motif: /[ée]ducation|[ée]cole|enseign|universit|[ée]tudiant/i },
  { id: "institutions", libelle: "Institutions", motif: /constitution|[ée]lection|r[ée]f[ée]rendum|collectivit|outre-mer|censure/i },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"] | "autre";

export const LIBELLE_AUTRE = "Autres textes";

export function themeDe(titre: string): ThemeId {
  return THEMES.find((theme) => theme.motif.test(titre))?.id ?? "autre";
}

export function libelleTheme(id: ThemeId): string {
  return THEMES.find((theme) => theme.id === id)?.libelle ?? LIBELLE_AUTRE;
}

export const PRIORITE_PAR_DEFAUT = 50;
