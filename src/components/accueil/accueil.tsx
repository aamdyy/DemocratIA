"use client";

import { MotionConfig } from "motion/react";

import { HumainContreIA } from "@/app/(app)/accueils/_composants/comparatif";
import { Recit } from "@/app/(app)/accueils/_composants/recit";
import { BoutonIA } from "@/components/bouton-ia";
import { FiltreSphere } from "@/components/sphere";
import { PremierEcran } from "./premier-ecran";
import { Reveal } from "./reveal";

/**
 * L'accueil retenu par l'équipe : le manège des trois sphères (maquette 05), puis « pourquoi une IA »
 * (humain contre IA, variante 3 de /accueils), puis « comment ça marche » en trois temps (variante 1).
 * Chaque animation démarre quand sa section entre à l'écran.
 */
export function Accueil() {
  return (
    <MotionConfig reducedMotion="user">
      <FiltreSphere />
      <div className="space-y-32 pb-16 sm:space-y-48">
        <PremierEcran />
        <HumainContreIA />
        <Recit />
        <Reveal className="flex justify-center pb-8 sm:pb-16">
          <BoutonIA href="/test">
            Trouver mon IA
          </BoutonIA>
        </Reveal>
      </div>
    </MotionConfig>
  );
}
