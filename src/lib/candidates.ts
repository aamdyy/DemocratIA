import type { Teintes } from "@/components/sphere";
import { prioriteDe, type Mandat } from "@/lib/mandat";
import { THEMES, themeDe, type ThemeId } from "@/lib/themes";
import type { Position, Scrutin } from "@/lib/types";

/**
 * Les sept IA candidates à la présidence de 2050. Toutes sont fictives : un prénom, une sphère,
 * une doctrine et un poids par thème. Aucune n'est liée à une personne ou à un parti réels.
 * Leur position sur un vrai texte se déduit de leur poids sur le thème du texte (règle publique,
 * voir positionCandidate) : c'est ce qui les rend auditables, à la différence d'un humain.
 */
export interface Candidate {
  id: string;
  prenom: string;
  doctrine: string;
  portrait: string;
  teintes: Teintes;
  poids: Record<ThemeId, number>;
}

const poids = (p: Partial<Record<ThemeId, number>>): Record<ThemeId, number> => ({
  budget: 50,
  travail: 50,
  sante: 50,
  ecologie: 50,
  securite: 50,
  logement: 50,
  agriculture: 50,
  numerique: 50,
  education: 50,
  institutions: 50,
  autre: 50,
  ...p,
});

export const CANDIDATES: Candidate[] = [
  {
    id: "gaia",
    prenom: "Gaïa",
    doctrine: "Le climat d'abord, toujours.",
    portrait: "Gaïa évalue chaque texte à son effet sur le climat et le vivant. Elle accepte de dépenser pour la transition.",
    teintes: ["#e3f4ec", "#1f9d77", "#0f6b52", "#8fd6b9"],
    poids: poids({ ecologie: 95, agriculture: 70, sante: 60, budget: 30, securite: 30, numerique: 45 }),
  },
  {
    id: "themis",
    prenom: "Thémis",
    doctrine: "L'ordre et la sécurité.",
    portrait: "Thémis soutient tout ce qui renforce la sécurité et la justice. Elle se méfie des dépenses nouvelles.",
    teintes: ["#e1e9fb", "#2f5fe0", "#1b3a8f", "#9db9f2"],
    poids: poids({ securite: 95, institutions: 70, budget: 70, ecologie: 30, logement: 35, travail: 40 }),
  },
  {
    id: "hygie",
    prenom: "Hygie",
    doctrine: "Soigner, loger, protéger.",
    portrait: "Hygie juge un texte à ce qu'il change pour la santé, le logement et le travail des plus fragiles.",
    teintes: ["#fbe3ec", "#e0457b", "#9c1f4f", "#f5a3c2"],
    poids: poids({ sante: 95, logement: 90, travail: 80, education: 70, budget: 25, securite: 35 }),
  },
  {
    id: "plutus",
    prenom: "Plutus",
    doctrine: "Des comptes à l'équilibre.",
    portrait: "Plutus vote pour ce qui réduit la dette et soutient l'activité, contre ce qui dépense sans financement.",
    teintes: ["#fdf0d8", "#c98a12", "#8a5a05", "#f2c66b"],
    poids: poids({ budget: 95, travail: 70, agriculture: 60, logement: 35, sante: 40, ecologie: 40 }),
  },
  {
    id: "athena",
    prenom: "Athéna",
    doctrine: "Le savoir et les libertés numériques.",
    portrait: "Athéna priorise l'éducation, la recherche et le numérique. Elle se méfie de la surveillance.",
    teintes: ["#dff3f7", "#0f9bb5", "#0a5f73", "#8bd5e4"],
    poids: poids({ numerique: 95, education: 90, institutions: 65, securite: 25, budget: 45 }),
  },
  {
    id: "harmonie",
    prenom: "Harmonie",
    doctrine: "Le compromis d'abord.",
    portrait: "Harmonie ne tranche fort sur rien : elle soutient ce qui protège le plus grand nombre et s'abstient sur le reste.",
    teintes: ["#ece8fb", "#7a5cd6", "#4a3596", "#c2b3f2"],
    poids: poids({ sante: 68, education: 68, institutions: 66, travail: 60, logement: 60, ecologie: 58, budget: 55, securite: 55, agriculture: 52, numerique: 52 }),
  },
  {
    id: "demeter",
    prenom: "Déméter",
    doctrine: "La France des territoires.",
    portrait: "Déméter juge un texte à ce qu'il change pour les campagnes, les villes moyennes et les services publics de proximité.",
    teintes: ["#f8e6dc", "#c2562f", "#7f3216", "#eba586"],
    poids: poids({ agriculture: 95, logement: 72, institutions: 70, travail: 66, sante: 66, ecologie: 55, numerique: 32, budget: 50 }),
  },
];

