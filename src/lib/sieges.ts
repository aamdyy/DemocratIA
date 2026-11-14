export interface Siege {
  x: number;
  y: number;
}

export const CADRE_HEMICYCLE = { largeur: 1000, hauteur: 520, rayonSiege: 8.4 };

const CENTRE = { x: 500, y: 504 };
const RAYON_INTERIEUR = 170;
const RAYON_EXTERIEUR = 480;

/**
 * Place les sièges en demi-cercle, puis les trie de la gauche vers la droite de l'hémicycle :
 * en les attribuant dans cet ordre, chaque groupe occupe un quartier, comme en séance.
 */
export function placerSieges(total = 577, rangs = 12): Siege[] {
  const rayons = Array.from(
    { length: rangs },
    (_, i) => RAYON_INTERIEUR + (i * (RAYON_EXTERIEUR - RAYON_INTERIEUR)) / (rangs - 1),
  );
  const somme = rayons.reduce((a, b) => a + b, 0);
  const exacts = rayons.map((rayon) => (total * rayon) / somme);
  const effectifs = exacts.map(Math.floor);
  // Les sièges restants vont aux rangs dont la part entière a le plus tronqué.
  const restes = exacts.map((exact, i) => ({ i, reste: exact - effectifs[i] })).sort((a, b) => b.reste - a.reste);
  // Le manque se calcule une fois : recalculé à chaque tour, il diminuait pendant qu'on le comblait.
  const manque = total - effectifs.reduce((a, b) => a + b, 0);
  for (let k = 0; k < manque; k++) effectifs[restes[k].i]++;

  const sieges: (Siege & { angle: number; rayon: number })[] = [];
  rayons.forEach((rayon, rang) => {
    const n = effectifs[rang];
    for (let j = 0; j < n; j++) {
      const angle = Math.PI - ((j + 0.5) * Math.PI) / n;
      sieges.push({
        x: Math.round((CENTRE.x + rayon * Math.cos(angle)) * 10) / 10,
        y: Math.round((CENTRE.y - rayon * Math.sin(angle)) * 10) / 10,
        angle,
        rayon,
      });
    }
  });
  return sieges
    .sort((a, b) => b.angle - a.angle || a.rayon - b.rayon)
    .map(({ x, y }) => ({ x, y }));
}

/** Ordre des groupes de la 17e législature dans l'hémicycle, de la gauche vers la droite. */
const ORDRE_GROUPES = ["LFI-NFP", "GDR", "ECOS", "SOC", "LIOT", "EPR", "DEM", "HOR", "DR", "UDR", "RN", "NI"];

export function rangDuGroupe(sigle: string | null): number {
  if (!sigle) return ORDRE_GROUPES.length;
  const cle = sigle.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
  const rang = ORDRE_GROUPES.findIndex((groupe) => cle === groupe || cle.startsWith(groupe));
  return rang < 0 ? ORDRE_GROUPES.length - 0.5 : rang;
}
