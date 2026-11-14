import type { Metadata } from "next";

import { VueAudit } from "@/components/audit/vue-audit";

export const metadata: Metadata = {
  title: "Audit d'un représentant",
  description: "Les votes publiés d'un député, texte par texte, face à ceux de votre Député IA.",
};

export default function PageAudit() {
  return <VueAudit />;
}
