"use client";

import Link from "next/link";
import { MotionConfig } from "motion/react";

import { FiltreSphere } from "@/components/sphere";
import { Faconner } from "./faconner";
import { FaceAFace } from "./face-a-face";
import { PremierEcran } from "./premier-ecran";
import { BOUTON_PILULE, Reveal } from "./reveal";

/**
 * L'accueil est un récit vertical : une idée par section, chaque animation démarre quand sa section
 * entre à l'écran. Les sections reprennent les maquettes 04 à 08.
 */
export function Accueil() {
  return (
    <MotionConfig reducedMotion="user">
      <FiltreSphere />
      <div className="space-y-32 pb-16 sm:space-y-48">
        <PremierEcran />
        <Faconner />
        <FaceAFace />
        <Reveal className="flex justify-center pb-8 sm:pb-16">
          <Link href="/test" className={BOUTON_PILULE}>
            Trouver mon IA
          </Link>
        </Reveal>
      </div>
    </MotionConfig>
  );
}
