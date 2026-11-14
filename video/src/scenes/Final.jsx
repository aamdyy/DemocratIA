// Final : « Et pourtant. » La musique remonte, les sept sphères se rassemblent, les phrases d'espoir,
// puis les sept se fondent dans une seule, la vôtre ; enfin le logo et l'adresse.
import { AbsoluteFill, Img, staticFile } from "remotion";

import { Sphere } from "../Sphere.jsx";
import { C, CANDIDATES, EGAL, MONO, SANS, entre } from "../commun.js";
import { Lisere } from "../elements.jsx";
import { SCENES, quand } from "../temps.js";
import { useVertical } from "../format.js";

// La sphère du citoyen : un mélange des couleurs des IA, sans emblème.
const VOTRE = ["#eef0fb", "#7a5cd6", "#0f9bb5", "#e0457b"];

function Ligne({ p, children, style }) {
  return <div style={{ opacity: p, translate: `0 ${(1 - p) * 20}px`, ...style }}>{children}</div>;
}

export function Final({ t }) {
  const [debut, fin] = SCENES.final;
  const tEt = quand("And");
  const tTout = quand("Everything");
  const tPas = quand("Not");
  const tOutils = quand("tools");
  const tSphere = quand("best");
  const tVotre = quand("yours,", 1);
  const tLogo = quand("DemocratIA.");

  const fond = entre(t, tEt, tEt + 3, 0, 0.55, EGAL);
  const pourtant = entre(t, tEt - 0.1, tEt + 0.5);
  const monteTitre = entre(t, tTout - 0.6, tTout + 0.4, 0, 1, EGAL);
  const sortieTitre = 1 - entre(t, tVotre - 0.4, tVotre + 0.2);
  const arrivee = entre(t, tTout - 0.4, tTout + 2.2);
  const fusion = entre(t, tVotre - 0.1, tVotre + 1.2, 0, 1, EGAL);
  const votre = entre(t, tVotre, tVotre + 0.9);
  const monte = entre(t, tLogo - 0.7, tLogo + 0.5, 0, 1, EGAL);
  const logo = entre(t, tLogo - 0.2, tLogo + 0.7);
  const pied = entre(t, tLogo + 0.6, tLogo + 1.4);

  const p1 = entre(t, tTout - 0.1, tTout + 0.5) * (1 - entre(t, tPas - 0.45, tPas - 0.1));
  const p2a = entre(t, tPas - 0.1, tPas + 0.5) * (1 - entre(t, tSphere - 0.45, tSphere - 0.1));
  const p2b = entre(t, tOutils - 0.3, tOutils + 0.3) * (1 - entre(t, tSphere - 0.45, tSphere - 0.1));
  const p3a = entre(t, tSphere - 0.2, tSphere + 0.4) * (1 - entre(t, tLogo - 0.8, tLogo - 0.3));
  const p3b = entre(t, tVotre - 0.15, tVotre + 0.4) * (1 - entre(t, tLogo - 0.8, tLogo - 0.3));

  const v = useVertical();
  const cx = v ? 540 : 960;
  const rangY = v ? 640 : 390;
  const centreY = v ? 700 - monte * 160 : rangY - monte * 130;
  const tailleVotre = v ? 300 : 240;
  return (
    <AbsoluteFill style={{ background: C.fond, fontFamily: SANS, color: C.texte }}>
      <AbsoluteFill style={{ opacity: fond }}>
        <Img
          src={staticFile("visuels/aube.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 100%", scale: String(1.08 - 0.07 * entre(t, debut, fin, 0, 1, (x) => x)) }}
        />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgb(255 255 255 / 1) 0%, rgb(255 255 255 / 0.9) 55%, rgb(255 255 255 / 0.5) 100%)" }} />
      </AbsoluteFill>

      {/* « Et pourtant. » en grand, puis en titre discret au-dessus des sphères. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: v ? 780 - monteTitre * 400 : 430 - monteTitre * 290,
          textAlign: "center",
          fontSize: v ? 160 - monteTitre * 76 : 150 - monteTitre * 90,
          fontWeight: 700,
          letterSpacing: "-0.055em",
          lineHeight: 1,
          opacity: pourtant * sortieTitre,
          translate: `0 ${(1 - pourtant) * 26}px`,
        }}
      >
        Et pourtant.
      </div>

      {/* Les sept sphères se rassemblent en une rangée, puis se fondent dans la vôtre. */}
      {CANDIDATES.map((c, i) => {
        const cible = cx + (i - 3) * (v ? 138 : 150);
        const depart = cx + (i - 3) * (v ? 420 : 600);
        const x = depart + (cible - depart) * arrivee;
        const xFinal = x + (cx - x) * fusion;
        const flotte = Math.sin((t + i * 0.7) * 1.3) * 6;
        const taille = (v ? 110 : 112) * (1 - fusion * 0.5);
        return (
          <div
            key={c.id}
            style={{
              position: "absolute",
              left: xFinal - taille / 2,
              top: rangY + (centreY - rangY) * fusion + flotte * (1 - fusion) - taille / 2,
              opacity: arrivee * (1 - entre(t, tVotre + 0.3, tVotre + 1.2)),
            }}
          >
            <Sphere teintes={c.teintes} taille={taille} decalage={i * 3.1} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: cx - tailleVotre / 2, top: centreY - tailleVotre / 2, opacity: votre, scale: String((0.5 + 0.5 * votre) * (1 - monte * 0.2)) }}>
        <Sphere teintes={VOTRE} taille={tailleVotre} decalage={2} duree={6} />
      </div>

      {/* Les phrases d'espoir. */}
      <div style={{ position: "absolute", left: v ? 60 : 160, right: v ? 60 : 160, top: v ? 900 : 560, textAlign: "center" }}>
        <div style={{ position: "relative", height: v ? 440 : 200, textWrap: v ? "balance" : undefined }}>
          <Ligne p={p1} style={{ position: "absolute", inset: 0, fontSize: v ? 66 : 58, fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.15 }}>
            Des données ouvertes,
            <br />
            <span style={{ color: C.bleu }}>que chacun peut vérifier.</span>
          </Ligne>
          <div style={{ position: "absolute", inset: 0 }}>
            <Ligne p={p2a} style={{ fontSize: v ? 52 : 50, fontWeight: 500, letterSpacing: "-0.03em", color: C.attenue }}>
              Pas une machine qui décide à notre place.
            </Ligne>
            <Ligne p={p2b} style={{ fontSize: v ? 66 : 58, lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.04em", marginTop: 14 }}>
              Des outils pour comprendre nos élus.
            </Ligne>
          </div>
          <div style={{ position: "absolute", inset: 0 }}>
            <Ligne p={p3a} style={{ fontSize: v ? 52 : 50, fontWeight: 500, letterSpacing: "-0.03em", color: C.attenue }}>
              La meilleure sphère, c'est celle qu'on ne remplace pas :
            </Ligne>
            <Ligne p={p3b} style={{ fontSize: v ? 74 : 66, lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.045em", marginTop: 14 }}>
              la vôtre, quand vous allez voter.
            </Ligne>
          </div>
        </div>
      </div>

      {/* Logo et adresse. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: v ? 800 : 520, display: "flex", flexDirection: "column", alignItems: "center", opacity: logo }}>
        <Img src={staticFile("logo-democratia.png")} style={{ width: v ? 860 : 760, translate: `0 ${(1 - logo) * 24}px` }} />
        <div style={{ width: 300, marginTop: 40, opacity: pied }}>
          <Lisere hauteur={5} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: v ? 40 : 36, marginTop: 36, opacity: pied, color: C.texte }}>democratia-one.vercel.app</div>
        <div style={{ fontSize: v ? 30 : 26, marginTop: 14, opacity: pied, color: C.attenue }}>Hackathon IA &amp; Open Data · Hémicycle</div>
      </div>
    </AbsoluteFill>
  );
}
