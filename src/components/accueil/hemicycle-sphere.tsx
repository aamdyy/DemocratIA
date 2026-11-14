"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

import { HEMICYCLE_HUMAIN, hemicycleUni } from "@/app/maquettes/commun";
import { Hemicycle } from "@/components/hemicycle";
import { Sphere } from "@/components/sphere";
import { CANDIDATES } from "@/lib/candidates";
import { useEtapeVue } from "./hooks";
import { Reveal, TITRE_SECTION } from "./reveal";

const IA = CANDIDATES.find((c) => c.id === "maelle") ?? CANDIDATES[0];

const DUREES = [3000, 4200] as const;
const ETATS = [HEMICYCLE_HUMAIN, hemicycleUni("machine")];
const LEGENDES = [
  "L’hémicycle de 2026 : 577 élus, des positions dispersées.",
  `L’hémicycle de 2050 : 577 sièges à la couleur de ${IA.prenom}.`,
];

/** Les humains sont en nuances de gris : seule la sphère apporte la couleur. */
const COULEURS = {
  "--pour": "#262930",
  "--contre": "#9aa0ab",
  "--abstention": "#cdd1d9",
  "--absent": "#eceef2",
  "--machine": IA.teintes[1],
  "--pas-siege": "2.6ms",
} as React.CSSProperties;

/** « 577 sièges. Une seule voix. » : l'hémicycle passe du gris à la couleur de la sphère qui se lève dans l'arc. */
export function HemicycleSphere() {
  const racine = useRef<HTMLElement>(null);
  const visible = useInView(racine, { amount: 0.4 });
  const etape = useEtapeVue(DUREES, visible);
  // La sphère se lève quand l'arc entre à l'écran : on observe le conteneur, pas la sphère (rognée par le conteneur).
  const arc = useRef<HTMLDivElement>(null);
  const arcVu = useInView(arc, { once: true, amount: 0.5 });

  return (
    <section ref={racine} aria-labelledby="titre-hemicycle" style={COULEURS}>
      <Reveal className="mx-auto grid max-w-[1120px] gap-6 md:grid-cols-[1fr_20rem]">
        <h2 id="titre-hemicycle" className={TITRE_SECTION}>
          577 sièges. Une seule voix.
        </h2>
        <p className="self-end text-[15px] font-semibold leading-6" aria-live="polite">
          {LEGENDES[etape]}
        </p>
      </Reveal>

      <div className="mt-14">
        <div ref={arc} className="@container relative mx-auto w-full max-w-[72rem] overflow-hidden">
          <Hemicycle etats={ETATS[etape]} description={LEGENDES[etape]} className="block w-full" />
          {/*
            La sphère se lève au creux de l'arc, comme un soleil derrière l'horizon. Elle a le même centre
            que les rangées de sièges et reste plus petite que le premier rang : elle ne recouvre aucun siège.
          */}
          <motion.div
            className="absolute -bottom-[7.4cqw] left-1/2 w-[18cqw] -translate-x-1/2 @2xl:-bottom-[8.9cqw] @2xl:w-[21cqw]"
            initial={{ y: "55%", opacity: 0 }}
            animate={arcVu ? { y: "0%", opacity: 1 } : { y: "55%", opacity: 0 }}
            transition={{ duration: 1.6, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Sphere teintes={IA.teintes} duree={12} />
          </motion.div>
          {/* Le prénom tient entre la sphère et le premier rang, et ne descend jamais sous 13 px. */}
          <p className="absolute bottom-[11.4cqw] left-1/2 -translate-x-1/2 text-[13px] font-semibold leading-none @2xl:bottom-[13.8cqw] @2xl:text-[length:2.2cqw]">
            {IA.prenom}
          </p>
        </div>
      </div>
    </section>
  );
}
