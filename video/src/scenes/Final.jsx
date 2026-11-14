// 7. « Et pourtant. » Les sept sphères se rassemblent en une seule, la vôtre ; puis le logo et l'adresse.
import { AbsoluteFill, Img, staticFile } from "remotion";

import { Sphere } from "../Sphere.jsx";
import { C, CANDIDATES, EGAL, MONO, SANS, entre } from "../commun.js";
import { Lisere } from "../elements.jsx";
import { SCENES, quand } from "../temps.js";

// La sphère du citoyen : un mélange des couleurs des IA, sans emblème.
const VOTRE = ["#eef0fb", "#7a5cd6", "#0f9bb5", "#e0457b"];

export function Final({ t }) {
  const [debut] = SCENES.final;
  const tSphere = quand("meilleure");
  const tVotre = quand("vôtre.");
  const tLogo = quand("DemocratIA.");
  const fond = entre(t, debut, debut + 2.5, 0, 0.5, EGAL);
  const pourtant = entre(t, debut + 0.15, debut + 0.85) * (1 - entre(t, tSphere + 0.2, tSphere + 0.8));
  const arrivee = entre(t, tSphere - 0.2, tSphere + 1.6);
  const fusion = entre(t, tVotre - 0.1, tVotre + 1.1, 0, 1, EGAL);
  const votre = entre(t, tVotre - 0.1, tVotre + 0.9);
  const monte = entre(t, tLogo - 0.6, tLogo + 0.6, 0, 1, EGAL);
  const logo = entre(t, tLogo - 0.2, tLogo + 0.7);
  const pied = entre(t, tLogo + 0.6, tLogo + 1.4);
  const centreY = 470 - monte * 120;
  const tour = (t - tSphere) * 0.35;
  return (
    <AbsoluteFill style={{ background: C.fond, fontFamily: SANS, color: C.texte }}>
      <AbsoluteFill style={{ opacity: fond }}>
        <Img src={staticFile("visuels/aube.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 100%", scale: String(1.06 - 0.05 * entre(t, debut, 60, 0, 1, (x) => x)) }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgb(255 255 255 / 1) 0%, rgb(255 255 255 / 0.92) 52%, rgb(255 255 255 / 0.55) 100%)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: pourtant }}>
        <div style={{ fontSize: 132, fontWeight: 700, letterSpacing: "-0.055em", translate: `0 ${(1 - entre(t, debut + 0.15, debut + 0.85)) * 26}px`, marginTop: -40 }}>
          Et pourtant.
        </div>
      </AbsoluteFill>
      {CANDIDATES.map((c, i) => {
        const angle = (i / CANDIDATES.length) * Math.PI * 2 - Math.PI / 2 + tour;
        const rayon = (1 - arrivee) * 1100 + 300 - fusion * 300;
        const taille = 130 * (1 - fusion * 0.6);
        return (
          <div
            key={c.id}
            style={{
              position: "absolute",
              left: 960 + Math.cos(angle) * rayon - taille / 2,
              top: centreY + Math.sin(angle) * rayon * 0.62 - taille / 2,
              opacity: arrivee * (1 - entre(t, tVotre + 0.3, tVotre + 1.1)),
            }}
          >
            <Sphere teintes={c.teintes} taille={taille} decalage={i * 3.1} />
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 960 - 130,
          top: centreY - 130,
          opacity: votre,
          scale: String((0.6 + 0.4 * votre) * (1 - monte * 0.25)),
        }}
      >
        <Sphere teintes={VOTRE} taille={260} decalage={2} duree={6} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: centreY - 50, textAlign: "center", opacity: votre * (1 - monte) }}>
        <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: "-0.03em", translate: "0 200px" }}>La vôtre.</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 575, display: "flex", flexDirection: "column", alignItems: "center", opacity: logo }}>
        <Img src={staticFile("logo-democratia.png")} style={{ width: 760, translate: `0 ${(1 - logo) * 24}px` }} />
        <div style={{ width: 300, marginTop: 40, opacity: pied }}>
          <Lisere hauteur={5} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 36, marginTop: 36, opacity: pied, color: C.texte }}>democratia-one.vercel.app</div>
        <div style={{ fontSize: 26, marginTop: 14, opacity: pied, color: C.attenue }}>Hackathon IA &amp; Open Data · Hémicycle</div>
      </div>
    </AbsoluteFill>
  );
}
