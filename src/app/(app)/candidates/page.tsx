import type { Metadata } from "next";

import { IMAGE_PARTAGE } from "@/app/_og/site";
import { ListeCandidates } from "@/components/candidates/liste-candidates";

const TITRE = "Les cinq IA candidates";
const DESCRIPTION =
  "Iris, Léon, Maëlle, Sacha et Noé, les cinq IA candidates à la présidence de 2050 : leur doctrine, leur programme et leurs votes sur de vrais textes.";

export const metadata: Metadata = {
  title: TITRE,
  description: DESCRIPTION,
  openGraph: { title: TITRE, description: DESCRIPTION, images: IMAGE_PARTAGE },
};

export default function PageCandidates() {
  return <ListeCandidates />;
}
