// Comparatif, repris de l'accueil du site : « Ce qu'un humain promet, une IA le tient. »
// À gauche, le dernier président humain (un disque gris neutre, aucune photo de personne réelle) ;
// à droite, la première présidente IA. Trois lignes se révèlent au rythme de la voix, avec leurs petits schémas.
import { AbsoluteFill } from "remotion";

import { Sphere } from "../Sphere.jsx";
import { C, CANDIDATES, EGAL, MONO, SANS, entre } from "../commun.js";
import { quand } from "../temps.js";

const HYGIE = CANDIDATES.find((c) => c.id === "hygie");
const M = C.machine;
const GRIS = "#5f6573";

const COL_H = 600;
const COL_IA = 1190;
const LARGEUR_COL = 520;
const RANGEES = [405, 580, 755];

/** Silhouette neutre : un disque gris, une tête et des épaules, sans aucun trait de visage. */
function Silhouette({ taille }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 100 100" style={{ display: "block", borderRadius: "50%" }}>
      <circle cx="50" cy="50" r="50" fill="#d9dce2" />
      <circle cx="50" cy="40" r="17" fill="#b9bec8" />
      <path d="M16 96 C 20 70, 36 62, 50 62 C 64 62, 80 70, 84 96 Z" fill="#b9bec8" />
    </svg>
  );
}

function Grille({ u, ia }) {
  const pleins = ia ? Math.floor(entre(u, 0.1, 2.2, 0, 52, (x) => x)) : 0;
  const curseur = Math.floor(u * 9) % 65;
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(13, 16px)", gap: 4 }}>
        {Array.from({ length: 65 }, (_, i) => {
          const plein = ia ? i < pleins : i === 0 && u > 0.2;
          const teinte = ia ? [M, "#c75a96", "#e3a3c6"][(i * 7) % 3] : "#4b5160";
          return (
            <div
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: plein ? teinte : "transparent",
                border: `1.5px solid ${plein ? teinte : !ia && i === curseur && u > 0.4 ? GRIS : "#dde0e6"}`,
              }}
            />
          );
        })}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 18, lineHeight: 1.5, color: ia ? M : C.attenue, marginTop: 2 }}>
        {ia ? `${Math.max(1, Math.round(pleins * 0.87))} votes` : "1 vote"}
        <br />
        {ia ? "à tout moment" : "puis aucun"}
      </div>
    </div>
  );
}

function Promesses({ u }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {["Baisser les impôts", "Créer des emplois", "Rénover les écoles"].map((p, i) => {
        const b = entre(u, 0.5 + i * 0.45, 1.2 + i * 0.45);
        return (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, color: GRIS }}>
            <span style={{ width: 7, height: 7, borderRadius: 4, background: "#c2c6ce" }} />
            <span style={{ position: "relative", filter: `blur(${b * 2.6}px)`, opacity: 1 - 0.35 * b }}>
              {p}
              <span style={{ position: "absolute", left: 0, top: "52%", height: 2, width: `${b * 100}%`, background: GRIS }} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Code({ u }) {
  const lignes = [
    ["pour chaque texte :", false],
    ["  appliquer(règle)", true],
    ["  voter(position)", true],
    ["  publier()", true],
  ];
  return (
    <div style={{ fontFamily: MONO, fontSize: 20, lineHeight: 1.35, color: M, width: 330 }}>
      {lignes.map(([l, coche], i) => (
        <div key={l} style={{ display: "flex", justifyContent: "space-between", opacity: entre(u, i * 0.25, i * 0.25 + 0.3) }}>
          <span style={{ whiteSpace: "pre" }}>{l}</span>
          {coche ? <span style={{ opacity: entre(u, 0.5 + i * 0.3, 0.7 + i * 0.3) }}>✓</span> : null}
        </div>
      ))}
    </div>
  );
}

function BoiteNoire({ u }) {
  const couvercle = entre(u, 0.3, 1.1, -38, 0, EGAL);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, height: 100 }}>
      <div style={{ position: "relative", width: 96, height: 90 }}>
        <div style={{ position: "absolute", left: 6, right: 6, bottom: 0, height: 60, borderRadius: 8, background: GRIS }} />
        <div
          style={{
            position: "absolute",
            left: 2,
            right: 2,
            top: 22,
            height: 9,
            borderRadius: 5,
            background: "#4b5160",
            transformOrigin: "0% 50%",
            rotate: `${couvercle}deg`,
          }}
        />
      </div>
      <div style={{ width: 56, borderTop: "2px dashed #c2c6ce" }} />
      <div style={{ width: 44, height: 44, borderRadius: 8, border: "2px dashed #c2c6ce" }} />
    </div>
  );
}

