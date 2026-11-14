import type { Metadata } from "next";

import { IMAGE_PARTAGE } from "@/app/_og/site";
import { VueAudit } from "@/components/audit/vue-audit";

const TITRE = "Audit d'un député";
const DESCRIPTION =
  "Les votes publiés d'un député, texte par texte, face à la position de votre IA candidate. Données parlementaires réelles d'Hémicycle.";

export const metadata: Metadata = {
  title: TITRE,
  description: DESCRIPTION,
  openGraph: { title: TITRE, description: DESCRIPTION, images: IMAGE_PARTAGE },
};

export default function PageAudit() {
  return <VueAudit />;
}
