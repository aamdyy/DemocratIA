"use client";

import { useEffect, useRef, useState } from "react";

import { Embleme } from "@/components/emblemes";
import { EmblemeVariante, type Lettre } from "@/components/emblemes-variantes";
import type { Teintes } from "@/components/sphere";
import { CANDIDATES } from "@/lib/candidates";

/**
 * Emblèmes retenus par l'équipe sur /maquettes/emblemes-spheres :
 * Gaïa A, Thémis C, Hygie A, Plutus B, Athéna B, Harmonie A, Déméter A.
 * Le trait prend la couleur la plus profonde de la sphère (teintes[2]), à la demande de l'équipe.
 */
const CHOIX: Record<string, "A" | Lettre> = {
  gaia: "A",
  themis: "C",
  hygie: "A",
  plutus: "B",
  athena: "B",
  harmonie: "A",
  demeter: "A",
};

/** Un voile blanc très doux éclaircit le cœur de la sphère, et un halo détache le trait de la matière. */
const VOILE = "radial-gradient(circle at 50% 50%, rgb(255 255 255 / 0.42) 0%, rgb(255 255 255 / 0.18) 38%, transparent 64%)";
const HALO = "drop-shadow(0 0 1px rgb(255 255 255 / 0.75)) drop-shadow(0 0 5px rgb(255 255 255 / 0.4))";

/**
 * L'emblème noir d'une candidate, posé au centre de sa sphère. La candidate est reconnue à ses teintes :
 * une sphère aux couleurs mêlées (citoyen qui n'a pas passé le test) n'a pas d'emblème.
 * Absent des petites sphères (boutons, rangées, course du test) : il n'apparaît qu'à partir de 96 px,
 * mesurés sur la sphère elle-même, là où le dessin se lit vraiment.
 */
const TAILLE_MIN = 96;

export function EmblemeDeSphere({ teintes }: { teintes: Teintes }) {
  const candidate = CANDIDATES.find((c) => c.teintes[1] === teintes[1] && c.teintes[2] === teintes[2]);
  const repere = useRef<HTMLDivElement>(null);
  const [assezGrande, setAssezGrande] = useState(false);

  useEffect(() => {
    const sphere = repere.current?.parentElement;
    if (!sphere) return;
    const observateur = new ResizeObserver(([entree]) => setAssezGrande(entree.contentRect.width >= TAILLE_MIN));
    observateur.observe(sphere);
    return () => observateur.disconnect();
  }, []);

  if (!candidate) return null;
  const lettre = CHOIX[candidate.id] ?? "A";
  const couleur = candidate.teintes[2];

  // Le repère invisible sert à mesurer la sphère ; le dessin n'est rendu que si elle est assez grande.
  if (!assezGrande) return <div ref={repere} aria-hidden className="hidden" />;

  return (
    <div ref={repere} aria-hidden className="sphere-embleme pointer-events-none absolute inset-0">
      <div className="absolute inset-0" style={{ background: VOILE }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/2" style={{ filter: HALO }}>
          {lettre === "A" ? (
            <Embleme id={candidate.id} couleur={couleur} className="w-full" />
          ) : (
            <EmblemeVariante id={candidate.id} lettre={lettre} couleur={couleur} className="w-full" />
          )}
        </div>
      </div>
    </div>
  );
}
