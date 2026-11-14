// La vidéo complète : sept scènes en fondu enchaîné, la voix off découpée aux silences, les sous-titres.
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";

import { C, DUREE, FPS, entre, EGAL } from "./commun.js";
import { EnTete, SousTitres } from "./elements.jsx";
import { ACCENTS, SCENES, SEGMENTS, voixActive } from "./temps.js";
import NIVEAUX from "../public/musique-niveaux.json";
import { Ouverture } from "./scenes/Ouverture.jsx";
import { Candidates } from "./scenes/Candidates.jsx";
import { Test } from "./scenes/Test.jsx";
import { Course } from "./scenes/Course.jsx";
import { Pouvoir } from "./scenes/Pouvoir.jsx";
import { Honnetete } from "./scenes/Honnetete.jsx";
import { Final } from "./scenes/Final.jsx";
import { Comparatif } from "./scenes/Comparatif.jsx";

const LISTE = [
  ["ouverture", Ouverture],
  ["candidates", Candidates],
  ["comparatif", Comparatif],
  ["test", Test],
  ["course", Course],
  ["pouvoir", Pouvoir],
  ["honnetete", Honnetete],
  ["final", Final],
];
const FONDU = 0.18;

// Gain de la musique image par image. Pendant la parole, elle est tenue environ 13 dB sous la voix, quel que soit
// son propre niveau (mesuré toutes les 0,1 s, lissé sur 1 s) ; dans les respirations, en intro, après « And yet. »
// et au final, elle revient à pleine puissance. Fondu de sortie sur la dernière seconde et demie.
const NIVEAU_VOIX = -20.4; // dBFS, voix pendant la parole (ffmpeg volumedetect, silences retirés)
const ECART = 13; // dB sous la voix
const niveauMusique = (t) => {
  const i = Math.round(t * 10);
  const fenetre = NIVEAUX.slice(Math.max(0, i - 5), i + 6);
  if (!fenetre.length) return -90;
  return 10 * Math.log10(fenetre.reduce((a, n) => a + 10 ** (n / 10), 0) / fenetre.length);
};
const GAINS_MUSIQUE = Array.from({ length: DUREE }, (_, f) => {
  const t = f / FPS;
  const v = voixActive(t);
  const sousVoix = Math.min(1, 10 ** ((NIVEAU_VOIX - ECART - niveauMusique(t)) / 20));
  const sortie = t > DUREE / FPS - 1.5 ? Math.max(0, (DUREE / FPS - t) / 1.5) : 1;
  return (v * sousVoix + (1 - v)) * sortie;
});

/** Accent visuel : une poussée de zoom très brève sur les mots clés de la voix (montée 0,1 s, retour 0,7 s). */
const accent = (t) =>
  ACCENTS.reduce((somme, tk) => {
    const dt = t - tk + 0.05;
    if (dt < 0 || dt > 1.2) return somme;
    return somme + (dt < 0.1 ? dt / 0.1 : Math.exp(-(dt - 0.1) / 0.28));
  }, 0);

export function Democratia() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: C.fond }}>
      <AbsoluteFill style={{ scale: String(1 + 0.014 * Math.min(1.4, accent(t))) }}>
        {LISTE.map(([cle, Scene], i) => {
          const [a, b] = SCENES[cle];
          if (t < a || t >= b) return null;
          // Coupe franche adoucie : la scène suivante se pose par-dessus en 0,18 s, avec un léger recul d'objectif.
          const entree = i === 0 ? 1 : entre(t, a, a + FONDU, 0, 1, EGAL);
          const recul = i === 0 ? 0 : 1 - entre(t, a, a + 0.6);
          return (
            <AbsoluteFill key={cle} style={{ opacity: entree, scale: String(1 + 0.03 * recul) }}>
              <Scene t={t} />
            </AbsoluteFill>
          );
        })}
      </AbsoluteFill>
      <EnTete t={t} />
      <SousTitres />
      <Audio src={staticFile("musique.mp3")} volume={(f) => GAINS_MUSIQUE[Math.min(f, GAINS_MUSIQUE.length - 1)]} />
      {SEGMENTS.map((s, i) => (
        <Sequence key={i} from={Math.round((s.de + s.decalage) * fps)} durationInFrames={Math.round((s.a - s.de) * fps)} layout="none">
          <Audio
            src={staticFile("voix.mp3")}
            trimBefore={Math.round(s.de * fps)}
            trimAfter={Math.round(s.a * fps)}
            volume={(f) => Math.min(1, f / 3, (Math.round((s.a - s.de) * fps) - f) / 3)}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
