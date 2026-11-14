// Montage de la voix : la prise d'ElevenLabs (53 s) est découpée aux silences entre phrases et posée avec
// quelques respirations supplémentaires, pour que chaque scène tombe sur ses mots.
import MOTS_SOURCE from "../public/mots.json";

// [début, fin] dans la prise, et décalage (s) appliqué pour la poser sur la vidéo.
export const SEGMENTS = [
  { de: 0.0, a: 14.1, decalage: 0.6 },
  { de: 14.1, a: 31.6, decalage: 1.0 },
  { de: 31.6, a: 40.3, decalage: 1.6 },
  { de: 40.3, a: 44.3, decalage: 2.8 },
  { de: 44.3, a: 51.6, decalage: 3.4 },
  { de: 51.6, a: 53.3, decalage: 4.0 },
];

const decalageDe = (t) => (SEGMENTS.find((s) => t >= s.de && t < s.a) ?? SEGMENTS[SEGMENTS.length - 1]).decalage;

/** Les mots de la voix, avec leurs temps sur la vidéo (secondes). */
export const MOTS = MOTS_SOURCE.map((m) => ({ mot: m.mot, debut: m.debut + decalageDe(m.debut), fin: m.fin + decalageDe(m.debut) }));

/** Temps (vidéo) du n-ième mot qui commence par `texte` (pratique pour caler une animation sur la voix). */
export function quand(texte, n = 0) {
  const trouves = MOTS.filter((m) => m.mot.toLowerCase().startsWith(texte.toLowerCase()));
  if (!trouves[n]) throw new Error(`Mot introuvable : ${texte}`);
  return trouves[n].debut;
}

// Les scènes, en secondes sur la vidéo.
export const SCENES = {
  ouverture: [0, 6.3],
  candidates: [6.0, 15.0],
  test: [14.7, 24.5],
  course: [24.2, 33.3],
  pouvoir: [33.0, 42.9],
  honnetete: [42.6, 51.5],
  final: [51.2, 60],
};
