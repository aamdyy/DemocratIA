// La sphère du site (src/components/sphere.tsx et bloc .sphere de globals.css), recréée image par image :
// trois nuages de couleur et un voile blanc tournent lentement dans un disque de verre immobile.
import { useCurrentFrame, useVideoConfig } from "remotion";

import { Embleme } from "./Embleme.jsx";

const NUAGES = [
  { inset: [-14, 28, 32, -12], radius: "58% 42% 55% 45% / 48% 56% 44% 52%", couleur: 1, pivot: "62% 64%", tour: 3.6, sens: 1, vague: 1.6, houle: [10, 8] },
  { inset: [26, -14, 0, 34], radius: "44% 56% 48% 52% / 57% 45% 55% 43%", couleur: 2, pivot: "34% 38%", tour: 4.7, sens: -1, vague: 2.1, houle: [-12, 6] },
  { inset: [46, 26, -18, -4], radius: "52% 48% 42% 58% / 46% 54% 50% 50%", couleur: 3, pivot: "58% 30%", tour: 3.1, sens: 1, vague: 1.3, houle: [8, -12] },
  { inset: [10, 10, 46, 42], radius: "50%", couleur: null, pivot: "20% 80%", tour: 2.7, sens: -1, vague: 1.8, houle: [-14, 16] },
];

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>\")";

/** `intensite` (0 à 1) densifie la matière : utile en grand format, où les teintes claires paraissent pâles. */
export function Sphere({ teintes, taille, embleme = null, trace = 1, duree = 7, decalage = 0, intensite = 0, style }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + decalage;
  const tour = (periode) => ((t / (duree * periode)) * 360) % 360;
  // La houle va et vient (ease-in-out alterné), comme l'animation CSS du site.
  const houle = (vague) => (1 - Math.cos((t / (duree * vague)) * Math.PI)) / 2;

  return (
    <div
      style={{
        position: "relative",
        width: taille,
        height: taille,
        borderRadius: "50%",
        clipPath: "circle(50%)",
        background: intensite ? `color-mix(in srgb, ${teintes[0]}, ${teintes[1]} ${Math.round(intensite * 42)}%)` : teintes[0],
        isolation: "isolate",
        flexShrink: 0,
        ...style,
      }}
    >
      <div style={{ position: "absolute", inset: 0, rotate: `${tour(7.9)}deg`, filter: intensite ? `saturate(${1 + 0.3 * intensite})` : undefined }}>
        {NUAGES.map((n, i) => {
          const h = houle(n.vague);
          return (
            <span
              key={i}
              style={{
                position: "absolute",
                top: `${n.inset[0]}%`,
                right: `${n.inset[1]}%`,
                bottom: `${n.inset[2]}%`,
                left: `${n.inset[3]}%`,
                borderRadius: n.radius,
                background: n.couleur ? teintes[n.couleur] : "#ffffff",
                opacity: n.couleur ? 1 : 0.65 - 0.45 * intensite,
                filter: `blur(${taille * (0.09 - 0.02 * intensite)}px)`,
                transformOrigin: n.pivot,
                rotate: `${n.sens * tour(n.tour)}deg`,
                translate: `${n.houle[0] * h}% ${n.houle[1] * h}%`,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          inset: "4%",
          borderRadius: "50%",
          background: "conic-gradient(from 0deg, transparent 0 50%, rgb(255 255 255 / 0.5) 68%, transparent 86%)",
          filter: `blur(${taille * 0.06}px)`,
          mixBlendMode: "soft-light",
          rotate: `${-tour(4.3)}deg`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 22%, rgb(255 255 255 / 0.55), transparent 42%), radial-gradient(circle at 70% 84%, rgb(255 255 255 / 0.16), transparent 28%), radial-gradient(circle at 50% 50%, transparent 58%, rgb(20 10 30 / 0.14) 100%)",
        }}
      />
      <div style={{ position: "absolute", inset: 0, opacity: 0.35, mixBlendMode: "overlay", backgroundImage: GRAIN }} />
      {embleme ? (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: Math.min(1, trace * 3),
              background: "radial-gradient(circle at 50% 50%, rgb(255 255 255 / 0.42) 0%, rgb(255 255 255 / 0.18) 38%, transparent 64%)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "50%", filter: "drop-shadow(0 0 1px rgb(255 255 255 / 0.75)) drop-shadow(0 0 5px rgb(255 255 255 / 0.4))" }}>
              <Embleme id={embleme} progression={trace} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
