import type { Metadata } from "next";

import { IMAGE_PARTAGE } from "@/app/_og/site";
import { VueResultat } from "@/components/resultat/vue-resultat";

const TITRE = "Votre IA";
const DESCRIPTION =
  "L'IA candidate la plus proche de vos choix, et pourquoi : les textes où vous votez pareil, vos désaccords, vos thèmes communs.";

export const metadata: Metadata = {
  title: TITRE,
  description: DESCRIPTION,
  openGraph: { title: TITRE, description: DESCRIPTION, images: IMAGE_PARTAGE },
};

export default function PageResultat() {
  return <VueResultat />;
}
