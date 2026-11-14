import type { Candidate } from "@/lib/candidates";

/**
 * Le partage, sans base de données : le lien ne porte que l'identifiant de la candidate et le
 * pourcentage d'affinité (?a=84). Rien d'autre n'est lu, stocké ni envoyé.
 */

/**
 * Lit l'affinité dans l'adresse : un entier de 0 à 100, écrit en chiffres, et rien d'autre.
 * Une valeur répétée (?a=1&a=2), vide, décimale ou hors bornes est ignorée.
 */
export function lireAffinite(brut: unknown): number | null {
  if (typeof brut !== "string" || !/^\d{1,3}$/.test(brut)) return null;
  const n = Number(brut);
  return n >= 0 && n <= 100 ? n : null;
}

/** De 0–1 (score du classement) à l'entier affiché (84). */
export const affiniteEntiere = (score: number) => Math.max(0, Math.min(100, Math.round(score * 100)));

/** « 84 % », avec l'espace insécable de la typographie française. */
export const enPourcent = (n: number) => `${n} %`;

export const cheminInvitation = (id: string, affinite: number | null) =>
  `/invitation/${encodeURIComponent(id)}${affinite === null ? "" : `?a=${affinite}`}`;

export const cheminImageInvitation = (id: string, affinite: number | null) =>
  `/invitation/${encodeURIComponent(id)}/image${affinite === null ? "" : `?a=${affinite}`}`;

/** Le texte proposé quand le citoyen partage son IA. */
export const texteMonIA = (candidate: Candidate, affinite: number) =>
  `Mon IA présidente pour 2050, c'est ${candidate.prenom} (${enPourcent(affinite)}). Et la vôtre ?`;

/** Le texte proposé quand le test n'est pas fini : une simple invitation. */
export const TEXTE_INVITATION_GENERIQUE =
  "En 2050, la France élit une IA. Passez le test pour trouver la vôtre, en quelques minutes.";

export const TITRE_PARTAGE = "DemocratIA, la présidentielle de 2050";

/** Les adresses d'intention publiques des réseaux : de simples liens, sans script tiers. */
export function liensIntention(texte: string, lien: string) {
  const t = encodeURIComponent(texte);
  const u = encodeURIComponent(lien);
  const tout = encodeURIComponent(`${texte} ${lien}`);
  return [
    { nom: "X", href: `https://x.com/intent/post?text=${t}&url=${u}` },
    { nom: "WhatsApp", href: `https://wa.me/?text=${tout}` },
    { nom: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { nom: "Bluesky", href: `https://bsky.app/intent/compose?text=${tout}` },
    { nom: "E-mail", href: `mailto:?subject=${encodeURIComponent(TITRE_PARTAGE)}&body=${tout}` },
  ] as const;
}
