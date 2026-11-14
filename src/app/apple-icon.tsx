import { iconeSphere } from "@/app/_og/rendu";
import { TEINTES_MARQUE } from "@/app/_og/marque";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return iconeSphere({ teintes: TEINTES_MARQUE, cote: size.width });
}
