// Montage de la voix off anglaise (ElevenLabs, eleven_v4, prise de 77,8 s accélérée de 4 % sans changer la hauteur :
// 74,8 s). Elle est posée en deux segments, avec une respiration avant « And yet. ». Les sous-titres restent en
// français : chaque phrase française est calée sur le passage anglais correspondant.
import MOTS_SOURCE from "../public/mots.json";

// [début, fin] dans la prise, et décalage (s) appliqué pour la poser sur la vidéo.
export const SEGMENTS = [
  { de: 0.0, a: 57.8, decalage: 0.35 },
  { de: 57.8, a: 74.95, decalage: 0.95 },
];

export const DUREE_SECONDES = 77.5;

const decalageDe = (t) => (SEGMENTS.find((s) => t >= s.de && t < s.a) ?? SEGMENTS[SEGMENTS.length - 1]).decalage;

/** Les mots de la voix, avec leurs temps sur la vidéo (secondes). */
export const MOTS = MOTS_SOURCE.map((m) => ({ mot: m.mot, debut: m.debut + decalageDe(m.debut), fin: m.fin + decalageDe(m.debut) }));

/** Temps (vidéo) du n-ième mot qui commence par `texte` (sensible à la casse). */
export function quand(texte, n = 0) {
  const trouves = MOTS.filter((m) => m.mot.startsWith(texte));
  if (!trouves[n]) throw new Error(`Mot introuvable : ${texte}`);
  return trouves[n].debut;
}

// Passages anglais et sous-titres français, dans l'ordre. Le passage anglais sert à compter les mots.
const PASSAGES = [
  ["In 2050, France no longer elects a president.", "En 2050, la France n'élit plus de président."],
  ["It chooses an artificial intelligence.", "Elle choisit une intelligence artificielle."],
  ["Seven AIs are running.", "Sept IA se présentent."],
  ["No party. No career to protect.", "Pas de parti, pas de carrière à protéger :"],
  ["Just a public doctrine, and votes anyone can check.", "une doctrine publique, et des votes vérifiables."],
  ["A human president is elected for five years,", "Un président humain est élu pour cinq ans,"],
  ["with no return to the voters.", "sans retour devant les électeurs."],
  ["Their promises carry no legal weight.", "Ses promesses n'ont aucune valeur juridique."],
  ["An AI is tuned with every vote,", "Une IA, elle, se règle à chaque vote,"],
  ["and every position it takes is published.", "et chacune de ses positions est publiée."],
  ["To find yours,", "Pour trouver la vôtre,"],
  ["you decide on real bills voted in the French National Assembly.", "vous tranchez de vrais textes de loi votés à l'Assemblée nationale."],
  ["Open public data, sourced by Hémicycle.", "Des données publiques, sourcées par Hémicycle."],
  ["Budget, crises, dilemmas:", "Budget, crises, dilemmes :"],
  ["with every answer, the race tightens…", "à chaque réponse, la course se resserre…"],
  ["until it reveals the AI that matches you.", "jusqu'à révéler l'IA qui vous ressemble."],
  ["Then it takes power.", "Puis elle prend le pouvoir."],
  ["All five hundred and seventy-seven seats switch to its color,", "Les cinq cent soixante-dix-sept sièges basculent à sa couleur,"],
  ["and it drafts its amendment, live.", "et elle rédige son amendement, en direct."],
  ["But let's be honest:", "Mais soyons honnêtes :"],
  ["whoever writes the rule governs.", "celui qui écrit la règle gouverne."],
  ["DemocratIA is fiction, made to ask a question.", "DemocratIA est une fiction, pour poser une question."],
  ["And yet.", "Et pourtant."],
  ["Everything you've seen rests on open data that anyone can verify.", "Tout ce que vous avez vu repose sur des données ouvertes, que chacun peut vérifier."],
  ["Not a machine deciding for us:", "Pas une machine qui décide à notre place :"],
  ["tools to understand the people we elect.", "des outils pour comprendre nos élus."],
  ["The best sphere is the one we never replace:", "La meilleure sphère, c'est celle qu'on ne remplace pas :"],
  ["yours, when you go and vote.", "la vôtre, quand vous allez voter."],
  ["DemocratIA.", "DemocratIA."],
];

/** Les phrases, avec le début et la fin du passage anglais correspondant. */
export const PHRASES = (() => {
  let k = 0;
  const liste = PASSAGES.map(([en, fr]) => {
    const n = en.split(/\s+/).length;
    const mots = MOTS.slice(k, k + n);
    k += n;
    return { en, fr, debut: mots[0].debut, fin: mots[mots.length - 1].fin };
  });
  if (k !== MOTS.length) throw new Error(`Alignement des sous-titres : ${k} mots comptés sur ${MOTS.length}`);
  return liste;
})();

const debutPhrase = (i) => PHRASES[i].debut - 0.12;
const CHEVAUCHEMENT = 0.2;

// Les scènes : chacune entre dès que sa phrase commence (passage de début entre parenthèses).
const DEBUTS = [
  ["ouverture", 0],
  ["candidates", debutPhrase(2)], // Seven AIs are running.
  ["comparatif", debutPhrase(5)], // A human president…
  ["test", debutPhrase(10)], // To find yours,
  ["course", debutPhrase(13)], // Budget, crises, dilemmas:
  ["pouvoir", debutPhrase(16)], // Then it takes power.
  ["honnetete", debutPhrase(19)], // But let's be honest:
  ["final", debutPhrase(22)], // And yet.
];
export const SCENES = Object.fromEntries(
  DEBUTS.map(([cle, debut], i) => [cle, [debut, i + 1 < DEBUTS.length ? DEBUTS[i + 1][1] + CHEVAUCHEMENT : DUREE_SECONDES]]),
);

// Activité de la voix : 1 quand elle parle, 0 dans les silences, avec une attaque de 0,2 s et un relâchement de 0,35 s.
export function voixActive(t) {
  let v = 0;
  for (const m of MOTS) {
    const d = t < m.debut ? (m.debut - t) / 0.2 : t > m.fin ? (t - m.fin) / 0.35 : 0;
    v = Math.max(v, 1 - Math.min(1, d));
    if (v === 1) break;
  }
  return v;
}

// Mots clés de la voix qui reçoivent un léger accent visuel (zoom bref).
export const ACCENTS = ["2050,", "Seven", "human", "published.", "real", "Budget,", "crises,", "dilemmas:", "reveals", "power.", "switch", "live.", "governs.", "yet.", "verify.", "vote.", "DemocratIA."].map(
  (mot) => MOTS.find((m) => m.mot === mot)?.debut ?? null,
).filter((x) => x !== null);