function BoiteDeVerre({ u }) {
  const registre = ["09:14  pour", "09:31  contre", "10:02  pour"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, height: 100 }}>
      <div style={{ width: 110, height: 78, borderRadius: 10, border: `2px solid ${M}`, background: "rgb(156 31 107 / 0.05)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: M, opacity: 0.3 + 0.7 * entre(u, 0.2 + i * 0.3, 0.5 + i * 0.3) }} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {registre.map((r, i) => {
          const p = entre(u, 0.5 + i * 0.4, 0.9 + i * 0.4);
          return (
            <div
              key={r}
              style={{
                fontFamily: MONO,
                fontSize: 17,
                color: M,
                border: `1.5px solid ${M}`,
                borderRadius: 999,
                padding: "2px 12px",
                display: "flex",
                gap: 18,
                justifyContent: "space-between",
                width: 250,
                opacity: p,
                translate: `${(1 - p) * 20}px 0`,
              }}
            >
              <span style={{ whiteSpace: "pre" }}>● {r}</span>
              <span style={{ opacity: 0.7 }}>publié</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Comparatif({ t }) {
  const t0 = quand("human") - 0.15;
  const titre = entre(t, t0 - 0.4, t0 + 0.4);
  const tIA = quand("An");
  const accentIA = entre(t, tIA - 0.2, tIA + 0.6);
  // Moments de révélation de chaque case, calés sur la voix.
  const lignes = [
    {
      libelle: "Mandat",
      h: quand("five") - 0.3,
      ia: quand("tuned") - 0.3,
      schemaH: (u) => <Grille u={u} ia={false} />,
      schemaIA: (u) => <Grille u={u} ia />,
      texteH: "Cinq ans, sans retour devant les électeurs.",
      texteIA: "Réglée à chaque vote.",
    },
    {
      libelle: "Programme",
      h: quand("promises") - 0.4,
      ia: quand("every", 0) + 0.4,
      schemaH: (u) => <Promesses u={u} />,
      schemaIA: (u) => <Code u={u} />,
      texteH: "Des promesses sans valeur juridique.",
      texteIA: "Une règle publique.",
    },
    {
      libelle: "Décisions",
      h: quand("weight.") + 0.1,
      ia: quand("every", 1) - 0.1,
      schemaH: (u) => <BoiteNoire u={u} />,
      schemaIA: (u) => <BoiteDeVerre u={u} />,
      texteH: "Non publiques.",
      texteIA: "Chaque position publiée.",
    },
  ];
  return (
    <AbsoluteFill style={{ background: C.fond, fontFamily: SANS, color: C.texte }}>
      <div style={{ position: "absolute", top: 118, left: 0, right: 0, textAlign: "center", opacity: titre, translate: `0 ${(1 - titre) * 20}px` }}>
        <div style={{ fontSize: 66, fontWeight: 700, letterSpacing: "-0.045em" }}>Ce qu'un humain promet, une IA le tient.</div>
      </div>
      {/* En-têtes des deux colonnes. */}
      <div style={{ position: "absolute", left: COL_H, top: 222, display: "flex", alignItems: "center", gap: 22, opacity: titre }}>
        <Silhouette taille={110} />
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em" }}>Le dernier président humain</div>
      </div>
      <div style={{ position: "absolute", left: COL_IA, top: 222, display: "flex", alignItems: "center", gap: 22, opacity: titre }}>
        <div style={{ scale: String(1 + 0.08 * accentIA) }}>
          <Sphere teintes={HYGIE.teintes} taille={110} embleme="hygie" trace={1} decalage={5} />
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", color: accentIA > 0.5 ? M : C.texte }}>La première présidente IA</div>
      </div>
      {lignes.map((l, i) => {
        const y = RANGEES[i];
        const pH = entre(t, l.h, l.h + 0.6);
        const pIA = entre(t, l.ia, l.ia + 0.6);
        const filet = entre(t, t0 + i * 0.15, t0 + 0.8 + i * 0.15, 0, 1, EGAL);
        return (
          <div key={l.libelle}>
            <div style={{ position: "absolute", left: 180, right: 180, top: y - 22, height: 1, background: C.trait, scale: `${filet} 1`, transformOrigin: "0 0" }} />
            <div style={{ position: "absolute", left: 180, top: y + 4, fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", opacity: filet }}>{l.libelle}</div>
            <div style={{ position: "absolute", left: COL_H, top: y, width: LARGEUR_COL, opacity: pH, translate: `0 ${(1 - pH) * 16}px` }}>
              <div style={{ height: 112, display: "flex", alignItems: "center" }}>{l.schemaH(t - l.h)}</div>
              <div style={{ fontSize: 24, color: C.attenue, marginTop: 6 }}>{l.texteH}</div>
            </div>
            <div style={{ position: "absolute", left: COL_IA, top: y, width: LARGEUR_COL, opacity: pIA, translate: `0 ${(1 - pIA) * 16}px` }}>
              <div style={{ height: 112, display: "flex", alignItems: "center" }}>{l.schemaIA(t - l.ia)}</div>
              <div style={{ fontSize: 24, color: M, fontWeight: 500, marginTop: 6 }}>{l.texteIA}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
