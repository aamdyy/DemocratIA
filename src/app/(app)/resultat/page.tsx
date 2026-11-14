import type { Metadata } from "next";

import { VueResultat } from "@/components/resultat/vue-resultat";

export const metadata: Metadata = {
  title: "Votre IA — DemocratIA",
  description:
    "L'IA candidate la plus proche de vos choix, et pourquoi : les textes de loi où vous votez pareil, vos désaccords, vos thèmes communs.",
};

export default function PageResultat() {
  return <VueResultat />;
}
