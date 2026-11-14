import type { Teintes } from "@/components/sphere";
import { sphereDuMandat } from "@/lib/sphere-mandat";
import type { Mandat } from "@/lib/mandat";
import { themeDe, type ThemeId } from "@/lib/themes";
import type { Scrutin } from "@/lib/types";

const FOND = "#f4f1ec";
/** Les trois nuages d'une sphère qui ne sait encore rien de vous : des gris. */
const NEUTRES = ["#d5d8de", "#e4e6ea", "#c3c8d0"] as const;

export interface SphereTest {
  teintes: Teintes;
  poids: [number, number, number];
  /** Libellés des thèmes qui colorent la sphère, vide tant que rien n'a été répondu. */
  themes: string[];
}

/**
 * La petite sphère du test. Elle est grise au départ. Chaque texte tranché colore son thème,
 * puis chaque curseur déplacé reprend la main : seuls les thèmes que vous avez touchés la colorent.
 */
export function sphereDuTest(mandat: Mandat, scrutins: Scrutin[]): SphereTest {
  const parId = new Map(scrutins.map((s) => [s.id, s]));
  const compte = new Map<ThemeId, number>();
  for (const id of Object.keys(mandat.votes)) {
    const scrutin = parId.get(id);
    if (scrutin) compte.set(themeDe(scrutin.titre), (compte.get(themeDe(scrutin.titre)) ?? 0) + 1);
  }

  const connus: Partial<Record<ThemeId, number>> = {};
  for (const [theme, n] of compte) connus[theme] = Math.min(100, 50 + 25 * n);
  Object.assign(connus, mandat.priorites);

  const { dominantes } = sphereDuMandat({ votes: mandat.votes, priorites: connus });
  const lignes = dominantes.map((d, i) => {
    const connu = connus[d.theme] !== undefined;
    return {
      couleur: connu ? d.couleur : NEUTRES[i],
      poids: connu ? 0.35 + (d.poids / 100) * 1.25 : 0.75,
      libelle: connu ? d.libelle : null,
    };
  });

  return {
    teintes: [FOND, lignes[0].couleur, lignes[1].couleur, lignes[2].couleur],
    poids: [lignes[0].poids, lignes[1].poids, lignes[2].poids],
    themes: lignes.flatMap((l) => (l.libelle ? [l.libelle] : [])),
  };
}
