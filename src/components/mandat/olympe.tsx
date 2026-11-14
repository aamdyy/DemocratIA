"use client";

import { motion } from "motion/react";

import { Sphere } from "@/components/sphere";
import { PRENOM_DEPUTE_IA, type SphereMandat } from "@/lib/sphere-mandat";

/** Quand une priorité entre ou sort du trio de tête, les couleurs de la sphère fondent au lieu de sauter. */
const STYLE_SPHERE = `
.sphere-mandat .sphere-nuage { transition: scale 400ms ease-out, background-color 600ms ease-out; }
@media (prefers-reduced-motion: reduce) { .sphere-mandat .sphere-nuage { transition: none; } }
`;

const enumerer = (noms: string[]) =>
  noms.length > 1 ? `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}` : (noms[0] ?? "");

/** La sphère du Député IA, aux couleurs des trois priorités les plus fortes du mandat. */
export function Olympe({ sphere, aucunReglage }: { sphere: SphereMandat; aucunReglage: boolean }) {
  const noms = enumerer(sphere.dominantes.map((dominante) => dominante.libelle.toLowerCase()));

  return (
    <div>
      <style>{STYLE_SPHERE}</style>
      <h2 id="titre-olympe" className="font-titre text-2xl font-medium tracking-[-0.01em]">
        {PRENOM_DEPUTE_IA}, votre Députée IA
      </h2>
      <p className="mt-2 max-w-md text-[15px] leading-6 text-attenue">
        Elle n&apos;a pas d&apos;opinions : elle a vos réglages. Ses couleurs sont celles de vos trois priorités les
        plus fortes.
      </p>

      <div className="mt-8 flex flex-col items-center">
        <motion.div
          className="sphere-mandat w-[min(260px,70vw)]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Sphere
            teintes={sphere.teintes}
            poids={sphere.poids}
            aquarelle
            duree={13}
            description={`La sphère d'${PRENOM_DEPUTE_IA}, aux couleurs de vos priorités : ${noms}`}
          />
        </motion.div>

        <ol aria-label="Ses trois priorités dominantes" className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {sphere.dominantes.map((dominante) => (
            <li key={dominante.theme} className="flex items-center gap-2">
              <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: dominante.couleur }} />
              <span className="font-medium">{dominante.libelle}</span>
              <span className="tabular-nums text-attenue">{dominante.poids} sur 100</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-center text-xs leading-5 text-attenue">
          {aucunReglage
            ? "Toutes vos priorités sont encore à 50 : déplacez un curseur pour qu'un thème prenne le dessus."
            : "Vos réglages, gardés dans ce navigateur."}
        </p>
        {/* Annoncé seulement quand le trio de tête change, pas à chaque cran d'un curseur. */}
        <p aria-live="polite" className="sr-only">
          Priorités dominantes d&apos;{PRENOM_DEPUTE_IA} : {noms}.
        </p>
      </div>
    </div>
  );
}
