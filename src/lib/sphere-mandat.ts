import type { Teintes } from "@/components/sphere";
import { prioriteDe, type Mandat } from "@/lib/mandat";
import { THEMES, type ThemeId } from "@/lib/themes";

/** Couleur de chaque thème dans la sphère : plus une priorité pèse, plus sa couleur gagne du terrain. */
export const COULEUR_THEME: Record<ThemeId, string> = {
  budget: "#c98a12",
  travail: "#d9531e",
  sante: "#e0457b",
  ecologie: "#1f9d77",
  securite: "#2f5fe0",
  logement: "#8a5cf0",
  agriculture: "#6f9a1f",
  numerique: "#0f9bb5",
  education: "#b8541f",
  institutions: "#5a6170",
  autre: "#9aa0ab",
};

export interface SphereMandat {
  teintes: Teintes;
  /** Taille relative des trois nuages, à passer à <Sphere poids>. */
  poids: [number, number, number];
  /** Les trois priorités les plus fortes du mandat, de la plus forte à la moins forte. */
  dominantes: { theme: ThemeId; libelle: string; poids: number; couleur: string }[];
}

/** Traduit un mandat en sphère : les trois priorités les plus fortes lui donnent ses couleurs. */
export function sphereDuMandat(mandat: Mandat): SphereMandat {
  const dominantes = THEMES.map((theme) => ({
    theme: theme.id as ThemeId,
    libelle: theme.libelle as string,
    poids: prioriteDe(mandat, theme.id),
    couleur: COULEUR_THEME[theme.id],
  }))
    .sort((a, b) => b.poids - a.poids)
    .slice(0, 3);
  return {
    teintes: ["#f4f1ec", dominantes[0].couleur, dominantes[1].couleur, dominantes[2].couleur],
    poids: dominantes.map((d) => 0.35 + (d.poids / 100) * 1.25) as [number, number, number],
    dominantes,
  };
}
