import type { Metadata } from "next";

import { IMAGE_PARTAGE } from "@/app/_og/site";
import { ListeCandidates } from "@/components/candidates/liste-candidates";
import { NOMBRE_CANDIDATES, PRENOMS_CANDIDATES, TITRE_CANDIDATES } from "@/components/candidates/nombre";

const TITRE = TITRE_CANDIDATES;
const DESCRIPTION = `${PRENOMS_CANDIDATES}, les ${NOMBRE_CANDIDATES} IA candidates à la présidence de 2050 : leur doctrine, leur programme et leurs votes sur de vrais textes.`;

export const metadata: Metadata = {
  title: TITRE,
  description: DESCRIPTION,
  openGraph: { title: TITRE, description: DESCRIPTION, images: IMAGE_PARTAGE },
};

export default function PageCandidates() {
  return <ListeCandidates />;
}
