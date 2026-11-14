// 3. Le test : vraie capture du site (cartes de loi, vrais titres), et la source des données.
import { AbsoluteFill, Sequence } from "remotion";
import { Video } from "@remotion/media";
import { staticFile } from "remotion";

import { C, FPS, MONO, SANS, entre } from "../commun.js";
import { SCENES, quand } from "../temps.js";
import { Lisere } from "../elements.jsx";
import { useVertical } from "../format.js";

export function Test({ t }) {
  const v = useVertical();
  const [debut] = SCENES.test;
  // Fenêtre du navigateur : 900 × 690 en paysage, 800 × 613 en vertical (même rapport que la capture).
  const larg = v ? 800 : 900;
  const haut = Math.round((larg * 690) / 900);
  const tPour = quand("find") - 0.3;
  const tAssemblee = quand("French");
  const tDonnees = quand("Open");
  const fenetre = entre(t, debut + 0.1, debut + 1.1);
  const h1 = entre(t, tPour - 0.2, tPour + 0.5);
  const h2 = entre(t, tAssemblee - 0.3, tAssemblee + 0.4);
  const source = entre(t, tDonnees - 0.1, tDonnees + 0.6);
  return (
    <AbsoluteFill style={{ background: C.fond, fontFamily: SANS, color: C.texte }}>
      <div style={{ position: "absolute", left: v ? 90 : 130, top: v ? 340 : 250, width: v ? 900 : 740 }}>
        <div style={{ fontFamily: MONO, fontSize: 24, color: C.machine, opacity: h1, letterSpacing: "0.01em" }}>Le test · 7 chapitres</div>
        <div style={{ fontSize: v ? 64 : 84, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.04, marginTop: v ? 16 : 22, textWrap: v ? "balance" : undefined }}>
          <span style={{ opacity: h1, display: "inline-block", translate: `0 ${(1 - h1) * 24}px` }}>Vous tranchez de vrais textes de loi,</span>{" "}
          <span style={{ opacity: h2, color: C.bleu, display: "inline-block", translate: `0 ${(1 - h2) * 24}px` }}>votés à l'Assemblée nationale.</span>
        </div>
        <div style={{ marginTop: v ? 26 : 56, opacity: source, translate: `0 ${(1 - source) * 20}px` }}>
          <div style={{ width: 120, marginBottom: v ? 14 : 22 }}>
            <Lisere hauteur={4} />
          </div>
          <div style={{ fontSize: v ? 32 : 34, fontWeight: 600, letterSpacing: "-0.02em" }}>Assemblée nationale, via Hémicycle</div>
          <div style={{ fontSize: v ? 24 : 26, color: C.attenue, marginTop: v ? 6 : 10 }}>Données publiques, ouvertes et sourcées · Licence Ouverte</div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: v ? 140 : 110,
          top: v ? 750 : 168,
          width: larg,
          borderRadius: 18,
          overflow: "hidden",
          border: `1px solid ${C.trait}`,
          boxShadow: "0 30px 80px rgb(17 19 24 / 0.10), 0 4px 14px rgb(17 19 24 / 0.05)",
          background: C.fond,
          opacity: fenetre,
          translate: v ? `0 ${(1 - fenetre) * 90}px` : `${(1 - fenetre) * 120}px 0`,
        }}
      >
        <div style={{ height: 46, background: C.relief, borderBottom: `1px solid ${C.trait}`, display: "flex", alignItems: "center", padding: "0 18px", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: 6, background: "#d5d8df" }} />
          ))}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 17, color: C.attenue, background: C.fond, padding: "4px 18px", borderRadius: 8 }}>democratia-one.vercel.app/test</div>
          </div>
        </div>
        <div style={{ width: larg, height: haut, position: "relative" }}>
          <Sequence from={Math.round((debut + 0.1) * FPS)} layout="none">
            <Video src={staticFile("captures/test.mp4")} muted playbackRate={1.3} style={{ width: larg, height: haut, display: "block" }} />
          </Sequence>
        </div>
      </div>
    </AbsoluteFill>
  );
}
