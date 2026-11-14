"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { BoutonIA } from "@/components/bouton-ia";
import { Sphere } from "@/components/sphere";
import { CANDIDATES } from "@/lib/candidates";
import { useMouvementReduit } from "./hooks";
import { FOCUS } from "./reveal";

/** Places du manège : au centre, à droite en retrait, à gauche en retrait ; les deux autres attendent derrière. */
const PLACES = [
  { x: "0%", scale: 1, opacity: 1, zIndex: 2 },
  { x: "78%", scale: 0.5, opacity: 0.55, zIndex: 1 },
  { x: "30%", scale: 0.3, opacity: 0, zIndex: 0 },
  { x: "-30%", scale: 0.3, opacity: 0, zIndex: 0 },
  { x: "-78%", scale: 0.5, opacity: 0.55, zIndex: 1 },
];

/**
 * Premier écran (maquette 05) : le logo, qui est l'unique h1, puis le manège des sept IA candidates,
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
    const minuterie = setInterval(() => setActive((a) => (a + 1) % CANDIDATES.length), 4500);
    return () => clearInterval(minuterie);
  }, [pause, visible, reduit]);

  const candidate = CANDIDATES[active];
  const total = CANDIDATES.length;
  const suivante = () => setActive((a) => (a + 1) % total);
  const precedente = () => setActive((a) => (a - 1 + total) % total);
  // Vrai pendant un glisser : le clic qui le termine ne doit pas choisir une sphère.
  const glisse = useRef(false);

  return (
    <section
      ref={racine}
      aria-labelledby="titre-accueil"
      className="flex min-h-[calc(100dvh-10rem)] flex-col items-center justify-center overflow-x-clip py-4 text-center"
    >
      <motion.h1
        id="titre-accueil"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <span className="sr-only">DemocratIA. </span>
        {/* La phrase de la maquette 05, gardée par l'équipe : c'est elle, en grand, qui porte la page. */}
        <span className="mx-auto block max-w-none text-[clamp(2.2rem,4.7vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-texte">
          En 2050, on ne vote plus pour un parti. <span className="block text-attenue">On règle une sphère.</span>
        </span>
      </motion.h1>

      {/*
        On fait défiler les IA en glissant le manège à gauche ou à droite (souris ou doigt), ou avec les flèches
        du clavier. Le manège revient à sa place en souplesse : seule la sphère au centre change.
      */}
      <motion.div
        role="group"
        aria-roledescription="carrousel"
        aria-label="Les IA candidates : glissez ou utilisez les flèches pour en voir une autre"
        tabIndex={0}
        className={`relative mx-auto mt-8 size-[min(27vh,58vw,300px)] cursor-grab touch-pan-y select-none active:cursor-grabbing ${FOCUS}`}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.35}
        dragSnapToOrigin
        onDragStart={() => {
          glisse.current = true;
          setPause(true);
        }}
        onDragEnd={(_, info) => {
          const elan = info.offset.x + info.velocity.x * 0.2;
          if (elan < -60) suivante();
          else if (elan > 60) precedente();
          setTimeout(() => (glisse.current = false), 0);
        }}
        onKeyDown={(evenement) => {
          if (evenement.key === "ArrowRight") {
            evenement.preventDefault();
            suivante();
          } else if (evenement.key === "ArrowLeft") {
            evenement.preventDefault();
            precedente();
          }
        }}
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
              tabIndex={-1}
              onClick={() => {
                if (!glisse.current) setActive(i);
              }}
              className={`absolute inset-0 rounded-full ${FOCUS}`}
              style={{ zIndex: place.zIndex, pointerEvents: place.opacity === 0 ? "none" : "auto" }}
              // Dès le premier affichage, chaque sphère est à sa place : pas d'empilement au chargement.
              initial={false}
              animate={{ x: place.x, scale: place.scale, opacity: place.opacity }}
              // Ressort doux, sans rebond : les sphères glissent d'une place à l'autre comme sur un rail.
              transition={{ type: "spring", visualDuration: 1.1, bounce: 0.08, opacity: { duration: 0.8, ease: "easeInOut" } }}
            >
              <Sphere teintes={c.teintes} duree={14 + i * 3} />
            </motion.button>
          );
        })}
      </motion.div>

      <div className="mt-6 flex h-[6.5rem] flex-col items-center text-center" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-4xl font-semibold tracking-[-0.03em]">{candidate.prenom}</p>
            <p className="mt-2 text-lg text-attenue">{candidate.doctrine}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3">
        <BoutonIA href="/test">
          Trouver mon IA
        </BoutonIA>
      </div>
    </section>
  );
}
