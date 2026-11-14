import type { Metadata } from "next";

import { VueTest } from "@/components/test/vue-test";

export const metadata: Metadata = {
  title: "Le test — DemocratIA",
  description:
    "Tranchez de vrais textes de loi de l'Assemblée, réglez vos priorités, et découvrez l'IA candidate faite pour vous. Fiction d'anticipation, données sourcées par Hémicycle.",
};

export default function PageTest() {
  return <VueTest />;
}
