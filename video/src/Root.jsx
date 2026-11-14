import { Composition } from "remotion";

import { DUREE, FPS } from "./commun.js";
import { Democratia } from "./Democratia.jsx";

export const RemotionRoot = () => (
  <>
    <Composition id="Democratia" component={Democratia} width={1920} height={1080} fps={FPS} durationInFrames={DUREE} />
    {/* Format téléphone (9:16) pour les réseaux : mêmes voix, musique et sous-titres, scènes recomposées. */}
    <Composition
      id="DemocratiaVertical"
      component={Democratia}
      defaultProps={{ vertical: true }}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={DUREE}
    />
  </>
);
