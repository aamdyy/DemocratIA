// 2. Les sept IA candidates entrent une à une, avec leur prénom, leur doctrine, et leur emblème qui se trace.
import { AbsoluteFill } from "remotion";

import { Sphere } from "../Sphere.jsx";
import { C, CANDIDATES, SANS, entre } from "../commun.js";
import { quand } from "../temps.js";

export function Candidates({ t }) {
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
      <div style={{ marginTop: 185, textAlign: "center", opacity: titre, translate: `0 ${(1 - titre) * 24}px` }}>
        <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1 }}>Sept IA se présentent.</div>
        <div style={{ position: "relative", height: 60, marginTop: 22, width: 1500 }}>
          <div style={{ position: "absolute", inset: 0, fontSize: 44, color: C.attenue, letterSpacing: "-0.02em", opacity: sous1 }}>
            Pas de parti. Pas de carrière à protéger.
          </div>
          <div style={{ position: "absolute", inset: 0, fontSize: 44, color: C.texte, fontWeight: 500, letterSpacing: "-0.02em", opacity: sous2 }}>
            Une doctrine publique. Des votes vérifiables.
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: 120, scale: String(1 + recul * 0.025) }}>
        {CANDIDATES.map((c, i) => {
          const entree = t0 + 0.05 + i * 0.3;
          const p = entre(t, entree, entree + 0.9);
          const trace = entre(t, entree + 0.25, entree + 1.9, 0, 1, (x) => x);
          return (
            <div key={c.id} style={{ width: 228, display: "flex", flexDirection: "column", alignItems: "center", opacity: p, translate: `0 ${(1 - p) * 60}px` }}>
              <Sphere teintes={c.teintes} taille={196} embleme={c.id} trace={trace} decalage={i * 3.7} />
              <div style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-0.03em", marginTop: 26 }}>{c.prenom}</div>
              <div
                style={{
                  fontSize: 23,
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
