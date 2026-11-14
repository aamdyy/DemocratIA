"use client";

import { AnimatePresence, motion, useInView, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { BoutonIA } from "@/components/bouton-ia";
import { Sphere } from "@/components/sphere";
import { CASCADE, DOUX, DUREE, ENTREE, RESSORT_LENT } from "@/lib/animation";
import { CANDIDATES } from "@/lib/candidates";
import { useMouvementReduit } from "./hooks";
import { FOCUS } from "./reveal";

/** Les couleurs des sept IA, encadrées du gris du texte secondaire : le dégradé passe puis revient. */
const DEGRADE_IA = `linear-gradient(90deg, var(--attenue) 0%, var(--attenue) 30%, ${CANDIDATES.map((c) => c.teintes[1]).join(", ")}, var(--attenue) 75%, var(--attenue) 100%)`;

/** Places du manège : au centre, à droite et à gauche en retrait ; toutes les autres attendent derrière, invisibles. */
const CENTRE = { x: "0%", scale: 1, opacity: 1, zIndex: 2 };
const DROITE = { x: "78%", scale: 0.5, opacity: 0.55, zIndex: 1 };
const GAUCHE = { x: "-78%", scale: 0.5, opacity: 0.55, zIndex: 1 };
const DERRIERE_DROITE = { x: "30%", scale: 0.3, opacity: 0, zIndex: 0 };
const DERRIERE_GAUCHE = { x: "-30%", scale: 0.3, opacity: 0, zIndex: 0 };

/** La place d'une sphère selon son écart avec la sphère au centre, quel que soit le nombre de candidates. */
function placeDe(ecart: number, total: number) {
  const e = ((ecart % total) + total) % total;
  if (e === 0) return CENTRE;
  if (e === 1) return DROITE;
  if (e === total - 1) return GAUCHE;
  return e <= total / 2 ? DERRIERE_DROITE : DERRIERE_GAUCHE;
}

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
    // Le délai repart de zéro à chaque changement de sphère : après un glisser, le manège
    // n'avance jamais tout seul dans la foulée, ce qui donnait l'impression d'un saut de deux IA.
    const minuterie = setTimeout(() => setActive((a) => (a + 1) % CANDIDATES.length), 4500);
    return () => clearTimeout(minuterie);
  }, [pause, visible, reduit, active]);

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
      // Les marges négatives étirent la zone de découpe jusqu'aux bords de l'écran : sur téléphone,
      // les sphères voisines sortent de l'écran au lieu d'être coupées net à 16 px du bord.
      // Sur grand écran, la section est un peu plus courte et suivie de près : le titre du comparatif
      // affleure en bas de l'écran, pour qu'on devine la suite.
      className="relative -mx-4 flex min-h-[calc(100dvh-10rem)] flex-col items-center justify-center overflow-x-clip px-4 pb-20 pt-4 text-center sm:-mx-6 sm:px-6 lg:-mx-8 lg:mb-7! lg:min-h-[calc(100dvh-12rem)] lg:px-8"
    >
      <motion.h1 id="titre-accueil" {...ENTREE}>
        <span className="sr-only">DemocratIA. </span>
        {/* La phrase de la maquette 05, gardée par l'équipe : c'est elle, en grand, qui porte la page. */}
        <span className="mx-auto block max-w-none text-[clamp(2.2rem,4.7vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-texte">
          En 2050, on ne vote plus pour un parti.{" "}
          {/* Proposition 7 de /maquettes/titre, retenue : les couleurs des IA traversent la seconde ligne, en boucle. */}
          <motion.span
            className="block bg-clip-text text-transparent"
            style={{ backgroundImage: DEGRADE_IA, backgroundSize: "300% 100%" }}
            initial={{ backgroundPositionX: "100%" }}
            animate={reduit ? { backgroundPositionX: "50%" } : { backgroundPositionX: ["100%", "0%"] }}
            transition={{ duration: 3.5, delay: DUREE.entree, ease: "easeInOut", repeat: reduit ? 0 : Infinity, repeatType: "mirror" }}
          >
            On règle une sphère.
          </motion.span>
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
        // Après le titre, le manège se pose : il grandit à peine en apparaissant.
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: DUREE.scene, ease: DOUX, delay: CASCADE * 3 }}
        drag="x"
        // Au doigt : un geste vertical fait défiler la page, seul un geste horizontal fait tourner le manège.
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.35}
        dragMomentum={false}
        dragSnapToOrigin
        onDragStart={() => {
          glisse.current = true;
          setPause(true);
        }}
        onDragEnd={(_, info) => {
          // Un balayage court mais vif suffit sur téléphone : distance OU vitesse.
          if (info.offset.x < -40 || info.velocity.x < -350) suivante();
          else if (info.offset.x > 40 || info.velocity.x > 350) precedente();
          // Sur écran tactile, le « clic » qui suit le geste arrive après coup : on l'ignore encore un instant,
          // sinon la sphère sous le doigt passait au centre et le manège sautait d'une IA de trop.
          setTimeout(() => (glisse.current = false), 350);
          setPause(false);
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
          const place = placeDe(i - active, CANDIDATES.length);
          return (
            <motion.button
              key={c.id}
              type="button"
              aria-label={`Voir ${c.prenom}`}
              aria-pressed={i === active}
              tabIndex={-1}
              // Les sphères cachées derrière le manège ne tournent pas pour rien.
              data-cachee={place.opacity === 0 ? "" : undefined}
              onClick={() => {
                if (!glisse.current) setActive(i);
              }}
              className={`absolute inset-0 rounded-full ${FOCUS}`}
              style={{ zIndex: place.zIndex, pointerEvents: place.opacity === 0 ? "none" : "auto" }}
              // Dès le premier affichage, chaque sphère est à sa place : pas d'empilement au chargement.
              initial={false}
              animate={{ x: place.x, scale: place.scale, opacity: place.opacity }}
              // Ressort doux, sans rebond : les sphères glissent d'une place à l'autre comme sur un rail.
              transition={{ ...RESSORT_LENT, opacity: { duration: DUREE.entree, ease: DOUX } }}
            >
              <Sphere teintes={c.teintes} duree={14 + i * 3} emblemeActif={i === active} />
            </motion.button>
          );
        })}
      </motion.div>

      <motion.div
        className="mt-6 flex h-[6.5rem] flex-col items-center text-center"
        aria-live="polite"
        initial={ENTREE.initial}
        animate={ENTREE.animate}
        transition={{ ...ENTREE.transition, delay: CASCADE * 6 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ duration: DUREE.entree, ease: DOUX }}
          >
            <p className="text-4xl font-semibold tracking-[-0.03em]">{candidate.prenom}</p>
            <p className="mt-2 text-lg text-attenue">{candidate.doctrine}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="mt-3"
        initial={ENTREE.initial}
        animate={ENTREE.animate}
        transition={{ ...ENTREE.transition, delay: CASCADE * 8 }}
      >
        <BoutonIA href="/test">
          Trouver mon IA
        </BoutonIA>
      </motion.div>

      <IndicateurDefilement />
    </section>
  );
}

