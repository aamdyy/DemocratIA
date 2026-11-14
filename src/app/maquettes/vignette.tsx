"use client";

import { useEffect, useRef, useState } from "react";

const LARGEUR = 1440;
const HAUTEUR = 900;

/** Affiche une maquette en réduction : la vraie page, animée, ramenée à la largeur de la vignette. */
export function Vignette({ src, titre }: { src: string; titre: string }) {
  const cadre = useRef<HTMLDivElement>(null);
  const [echelle, setEchelle] = useState(0.3);

  useEffect(() => {
    const element = cadre.current;
    if (!element) return;
    const observateur = new ResizeObserver(([entree]) => setEchelle(entree.contentRect.width / LARGEUR));
    observateur.observe(element);
    return () => observateur.disconnect();
  }, []);

  return (
    <div ref={cadre} className="relative overflow-hidden rounded-lg border border-[#e4e4e7] bg-white" style={{ aspectRatio: `${LARGEUR} / ${HAUTEUR}` }}>
      <iframe
        src={src}
        title={titre}
        loading="lazy"
        tabIndex={-1}
        className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
        style={{ width: LARGEUR, height: HAUTEUR, transform: `scale(${echelle})` }}
      />
    </div>
  );
}
