// Montage de la voix : la prise d'ElevenLabs (76,6 s, avec respirations) est découpée aux silences entre phrases et posée avec
// quelques respirations supplémentaires, pour que chaque scène tombe sur ses mots.
import MOTS_SOURCE from "../public/mots.json";

// [début, fin] dans la prise, et décalage (s) appliqué pour la poser sur la vidéo.
export const SEGMENTS = [
  { de: 0.0, a: 58.8, decalage: 0.6 },
  { de: 58.8, a: 76.9, decalage: 1.0 },
];

const decalageDe = (t) => (SEGMENTS.find((s) => t >= s.de && t < s.a) ?? SEGMENTS[SEGMENTS.length - 1]).decalage;

/** Les mots de la voix, avec leurs temps sur la vidéo (secondes). */
export const MOTS = MOTS_SOURCE.map((m) => ({ mot: m.mot, debut: m.debut + decalageDe(m.debut), fin: m.fin + decalageDe(m.debut) }));

/** Temps (vidéo) du n-ième mot qui commence par `texte` (pratique pour caler une animation sur la voix). */
export function quand(texte, n = 0) {
  const trouves = MOTS.filter((m) => m.mot.startsWith(texte));
  if (!trouves[n]) throw new Error(`Mot introuvable : ${texte}`);
  return trouves[n].debut;
}

// Les scènes, en secondes sur la vidéo.
export const SCENES = {
  ouverture: [0, 6.4],
  candidates: [6.1, 13.7],
  comparatif: [13.4, 26.8],
  test: [26.5, 34.7],
  course: [34.4, 43.3],
  pouvoir: [43.0, 51.7],
  honnetete: [51.4, 59.6],
  final: [59.3, 80],
};

// La musique s'efface sous la voix : 1 quand la voix parle, 0 dans les silences (rampes de 0,35 s).
export function voixActive(t) {
  let v = 0;
  for (const m of MOTS) {
    const avant = m.debut - t;
    const apres = t - m.fin;
    const d = Math.max(avant, apres, 0);
    v = Math.max(v, 1 - Math.min(1, d / 0.35));
    if (v === 1) break;
  }
  return v;
}
