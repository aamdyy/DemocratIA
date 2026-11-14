"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { NOMBRE_SIEGES, type EtatSiege } from "@/components/hemicycle";
import { MAQUETTES, lienMaquette } from "./contenu";

/** Tirage stable d'un rang à l'autre et identique sur le serveur et dans le navigateur. */
export const alea = (i: number) => ((Math.imul(i + 1, 2654435761) >>> 0) % 10000) / 10000;

const QUARTIERS: { jusqu: number; tendance: EtatSiege }[] = [
  { jusqu: 0.13, tendance: "contre" },
  { jusqu: 0.24, tendance: "contre" },
  { jusqu: 0.33, tendance: "abstention" },
  { jusqu: 0.58, tendance: "pour" },
  { jusqu: 0.7, tendance: "pour" },
  { jusqu: 0.79, tendance: "abstention" },
  { jusqu: 1, tendance: "contre" },
];

/** Un hémicycle humain : des quartiers aux positions différentes, quelques dissidents, des absents. */
export const HEMICYCLE_HUMAIN: EtatSiege[] = Array.from({ length: NOMBRE_SIEGES }, (_, i) => {
  const tirage = alea(i);
  if (tirage < 0.09) return "non_votant";
  const tendance = QUARTIERS.find((q) => i / NOMBRE_SIEGES < q.jusqu)!.tendance;
  if (tirage < 0.17) return tendance === "pour" ? "abstention" : "pour";
  return tendance;
});

export const hemicycleUni = (etat: EtatSiege): EtatSiege[] => Array.from({ length: NOMBRE_SIEGES }, () => etat);

export const HEMICYCLE_ETEINT: EtatSiege[] = hemicycleUni("non_votant");

const mouvementReduit = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Fait défiler des étapes minutées, en boucle. `durees` doit être une constante de module.
 * Si l'utilisateur a demandé moins d'animations, on reste sur `repos` (la dernière étape par défaut).
 */
export function useEtape(durees: readonly number[], repos = durees.length - 1): number {
  const [etape, setEtape] = useState(0);
  useEffect(() => {
    if (mouvementReduit()) {
      // Préférence lue dans le navigateur uniquement : le premier rendu doit rester identique au rendu serveur.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEtape(repos);
      return;
    }
    const minuterie = setTimeout(() => setEtape((e) => (e + 1) % durees.length), durees[etape]);
    return () => clearTimeout(minuterie);
  }, [etape, durees, repos]);
  return etape;
}

/** Fait courir un nombre de `depart` à `cible` en `duree` millisecondes, chaque fois que `cle` change. */
export function useCompteur(depart: number, cible: number, duree: number, cle: unknown = 0): number {
  const [valeur, setValeur] = useState(depart);
  const image = useRef(0);
  useEffect(() => {
    if (mouvementReduit()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValeur(cible);
      return;
    }
    const debut = performance.now();
    const avancer = (maintenant: number) => {
      const t = Math.min((maintenant - debut) / duree, 1);
      const adouci = 1 - Math.pow(1 - t, 4);
      setValeur(depart + (cible - depart) * adouci);
      if (t < 1) image.current = requestAnimationFrame(avancer);
    };
    image.current = requestAnimationFrame(avancer);
    return () => cancelAnimationFrame(image.current);
  }, [depart, cible, duree, cle]);
  return valeur;
}

/** Navigation entre maquettes. Absente quand la maquette est affichée en vignette dans la galerie. */
export function Barre({ n }: { n: number }) {
  const [visible, setVisible] = useState(false);
  // Lu dans le navigateur uniquement (hydratation identique au rendu serveur).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setVisible(window.self === window.top), []);
  if (!visible) return null;

  const total = MAQUETTES.length;
  const precedente = n === 1 ? total : n - 1;
  const suivante = n === total ? 1 : n + 1;
  // Cibles de 44 px, et contour de focus blanc : le bleu du site ne se voit pas sur la barre sombre.
  const lien =
    "flex h-11 min-w-11 items-center justify-center rounded-full px-3 hover:bg-white/15 focus-visible:outline-white";

  return (
    <nav
      aria-label="Maquettes"
      style={{ fontFamily: "system-ui, sans-serif", colorScheme: "dark" }}
      className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-neutral-900 p-1 text-[13px] leading-none text-white"
    >
      <Link href={lienMaquette(precedente)} aria-label="Maquette précédente" className={lien}>
        ‹
      </Link>
      <span className="px-2 tabular-nums">
        {n} sur {total}
        {/* Sur un téléphone, le nom de la maquette ne tient pas : on garde le compteur. */}
        <span className="ml-2 hidden text-white/70 sm:inline">{MAQUETTES[n - 1].nom}</span>
      </span>
      <Link href={lienMaquette(suivante)} aria-label="Maquette suivante" className={lien}>
        ›
      </Link>
      <Link href="/maquettes" className={`${lien} bg-white/10`}>
        Les dix
      </Link>
    </nav>
  );
}
