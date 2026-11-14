// 6. Honnêteté : le ton devient grave, l'image se désature, la phrase clé s'écrit mot à mot.
import { AbsoluteFill, Img, staticFile } from "remotion";

import { C, EGAL, MONO, SANS, entre } from "../commun.js";
import { SCENES, quand } from "../temps.js";
import { useVertical } from "../format.js";

const PHRASE = ["Celui", "qui", "écrit", "la", "règle", "gouverne."];

export function Honnetete({ t }) {
  const [debut] = SCENES.honnetete;
  const tMais = quand("But");
  const tCelui = quand("whoever");
  const tFiction = quand("DemocratIA", 0);
  const tQuestion = quand("ask");
  const image = entre(t, debut, debut + 1.6, 0, 1, EGAL);
  const v = useVertical();
  const kicker = entre(t, tMais - 0.2, tMais + 0.4) * (1 - entre(t, tFiction - 0.7, tFiction - 0.2));
  // En vertical, la phrase clé reste un peu plus longtemps à l'écran avant « DemocratIA est une fiction ».
  const bloc1 = v ? 1 - entre(t, tFiction - 0.1, tFiction + 0.3) : 1 - entre(t, tFiction - 0.7, tFiction - 0.2);
  const bloc2 = v ? entre(t, tFiction + 0.2, tFiction + 0.7) : entre(t, tFiction - 0.15, tFiction + 0.5);
  const question = entre(t, tQuestion - 0.25, tQuestion + 0.4);
  // La phrase française se révèle mot à mot sur la durée du passage anglais (« whoever writes the rule governs. »).
  const pas = (quand("governs.") - tCelui + 0.15) / PHRASE.length;
  const motsVoix = PHRASE.map((_, i) => ({ debut: tCelui + i * pas }));
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
            objectPosition: v ? "62% 50%" : "60% 50%",
          }}
        />
        <AbsoluteFill style={{ background: v ? "linear-gradient(180deg, rgb(248 248 246 / 0.97) 0%, rgb(248 248 246 / 0.92) 48%, rgb(248 248 246 / 0.45) 75%, rgb(248 248 246 / 0.25) 100%)" : "linear-gradient(90deg, rgb(248 248 246 / 0.97) 0%, rgb(248 248 246 / 0.9) 46%, rgb(248 248 246 / 0.35) 75%, rgb(248 248 246 / 0.15) 100%)" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: v ? 80 : 130, top: v ? 380 : 300, width: v ? 940 : 1400 }}>
        <div style={{ opacity: bloc1 }}>
          <div style={{ fontFamily: MONO, fontSize: 26, color: C.attenue, opacity: kicker, letterSpacing: "0.01em" }}>Honnêteté · {v ? <br /> : null}dangers, limites, autocritique</div>
          <div style={{ fontSize: v ? 52 : 46, color: C.attenue, marginTop: 26, opacity: kicker, letterSpacing: "-0.02em" }}>Mais soyons honnêtes.</div>
          <div style={{ fontSize: v ? 120 : 112, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.0, marginTop: 34 }}>
            {PHRASE.map((mot, i) => {
              const m = motsVoix[i];
              const p = m ? entre(t, m.debut - 0.12, m.debut + 0.3) : 0;
              return (
                <span key={i}>
                  <span style={{ display: "inline-block", opacity: p, translate: `0 ${(1 - p) * 22}px`, marginRight: "0.24em" }}>{mot}</span>
                  {mot === "règle" || (v && mot === "écrit") ? <br /> : null}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: v ? 80 : 130, top: v ? 430 : 380, width: v ? 940 : 1400, opacity: bloc2 }}>
        <div style={{ fontSize: v ? 110 : 96, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.02, translate: `0 ${(1 - bloc2) * 22}px` }}>
          DemocratIA est une fiction.
        </div>
        <div style={{ fontSize: v ? 62 : 60, fontWeight: 500, letterSpacing: "-0.035em", color: C.attenue, marginTop: 26, opacity: question, translate: `0 ${(1 - question) * 18}px` }}>
          Pour poser une question.
        </div>
      </div>
    </AbsoluteFill>
  );
}
