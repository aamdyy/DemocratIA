"use client";

import Link from "next/link";
import { Hanken_Grotesk } from "next/font/google";
import { MotionConfig, motion } from "motion/react";

import { SPHERES, Sphere, teintesDepuis } from "@/components/sphere";
import { Barre } from "../commun";
import { EXEMPLE } from "../contenu";

const police = Hanken_Grotesk({ subsets: ["latin"] });

const PRENOMS = [
  "Victor", "Simone", "Jean", "Louise", "Léon", "Aimé", "Marie",
  "Émile", "Colette", "Jules", "Hubertine", "Olympe", "Aristide", "Germaine",
  "Félix", "Lucie", "René", "Gisèle", "Pierre", "Jeanne", "Flora",
];

export default function Maquette10() {
  return (
    <MotionConfig reducedMotion="user">
      <div className={`${police.className} min-h-dvh bg-white text-[#111318]`}>
        <header className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6 lg:px-10">
          <p className="text-lg font-bold tracking-[-0.02em]">DemocratIA</p>
          <p className="text-sm text-[#696f7c]">République française, an 2050</p>
        </header>

        <main className="mx-auto grid max-w-[1240px] items-center gap-x-16 gap-y-14 px-6 pb-28 pt-6 lg:grid-cols-[minmax(0,26rem)_1fr] lg:px-10 lg:pt-12">
          <div>
            <h1 className="text-[clamp(2.2rem,4.2vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.035em]">
              Chaque circonscription a sa sphère. La vôtre s’appelle Olympe.
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#4c515e]">
              Elles sont 577. Aucune n’a de parti : chacune porte un prénom, et les couleurs du mandat que lui règlent
              ses citoyens.
            </p>
            <Link
              href="/mandat"
              className="mt-9 inline-flex h-14 items-center rounded-full bg-[#111318] px-8 font-semibold text-white transition-transform duration-150 hover:scale-[1.03]"
            >
              Régler Olympe
            </Link>
            <p className="mt-10 flex flex-wrap gap-x-3 text-xs leading-5 text-[#696f7c]">
              <span>{EXEMPLE.source}</span>
              <span className="border-l border-[#e3e5ea] pl-3 tabular-nums">{EXEMPLE.date}</span>
              <span className="border-l border-[#e3e5ea] pl-3">{EXEMPLE.licence}</span>
            </p>
          </div>

          <ul className="grid grid-cols-4 gap-x-4 gap-y-7 sm:grid-cols-7">
            {PRENOMS.map((prenom, i) => {
              const laVotre = prenom === "Olympe";
              return (
                <motion.li
                  key={prenom}
                  className="flex flex-col items-center gap-2.5"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: laVotre ? 1 : 0.9, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.15 + ((i * 7) % PRENOMS.length) * 0.045, ease: "easeOut" }}
                >
                  {/* Chaque sphère flotte à son rythme ; celle du citoyen est plus grande et cerclée. */}
                  <motion.div
                    className={`w-full rounded-full ${laVotre ? "scale-[1.28] p-1 ring-1 ring-[#111318]" : ""}`}
                    animate={{ y: [0, i % 2 ? -7 : 7, 0] }}
                    transition={{ duration: 5 + (i % 5), repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sphere
                      teintes={laVotre ? SPHERES.olympe.teintes : teintesDepuis((i * 47 + 200) % 360)}
                      duree={10 + (i % 6) * 2}
                    />
                  </motion.div>
                  <p className={`text-sm ${laVotre ? "mt-2 font-semibold" : "text-[#4c515e]"}`}>{prenom}</p>
                </motion.li>
              );
            })}
          </ul>
        </main>

        <Barre n={10} />
      </div>
    </MotionConfig>
  );
}
