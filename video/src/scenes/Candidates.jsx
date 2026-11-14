// 2. Les sept IA candidates entrent une à une, avec leur prénom, leur doctrine, et leur emblème qui se trace.
import { AbsoluteFill } from "remotion";

import { Sphere } from "../Sphere.jsx";
import { C, CANDIDATES, SANS, entre } from "../commun.js";
import { quand } from "../temps.js";
import { useVertical } from "../format.js";

export function Candidates({ t }) {
  const v = useVertical();
  const t0 = quand("Seven");
  const tParti = quand("party.");
  const tDoctrine = quand("doctrine,");
  const titre = entre(t, t0 - 0.3, t0 + 0.4);
  const sous1 = entre(t, tParti - 0.5, tParti) * (1 - entre(t, tDoctrine - 0.6, tDoctrine - 0.2));
  const sous2 = entre(t, tDoctrine - 0.2, tDoctrine + 0.4);
  const doctrineVive = entre(t, tDoctrine, tDoctrine + 0.8);
  const recul = entre(t, 6, 15, 0, 1);
  return (
    <AbsoluteFill style={{ background: C.fond, fontFamily: SANS, color: C.texte, alignItems: "center" }}>
      <div style={{ marginTop: v ? 360 : 185, textAlign: "center", opacity: titre, translate: `0 ${(1 - titre) * 24}px` }}>
        <div style={{ fontSize: v ? 96 : 92, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1 }}>Sept IA se présentent.</div>
        <div style={{ position: "relative", height: v ? 110 : 60, marginTop: 22, width: v ? 940 : 1500 }}>
          <div style={{ position: "absolute", inset: 0, fontSize: v ? 42 : 44, lineHeight: 1.25, color: C.attenue, letterSpacing: "-0.02em", opacity: sous1 }}>
            Pas de parti. Pas de carrière à protéger.
          </div>
          <div style={{ position: "absolute", inset: 0, fontSize: v ? 42 : 44, lineHeight: 1.25, color: C.texte, fontWeight: 500, letterSpacing: "-0.02em", opacity: sous2 }}>
            Une doctrine publique. Des votes vérifiables.
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", rowGap: v ? 44 : 0, columnGap: v ? 14 : 22, width: v ? 1000 : undefined, marginTop: v ? 70 : 120, scale: String(1 + recul * 0.025) }}>
        {CANDIDATES.map((c, i) => {
          const entree = t0 + 0.05 + i * 0.3;
          const p = entre(t, entree, entree + 0.9);
          const trace = entre(t, entree + 0.25, entree + 1.9, 0, 1, (x) => x);
          return (
            <div key={c.id} style={{ width: v ? 236 : 228, display: "flex", flexDirection: "column", alignItems: "center", opacity: p, translate: `0 ${(1 - p) * 60}px` }}>
              <Sphere teintes={c.teintes} taille={v ? 184 : 196} embleme={c.id} trace={trace} decalage={i * 3.7} />
              <div style={{ fontSize: v ? 40 : 38, fontWeight: 600, letterSpacing: "-0.03em", marginTop: v ? 20 : 26 }}>{c.prenom}</div>
              <div
                style={{
                  fontSize: v ? 25 : 23,
                  lineHeight: 1.3,
                  textAlign: "center",
                  marginTop: 8,
                  color: doctrineVive > 0.5 ? C.texte : C.attenue,
                  opacity: 0.75 + 0.25 * doctrineVive,
                  textWrap: "balance",
                }}
              >
                {c.doctrine}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
