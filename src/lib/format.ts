const DATE_LONGUE = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const DATE_COURTE = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
const NOMBRE = new Intl.NumberFormat("fr-FR");
const POURCENT = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 0 });

function date(iso: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const dateLongue = (iso: string | null) => {
  const d = date(iso);
  return d ? DATE_LONGUE.format(d) : "date non communiquée";
};

export const dateCourte = (iso: string | null) => {
  const d = date(iso);
  return d ? DATE_COURTE.format(d) : null;
};

export const nombre = (n: number) => NOMBRE.format(n);
export const pourcent = (part: number) => POURCENT.format(part);

/**
 * « l'ensemble du projet de loi relatif à… » devient « Projet de loi relatif à… » :
 * le citoyen arbitre un texte, pas une formule de procès-verbal.
 */
export function titreLisible(titre: string): string {
  const sansFormule = titre
    .replace(/^l['’]ensemble\s+(du\s+|de\s+la\s+|de\s+l['’]|des\s+)/i, "")
    .replace(/\s*\((première|deuxième|nouvelle|dernière) lecture\)\.?$/i, "")
    .trim();
  return sansFormule.charAt(0).toUpperCase() + sansFormule.slice(1);
}

export const LIBELLE_POSITION = {
  pour: "Pour",
  contre: "Contre",
  abstention: "Abstention",
  non_votant: "Non-votant",
} as const;

const CHIFFRES = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze"];

/** Un petit nombre en toutes lettres (« sept »), pour que les phrases suivent le nombre réel d'éléments. */
export const enLettres = (n: number) => CHIFFRES[n] ?? String(n);
