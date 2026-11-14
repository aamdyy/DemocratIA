import type { Metadata } from "next";

import { VueSeance } from "@/components/seance/vue-seance";

export const metadata: Metadata = {
  title: "Au pouvoir",
  description: "Votre IA préside : elle tranche un vrai texte de loi face à l'Assemblée de 2026, puis rédige un amendement.",
};

export default function PageSeance() {
  return <VueSeance />;
}
