// Transforme l'alignement par caractère d'ElevenLabs en mots horodatés (public/mots.json).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
// Facteur de tempo appliqué à la prise (ffmpeg atempo), par exemple 1.04 : les temps sont divisés d'autant.
const TEMPO = Number(process.argv[2] ?? 1);
const { alignment: a } = JSON.parse(readFileSync(join(RACINE, "public", "voix-alignement.json"), "utf8"));
const mots = [];
let courant = null;
a.characters.forEach((c, i) => {
  if (/\s/.test(c)) { if (courant) { mots.push(courant); courant = null; } return; }
  if (!courant) courant = { mot: "", debut: a.character_start_times_seconds[i] / TEMPO, fin: 0 };
  courant.mot += c;
  courant.fin = a.character_end_times_seconds[i] / TEMPO;
});
if (courant) mots.push(courant);
// Les balises <break> éventuelles ne sont pas des mots prononcés.
const prononces = mots.filter((m) => !/[<>]|^break$|^time=|^\/>$/.test(m.mot));
mots.length = 0;
mots.push(...prononces);
writeFileSync(join(RACINE, "public", "mots.json"), JSON.stringify(mots, null, 0));
console.log(mots.map((m, i) => `${i}:${m.mot}@${m.debut.toFixed(2)}-${m.fin.toFixed(2)}`).join("  "));
