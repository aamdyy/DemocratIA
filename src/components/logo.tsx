import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Logo DemocratIA, fourni par l'équipe (public/logo-democratia.png, 2000 × 290).
 * Sa hauteur suit la taille de police du parent : `className="text-[18px]"` donne un logo
 * d'environ 18 px de haut. `point` et `titre` sont gardés pour ne pas casser les appels existants.
 */
export function Logo({
  className,
  titre = false,
}: {
  className?: string;
  point?: string;
  titre?: boolean;
}) {
  return (
    <span className={cn("inline-flex leading-none", className)}>
      <Image
        src="/logo-democratia.png"
        alt="DemocratIA"
        width={2000}
        height={290}
        priority={titre}
        className="h-[0.8em] w-auto"
      />
    </span>
  );
}
