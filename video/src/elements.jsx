// Éléments communs : liseré tricolore, en-tête, sous-titres, hémicycle.
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

import { C, MONO, SANS, entre, EGAL } from "./commun.js";
import { MOTS } from "./temps.js";

/** Le liseré tricolore du site : bleu, gris clair, rouge. `p` (0 à 1) le déploie depuis le centre. */
export function Lisere({ p = 1, hauteur = 4, style }) {
  return (
    <div style={{ display: "flex", width: "100%", height: hauteur, justifyContent: "center", ...style }}>
      <div style={{ display: "flex", width: `${p * 100}%`, height: "100%" }}>
        <div style={{ flex: 1, background: C.bleu }} />
        <div style={{ flex: 1, background: C.trait }} />
        <div style={{ flex: 1, background: C.rouge }} />
      </div>
    </div>
  );
}

/** En-tête discret, comme celui du site : logo, mention « République française, an 2050 », liseré. */
export function EnTete({ t }) {
  const lisere = entre(t, 0.7, 2.0, 0, 1, EGAL);
  const logo = entre(t, 6.2, 7.0) * (1 - entre(t, 51.0, 51.8));
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
      <div style={{ height: 76, display: "flex", alignItems: "center", padding: "0 96px", gap: 22, opacity: logo }}>
        <Img src={staticFile("logo-democratia.png")} style={{ height: 25 }} />
        <div style={{ width: 1, height: 30, background: C.trait }} />
        <div style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.25, color: C.attenue }}>
          République française
          <br />
          an 2050
        </div>
      </div>
      <Lisere p={lisere} hauteur={5} />
    </div>
  );
}

// Les sous-titres : des groupes de mots coupés à la ponctuation, affichés pendant que la voix les dit.
const PHRASES = (() => {
  const phrases = [];
  let courante = [];
  MOTS.forEach((m, i) => {
    if (m.mot === ":") {
      if (courante.length) courante[courante.length - 1] = { ...courante[courante.length - 1], mot: courante[courante.length - 1].mot + " :" };
    } else courante.push(m);
    const fin = /[.…:]$/.test(m.mot) || (/,$/.test(m.mot) && courante.length >= 4) || courante.length >= 9;
    const suivant = MOTS[i + 1];
    if (fin && !(suivant && suivant.mot === ":")) {
      if (courante.length) phrases.push(courante);
      courante = [];
    }
  });
  if (courante.length) phrases.push(courante);
  return phrases.map((mots, i, toutes) => ({
    texte: mots.map((m) => m.mot).join(" ").replace(/ :/g, " :"),
    debut: mots[0].debut - 0.08,
    fin: Math.min(mots[mots.length - 1].fin + 0.35, toutes[i + 1] ? toutes[i + 1][0].debut - 0.08 : Infinity),
  }));
})();

export function SousTitres() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const phrase = PHRASES.find((p) => t >= p.debut && t < p.fin);
  if (!phrase) return null;
  const o = Math.min(entre(t, phrase.debut, phrase.debut + 0.15), 1 - entre(t, phrase.fin - 0.15, phrase.fin));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 54, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 30,
          fontWeight: 500,
          letterSpacing: "-0.005em",
          color: "#2b2f38",
          background: "rgb(255 255 255 / 0.86)",
          padding: "8px 20px",
          borderRadius: 10,
          opacity: o,
          maxWidth: 1400,
          textAlign: "center",
        }}
      >
        {phrase.texte}
      </div>
    </div>
  );
}

// L'hémicycle de 577 sièges (src/lib/sieges.ts du site).
export const CADRE = { largeur: 1000, hauteur: 520, rayonSiege: 8.4 };
export const SIEGES = (() => {
  const total = 577;
  const rangs = 12;
  const centre = { x: 500, y: 504 };
  const rayons = Array.from({ length: rangs }, (_, i) => 170 + (i * (480 - 170)) / (rangs - 1));
  const somme = rayons.reduce((a, b) => a + b, 0);
  const exacts = rayons.map((r) => (total * r) / somme);
  const effectifs = exacts.map(Math.floor);
  const restes = exacts.map((e, i) => ({ i, reste: e - effectifs[i] })).sort((a, b) => b.reste - a.reste);
  const manque = total - effectifs.reduce((a, b) => a + b, 0);
  for (let k = 0; k < manque; k++) effectifs[restes[k].i]++;
  const sieges = [];
  rayons.forEach((rayon, rang) => {
    const n = effectifs[rang];
    for (let j = 0; j < n; j++) {
      const angle = Math.PI - ((j + 0.5) * Math.PI) / n;
      sieges.push({ x: centre.x + rayon * Math.cos(angle), y: centre.y - rayon * Math.sin(angle), angle, rayon });
    }
  });
  return sieges.sort((a, b) => b.angle - a.angle || a.rayon - b.rayon);
})();

/** Petite pastille mono, comme les étiquettes de données du site. */
export function Etiquette({ children, couleur = C.attenue, style }) {
  return <span style={{ fontFamily: MONO, fontSize: 22, color: couleur, letterSpacing: "0.01em", ...style }}>{children}</span>;
}
