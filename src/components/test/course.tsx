"use client";

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useState } from "react";

import { Sphere } from "@/components/sphere";
import { DOUX, DUREE, RESSORT } from "@/lib/animation";
import type { Affinite } from "@/lib/candidates";

/** Taille de la sphère la moins proche, puis de la plus proche : la course se lit d'un coup d'œil. */
const ECHELLE_MIN = 0.58;
const ECHELLE_MAX = 1;
/** Tant que rien n'est répondu, les sphères ont la même taille. */
const ECHELLE_NEUTRE = 0.78;

/** Durée d'affichage du « +2 » au-dessus d'un score qui vient de bouger, en millisecondes. */
const DUREE_ECART = 1600;

/**
 * La course des IA candidates : alignées, classées de la plus proche à la plus éloignée,
 * chacune grossit avec son affinité. Elles se réordonnent à chaque réponse ; celle en tête prend la lumière,
 * et chaque score qui bouge affiche brièvement son écart.
 */
export function CourseIA({ classement, actif }: { classement: Affinite[]; actif: boolean }) {
  const scores = classement.map((a) => a.score);
  const haut = Math.max(...scores);
  const bas = Math.min(...scores);
  const ecart = haut - bas;

  const [premiere, deuxieme] = classement;

  return (
    <div>
      {/* Le classement change à chaque réponse : une courte phrase le dit aux lecteurs d'écran. */}
      <p aria-live="polite" aria-atomic className="sr-only">
        {actif
          ? `En tête : ${premiere.candidate.prenom}, ${Math.round(premiere.score * 100)} % d'affinité avec vous, devant ${deuxieme.candidate.prenom}, ${Math.round(deuxieme.score * 100)} %.`
          : ""}
      </p>
      <ol aria-label="Les IA candidates, de la plus proche de vous à la plus éloignée" className="flex items-end gap-0.5 sm:gap-3">
        {classement.map((affinite, rang) => {
          const part = ecart > 0.01 ? (affinite.score - bas) / ecart : 0.5;
          const echelle = actif ? ECHELLE_MIN + (ECHELLE_MAX - ECHELLE_MIN) * part : ECHELLE_NEUTRE;
          const { candidate } = affinite;
          const tete = actif && rang === 0;
          const valeur = Math.round(affinite.score * 100);
          return (
            <motion.li
              key={candidate.id}
              layout="position"
              transition={RESSORT}
              className="flex min-w-0 flex-1 basis-0 flex-col items-center text-center"
            >
              <div className="relative flex size-16 items-end justify-center sm:size-24">
                {/* La lumière de la tête de course : un halo de sa couleur, qui passe d'une sphère à l'autre. */}
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-[-30%] bottom-[-20%] top-[-10%] rounded-full blur-xl"
                  style={{ background: `radial-gradient(closest-side, ${candidate.teintes[1]}, transparent)` }}
                  initial={false}
                  animate={{ opacity: tete ? 0.55 : 0, scale: tete ? 1 : 0.6 }}
                  transition={{ duration: DUREE.entree, ease: DOUX }}
                />
                <motion.div
                  initial={false}
                  animate={{ scale: echelle }}
                  transition={RESSORT}
                  style={{ transformOrigin: "50% 100%" }}
                  className="relative size-11 sm:size-16 md:size-20"
                >
                  <Sphere teintes={candidate.teintes} duree={11 + rang * 2.3} className="size-full" />
                </motion.div>
              </div>
              <p
                className={`mt-1 max-w-full truncate text-xs transition-colors duration-300 sm:text-base ${tete ? "font-semibold text-texte" : "font-medium text-attenue"}`}
              >
                {candidate.prenom}
              </p>
              <p className={`relative text-xs tabular-nums sm:text-sm ${tete ? "text-texte" : "text-attenue"}`}>
                {actif ? <Pourcent valeur={valeur} /> : <span aria-label="Pas encore calculé">–</span>}
                {actif ? <Ecart valeur={valeur} /> : null}
              </p>
            </motion.li>
          );
        })}
      </ol>
      <AnimatePresence initial={false}>
        {actif ? null : (
          <motion.p
            className="mt-2 text-center text-sm text-attenue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUREE.etat }}
          >
            Vos réponses vont départager ces sept IA.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Le pourcentage compte jusqu'à sa nouvelle valeur au lieu de sauter. */
function Pourcent({ valeur }: { valeur: number }) {
  const reduit = useReducedMotion();
  const courant = useMotionValue(valeur);
  const arrondi = useTransform(courant, (v) => Math.round(v));

  useEffect(() => {
    const lecture = animate(courant, valeur, { duration: reduit ? 0 : DUREE.entree, ease: DOUX });
    return () => lecture.stop();
  }, [courant, valeur, reduit]);

  return (
    <>
      <motion.span>{arrondi}</motion.span> %
    </>
  );
}

/** « +2 » ou « −1 » qui monte au-dessus du score quand il change, puis s'efface. */
function Ecart({ valeur }: { valeur: number }) {
  const [precedente, setPrecedente] = useState(valeur);
  const [ecart, setEcart] = useState<{ delta: number; tour: number } | null>(null);

  // Comparer à la valeur précédente pendant le rendu : le motif recommandé par React pour suivre un changement de propriété.
  if (valeur !== precedente) {
    setPrecedente(valeur);
    setEcart((e) => ({ delta: valeur - precedente, tour: (e?.tour ?? 0) + 1 }));
  }

  useEffect(() => {
    if (!ecart) return;
    const minuterie = setTimeout(() => setEcart(null), DUREE_ECART);
    return () => clearTimeout(minuterie);
  }, [ecart]);

  return (
    <AnimatePresence>
      {ecart && ecart.delta !== 0 ? (
        <motion.span
          key={ecart.tour}
          aria-hidden
          className={`pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 text-[11px] font-semibold tabular-nums sm:text-xs ${
            ecart.delta > 0 ? "text-texte" : "text-attenue"
          }`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: DUREE.etat, ease: DOUX }}
        >
          {ecart.delta > 0 ? `+${ecart.delta}` : `−${Math.abs(ecart.delta)}`}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * La course en bandeau, collée en haut de l'écran quand la grande course est sortie de la vue :
 * on voit toujours qui mène pendant qu'on répond. La précision court sur son bord inférieur.
 * Décorative pour les lecteurs d'écran : la grande course annonce déjà chaque changement.
 */
export function CourseCompacte({ classement, precision, visible }: { classement: Affinite[]; precision: number; visible: boolean }) {
  const tete = classement[0];
  return (
    <AnimatePresence>
      {visible && tete ? (
        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-40 border-b border-trait bg-fond/90 backdrop-blur-md"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={RESSORT}
        >
          <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
            <ol className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
              {classement.map(({ candidate }, rang) => (
                <motion.li key={candidate.id} layout="position" transition={RESSORT} className="relative">
                  {rang === 0 ? (
                    <motion.span
                      layoutId="halo-compact"
                      className="absolute -inset-1.5 rounded-full blur-md"
                      style={{ background: `radial-gradient(closest-side, ${candidate.teintes[1]}, transparent)`, opacity: 0.6 }}
                      transition={RESSORT}
                    />
                  ) : null}
                  <motion.div
                    initial={false}
                    animate={{ scale: rang === 0 ? 1 : 0.72 }}
                    transition={RESSORT}
                    className="relative size-7 sm:size-8"
                  >
                    <Sphere teintes={candidate.teintes} duree={10 + rang} className="size-full" />
                  </motion.div>
                </motion.li>
              ))}
            </ol>
            <p className="min-w-0 flex-1 whitespace-nowrap text-sm">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={tete.candidate.id}
                  className="inline-block font-semibold"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={RESSORT}
                >
                  {tete.candidate.prenom}
                </motion.span>
              </AnimatePresence>{" "}
              <span className="tabular-nums text-attenue">
                <Pourcent valeur={Math.round(tete.score * 100)} />
              </span>
            </p>
            <p className="hidden shrink-0 text-sm text-attenue sm:block">
              Précision <span className="font-medium tabular-nums text-texte">{precision} %</span>
            </p>
          </div>
          <motion.span
            className="absolute inset-x-0 -bottom-px block h-0.5 origin-left bg-republique"
            initial={false}
            animate={{ scaleX: precision / 100 }}
            transition={RESSORT}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
