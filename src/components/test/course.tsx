"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect } from "react";

import { Sphere } from "@/components/sphere";
import type { Affinite } from "@/lib/candidates";

/** Taille de la sphère la moins proche, puis de la plus proche : la course se lit d'un coup d'œil. */
const ECHELLE_MIN = 0.58;
const ECHELLE_MAX = 1;
/** Tant que rien n'est répondu, les sphères ont la même taille. */
const ECHELLE_NEUTRE = 0.78;

const RESSORT = { type: "spring", stiffness: 240, damping: 28 } as const;

/**
 * La course des IA candidates : alignées, classées de la plus proche à la plus éloignée,
 * chacune grossit avec son affinité. Elles se réordonnent à chaque réponse.
 */
export function CourseIA({ classement, actif }: { classement: Affinite[]; actif: boolean }) {
  const scores = classement.map((a) => a.score);
  const haut = Math.max(...scores);
  const bas = Math.min(...scores);
  const ecart = haut - bas;

  const [premiere, deuxieme] = classement;

  return (
    <>
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
        return (
          <motion.li
            key={candidate.id}
            layout="position"
            transition={RESSORT}
            className="flex min-w-0 flex-1 basis-0 flex-col items-center text-center"
          >
            <div className="flex size-16 items-end justify-center sm:size-24">
              <motion.div
                initial={false}
                animate={{ scale: echelle }}
                transition={RESSORT}
                style={{ transformOrigin: "50% 100%" }}
                className="size-11 sm:size-16 md:size-20"
              >
                <Sphere teintes={candidate.teintes} duree={11 + rang * 2.3} className="size-full" />
              </motion.div>
            </div>
            <p className={`mt-1 max-w-full truncate text-xs sm:text-base ${tete ? "font-semibold" : "font-medium text-attenue"}`}>
              {candidate.prenom}
            </p>
            <p className={`text-xs tabular-nums sm:text-sm ${tete ? "text-texte" : "text-attenue"}`}>
              {actif ? <Pourcent valeur={Math.round(affinite.score * 100)} /> : <span aria-label="Pas encore calculé">–</span>}
            </p>
          </motion.li>
        );
      })}
    </ol>
    </>
  );
}

/** Le pourcentage compte jusqu'à sa nouvelle valeur au lieu de sauter. */
function Pourcent({ valeur }: { valeur: number }) {
  const reduit = useReducedMotion();
  const courant = useMotionValue(valeur);
  const arrondi = useTransform(courant, (v) => Math.round(v));

  useEffect(() => {
    const lecture = animate(courant, valeur, { duration: reduit ? 0 : 0.6, ease: [0.2, 0.8, 0.2, 1] });
    return () => lecture.stop();
  }, [courant, valeur, reduit]);

  return (
    <>
      <motion.span>{arrondi}</motion.span> %
    </>
  );
}
