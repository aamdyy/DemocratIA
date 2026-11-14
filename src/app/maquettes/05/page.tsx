"use client";

import Link from "next/link";
import { Manrope } from "next/font/google";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useState } from "react";

import { SPHERES, Sphere } from "@/components/sphere";
import { Barre } from "../commun";
import { EXEMPLE } from "../contenu";

const police = Manrope({ subsets: ["latin"] });

const ENTITES = [
  { ...SPHERES.olympe, trait: "L’écologie d’abord", mandants: "12 408 mandants" },
  { ...SPHERES.victor, trait: "La sécurité d’abord", mandants: "9 731 mandants" },
  { ...SPHERES.simone, trait: "La santé d’abord", mandants: "14 052 mandants" },
] as const;

/** Places du manège : au centre, à droite en retrait, à gauche en retrait. */
const PLACES = [
  { x: "0%", scale: 1, opacity: 1, zIndex: 2 },
  { x: "78%", scale: 0.5, opacity: 0.55, zIndex: 1 },
  { x: "-78%", scale: 0.5, opacity: 0.55, zIndex: 1 },
];

export default function Maquette05() {
  const [active, setActive] = useState(0);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (pause || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const minuterie = setInterval(() => setActive((a) => (a + 1) % ENTITES.length), 3600);
    return () => clearInterval(minuterie);
  }, [pause]);

  const entite = ENTITES[active];

  return (
    <MotionConfig reducedMotion="user">
      <div className={`${police.className} min-h-dvh overflow-x-clip bg-white text-[#0f1115]`}>
        <header className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-6 lg:px-10">
          <p className="text-lg font-bold tracking-[-0.02em]">DemocratIA</p>
          <p className="text-sm text-[#6b7180]">République française, an 2050</p>
        </header>

        <main className="mx-auto max-w-[1200px] px-6 pb-24 lg:px-10">
          {/* Deux phrases, deux lignes sur grand écran : le titre prend moins de hauteur et le bouton reste visible. */}
          <h1 className="mx-auto max-w-[20ch] pt-4 text-center text-[clamp(2.1rem,4.4vw,3.6rem)] font-semibold leading-[1.08] tracking-[-0.035em] md:max-w-none">
            <span className="md:block">En 2050, on ne vote plus pour un parti.</span>{" "}
            <span className="md:block">On règle une sphère.</span>
          </h1>

          <div
            className="relative mx-auto mt-8 size-[min(34vh,62vw,340px)]"
            onPointerEnter={() => setPause(true)}
            onPointerLeave={() => setPause(false)}
          >
            {ENTITES.map((e, i) => {
              const place = PLACES[(i - active + ENTITES.length) % ENTITES.length];
              return (
                <motion.button
                  key={e.prenom}
                  type="button"
                  aria-label={`Voir ${e.prenom}`}
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                  className="absolute inset-0 rounded-full"
                  style={{ zIndex: place.zIndex }}
                  // Dès le premier affichage, chaque sphère est à sa place : pas d'empilement au chargement.
                  initial={false}
                  animate={{ x: place.x, scale: place.scale, opacity: place.opacity }}
                  transition={{ type: "spring", stiffness: 70, damping: 16 }}
                >
                  <Sphere teintes={e.teintes} duree={14 + i * 3} />
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 flex h-[6.5rem] flex-col items-center text-center" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={entite.prenom}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <p className="text-4xl font-semibold tracking-[-0.03em]">{entite.prenom}</p>
                <p className="mt-2 text-lg text-[#4c5260]">{entite.trait}</p>
                <p className="mt-1 text-sm tabular-nums text-[#6b7180]">{entite.mandants}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-3 flex flex-col items-center gap-5">
            <Link
              href="/mandat"
              className="inline-flex h-12 items-center rounded-full bg-[#0f1115] px-8 font-semibold text-white transition-transform duration-150 hover:scale-[1.03]"
            >
              Régler ma sphère
            </Link>
            <p className="flex flex-wrap justify-center gap-x-3 text-xs leading-5 text-[#6b7180]">
              <span>{EXEMPLE.source}</span>
              <span className="border-l border-[#e4e6eb] pl-3 tabular-nums">{EXEMPLE.date}</span>
              <span className="border-l border-[#e4e6eb] pl-3">{EXEMPLE.licence}</span>
            </p>
          </div>
        </main>

        <Barre n={5} />
      </div>
    </MotionConfig>
  );
}
