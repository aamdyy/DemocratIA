import { Composition } from "remotion";

import { DUREE, FPS } from "./commun.js";
import { Democratia } from "./Democratia.jsx";

export const RemotionRoot = () => (
  <Composition id="Democratia" component={Democratia} width={1920} height={1080} fps={FPS} durationInFrames={DUREE} />
);