export const candidateParId = (id: string) => CANDIDATES.find((c) => c.id === id) ?? null;

/** Règle publique : pour au-dessus de 65, contre en dessous de 35, abstention entre les deux. */
export const REGLE_POSITION =
  "Une IA candidate vote pour un texte si son poids sur le thème du texte dépasse 65 sur 100, contre s'il est sous 35, et s'abstient entre les deux.";

export function positionCandidate(candidate: Candidate, scrutin: Pick<Scrutin, "titre">): Position {
  const p = candidate.poids[themeDe(scrutin.titre)];
  return p > 65 ? "pour" : p < 35 ? "contre" : "abstention";
}

export interface Affinite {
  candidate: Candidate;
  /** De 0 à 1. */
  score: number;
  /** Accord sur les textes tranchés, de 0 à 1, ou null si aucun texte tranché. */
  accordTextes: number | null;
  /** Proximité des priorités, de 0 à 1. */
  accordPriorites: number;
  textesCommuns: Scrutin[];
  textesDivergents: Scrutin[];
  /** Thèmes où le citoyen et la candidate sont les plus proches, parmi ceux qui comptent pour le citoyen. */
  themesCommuns: { theme: ThemeId; libelle: string }[];
}

export const DEFINITION_AFFINITE =
  "Affinité = 60 % d'accord sur les textes que vous avez tranchés (une abstention face à un vote compte pour moitié) + 40 % de proximité entre vos priorités et celles de la candidate.";

/** Classe les candidates de la plus proche à la plus éloignée du mandat du citoyen. */
export function classerCandidates(mandat: Mandat, scrutins: Scrutin[]): Affinite[] {
  const tranches = scrutins.filter((s) => mandat.votes[s.id]);
  return CANDIDATES.map((candidate) => {
    let points = 0;
    const textesCommuns: Scrutin[] = [];
    const textesDivergents: Scrutin[] = [];
    for (const s of tranches) {
      const moi = mandat.votes[s.id];
      const elle = positionCandidate(candidate, s);
      if (moi === elle) {
        points += 1;
        textesCommuns.push(s);
      } else if (moi === "abstention" || elle === "abstention") {
        points += 0.5;
      } else {
        textesDivergents.push(s);
      }
    }
    const accordTextes = tranches.length ? points / tranches.length : null;
    const ecarts = THEMES.map((t) => ({
      theme: t.id as ThemeId,
      libelle: t.libelle as string,
      moi: prioriteDe(mandat, t.id),
      ecart: Math.abs(prioriteDe(mandat, t.id) - candidate.poids[t.id]),
    }));
    const accordPriorites = 1 - ecarts.reduce((somme, e) => somme + e.ecart, 0) / (ecarts.length * 100);
    const themesCommuns = ecarts
      .filter((e) => e.moi >= 60)
      .sort((a, b) => a.ecart - b.ecart)
      .slice(0, 3)
      .map(({ theme, libelle }) => ({ theme, libelle }));
    const score = accordTextes === null ? accordPriorites : 0.6 * accordTextes + 0.4 * accordPriorites;
    return { candidate, score, accordTextes, accordPriorites, textesCommuns, textesDivergents, themesCommuns };
  }).sort((a, b) => b.score - a.score);
}
