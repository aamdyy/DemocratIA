// Visuels réalistes de la vidéo, générés par kie.ai (modèle Nano Banana 2, tâche asynchrone).
// La clé est lue dans process.env.KIE_API_KEY, injectée au lancement depuis le trousseau macOS :
//   KIE_API_KEY="$(security find-generic-password -a kork -s kie-api -w)" node scripts/visuels.mjs [test|tout|<nom>]
// Les images sont écrites dans public/visuels/<nom>.jpg ; une image déjà présente n'est pas régénérée.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOSSIER = join(RACINE, "public", "visuels");
const CLE = process.env.KIE_API_KEY;
if (!CLE) {
  console.error("KIE_API_KEY absente : lancez la commande avec la clé du trousseau.");
  process.exit(1);
}
const BASE = "https://api.kie.ai";

const COMMUN =
  "Photorealistic, cinematic still, shot on a full-frame camera with a 35mm lens, natural soft light, " +
  "restrained elegant colour grading, very clean composition with generous negative space, no text, no letters, " +
  "no logos, no flags, no insignia, no recognizable people.";

export const VISUELS = {
  hemicycle:
    "A vast empty neoclassical semicircular parliament chamber at dawn, rows of empty curved benches seen from the " +
    "upper gallery, pale golden morning light through a glass ceiling, faint mist in the air. Seven softly glowing " +
    "translucent spheres float quietly above the benches, each filled with drifting coloured clouds: emerald green, " +
    "royal blue, rose pink, amber gold, teal cyan, lavender violet and terracotta orange. Calm, solemn, futuristic yet " +
    "sober, airy and luminous, mostly white and warm grey tones. " +
    COMMUN,
  bulletin:
    "Close-up of a human hand, seen from the side and cropped at the wrist, holding a plain white folded paper ballot " +
    "just above the slot of a transparent acrylic ballot box, on a simple light wooden table. Soft natural window " +
    "light, shallow depth of field, quiet and serious mood, neutral white and warm grey palette, the background a " +
    "softly blurred pale wall. " +
    COMMUN,
  aube:
    "Wide view over Parisian zinc rooftops at dawn seen from high above, a pale sky turning from soft white to light " +
    "blue, gentle morning haze, tiny warm lights in a few windows, serene and hopeful, very bright and airy, " +
    "minimalist composition with a large empty sky in the upper two thirds. " +
    COMMUN,
};

async function appel(chemin, options = {}) {
  const reponse = await fetch(BASE + chemin, {
    ...options,
    headers: { Authorization: `Bearer ${CLE}`, "Content-Type": "application/json" },
  });
  const corps = await reponse.json().catch(() => ({}));
  // kie.ai répond souvent 200 même en cas d'erreur : c'est le champ `code` qui fait foi.
  if (!reponse.ok || corps.code !== 200) {
    console.error(`Erreur sur ${chemin} : statut ${reponse.status}, code ${corps.code}, ${corps.msg ?? ""}`);
    process.exit(2);
  }
  return corps.data;
}

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

async function generer(nom) {
  const fichier = join(DOSSIER, `${nom}.jpg`);
  if (existsSync(fichier)) {
    console.log(`${nom} : déjà présent, ignoré`);
    return;
  }
  const { taskId } = await appel("/api/v1/jobs/createTask", {
    method: "POST",
    body: JSON.stringify({
      model: "nano-banana-2",
      input: { prompt: VISUELS[nom], aspect_ratio: "16:9", resolution: "2K", output_format: "jpg" },
    }),
  });
  console.log(`${nom} : tâche créée`);
  for (let i = 0; i < 120; i++) {
    await attendre(5000);
    const t = await appel(`/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`);
    if (t.state === "success") {
      const url = JSON.parse(t.resultJson).resultUrls[0];
      const image = Buffer.from(await (await fetch(url)).arrayBuffer());
      writeFileSync(fichier, image);
      console.log(`${nom} : écrit (${Math.round(image.length / 1024)} Ko, ${t.creditsConsumed ?? "?"} crédits)`);
      return;
    }
    if (t.state === "fail") {
      console.error(`${nom} : échec ${t.failCode} ${t.failMsg}`);
      return;
    }
  }
  console.error(`${nom} : délai dépassé`);
}

mkdirSync(DOSSIER, { recursive: true });
const cible = process.argv[2] ?? "tout";
if (cible === "test") {
  const credits = await appel("/api/v1/chat/credit");
  console.log(`Clé acceptée, crédits restants : ${credits}`);
} else if (cible === "tout") {
  await Promise.all(Object.keys(VISUELS).map(generer));
} else if (VISUELS[cible]) {
  await generer(cible);
} else {
  console.error(`Visuel inconnu : ${cible}`);
  process.exit(1);
}
