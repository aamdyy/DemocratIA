// Mesure le niveau de la musique toutes les 0,1 s (RMS en dBFS, via ffmpeg) : public/musique-niveaux.json.
// Le montage s'en sert pour garder la musique à un écart constant sous la voix, même dans les crescendos.
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const { stdout } = spawnSync(
  "ffmpeg",
  [
    "-v", "error",
    "-i", join(RACINE, "public", "musique.mp3"),
    "-af", "aresample=44100,asetnsamples=4410,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-",
    "-f", "null", "-",
  ],
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);
const niveaux = [...stdout.matchAll(/RMS_level=(-?[\d.]+|-inf)/g)].map((m) => (m[1] === "-inf" ? -90 : Math.max(-90, Number(m[1]))));
writeFileSync(join(RACINE, "public", "musique-niveaux.json"), JSON.stringify(niveaux.map((n) => Math.round(n * 10) / 10)));
console.log(`${niveaux.length} mesures (pas de 0,1 s)`);
