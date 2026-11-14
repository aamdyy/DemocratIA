import type { Metadata } from "next";

import { Cadre } from "../_composants/commun";
import { Manifeste } from "../_composants/manifeste";
import { PremierEcranGrandeSphere } from "../_composants/premiers";

export const metadata: Metadata = {
  title: "Accueil, variante 2 : manifeste",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Cadre n={2} premier={<PremierEcranGrandeSphere />}>
      <Manifeste />
    </Cadre>
  );
}
