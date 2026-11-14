import type { Metadata } from "next";

import { IMAGE_PARTAGE } from "@/app/_og/site";
import { VueTest } from "@/components/test/vue-test";

const TITRE = "Le test";
const DESCRIPTION =
  "Tranchez de vrais textes de loi de l'Assemblée, réglez vos priorités et découvrez l'IA candidate qui vous ressemble. Fiction d'anticipation, données sourcées par Hémicycle.";

export const metadata: Metadata = {
  title: TITRE,
  description: DESCRIPTION,
  openGraph: { title: TITRE, description: DESCRIPTION, images: IMAGE_PARTAGE },
};

export default function PageTest() {
  return <VueTest />;
}
