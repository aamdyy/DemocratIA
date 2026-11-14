// Nappe musicale originale générée par Eleven Music (aucun enregistrement existant n'est utilisé).
// La clé est lue dans process.env.ELEVENLABS_API_KEY, injectée au lancement depuis le trousseau macOS :
//   ELEVENLABS_API_KEY="$(security find-generic-password -a kork -s elevenlabs-api -w)" node scripts/musique.mjs
// Écrit public/musique.mp3. Une musique déjà présente n'est pas régénérée.
import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const FICHIER = join(RACINE, "public", "musique.mp3");
const CLE = process.env.ELEVENLABS_API_KEY;
if (!CLE) {
  console.error("ELEVENLABS_API_KEY absente : lancez la commande avec la clé du trousseau.");
  process.exit(1);
}
if (existsSync(FICHIER)) {
  console.log("musique.mp3 déjà présente, rien à faire");
  process.exit(0);
}

export const PROMPT =
  "Original instrumental classical orchestral piece for a film-like institutional presentation. String orchestra " +
  "(violins, violas, cellos, soft double basses) with an expressive solo piano. Luminous, hopeful and slightly solemn, " +
  "in a major key, around 72 BPM. Opens very softly with sustained strings and a simple piano motif, keeps a calm " +
  "and spacious middle that leaves room for narration, a brief hush around 58 seconds, then a hopeful swell and a " +
  "gradual crescendo with fuller strings over the last twenty seconds, ending on a warm, resolved final chord. No vocals, no choir, no percussion, no electronic sounds.";

const reponse = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192", {
  method: "POST",
  headers: { "xi-api-key": CLE, "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: PROMPT, music_length_ms: 81000, force_instrumental: true }),
});
if (!reponse.ok) {
  // Seul le statut et le message d'erreur sont affichés, jamais les en-têtes.
  console.error(`Erreur ${reponse.status} : ${(await reponse.text()).slice(0, 500)}`);
  process.exit(2);
}
writeFileSync(FICHIER, Buffer.from(await reponse.arrayBuffer()));
console.log("musique.mp3 écrite");
