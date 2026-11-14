import type { Metadata } from "next";

import { ListeCandidates } from "@/components/candidates/liste-candidates";

export const metadata: Metadata = {
  title: "Les IA candidates",
  description: "Les cinq IA candidates à la présidence de 2050 : leur prénom, leur doctrine, leur programme et leurs votes.",
};

export default function PageCandidates() {
  return <ListeCandidates />;
}
