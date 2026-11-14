"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { TEINTES_MELEES } from "@/components/accueil/ma-sphere";
import { BOUTON_PILULE } from "@/components/accueil/reveal";
import { Sphere } from "@/components/sphere";
import { candidateParId } from "@/lib/candidates";
import { TitreLogo } from "./commun";

const DOUX = [0.2, 0.8, 0.2, 1] as const;

/** Variante 2 : une seule grande sphère au centre, le logo dessous (maquette 04). */
export function PremierEcranGrandeSphere() {
  return (
    <section
      aria-labelledby="titre-accueil"
      className="flex min-h-[calc(100dvh-10rem)] flex-col items-center justify-center py-4 text-center"
    >
      <motion.div
        className="w-[min(70vw,46vh,520px)]"
        initial={{ opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: DOUX }}
      >
        <motion.div
          animate={{ scale: [1, 1.035, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sphere
            teintes={TEINTES_MELEES}
            aquarelle
            description="Une sphère aux couleurs mêlées des cinq IA candidates"
          />
        </motion.div>
      </motion.div>
      <div className="mt-10">
        <TitreLogo id="titre-accueil" className="text-[clamp(3rem,10vw,8.5rem)]" />
      </div>
      <p className="mt-4 text-lg text-attenue">Cinq IA se présentent à la présidence.</p>
      <div className="mt-8">
        <Link href="/test" className={BOUTON_PILULE}>
          Trouver mon IA
        </Link>
      </div>
    </section>
  );
}

const IA = candidateParId("maelle");

/** Variante 3 : le logo, une question, puis l'écran coupé en deux, un humain d'un côté, une IA de l'autre. */
export function PremierEcranCoupeEnDeux() {
  const teintes = IA?.teintes ?? TEINTES_MELEES;
  return (
    <section
      aria-labelledby="titre-accueil"
      className="flex min-h-[calc(100dvh-10rem)] flex-col items-center py-4 text-center"
    >
      <TitreLogo id="titre-accueil" className="text-[clamp(2.75rem,8vw,6.5rem)]" />
      <motion.p
        className="mt-5 text-balance text-[clamp(1.4rem,3vw,2.25rem)] font-medium tracking-[-0.03em]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: DOUX }}
      >
        Qui voulez-vous à l&apos;Élysée ?
      </motion.p>

      <div className="mt-8 grid w-full max-w-[1120px] flex-1 grid-cols-2 gap-3 sm:gap-5">
        <motion.div
          className="flex flex-col items-center justify-center gap-6 rounded-3xl bg-relief p-4 sm:p-8"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: DOUX }}
        >
          <div
            aria-hidden
            className="size-[min(34vw,30vh,300px)] rounded-full bg-[radial-gradient(circle_at_35%_30%,#eceef1,#b4b8c2)]"
          />
          <p className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">Un humain</p>
        </motion.div>
        <motion.div
          className="flex flex-col items-center justify-center gap-6 rounded-3xl p-4 sm:p-8"
          style={{ background: teintes[0] }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: DOUX }}
        >
          <Sphere teintes={teintes} className="size-[min(34vw,30vh,300px)]" />
          <p className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">Une IA</p>
        </motion.div>
      </div>
    </section>
  );
}
