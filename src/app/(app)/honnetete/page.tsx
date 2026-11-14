import type { Metadata } from "next";

import { IMAGE_PARTAGE } from "@/app/_og/site";
import { VueHonnetete } from "@/components/honnetete/vue-honnetete";

const TITRE = "Honnêteté";
const DESCRIPTION =
  "Ce que DemocratIA ne dit pas sur ses propres pages : les dangers d'une IA au pouvoir, les limites de ce prototype, notre autocritique, et ce qui nous rend quand même optimistes.";

export const metadata: Metadata = {
  title: TITRE,
  description: DESCRIPTION,
  openGraph: { title: TITRE, description: DESCRIPTION, images: IMAGE_PARTAGE },
};

export default function PageHonnetete() {
  return <VueHonnetete />;
}
