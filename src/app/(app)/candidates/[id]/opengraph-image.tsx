import { TEINTES_MARQUE } from "@/app/_og/marque";
import { imagePartage, TAILLE_PARTAGE } from "@/app/_og/rendu";
import { candidateParId } from "@/lib/candidates";

export const alt = "Une IA candidate à la présidence de 2050, DemocratIA";
export const size = TAILLE_PARTAGE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = candidateParId(id);
  return imagePartage({
    teintes: candidate?.teintes ?? TEINTES_MARQUE,
    titre: candidate ? candidate.prenom : "IA candidate",
    sousTitre: candidate ? `IA candidate de 2050. ${candidate.doctrine}` : "Les sept IA candidates de 2050.",
  });
}
