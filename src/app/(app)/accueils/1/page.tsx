import type { Metadata } from "next";

import { PremierEcran } from "@/components/accueil/premier-ecran";
import { Cadre } from "../_composants/commun";
import { Recit } from "../_composants/recit";

export const metadata: Metadata = {
  title: "Accueil, variante 1 : récit en 3 temps",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Cadre n={1} premier={<PremierEcran />}>
      <Recit />
    </Cadre>
  );
}
