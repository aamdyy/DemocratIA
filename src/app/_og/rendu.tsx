import { ImageResponse } from "next/og";

import type { Teintes } from "@/components/sphere";

/**
 * Rendu des images de partage et des icônes : fond blanc, la marque, une sphère en dégradé radial.
 * Satori (le moteur d'ImageResponse) ne sait ni animer ni flouter : la sphère est donc une pile de
 * dégradés radiaux, qui rappelle les nuages de la vraie sphère sans la copier.
 */

export const TAILLE_PARTAGE = { width: 1200, height: 630 };

/** Les dégradés d'une sphère, du reflet vers la matière. Les couleurs viennent des teintes de la candidate. */
const matiere = ([fond, nuage1, nuage2, nuage3]: Teintes) =>
  [
    "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 40%)",
    `radial-gradient(circle at 24% 72%, ${nuage3} 0%, rgba(255,255,255,0) 52%)`,
    `radial-gradient(circle at 78% 66%, ${nuage2} 0%, rgba(255,255,255,0) 58%)`,
    `radial-gradient(circle at 62% 30%, ${nuage1} 0%, rgba(255,255,255,0) 62%)`,
    `linear-gradient(${fond}, ${fond})`,
  ].join(", ");

function SphereRendue({ teintes, diametre }: { teintes: Teintes; diametre: number }) {
  return (
    <div
      style={{
        display: "flex",
        width: diametre,
        height: diametre,
        borderRadius: diametre,
        backgroundImage: matiere(teintes),
      }}
    />
  );
}

/** Image de partage 1200 × 630 : la marque à gauche, la sphère à droite, sur fond blanc. */
export function imagePartage({
  teintes,
  titre,
  sousTitre,
}: {
  teintes: Teintes;
  titre: string;
  sousTitre: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 96px",
          background: "#ffffff",
          color: "#111318",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ display: "flex", fontSize: 30, color: "#5f6573", letterSpacing: -0.5 }}>DemocratIA</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: 76, lineHeight: 1.06, letterSpacing: -2.5 }}>
            {titre.split("\n").map((ligne) => (
              <div key={ligne} style={{ display: "flex" }}>
                {ligne}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 32, lineHeight: 1.35, color: "#5f6573" }}>
            {sousTitre}
          </div>
        </div>
        <SphereRendue teintes={teintes} diametre={400} />
      </div>
    ),
    { ...TAILLE_PARTAGE },
  );
}

/** Icône carrée : la sphère seule, qui remplit le carré. */
export function iconeSphere({ teintes, cote }: { teintes: Teintes; cote: number }) {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <SphereRendue teintes={teintes} diametre={Math.round(cote * 0.9)} />
      </div>
    ),
    { width: cote, height: cote },
  );
}
