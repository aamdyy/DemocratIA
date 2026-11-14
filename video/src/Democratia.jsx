// La vidéo complète : sept scènes en fondu enchaîné, la voix off découpée aux silences, les sous-titres.
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";

import { C, entre, EGAL } from "./commun.js";
import { EnTete, SousTitres } from "./elements.jsx";
import { SCENES, SEGMENTS } from "./temps.js";
import { Ouverture } from "./scenes/Ouverture.jsx";
import { Candidates } from "./scenes/Candidates.jsx";
import { Test } from "./scenes/Test.jsx";
import { Course } from "./scenes/Course.jsx";
import { Pouvoir } from "./scenes/Pouvoir.jsx";
import { Honnetete } from "./scenes/Honnetete.jsx";
import { Final } from "./scenes/Final.jsx";

const LISTE = [
  ["ouverture", Ouverture],
  ["candidates", Candidates],
  ["test", Test],
  ["course", Course],
  ["pouvoir", Pouvoir],
  ["honnetete", Honnetete],
  ["final", Final],
];
const FONDU = 0.3;

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
