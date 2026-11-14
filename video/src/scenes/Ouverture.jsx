// 1. Ouverture : noir, puis blanc ; « En 2050 » ; l'hémicycle à l'aube en fond très doux.
import { AbsoluteFill, Img, staticFile } from "remotion";

import { C, CANDIDATES, SANS, entre, EGAL } from "../commun.js";
import { quand } from "../temps.js";

const ARC = CANDIDATES.map((c) => c.teintes[1]);

export function Ouverture({ t }) {
  const tIA = quand("chooses");
  const fond = entre(t, 0.8, 3.0, 0, 0.2) + entre(t, tIA, tIA + 1.6, 0, 0.42, EGAL);
  const titre = entre(t, 0.75, 1.75);
  const ligne1 = entre(t, 1.5, 2.2) * (1 - entre(t, tIA - 0.35, tIA));
  const ligne2 = entre(t, tIA - 0.05, tIA + 0.6);
  // Les couleurs des IA traversent la seconde ligne, comme sur l'accueil du site.
  const defilement = (t - tIA) * 140;
  return (
    <AbsoluteFill style={{ background: C.fond }}>
      <AbsoluteFill style={{ opacity: fond }}>
        <Img
          src={staticFile("visuels/hemicycle.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            scale: String(1.12 - 0.08 * entre(t, 0, 6.3, 0, 1, EGAL)),
            filter: `saturate(0.85) blur(${2 * (1 - entre(t, tIA, tIA + 1.6))}px)`,
          }}
        />
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 62% 48% at 50% 46%, rgb(255 255 255 / 0.9), rgb(255 255 255 / 0.55) 60%, rgb(255 255 255 / 0.2) 100%)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: SANS, color: C.texte }}>
        <div
          style={{
            fontSize: 260,
            fontWeight: 700,
            letterSpacing: "-0.055em",
            lineHeight: 1,
            opacity: titre,
            translate: `0 ${(1 - titre) * 40}px`,
            marginTop: -60,
          }}
        >
          En 2050
        </div>
        <div style={{ position: "relative", height: 90, width: 1600, marginTop: 34 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              textAlign: "center",
              fontSize: 60,
              fontWeight: 500,
              letterSpacing: "-0.03em",
              color: C.attenue,
              opacity: ligne1,
              translate: `0 ${(1 - entre(t, 1.5, 2.2)) * 18}px`,
            }}
          >
            la France n'élit plus de président.
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              textAlign: "center",
              fontSize: 60,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              opacity: ligne2,
              translate: `0 ${(1 - ligne2) * 18}px`,
            }}
          >
            Elle choisit{" "}
            <span
              style={{
                backgroundImage: `linear-gradient(90deg, ${[...ARC, ARC[0]].join(", ")})`,
                backgroundSize: "1400px 100%",
                backgroundPosition: `${defilement}px 0`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              une intelligence artificielle.
            </span>
          </div>
        </div>
      </AbsoluteFill>
      {/* Noir d'ouverture, qui s'efface vers le blanc. */}
      <AbsoluteFill style={{ background: "#000", opacity: 1 - entre(t, 0.25, 0.9, 0, 1, EGAL) }} />
    </AbsoluteFill>
  );
}