/**
 * Sous le premier écran, une invitation discrète à poursuivre : un trait qui s'écoule vers le bas.
 * Il apparaît en dernier et s'efface dès que la page défile. Cliquable : il mène à la section suivante.
 */
function IndicateurDefilement() {
  const reduit = useMouvementReduit();
  const { scrollY } = useScroll();
  const opacite = useTransform(scrollY, [0, 160], [1, 0]);

  return (
    <motion.div
      className="absolute bottom-0 left-1/2 -translate-x-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DUREE.entree, ease: DOUX, delay: DUREE.scene + CASCADE * 8 }}
    >
      <motion.a
        href="#titre-comparatif"
        style={{ opacity: opacite }}
        onClick={(evenement) => {
          const cible = document.getElementById("titre-comparatif");
          if (!cible) return;
          evenement.preventDefault();
          cible.scrollIntoView({ behavior: reduit ? "auto" : "smooth", block: "start" });
        }}
        className={`group flex min-h-11 flex-col items-center gap-2 rounded-md px-3 py-1 text-xs text-attenue transition-colors duration-150 ease-out hover:text-texte ${FOCUS}`}
      >
        Pourquoi une IA ?
        <span aria-hidden className="relative h-7 w-px overflow-hidden bg-trait">
          <motion.span
            className="absolute inset-x-0 top-0 h-3 bg-texte"
            initial={{ y: "-100%" }}
            animate={reduit ? { y: "0%" } : { y: ["-100%", "240%"] }}
            transition={{ duration: 1.6, ease: DOUX, repeat: reduit ? 0 : Infinity, repeatDelay: 0.6 }}
          />
        </span>
      </motion.a>
    </motion.div>
  );
}
