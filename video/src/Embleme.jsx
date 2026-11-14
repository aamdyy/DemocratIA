// Emblème au trait d'une candidate : chaque tracé se dessine à son tour, comme sur le site.
import { Easing, interpolate } from "remotion";

import { EMBLEMES } from "./emblemes-data.js";

const COURBE = Easing.bezier(0.65, 0, 0.35, 1);

/** `progression` va de 0 (rien) à 1 (dessin complet) ; les tracés se suivent avec un léger chevauchement. */
export function Embleme({ id, progression }) {
  const source = EMBLEMES[id];
  if (!source) return null;
  const total = (source.match(/stroke-dashoffset="0"/g) ?? []).length;
  let rang = 0;
  const svg = source
    .replace(/stroke-dashoffset="0"/g, () => {
      const debut = (rang / total) * 0.55;
      rang++;
      const p = interpolate(progression, [debut, debut + 0.45], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: COURBE,
      });
      // Un tracé pas encore commencé reste invisible (les extrémités coupées laisseraient sinon un point).
      return `stroke-dashoffset="${(1 - p).toFixed(4)}" opacity="${p > 0.001 ? 1 : 0}"`;
    })
    .replace(/<circle /g, `<circle opacity="${progression > 0.9 ? 1 : 0}" `)
    .replace("<svg ", '<svg width="100%" height="100%" ')
    .replace('style="color:', 'style="display:block;color:');
  return <div style={{ width: "100%", aspectRatio: "1" }} dangerouslySetInnerHTML={{ __html: svg }} />;
}
