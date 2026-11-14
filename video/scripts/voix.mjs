// Voix off de la vidéo DemocratIA, générée par ElevenLabs avec horodatage par caractère.
// La clé n'est jamais écrite nulle part : elle est lue dans process.env.ELEVENLABS_API_KEY,
// injectée au lancement depuis le trousseau macOS, par exemple :
//   ELEVENLABS_API_KEY="$(security find-generic-password -a kork -s elevenlabs-api -w)" node scripts/voix.mjs generer <voice_id>
//
// Sous-commandes :
//   modeles                 liste les modèles capables de synthèse vocale
//   voix                    liste les voix du compte et des voix françaises de la bibliothèque
//   ajouter <owner> <id>    copie une voix de la bibliothèque dans le compte
//   generer <voice_id> [modele] [réglages JSON] [pauses]   génère public/voix.mp3 et public/voix-alignement.json
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLE = process.env.ELEVENLABS_API_KEY;
if (!CLE) {
  console.error("ELEVENLABS_API_KEY absente : lancez la commande avec la clé du trousseau.");
  process.exit(1);
}

export const TEXTE =
  "En 2050, la France n'élit plus de président. Elle choisit une intelligence artificielle. " +
  "Sept IA se présentent. Pas de parti, pas de carrière à protéger : une doctrine publique, et des votes vérifiables. " +
  "Un président humain est élu pour cinq ans, sans retour devant les électeurs. Ses promesses n'ont aucune valeur juridique. " +
  "Une IA, elle, se règle à chaque vote, et chacune de ses positions est publiée. " +
  "Pour trouver la vôtre, vous tranchez de vrais textes de loi votés à l'Assemblée nationale. " +
  "Des données publiques, sourcées par Hémicycle. " +
  "Budget, crises, dilemmes : à chaque réponse, la course se resserre… jusqu'à révéler l'IA qui vous ressemble. " +
  "Puis elle prend le pouvoir. Les cinq cent soixante-dix-sept sièges basculent à sa couleur, et elle rédige son amendement, en direct. " +
  "Mais soyons honnêtes : celui qui écrit la règle gouverne. " +
  "DemocratIA est une fiction, pour poser une question. " +
  "Et pourtant. " +
  "Tout ce que vous avez vu repose sur des données ouvertes, que chacun peut vérifier. " +
  "Pas une machine qui décide à notre place : des outils pour comprendre nos élus. " +
  "La meilleure sphère, c'est celle qu'on ne remplace pas : la vôtre, quand vous allez voter. " +
  "DemocratIA.";

// Même texte, avec des respirations entre les mouvements du script (balises <break>, non prononcées).
const PAUSE = (s) => ` <break time="${s}s" /> `;
export const TEXTE_RYTHME = TEXTE.replace("artificielle. ", "artificielle." + PAUSE(0.4))
  .replace("vérifiables. ", "vérifiables." + PAUSE(0.5))
  .replace("juridique. ", "juridique." + PAUSE(0.3))
  .replace("publiée. ", "publiée." + PAUSE(0.5))
  .replace("Hémicycle. ", "Hémicycle." + PAUSE(0.4))
  .replace("ressemble. ", "ressemble." + PAUSE(0.5))
  .replace("direct. ", "direct." + PAUSE(0.6))
  .replace("gouverne. ", "gouverne." + PAUSE(0.5))
  .replace("question. ", "question." + PAUSE(0.7))
  .replace("Et pourtant. ", "Et pourtant." + PAUSE(0.6))
  .replace("vérifier. ", "vérifier." + PAUSE(0.3))
  .replace("élus. ", "élus." + PAUSE(0.4))
  .replace("voter. ", "voter." + PAUSE(0.6));

const BASE = "https://api.elevenlabs.io";

async function appel(chemin, options = {}) {
  const reponse = await fetch(BASE + chemin, {
    ...options,
    headers: { "xi-api-key": CLE, "Content-Type": "application/json", ...(options.headers ?? {}) },
  });
  const corps = await reponse.text();
  if (!reponse.ok) {
    // Seul le statut et le message d'erreur sont affichés, jamais les en-têtes.
    console.error(`Erreur ${reponse.status} sur ${chemin} : ${corps.slice(0, 400)}`);
    process.exit(2);
  }
  return JSON.parse(corps);
}

const [commande, ...args] = process.argv.slice(2);

if (commande === "modeles") {
  const modeles = await appel("/v1/models");
  for (const m of modeles) {
    if (!m.can_do_text_to_speech) continue;
    const fr = (m.languages ?? []).some((l) => l.language_id === "fr");
    console.log(`${m.model_id}\tfr=${fr}\t${m.name}`);
  }
} else if (commande === "voix") {
  const compte = await appel("/v2/voices?page_size=100");
  console.log("== Voix du compte ==");
  for (const v of compte.voices) {
    console.log(`${v.voice_id}\t${v.name}\t${v.category}\t${JSON.stringify(v.labels)}`);
  }
  const genre = args[0] === "femme" ? "female" : "male";
  console.log(`== Bibliothèque, français, voix ${genre === "female" ? "de femme" : "d'homme"} ==`);
  const partage = await appel(`/v1/shared-voices?page_size=40&language=fr&gender=${genre}&sort=usage_character_count_1y`);
  for (const v of partage.voices) {
    console.log(
      `${v.public_owner_id}\t${v.voice_id}\t${v.name}\t${v.age}\t${v.accent}\t${v.use_case}\t${v.descriptive}\t${(v.description ?? "").slice(0, 90)}`,
    );
  }
} else if (commande === "ajouter") {
  const [owner, id] = args;
  const r = await appel(`/v1/voices/add/${owner}/${id}`, {
    method: "POST",
    body: JSON.stringify({ new_name: "Voix DemocratIA" }),
  });
  console.log(`Voix ajoutée : ${r.voice_id}`);
} else if (commande === "generer") {
  const [voiceId, modele = "eleven_multilingual_v2", reglages = "{}", rythme] = args;
  const r = await appel(`/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    body: JSON.stringify({
      text: rythme === "pauses" ? TEXTE_RYTHME : TEXTE,
      model_id: modele,
      // Réglages par défaut (voix posée), surchargeables en JSON, par exemple '{"stability":0.35,"style":0.45}'.
      voice_settings: { stability: 0.6, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true, speed: 0.95, ...JSON.parse(reglages) },
    }),
  });
  mkdirSync(join(RACINE, "public"), { recursive: true });
  writeFileSync(join(RACINE, "public", "voix.mp3"), Buffer.from(r.audio_base64, "base64"));
  writeFileSync(
    join(RACINE, "public", "voix-alignement.json"),
    JSON.stringify({ voiceId, modele, alignment: r.alignment, normalized: r.normalized_alignment }),
  );
  const fins = r.alignment.character_end_times_seconds;
  console.log(`Voix écrite : ${fins[fins.length - 1].toFixed(2)} s`);
} else {
  console.error("Sous-commande attendue : modeles | voix | ajouter | generer");
  process.exit(1);
}
