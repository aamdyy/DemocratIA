// 4. La course des IA se resserre au fil des chapitres, puis l'IA qui vous ressemble se révèle.
import { AbsoluteFill, interpolate } from "remotion";

import { Sphere } from "../Sphere.jsx";
import { C, CANDIDATES, EGAL, GAGNANTE, MONO, SANS, entre } from "../commun.js";
import { quand } from "../temps.js";
import { useVertical } from "../format.js";

// Affinités (%) à chaque étape, dans l'ordre de CANDIDATES : gaia, themis, hygie, plutus, athena, harmonie, demeter.
const ETAPES = [
  [52, 51, 50, 53, 49, 51, 50],
  [58, 63, 47, 65, 57, 55, 52],
  [61, 59, 45, 67, 66, 56, 54],
  [58, 55, 42, 63, 73, 59, 53],
  [55, 52, 40, 60, 80, 59, 51],
  [54, 50, 38, 58, 87, 57, 50],
];

const rangs = (scores) => {
  const ordre = scores.map((s, i) => ({ s, i })).sort((a, b) => b.s - a.s);
  const r = [];
  ordre.forEach((o, k) => (r[o.i] = k));
  return r;
};
const RANGS = ETAPES.map(rangs);

export function Course({ t }) {
  const chapitres = [
    { mot: "Budget", t: quand("Budget,") },
    { mot: "Crises", t: quand("crises,") },
    { mot: "Dilemmes", t: quand("dilemmas:") },
  ];
  const tRevele = quand("reveals");
  const tRessemble = quand("AI", 2);
  const instants = [chapitres[0].t - 0.2, chapitres[1].t, chapitres[2].t, quand("answer,"), quand("race"), quand("tightens")];
  const valeur = (tableau, i) =>
    interpolate(t, instants, tableau.map((ligne) => ligne[i]), { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EGAL });

  const course = 1 - entre(t, tRevele - 0.2, tRessemble + 0.2);
  const revele = entre(t, tRessemble - 0.3, tRessemble + 0.9);
  const precision = Math.round(interpolate(t, [instants[0], instants[5]], [10, 92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const gIndex = CANDIDATES.indexOf(GAGNANTE);
  const v = useVertical();
  const pas = v ? 100 : 84;

  return (
    <AbsoluteFill style={{ background: C.fond, fontFamily: SANS, color: C.texte }}>
      <AbsoluteFill style={{ opacity: course, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 18, marginTop: v ? 370 : 150 }}>
          {chapitres.map((ch, i) => {
            const vu = entre(t, ch.t - 0.15, ch.t + 0.35);
            const actif = i === chapitres.length - 1 ? vu : vu * (1 - entre(t, chapitres[i + 1].t - 0.1, chapitres[i + 1].t + 0.3));
            return (
              <div
                key={ch.mot}
                style={{
                  fontSize: 40,
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  padding: "10px 28px",
                  borderRadius: 999,
                  border: `1.5px solid ${actif > 0.5 ? C.texte : C.trait}`,
                  background: actif > 0.5 ? C.texte : C.fond,
                  color: actif > 0.5 ? C.fond : C.attenue,
                  opacity: 0.25 + 0.75 * vu,
                }}
              >
                {ch.mot}
              </div>
            );
          })}
        </div>
        <div style={{ position: "relative", width: v ? 960 : 1240, height: 7 * pas, marginTop: 64 }}>
          {CANDIDATES.map((c, i) => {
            const score = valeur(ETAPES, i);
            const rang = valeur(RANGS, i);
            return (
              <div key={c.id} style={{ position: "absolute", left: 0, right: 0, top: rang * pas, height: pas - 12, display: "flex", alignItems: "center", gap: v ? 22 : 26 }}>
                <Sphere teintes={c.teintes} taille={v ? 70 : 60} decalage={i * 2.3} />
                <div style={{ width: v ? 190 : 170, fontSize: v ? 38 : 32, fontWeight: 600, letterSpacing: "-0.025em" }}>{c.prenom}</div>
                <div style={{ flex: 1, height: 14, borderRadius: 7, background: C.relief, overflow: "hidden" }}>
                  <div style={{ width: `${score}%`, height: "100%", borderRadius: 7, background: c.teintes[1] }} />
                </div>
                <div style={{ width: v ? 110 : 96, textAlign: "right", fontFamily: MONO, fontSize: v ? 34 : 30, color: C.texte }}>{Math.round(score)} %</div>
              </div>
            );
          })}
        </div>
        <div style={{ width: v ? 960 : 1240, marginTop: 18, display: "flex", justifyContent: "space-between", fontSize: v ? 26 : 24, color: C.attenue }}>
          <span>
            Précision du résultat : <span style={{ color: C.texte, fontFamily: MONO }}>{precision} %</span>
          </span>
          {v ? null : <span>plus vous répondez, plus elle monte</span>}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: revele }}>
        <div style={{ scale: String(0.82 + 0.18 * revele), display: "flex", flexDirection: "column", alignItems: "center", marginTop: -30 }}>
          <div style={{ fontFamily: MONO, fontSize: v ? 30 : 26, color: C.attenue, marginBottom: 30 }}>L'IA qui vous ressemble</div>
          <Sphere teintes={GAGNANTE.teintes} taille={v ? 500 : 400} intensite={1} embleme={GAGNANTE.id} trace={entre(t, tRessemble + 0.1, tRessemble + 1.7, 0, 1, (x) => x)} decalage={gIndex * 2.3} />
          <div style={{ fontSize: v ? 132 : 110, fontWeight: 700, letterSpacing: "-0.05em", marginTop: 34, lineHeight: 1 }}>{GAGNANTE.prenom}</div>
          <div style={{ fontSize: v ? 42 : 36, color: C.attenue, marginTop: 14, textAlign: "center", maxWidth: v ? 900 : undefined }}>
            {GAGNANTE.doctrine}
            {v ? <br /> : " "}
            <span style={{ fontFamily: MONO, color: C.texte }}>{v ? "" : "· "}87 % d'affinité</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
