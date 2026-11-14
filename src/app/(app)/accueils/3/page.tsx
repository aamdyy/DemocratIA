import type { Metadata } from "next";

import { Cadre } from "../_composants/commun";
import { HumainContreIA } from "../_composants/comparatif";
import { PremierEcranCoupeEnDeux } from "../_composants/premiers";

export const metadata: Metadata = {
  title: "Accueil, variante 3 : humain contre IA",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Cadre n={3} premier={<PremierEcranCoupeEnDeux />}>
      <HumainContreIA />
    </Cadre>
  );
}
