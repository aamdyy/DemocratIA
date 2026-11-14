import { iconeSphere } from "@/app/_og/rendu";
import { TEINTES_MARQUE } from "@/app/_og/marque";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return iconeSphere({ teintes: TEINTES_MARQUE, cote: size.width });
}
