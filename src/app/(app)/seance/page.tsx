import type { Metadata } from "next";

import { IMAGE_PARTAGE } from "@/app/_og/site";
import { VueSeance } from "@/components/seance/vue-seance";

const TITRE = "Votre IA au pouvoir";
const DESCRIPTION =
  "Votre IA préside : elle tranche un vrai texte de loi face à l'Assemblée de 2026, puis rédige un amendement sous vos yeux.";

export const metadata: Metadata = {
  title: TITRE,
  description: DESCRIPTION,
  openGraph: { title: TITRE, description: DESCRIPTION, images: IMAGE_PARTAGE },
};

export default function PageSeance() {
  return <VueSeance />;
}
