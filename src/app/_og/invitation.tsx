import { ImageResponse } from "next/og";

import { SphereRendue, TAILLE_PARTAGE } from "@/app/_og/rendu";
import type { Candidate } from "@/lib/candidates";
import { enPourcent } from "@/lib/partage";

const GRIS = "#5f6573";

/**
 * L'image d'un lien d'invitation, 1200 × 630, dans le style des autres images de partage :
 * fond blanc, la marque, le prénom de l'IA, l'affinité, la question, et la grande sphère à droite.
 */
export function imageInvitation(candidate: Candidate, affinite: number | null) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 88px 0 96px",
          background: "#ffffff",
          color: "#111318",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 600 }}>
          <div style={{ display: "flex", fontSize: 30, color: GRIS, letterSpacing: -0.5 }}>DemocratIA</div>
          <div style={{ display: "flex", marginTop: 40, fontSize: 38, color: GRIS, letterSpacing: -0.5 }}>
            Mon IA présidente :
          </div>
          <div style={{ display: "flex", marginTop: 4, fontSize: 128, lineHeight: 1, letterSpacing: -4 }}>
            {candidate.prenom}
          </div>
          {affinite === null ? null : (
            <div style={{ display: "flex", marginTop: 26, fontSize: 46, letterSpacing: -1 }}>
              {`${enPourcent(affinite)} d'affinité`}
            </div>
          )}
          <div style={{ display: "flex", marginTop: affinite === null ? 30 : 34, fontSize: 36, color: GRIS }}>
            Et la vôtre ?
          </div>
        </div>
        <SphereRendue teintes={candidate.teintes} diametre={420} />
      </div>
    ),
    { ...TAILLE_PARTAGE },
  );
}
