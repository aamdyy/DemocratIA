import type { Metadata } from "next";

import { Cadre } from "../_composants/commun";
import { PremierEcranTest } from "../_composants/test-accueil";

export const metadata: Metadata = {
  title: "Accueil, variante 4 : le test dès l'accueil",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Cadre n={4} premier={<PremierEcranTest />} bouton={false} />;
}
