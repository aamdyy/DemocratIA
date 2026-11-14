// 6. Honnêteté : le ton devient grave, l'image se désature, la phrase clé s'écrit mot à mot.
import { AbsoluteFill, Img, staticFile } from "remotion";

import { C, EGAL, MONO, SANS, entre } from "../commun.js";
import { MOTS, SCENES, quand } from "../temps.js";

const PHRASE = ["Celui", "qui", "écrit", "la", "règle", "gouverne."];

export function Honnetete({ t }) {
  const [debut] = SCENES.honnetete;
  const tMais = quand("Mais");
  const tCelui = quand("celui");
  const tFiction = quand("DemocratIA", 0);
  const tQuestion = quand("poser");
  const image = entre(t, debut, debut + 1.6, 0, 1, EGAL);
  const kicker = entre(t, tMais - 0.2, tMais + 0.4) * (1 - entre(t, tFiction - 0.7, tFiction - 0.2));
  const bloc1 = 1 - entre(t, tFiction - 0.7, tFiction - 0.2);
  const bloc2 = entre(t, tFiction - 0.15, tFiction + 0.5);
  const question = entre(t, tQuestion - 0.25, tQuestion + 0.4);
  const motsVoix = MOTS.filter((m) => m.debut >= tCelui - 0.05).slice(0, PHRASE.length);
  return (
    <AbsoluteFill style={{ background: "#f4f4f2", fontFamily: SANS, color: C.texte }}>
      <AbsoluteFill style={{ opacity: image }}>
        <Img
          src={staticFile("visuels/bulletin.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "grayscale(1) contrast(0.92) brightness(1.06)",
            scale: String(1.04 + 0.06 * entre(t, debut, SCENES.honnetete[1], 0, 1, (x) => x)),
            objectPosition: "60% 50%",
          }}
        />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgb(248 248 246 / 0.97) 0%, rgb(248 248 246 / 0.9) 46%, rgb(248 248 246 / 0.35) 75%, rgb(248 248 246 / 0.15) 100%)" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 130, top: 300, width: 1400 }}>
        <div style={{ opacity: bloc1 }}>
          <div style={{ fontFamily: MONO, fontSize: 26, color: C.attenue, opacity: kicker, letterSpacing: "0.01em" }}>Honnêteté · dangers, limites, autocritique</div>
          <div style={{ fontSize: 46, color: C.attenue, marginTop: 26, opacity: kicker, letterSpacing: "-0.02em" }}>Mais soyons honnêtes.</div>
          <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.0, marginTop: 34 }}>
            {PHRASE.map((mot, i) => {
              const m = motsVoix[i];
              const p = m ? entre(t, m.debut - 0.12, m.debut + 0.3) : 0;
              return (
                <span key={i}>
                  <span style={{ display: "inline-block", opacity: p, translate: `0 ${(1 - p) * 22}px`, marginRight: "0.24em" }}>{mot}</span>
                  {mot === "règle" ? <br /> : null}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 130, top: 380, width: 1100, opacity: bloc2 }}>
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.02, translate: `0 ${(1 - bloc2) * 22}px` }}>
          DemocratIA est une fiction.
        </div>
        <div style={{ fontSize: 60, fontWeight: 500, letterSpacing: "-0.035em", color: C.attenue, marginTop: 26, opacity: question, translate: `0 ${(1 - question) * 18}px` }}>
          Pour poser une question.
        </div>
      </div>
    </AbsoluteFill>
  );
}
