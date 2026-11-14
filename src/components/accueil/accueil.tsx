"use client";

import { MotionConfig } from "motion/react";

import { FiltreSphere } from "@/components/sphere";
import { Etapes } from "./etapes";
import { HemicycleRallie } from "./hemicycle-rallie";
import { Modele } from "./modele";
import { PremierEcran } from "./premier-ecran";
import { useSphereCitoyen } from "./sphere-citoyen";

/**
 * L'accueil : la sphère du citoyen, les trois étapes, l'hémicycle qui prend sa couleur,
 * puis le modèle à trois niveaux qui explique ce dessin.
 */
export function Accueil() {
  const sphere = useSphereCitoyen();

  return (
    <MotionConfig reducedMotion="user">
      <FiltreSphere />
      <PremierEcran sphere={sphere} />
      <Etapes mandatRegle={sphere.regle} />
      <HemicycleRallie teintes={sphere.teintes} poids={sphere.poids} />
      <Modele />
    </MotionConfig>
  );
}
