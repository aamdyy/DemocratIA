// 5. Au pouvoir : les 577 sièges basculent à la couleur de l'IA, puis elle rédige son amendement en direct.
import { AbsoluteFill } from "remotion";

import { Sphere } from "../Sphere.jsx";
import { C, CANDIDATES, EGAL, GAGNANTE, MONO, SANS, entre } from "../commun.js";
import { CADRE, SIEGES } from "../elements.jsx";
import { quand } from "../temps.js";

// État de départ : un vote ordinaire de l'Assemblée (pour, contre, abstention), déterministe.
const ETATS = SIEGES.map((_, i) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  const r = x - Math.floor(x);
  const quartier = i / SIEGES.length;
  if (quartier < 0.38) return r < 0.85 ? C.bleu : C.gris;
  if (quartier < 0.62) return r < 0.6 ? C.gris : r < 0.8 ? C.bleu : C.rouge;
  return r < 0.82 ? C.rouge : C.gris;
});

const AMENDEMENT =
  "Article unique. Après l'article 3, il est inséré un article ainsi rédigé : « Tout algorithme qui fonde une décision administrative est publié, avec ses données et ses règles. Chacun peut en demander l'explication et la faire réexaminer par un agent public. »";

const melange = (a, b, p) => {
  const ha = a.match(/\w\w/g).map((h) => parseInt(h, 16));
  const hb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return `rgb(${ha.map((v, k) => Math.round(v + (hb[k] - v) * p)).join(" ")})`;
};

export function Pouvoir({ t }) {
  const tPouvoir = quand("Puis");
  const tSieges = quand("cinq");
  const tBascule = quand("basculent");
  const tRedige = quand("rédige");
  const tDirect = quand("direct.");
  const couleur = GAGNANTE.teintes[1];
  const titre = entre(t, tPouvoir - 0.3, tPouvoir + 0.5);
  const hemi = entre(t, tPouvoir, tPouvoir + 1.0);
  const feuille = entre(t, tRedige - 0.8, tRedige + 0.2);
  const decal = entre(t, tRedige - 0.9, tRedige + 0.1, 0, 1, EGAL);
  // Le balayage de gauche à droite dure environ 2,6 s, chaque siège basculant en 0,35 s.
  const debutBascule = tSieges + 0.3;
  const dureeBascule = tBascule + 1.2 - debutBascule;
  const bascules = SIEGES.filter((_, i) => t > debutBascule + (i / SIEGES.length) * dureeBascule + 0.15).length;
  const caracteres = Math.floor(entre(t, tRedige + 0.15, tDirect + 1.0, 0, 1, (x) => x) * AMENDEMENT.length);
  const sortie = entre(t, 42.1, 42.9);

  return (
    <AbsoluteFill style={{ background: C.fond, fontFamily: SANS, color: C.texte, filter: `grayscale(${sortie})` }}>
      <div style={{ position: "absolute", left: 130, top: 150, display: "flex", alignItems: "center", gap: 26, opacity: titre, translate: `0 ${(1 - titre) * 20}px` }}>
        <Sphere teintes={GAGNANTE.teintes} taille={92} embleme={GAGNANTE.id} trace={1} decalage={CANDIDATES.indexOf(GAGNANTE) * 2.3} />
        <div>
          <div style={{ fontFamily: MONO, fontSize: 24, color: C.attenue }}>Au pouvoir</div>
          <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.05 }}>{GAGNANTE.prenom} gouverne.</div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 130 + (1 - decal) * 270,
          top: 300 + (1 - hemi) * 30,
          width: 1120 - decal * 300,
          opacity: hemi,
        }}
      >
        <svg viewBox={`0 0 ${CADRE.largeur} ${CADRE.hauteur}`} style={{ width: "100%", display: "block" }}>
          {SIEGES.map((s, i) => {
            const p = entre(t, debutBascule + (i / SIEGES.length) * dureeBascule, debutBascule + (i / SIEGES.length) * dureeBascule + 0.35, 0, 1, EGAL);
            return <circle key={i} cx={s.x} cy={s.y} r={CADRE.rayonSiege} fill={p <= 0 ? ETATS[i] : melange(ETATS[i], couleur, p)} />;
          })}
        </svg>
        <div style={{ display: "flex", justifyContent: "center", marginTop: -84 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 64, letterSpacing: "-0.02em", color: bascules > 0 ? GAGNANTE.teintes[2] : C.texte }}>
              {bascules > 0 ? bascules : 577}
            </div>
            <div style={{ fontSize: 24, color: C.attenue }}>{bascules > 0 ? `sièges sur 577 à la couleur d'${GAGNANTE.prenom}` : "sièges à l'Assemblée"}</div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 120,
          top: 300,
          width: 700,
          minHeight: 560,
          padding: "36px 40px",
          borderRadius: 14,
          border: `1px solid ${C.trait}`,
          background: C.fond,
          boxShadow: "0 30px 80px rgb(17 19 24 / 0.10), 0 4px 14px rgb(17 19 24 / 0.05)",
          opacity: feuille,
          translate: `${(1 - feuille) * 90}px 0`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 22, borderBottom: `1px solid ${C.trait}` }}>
          <div style={{ position: "relative", width: 52, height: 52 }}>
            {[0, 1, 2].map((k) => {
              const phase = ((t - tRedige) / 1.8 + k / 3) % 1;
              return (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: `1.5px solid ${couleur}`,
                    scale: String(1 + 0.85 * Math.max(0, phase)),
                    opacity: t > tRedige && caracteres < AMENDEMENT.length ? 0.5 * (1 - Math.max(0, phase)) : 0,
                  }}
                />
              );
            })}
            <Sphere teintes={GAGNANTE.teintes} taille={52} decalage={4} />
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 22, color: C.machine, letterSpacing: "0.02em" }}>AMENDEMENT N° IA-2050</div>
            <div style={{ fontSize: 22, color: C.attenue, marginTop: 4 }}>rédigé par {GAGNANTE.prenom}, en direct</div>
          </div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 25, lineHeight: 1.55, marginTop: 24, color: C.texte, whiteSpace: "pre-wrap" }}>
          {AMENDEMENT.slice(0, caracteres)}
          <span style={{ color: C.machine, opacity: Math.floor(t * 2) % 2 === 0 || caracteres < AMENDEMENT.length ? 1 : 0 }}>▍</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}
