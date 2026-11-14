import { imagePartage, TAILLE_PARTAGE } from "@/app/_og/rendu";
import { TEINTES_MARQUE } from "@/app/_og/marque";

export const alt = "DemocratIA : en 2050, la France élit une IA";
export const size = TAILLE_PARTAGE;
export const contentType = "image/png";

export default function Image() {
  return imagePartage({
    teintes: TEINTES_MARQUE,
    titre: "En 2050, la France\nélit une IA.",
    sousTitre: "Tranchez de vrais textes de loi et trouvez l'IA qui vous ressemble.",
  });
}
