"use client";

import { motion } from "motion/react";

import { useMouvementReduit } from "@/components/accueil/hooks";
import { TEINTES_MELEES } from "@/components/accueil/ma-sphere";
import { FOCUS } from "@/components/accueil/reveal";
import { BoutonIA } from "@/components/bouton-ia";
import { PositionLibelle } from "@/components/position";
import { Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { useScrutins } from "@/lib/api";
import { classerCandidates } from "@/lib/candidates";
import { dateLongue, titreLisible } from "@/lib/format";
import { mandat, useMandat } from "@/lib/mandat";
import { libelleTheme, themeDe } from "@/lib/themes";
import type { Position } from "@/lib/types";
import { TitreLogo } from "./commun";

const REPONSES: Position[] = ["contre", "abstention", "pour"];

const CADRE = "flex min-h-[19rem] flex-col rounded-3xl bg-relief p-6 sm:p-8";

/**
 * Variante 4 : le logo, puis directement la première loi à trancher. À droite, une petite sphère
 * prend la couleur de l'IA en tête, et se corrige à chaque réponse.
 */
export function PremierEcranTest() {
  const { data, isLoading, error, mutate } = useScrutins();
  const m = useMandat();
  const reduit = useMouvementReduit();

  const scrutins = data?.data ?? [];
  const total = scrutins.length;
  const repondus = scrutins.filter((s) => m.votes[s.id]).length;
  const courant = scrutins.find((s) => !m.votes[s.id]) ?? null;
  const tete = repondus > 0 ? classerCandidates(m, scrutins)[0] : null;
  const pourcent = tete ? Math.round(tete.score * 100) : 0;

  return (
    <section aria-labelledby="titre-accueil" className="mx-auto flex min-h-[calc(100dvh-10rem)] max-w-[1120px] flex-col justify-center py-4">
      <div className="text-center">
        <TitreLogo id="titre-accueil" className="text-[clamp(2.75rem,7vw,5.5rem)]" />
      </div>

      <div className="mt-12 grid items-center gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div>
          <p className="text-sm tabular-nums text-attenue" aria-live="polite">
            {courant ? `Texte ${repondus + 1} sur ${total}` : total > 0 ? `${total} textes sur ${total}` : "Lecture des textes de loi"}
          </p>

          <div className={`mt-3 ${CADRE}`}>
            {isLoading ? (
              <div role="status">
                <p className="text-sm text-attenue">Lecture des textes de loi…</p>
                <div aria-hidden className="mt-5 space-y-3 motion-safe:animate-pulse">
                  <div className="h-6 w-11/12 rounded bg-fond" />
                  <div className="h-6 w-8/12 rounded bg-fond" />
                </div>
              </div>
            ) : error ? (
              <div role="alert">
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">Les textes de loi n&apos;ont pas pu être lus.</h2>
                <BoutonIA variante="contour" onClick={() => mutate()} className="mt-6">
                  Réessayer
                </BoutonIA>
              </div>
            ) : courant ? (
              <motion.div
                key={courant.id}
                className="flex flex-1 flex-col"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <p className="text-sm text-attenue">
                  {courant.numero ? `Scrutin n° ${courant.numero}, ` : "Scrutin "}du {dateLongue(courant.date)}
                </p>
                <h2 className="mt-3 text-balance text-[clamp(1.375rem,2.4vw,1.75rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
                  {titreLisible(courant.titre)}
                </h2>
                <div className="mt-auto space-y-3 pt-6">
                  <p className="font-donnee text-sm text-machine">Thème estimé : {libelleTheme(themeDe(courant.titre))}</p>
                  <SourceBadge source={courant.source} />
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-1 flex-col">
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                  {total > 0 ? `Vous avez parcouru les ${total} textes.` : "Aucun texte à trancher pour le moment."}
                </h2>
              </div>
            )}
          </div>

          {courant ? (
            <div role="group" aria-label="Votre position sur ce texte" className="mt-4 grid grid-cols-3 gap-3">
              {REPONSES.map((position) => (
                <button
                  key={position}
                  type="button"
                  onClick={() => mandat.voter(courant.id, position)}
                  className={`flex min-h-14 items-center justify-center rounded-full bg-relief px-2 text-[15px] font-medium transition-colors duration-150 hover:bg-trait ${FOCUS}`}
                >
                  <PositionLibelle position={position} />
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-8">
            <BoutonIA href="/test">
              Continuer le test
            </BoutonIA>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[320px] text-center">
          <motion.div
            key={tete ? tete.candidate.id : "melee"}
            className="mx-auto size-[min(48vw,220px)] lg:size-[min(100%,280px)]"
            initial={{ opacity: reduit ? 1 : 0.3, scale: reduit ? 1 : 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Sphere teintes={tete ? tete.candidate.teintes : TEINTES_MELEES} />
          </motion.div>

          <div className="mt-8" aria-live="polite" aria-atomic>
            {tete ? (
              <>
                <p className="text-lg">
                  En tête : <span className="font-semibold">{tete.candidate.prenom}</span>{" "}
                  <span className="tabular-nums">{pourcent} %</span>
                </p>
                <span
                  role="img"
                  aria-label={`${tete.candidate.prenom} : ${pourcent} % d'affinité`}
                  className="mt-3 block h-2 overflow-hidden rounded-full bg-relief"
                >
                  <motion.span
                    aria-hidden
                    className="block h-full rounded-full"
                    style={{ background: tete.candidate.teintes[1] }}
                    initial={false}
                    animate={{ width: `${pourcent}%` }}
                    transition={{ duration: reduit ? 0 : 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                  />
                </span>
              </>
            ) : (
              <p className="text-lg text-attenue">Tranchez un texte : l&apos;IA en tête apparaît ici.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
