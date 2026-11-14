"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useEffectEvent, useRef } from "react";

import { BoutonIA } from "@/components/bouton-ia";
import { DILEMMES, type Dilemme, type ReponseDilemme } from "@/lib/dilemmes";
import { libelleTheme } from "@/lib/themes";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-republique";

const CADRE = "flex min-h-[14rem] flex-col rounded-2xl border border-trait bg-surface p-6 sm:p-8";

const TITRE = "text-balance font-titre text-[clamp(1.5rem,3.2vw,2.125rem)] font-semibold leading-[1.12] tracking-[-0.03em]";

const BOUTON_DISCRET = `inline-flex min-h-11 items-center px-3 text-[15px] text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current disabled:pointer-events-none disabled:opacity-60 ${FOCUS}`;

const DOUX = [0.2, 0.8, 0.2, 1] as const;

/**
 * Les dilemmes : un arbitrage à la fois entre deux thèmes, deux grands boutons, ou « Les deux » / « Aucun ».
 * Les boutons restent en place d'un dilemme à l'autre : le clavier ne perd pas le focus.
 */
export function Dilemmes({
  dilemme,
  numero,
  peutAnnuler,
  onRepondre,
  onAnnuler,
  onTerminer,
  onRevenir,
}: {
  /** Le premier dilemme sans réponse, ou null quand les six sont répondus. */
  dilemme: Dilemme | null;
  /** Rang du dilemme en cours, à partir de 1. */
  numero: number;
  peutAnnuler: boolean;
  onRepondre: (reponse: ReponseDilemme) => void;
  onAnnuler: () => void;
  onTerminer: () => void;
  onRevenir: () => void;
}) {
  return (
    <section aria-labelledby="titre-dilemme">
      <div className="relative grid">
        <AnimatePresence mode="wait" initial={false}>
          {dilemme ? (
            <motion.div
              key={dilemme.id}
              className={CADRE}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: DOUX } }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" } }}
            >
              <p className="text-sm tabular-nums text-attenue">
                <span className="sr-only">Dilemme </span>
                {numero} sur {DILEMMES.length}
              </p>
              <h2 id="titre-dilemme" className={`mt-3 ${TITRE}`}>
                {dilemme.question}
              </h2>
              <p className="mt-auto pt-8 font-donnee text-xs text-machine">
                Thèmes : {libelleTheme(dilemme.a.theme)} · {libelleTheme(dilemme.b.theme)}
              </p>
            </motion.div>
          ) : (
            <CarteFin key="fin" onTerminer={onTerminer} />
          )}
        </AnimatePresence>
      </div>

      {dilemme ? (
        <>
          <div role="group" aria-label="Votre arbitrage" className="mt-6 grid gap-3 sm:grid-cols-2">
            {([
              ["a", dilemme.a],
              ["b", dilemme.b],
            ] as const).map(([reponse, choix]) => (
              <button
                key={reponse}
                type="button"
                onClick={() => onRepondre(reponse)}
                className={`flex min-h-16 items-center justify-center rounded-full border border-texte bg-surface px-5 py-3 text-center text-base font-medium leading-snug transition-colors duration-150 hover:bg-texte hover:text-fond active:bg-texte active:text-fond ${FOCUS}`}
              >
                {choix.libelle}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Ou aucun des deux choix" className="mt-3 grid grid-cols-2 gap-3">
            {([
              ["deux", "Les deux"],
              ["aucun", "Aucun"],
            ] as const).map(([reponse, libelle]) => (
              <button
                key={reponse}
                type="button"
                onClick={() => onRepondre(reponse)}
                className={`flex min-h-11 items-center justify-center rounded-full border border-trait bg-surface px-4 text-[15px] font-medium transition-colors duration-150 hover:border-texte active:bg-relief ${FOCUS}`}
              >
                {libelle}
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between gap-4">
            <button type="button" onClick={onAnnuler} disabled={!peutAnnuler} className={`-ml-3 ${BOUTON_DISCRET}`}>
              Revenir
            </button>
            <button type="button" onClick={onRevenir} className={`-mr-3 ${BOUTON_DISCRET}`}>
              Revenir aux textes
            </button>
          </div>
        </>
      ) : (
        <p className="mt-2 flex items-center justify-between gap-4">
          <button type="button" onClick={onAnnuler} disabled={!peutAnnuler} className={`-ml-3 ${BOUTON_DISCRET}`}>
            Revenir
          </button>
          <button type="button" onClick={onRevenir} className={`-mr-3 ${BOUTON_DISCRET}`}>
            Revenir aux textes
          </button>
        </p>
      )}
    </section>
  );
}

function CarteFin({ onTerminer }: { onTerminer: () => void }) {
  // Les boutons de réponse disparaissent avec le dernier dilemme : le clavier se pose sur le message de fin.
  const titre = useRef<HTMLHeadingElement>(null);
  const poserLeFocus = useEffectEvent(() => titre.current?.focus({ preventScroll: true }));
  useEffect(() => poserLeFocus(), []);

  return (
    <motion.div
      className={CADRE}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: DOUX } }}
    >
      <h2 id="titre-dilemme" ref={titre} tabIndex={-1} className={`${TITRE} outline-none`}>
        Vos six arbitrages sont enregistrés.
      </h2>
      <p className="mt-auto pt-8">
        <BoutonIA onClick={onTerminer}>Choisir mes priorités</BoutonIA>
      </p>
    </motion.div>
  );
}

/** Le premier dilemme sans réponse, et son rang. */
export function dilemmeEnCours(reponses: Record<string, ReponseDilemme>): { dilemme: Dilemme | null; numero: number } {
  const indice = DILEMMES.findIndex((d) => !reponses[d.id]);
  return indice < 0 ? { dilemme: null, numero: DILEMMES.length } : { dilemme: DILEMMES[indice], numero: indice + 1 };
}

/** Le dernier dilemme répondu : celui que « Revenir » rouvre. */
export function dernierDilemmeRepondu(reponses: Record<string, ReponseDilemme>): Dilemme | null {
  return [...DILEMMES].reverse().find((d) => reponses[d.id]) ?? null;
}
