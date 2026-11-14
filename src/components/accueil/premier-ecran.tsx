"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { SourceBadge } from "@/components/source-badge";
import { Sphere } from "@/components/sphere";
import { sourceCalcul } from "@/lib/concordance";
import { PRENOM_DEPUTE_IA } from "@/lib/sphere-mandat";
import { PRIORITE_PAR_DEFAUT } from "@/lib/themes";
import type { Provenance } from "@/lib/types";
import type { SphereCitoyen } from "./sphere-citoyen";

const LETTRES = PRENOM_DEPUTE_IA.split("");

/**
 * Une seule entrée, réglée sur une seule horloge : la sphère grandit, le prénom se pose lettre
 * à lettre, puis le titre et le bouton arrivent ensemble. Rien d'autre ne s'anime à l'arrivée.
 */
const DOUX = [0.2, 0.8, 0.2, 1] as const;
const DEBUT_PRENOM = 0.45;
const PAS_LETTRE = 0.06;
const DEBUT_TEXTE = 0.95;

/** Ce qui donne ses couleurs à la sphère une fois le mandat commencé : un calcul sur les réglages du citoyen. */
function sourceCouleurs(sphere: SphereCitoyen): Provenance {
  const n = sphere.textesArbitres;
  const textes = n > 1 ? `${n} textes arbitrés` : n === 1 ? "1 texte arbitré" : "Aucun texte arbitré pour l’instant";
  const couleurs = sphere.prioritesReglees
    ? `Les couleurs d’${PRENOM_DEPUTE_IA} sont celles de vos trois priorités les plus fortes : ${sphere.priorites.join(", ")}.`
    : `Vos priorités sont encore toutes à ${PRIORITE_PAR_DEFAUT} sur 100 : ${PRENOM_DEPUTE_IA} porte les couleurs des trois premiers thèmes.`;
  return {
    ...sourceCalcul(`${textes}. ${couleurs}`),
    licence: "D’après vos réglages, gardés dans ce navigateur",
  };
}

export function PremierEcran({ sphere }: { sphere: SphereCitoyen }) {
  return (
    // Le premier écran remplit la fenêtre, sans s'étirer sur un écran très haut.
    <section aria-labelledby="titre-accueil" className="flex min-h-[min(calc(100dvh-9.5rem),50rem)] flex-col">
      <div className="flex flex-1 flex-col items-center justify-center pb-9 pt-2">
        <motion.div
          className="w-[min(52vw,36dvh,400px)]"
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: DOUX }}
        >
          <Sphere teintes={sphere.teintes} poids={sphere.poids} aquarelle description={sphere.description} />
        </motion.div>

        {/* Le prénom et la ligne qui le suit se lisent d'une traite : « Olympe attend votre mandat. » */}
        <p className="mt-7 text-center">
          <span className="sr-only">{PRENOM_DEPUTE_IA} </span>
          <span
            aria-hidden
            className="flex justify-center font-titre text-[length:clamp(2rem,3.2vw,2.75rem)] font-semibold leading-none tracking-[-0.04em]"
          >
            {LETTRES.map((lettre, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: DEBUT_PRENOM + i * PAS_LETTRE, ease: "easeOut" }}
              >
                {lettre}
              </motion.span>
            ))}
          </span>
          <motion.span
            className="mt-2 block text-[15px] leading-6 text-attenue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: DEBUT_TEXTE, ease: "easeOut" }}
          >
            {sphere.regle ? "vote selon votre mandat." : "attend votre mandat."}
          </motion.span>
        </p>
      </div>

      <motion.div
        className="grid items-end gap-x-16 gap-y-7 border-t border-trait pt-8 lg:grid-cols-[minmax(0,1fr)_24rem]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: DEBUT_TEXTE, ease: DOUX }}
      >
        {/* Le titre se cale sur la largeur de sa colonne : sur un ordinateur, chaque phrase tient sur sa ligne. */}
        <div className="[container-type:inline-size]">
          <h1
            id="titre-accueil"
            className="font-titre text-[length:clamp(1.75rem,6cqw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.035em]"
          >
            <span className="block text-balance text-attenue">Vous ne votez plus pour quelqu’un.</span>{" "}
            <span className="block text-balance">Vous réglez quelque chose.</span>
          </h1>
        </div>

        <div>
          <p className="text-[17px] leading-7 text-attenue">
            En 2050, les 577 sièges de l’Assemblée sont tenus par une IA législatrice. Votre vote ne désigne plus un
            député : il la règle.
          </p>
          <Link
            href="/mandat"
            className="mt-6 inline-flex h-14 items-center rounded-full bg-texte px-8 text-base font-medium text-fond transition-transform duration-150 motion-safe:hover:scale-[1.03]"
          >
            {sphere.regle ? "Reprendre mon mandat" : "Régler mon Député IA"}
          </Link>
          {sphere.regle ? (
            <SourceBadge className="mt-5" source={sourceCouleurs(sphere)} />
          ) : (
            <p className="mt-5 text-xs leading-5 text-attenue">
              {PRENOM_DEPUTE_IA} porte ses couleurs d’origine. Elles changeront avec votre mandat.
            </p>
          )}
        </div>
      </motion.div>
    </section>
  );
}
