"use client";

import { HumainContreIA } from "@/app/(app)/accueils/_composants/comparatif";
import { Recit } from "@/app/(app)/accueils/_composants/recit";
import { BoutonIA } from "@/components/bouton-ia";
import { FiltreSphere } from "@/components/sphere";
import { PremierEcran } from "./premier-ecran";
import { Element, Serie } from "./reveal";

/**
 * L'accueil retenu par l'équipe, lu comme une histoire : le manège des sept sphères, puis « pourquoi une IA »
 * (humain contre IA, puis les sept candidates), puis « comment ça marche » en trois temps, et l'invitation finale.
 * Chaque section entre à l'écran en cascade, au même rythme (src/lib/animation.ts).
 * Le mouvement réduit est réglé une fois pour tout le site, dans le layout.
 */
export function Accueil() {
  return (
    <>
      <FiltreSphere />
      <div className="space-y-32 pb-16 sm:space-y-44">
        <PremierEcran />
        <HumainContreIA />
        <Recit />
        <Serie className="flex flex-col items-center gap-8 pb-8 text-center sm:pb-16">
          <Element as="p" className="text-balance text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
            À vous de régler votre sphère.
          </Element>
          <Element>
            <BoutonIA href="/test">Trouver mon IA</BoutonIA>
          </Element>
        </Serie>
      </div>
    </>
  );
}
