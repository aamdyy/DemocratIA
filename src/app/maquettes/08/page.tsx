"use client";

import Link from "next/link";
import { Archivo } from "next/font/google";
import { MotionConfig, motion } from "motion/react";

import { Hemicycle } from "@/components/hemicycle";
import { SPHERES, Sphere } from "@/components/sphere";
import { Barre, HEMICYCLE_HUMAIN, hemicycleUni, useEtape } from "../commun";
import { EXEMPLE } from "../contenu";

const police = Archivo({ subsets: ["latin"], axes: ["wdth"] });

const DUREES = [3000, 4200] as const;
const ETATS = [HEMICYCLE_HUMAIN, hemicycleUni("machine")];
const LEGENDES = [
  "L’hémicycle de 2026 : 577 élus, des positions dispersées.",
  "L’hémicycle de 2050 : 577 sièges à la couleur d’Olympe.",
];

/** Les humains sont en nuances de gris : seule la sphère apporte la couleur. */
const COULEURS = {
  "--pour": "#262930",
  "--contre": "#9aa0ab",
  "--abstention": "#cdd1d9",
  "--absent": "#eceef2",
  "--machine": SPHERES.olympe.teintes[1],
  "--pas-siege": "2.6ms",
} as React.CSSProperties;

export default function Maquette08() {
  const etape = useEtape(DUREES);

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`${police.className} flex min-h-dvh flex-col overflow-x-clip bg-white text-[#14161b]`}
        style={COULEURS}
      >
        <header className="flex items-center justify-between px-6 py-6 lg:px-12">
          <p className="text-lg font-bold" style={{ fontStretch: "112%" }}>
            DemocratIA
          </p>
          <Link href="/seance" className="bg-[#14161b] px-5 py-3 text-sm font-semibold text-white">
            Entrer en séance
          </Link>
        </header>

        <div className="grid gap-6 px-6 pt-4 md:grid-cols-[1fr_20rem] lg:px-12">
          <h1
            className="text-[clamp(2.6rem,7vw,6.2rem)] font-bold leading-[0.92] tracking-[-0.02em]"
            style={{ fontStretch: "68%" }}
          >
            577 sièges.
            <br />
            Une seule couleur : la vôtre.
          </h1>
          <div className="self-end text-[15px] leading-6">
            <p className="font-semibold" aria-live="polite">
              {LEGENDES[etape]}
            </p>
            <p className="mt-2 flex flex-wrap gap-x-3 text-xs leading-5 text-[#6a7080]">
              <span>{EXEMPLE.source}</span>
              <span className="border-l border-[#dfe2e8] pl-3 tabular-nums">{EXEMPLE.date}</span>
              <span className="border-l border-[#dfe2e8] pl-3">{EXEMPLE.licence}</span>
            </p>
          </div>
        </div>

        {/*
          L'hémicycle prend la place qui reste sous le titre, sans jamais dépasser de l'écran :
          l'arc entier et la sphère se voient d'un seul regard. La marge du bas laisse passer la barre de navigation.
        */}
        <div className="mt-auto px-2 pb-20 pt-8">
          {/* La largeur se cale sur la hauteur d'écran restante (rapport 1000 × 520 du dessin), sans descendre sous 20rem. */}
          <div
            className="@container relative mx-auto overflow-hidden"
            style={{ width: "min(100%, max(20rem, calc((100dvh - 27rem) * 1000 / 520)))" }}
          >
            <Hemicycle etats={ETATS[etape]} description={LEGENDES[etape]} className="block w-full" />
            {/*
              La sphère se lève au creux de l'arc, comme un soleil derrière l'horizon. Elle a le même centre
              que les rangées de sièges et reste plus petite que le premier rang : elle ne recouvre aucun siège.
            */}
            <motion.div
              className="absolute -bottom-[7.4cqw] left-1/2 w-[18cqw] -translate-x-1/2 @2xl:-bottom-[8.9cqw] @2xl:w-[21cqw]"
              initial={{ y: "55%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 1.6, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <Sphere teintes={SPHERES.olympe.teintes} duree={12} />
            </motion.div>
            {/* Le prénom tient entre la sphère et le premier rang, et ne descend jamais sous 13 px. */}
            <p
              className="absolute bottom-[11.4cqw] left-1/2 -translate-x-1/2 text-[13px] leading-none font-semibold @2xl:bottom-[13.8cqw] @2xl:text-[length:2.2cqw]"
              style={{ fontStretch: "100%" }}
            >
              Olympe
            </p>
          </div>
        </div>

        <Barre n={8} />
      </div>
    </MotionConfig>
  );
}
