"use client";

import Link from "next/link";
import { Instrument_Sans } from "next/font/google";
import { MotionConfig, motion } from "motion/react";

import { FiltreSphere, SPHERES, Sphere } from "@/components/sphere";
import { Barre } from "../commun";
import { EXEMPLE } from "../contenu";

const police = Instrument_Sans({ subsets: ["latin"] });

const PRENOM = SPHERES.olympe.prenom;

export default function Maquette04() {
  return (
    <MotionConfig reducedMotion="user">
      <div className={`${police.className} flex min-h-dvh flex-col bg-white text-[#111111]`}>
        <FiltreSphere />
        <header className="flex items-center justify-between px-6 py-6 lg:px-12">
          <p className="text-lg font-semibold tracking-[-0.01em]">DemocratIA</p>
          <Link
            href="/mandat"
            className="rounded-full bg-[#111111] px-5 py-3 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-80"
          >
            {EXEMPLE.action}
          </Link>
        </header>

        {/* La marge du bas laisse passer la barre de navigation ; sur grand écran, elle tombe entre les deux colonnes. */}
        <main className="flex flex-1 flex-col px-6 pb-24 xl:pb-10 lg:px-12">
          <div className="flex flex-1 flex-col items-center justify-center py-6">
            <motion.div
              className="w-[min(58vw,36vh,440px)]"
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <motion.div
                animate={{ scale: [1, 1.035, 1] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sphere
                  teintes={SPHERES.olympe.teintes}
                  aquarelle
                  description={`La sphère d’${PRENOM}, aux nuages roses et pourpres`}
                />
              </motion.div>
            </motion.div>
            <p aria-hidden className="mt-8 flex text-[clamp(2.6rem,7vw,5rem)] font-normal leading-none tracking-[-0.045em]">
              {PRENOM.split("").map((lettre, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.55 + i * 0.07, ease: "easeOut" }}
                >
                  {lettre}
                </motion.span>
              ))}
            </p>
          </div>

          <motion.div
            className="grid items-end gap-8 border-t border-[#e6e6e6] pt-8 md:grid-cols-[1fr_22rem]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <h1 className="max-w-[18ch] text-[clamp(1.9rem,3.6vw,3rem)] font-medium leading-[1.08] tracking-[-0.03em]">
              Voici {PRENOM}. <span className="text-[#6f6f6f]">Elle siège à votre place et vote ce que vous réglez.</span>
            </h1>
            <div className="text-[15px] leading-6">
              <p className="font-medium">Une sphère par circonscription.</p>
              <p className="text-[#6b6b6b]">
                Chacune porte un prénom, et les couleurs du mandat que lui donnent ses citoyens.
              </p>
              <p className="mt-4 flex flex-wrap gap-x-3 text-xs leading-5 text-[#6b6b6b]">
                <span>{EXEMPLE.source}</span>
                <span className="border-l border-[#e6e6e6] pl-3 tabular-nums">{EXEMPLE.date}</span>
                <span className="border-l border-[#e6e6e6] pl-3">{EXEMPLE.licence}</span>
              </p>
            </div>
          </motion.div>
        </main>

        <Barre n={4} />
      </div>
    </MotionConfig>
  );
}
