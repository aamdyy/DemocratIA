"use client";

import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

import { useCompteur } from "@/app/maquettes/commun";
import { BOUTON_PILULE, FOCUS, Reveal, TITRE_SECTION } from "@/components/accueil/reveal";
import { Logo } from "@/components/logo";
import { FiltreSphere } from "@/components/sphere";
import type { Provenance } from "@/lib/types";
import { VARIANTES } from "./variantes";

/** Provenance des valeurs imaginaires des schémas : elles sont toujours marquées comme exemple. */
export const SOURCE_EXEMPLE: Provenance = {
  editeur: "DemocratIA",
  url: null,
  licence: "Intitulés et valeurs fictifs",
  date: null,
  nature: "exemple",
};

/** Titre de section, avec au plus une phrase dessous. */
export function EnTete({ id, titre, phrase }: { id: string; titre: string; phrase?: string }) {
  return (
    <Reveal>
      <h2 id={id} className={TITRE_SECTION}>
        {titre}
      </h2>
      {phrase ? <p className="mt-6 max-w-[34rem] text-lg leading-8 text-attenue">{phrase}</p> : null}
    </Reveal>
  );
}

/** Un nombre qui monte de 0 à `valeur` quand il entre à l'écran, une seule fois. Décoratif : la valeur est dite ailleurs. */
export function Nombre({
  valeur,
  suffixe = "",
  duree = 1300,
  className,
}: {
  valeur: number;
  suffixe?: string;
  duree?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const vu = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const courant = useCompteur(0, vu ? valeur : 0, duree, vu);
  return (
    <span ref={ref} aria-hidden className={className}>
      {Math.round(courant)}
      {suffixe}
    </span>
  );
}

/** Le logo, qui est l'unique h1 de la page, avec la phrase du concept pour les lecteurs d'écran. */
export function TitreLogo({ id, className }: { id: string; className: string }) {
  return (
    <motion.h1
      id={id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Logo titre className={className} />
      <span className="sr-only"> En 2050, la France élit une IA.</span>
    </motion.h1>
  );
}

/** Passer d'une variante à l'autre, et revenir à la liste. */
function NavVariantes({ n }: { n: number }) {
  return (
    <nav aria-label="Variantes de l'accueil" className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[15px]">
      <span className="px-3 text-attenue">Maquette {n} sur 4</span>
      {VARIANTES.filter((v) => v.n !== n).map((v) => (
        <Link
          key={v.n}
          href={`/accueils/${v.n}`}
          className={`inline-flex min-h-11 items-center px-3 text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current ${FOCUS}`}
        >
          {v.n}. {v.titre}
        </Link>
      ))}
      <Link
        href="/accueils"
        className={`inline-flex min-h-11 items-center px-3 text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current ${FOCUS}`}
      >
        Toutes les maquettes
      </Link>
    </nav>
  );
}

/**
 * Le cadre commun des quatre variantes : le premier écran propre à la variante (son logo est l'unique h1),
 * la suite, puis le bouton du test.
 */
export function Cadre({
  n,
  premier,
  children,
  bouton = true,
}: {
  n: number;
  premier: React.ReactNode;
  children?: React.ReactNode;
  /** Faux quand la variante porte déjà son propre bouton vers le test. */
  bouton?: boolean;
}) {
  return (
    <div className="space-y-32 pb-12 sm:space-y-48">
      <FiltreSphere />
      {premier}
      {children}
      {bouton ? (
        <Reveal className="flex justify-center">
          <Link href="/test" className={BOUTON_PILULE}>
            Trouver mon IA
          </Link>
        </Reveal>
      ) : null}
      <NavVariantes n={n} />
    </div>
  );
}
