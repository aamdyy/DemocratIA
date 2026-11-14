"use client";

import Link from "next/link";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/logo";
import { Sphere } from "@/components/sphere";
import { CANDIDATES } from "@/lib/candidates";
import { useMouvementReduit } from "./hooks";
import { BOUTON_PILULE, FOCUS } from "./reveal";

/** Places du manège : au centre, à droite en retrait, à gauche en retrait ; les deux autres attendent derrière. */
const PLACES = [
  { x: "0%", scale: 1, opacity: 1, zIndex: 2 },
  { x: "78%", scale: 0.5, opacity: 0.55, zIndex: 1 },
  { x: "30%", scale: 0.3, opacity: 0, zIndex: 0 },
  { x: "-30%", scale: 0.3, opacity: 0, zIndex: 0 },
  { x: "-78%", scale: 0.5, opacity: 0.55, zIndex: 1 },
];

/**
 * Premier écran (maquette 05) : le logo, qui est l'unique h1, puis le manège des cinq IA candidates,
 * trois à la fois, et le bouton du test.
 */
export function PremierEcran() {
  const [active, setActive] = useState(0);
  const [pause, setPause] = useState(false);
  const racine = useRef<HTMLElement>(null);
  const visible = useInView(racine);
  const reduit = useMouvementReduit();

  useEffect(() => {
    if (pause || !visible || reduit) return;
    const minuterie = setInterval(() => setActive((a) => (a + 1) % CANDIDATES.length), 3600);
    return () => clearInterval(minuterie);
  }, [pause, visible, reduit]);

  const candidate = CANDIDATES[active];

  return (
    <section
      ref={racine}
      aria-labelledby="titre-accueil"
      className="flex min-h-[calc(100dvh-10rem)] flex-col items-center justify-center overflow-x-clip py-4 text-center"
    >
      <motion.h1
        id="titre-accueil"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Logo titre className="text-[clamp(3rem,10vw,8.5rem)]" />
        {/* La phrase de la maquette 05, gardée par l'équipe : elle fait partie du titre de la page. */}
        <span className="mx-auto mt-6 block max-w-[30ch] text-[clamp(1.5rem,3vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-texte">
          <span className="sr-only">. </span>
          En 2050, on ne vote plus pour un parti. <span className="block text-attenue">On règle une sphère.</span>
        </span>
      </motion.h1>

      <div
        className="relative mx-auto mt-8 size-[min(34vh,62vw,340px)]"
        onPointerEnter={() => setPause(true)}
        onPointerLeave={() => setPause(false)}
      >
        {CANDIDATES.map((c, i) => {
          const place = PLACES[(i - active + CANDIDATES.length) % CANDIDATES.length];
          return (
            <motion.button
              key={c.id}
              type="button"
              aria-label={`Voir ${c.prenom}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={`absolute inset-0 rounded-full ${FOCUS}`}
              style={{ zIndex: place.zIndex, pointerEvents: place.opacity === 0 ? "none" : "auto" }}
              // Dès le premier affichage, chaque sphère est à sa place : pas d'empilement au chargement.
              initial={false}
              animate={{ x: place.x, scale: place.scale, opacity: place.opacity }}
              transition={{ type: "spring", stiffness: 70, damping: 16 }}
            >
              <Sphere teintes={c.teintes} duree={14 + i * 3} />
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 flex h-[6.5rem] flex-col items-center text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <p className="text-4xl font-semibold tracking-[-0.03em]">{candidate.prenom}</p>
            <p className="mt-2 text-lg text-attenue">{candidate.doctrine}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3">
        <Link href="/test" className={BOUTON_PILULE}>
          Trouver mon IA
        </Link>
      </div>
    </section>
  );
}
