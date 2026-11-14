// La vidéo complète : sept scènes en fondu enchaîné, la voix off découpée aux silences, les sous-titres.
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";

import { C, DUREE, FPS, entre, EGAL } from "./commun.js";
import { EnTete, SousTitres } from "./elements.jsx";
import { MOTS, SCENES, SEGMENTS, voixActive } from "./temps.js";
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
const FONDU = 0.3;

// Gain de la musique image par image : présente au début et à la fin, effacée sous la voix (environ -24 dB
// sous elle), légère remontée dans les respirations ; après « Et pourtant. », elle remonte, puis crescendo final et fondu.
const FIN_VOIX = MOTS[MOTS.length - 1].fin;
const POURTANT = MOTS.find((m) => m.mot === "pourtant.").debut;
const GAINS_MUSIQUE = Array.from({ length: DUREE }, (_, f) => {
  const t = f / FPS;
  const v = voixActive(t);
  const espoir = Math.min(1, Math.max(0, (t - (POURTANT - 1.2)) / 1.5));
  const sousVoix = 0.055 - 0.01 * espoir + (1 - v) * (0.045 + 0.06 * espoir);
  const debut = Math.min(1, t / 0.5) * 0.2;
  const ouverture = t < 0.6 ? debut : t < 1.4 ? 0.2 + (sousVoix - 0.2) * ((t - 0.6) / 0.8) : sousVoix;
  const fin = t > FIN_VOIX ? Math.min(1, (t - FIN_VOIX) / 0.8) : 0;
  const sortie = t > DUREE / FPS - 1.5 ? Math.max(0, (DUREE / FPS - t) / 1.5) : 1;
  return (ouverture * (1 - fin) + 0.26 * fin) * sortie;
});

export function Democratia() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: C.fond }}>
      {LISTE.map(([cle, Scene], i) => {
        const [a, b] = SCENES[cle];
        if (t < a || t >= b) return null;
        // Chaque scène se fond dans la suivante, qui est posée par-dessus.
        const entree = i === 0 ? 1 : entre(t, a, a + FONDU, 0, 1, EGAL);
        return (
          <AbsoluteFill key={cle} style={{ opacity: entree }}>
            <Scene t={t} />
          </AbsoluteFill>
        );
      })}
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
