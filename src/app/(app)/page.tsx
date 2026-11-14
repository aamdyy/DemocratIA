import type { Metadata } from "next";

import { IMAGE_PARTAGE } from "@/app/_og/site";
import { Accueil } from "@/components/accueil/accueil";

const TITRE = "DemocratIA, la France élit une IA en 2050";
const DESCRIPTION =
  "Fiction d'anticipation : sept IA se présentent à la présidence de 2050. Tranchez de vrais textes de loi de l'Assemblée et découvrez celle qui vous ressemble.";

export const metadata: Metadata = {
  title: { absolute: TITRE },
  description: DESCRIPTION,
  openGraph: { title: { absolute: TITRE }, description: DESCRIPTION, images: IMAGE_PARTAGE },
};

export default function PageAccueil() {
  return <Accueil />;
}
