import type { Metadata } from "next";

import { VueMandat } from "@/components/mandat/vue-mandat";

export const metadata: Metadata = {
  title: "Façonnez votre Député IA — DemocratIA",
  description:
    "Tranchez de vrais textes de loi et réglez vos priorités : votre Députée IA votera selon ce mandat. Fiction d'anticipation, données sourcées par Hémicycle.",
};

export default function PageMandat() {
  return <VueMandat />;
}
