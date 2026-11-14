"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { DILEMMES, type Dilemme, type ReponseDilemme } from "@/lib/dilemmes";
import { mandat, type Mandat } from "@/lib/mandat";
import type { Chapitre } from "@/lib/questions/chapitres";
import { libelleTheme } from "@/lib/themes";

import { BOUTON_DISCRET, CADRE, EnteteChapitre, FOCUS, FinChapitre, RESSORT, SORTIE, TITRE_CARTE } from "./chapitre";

/**
 * Chapitre « Dilemmes » : un arbitrage à la fois entre deux thèmes, deux grands boutons, ou « Les deux » / « Aucun ».
 * Les boutons restent en place d'un dilemme à l'autre : le clavier ne perd pas le focus.
 */
export function ChapitreDilemmes({
  chapitre,
  reglages,
  onAnnonce,
  onFini,
}: {
  chapitre: Chapitre;
  reglages: Mandat;
  onAnnonce: (texte: string) => void;
  onFini: () => void;
}) {
  const [passes, setPasses] = useState<string[]>([]);
  const [historique, setHistorique] = useState<string[]>([]);

  const indice = DILEMMES.findIndex((d) => !reglages.dilemmes[d.id] && !passes.includes(d.id));
  const dilemme = indice < 0 ? null : DILEMMES[indice];

  function annoncerSuite(apres: number) {
    const suivant = DILEMMES.slice(apres + 1).find((d) => !reglages.dilemmes[d.id] && !passes.includes(d.id));
    return suivant ? `Dilemme suivant : ${suivant.question}` : "Les dilemmes sont terminés.";
  }

  function repondre(reponse: ReponseDilemme) {
    if (!dilemme) return;
    mandat.repondreDilemme(dilemme.id, reponse);
    setHistorique((h) => [...h, dilemme.id]);
    onAnnonce(`Réponse enregistrée. ${annoncerSuite(indice)}`);
  }

  function passer() {
    if (!dilemme) return;
    setPasses((p) => [...p, dilemme.id]);
    setHistorique((h) => [...h, dilemme.id]);
    onAnnonce(`Dilemme passé. ${annoncerSuite(indice)}`);
  }

  function annuler() {
    const dernier = historique[historique.length - 1];
    if (!dernier) return;
    setHistorique((h) => h.slice(0, -1));
    setPasses((p) => p.filter((id) => id !== dernier));
    if (reglages.dilemmes[dernier]) mandat.repondreDilemme(dernier, null);
    onAnnonce(`Retour au dilemme : ${DILEMMES.find((d) => d.id === dernier)?.question ?? ""}`);
  }

  return (
    <section aria-label="Dilemmes">
      <EnteteChapitre
        chapitre={chapitre}
        etape={dilemme ? indice + 1 : DILEMMES.length}
        total={DILEMMES.length}
        libelleEtape="Dilemme"
        onPasser={onFini}
      />
      {dilemme ? (
        <>
          <div className="relative grid">
            <AnimatePresence mode="wait" initial={false}>
              <CarteDilemme key={dilemme.id} dilemme={dilemme} />
            </AnimatePresence>
          </div>
          <div role="group" aria-label="Votre arbitrage" className="mt-6 grid gap-3 sm:grid-cols-2">
            {([
              ["a", dilemme.a],
              ["b", dilemme.b],
            ] as const).map(([reponse, choix]) => (
              <motion.button
                key={reponse}
                type="button"
                onClick={() => repondre(reponse)}
                whileTap={{ scale: 0.97 }}
                className={`flex min-h-16 items-center justify-center rounded-full border border-texte bg-surface px-5 py-3 text-center text-base font-medium leading-snug transition-colors duration-150 hover:bg-texte hover:text-fond active:bg-texte active:text-fond ${FOCUS}`}
              >
                {choix.libelle}
              </motion.button>
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
                onClick={() => repondre(reponse)}
                className={`flex min-h-11 items-center justify-center rounded-full border border-trait bg-surface px-4 text-[15px] font-medium transition-colors duration-150 hover:border-texte active:bg-relief ${FOCUS}`}
              >
                {libelle}
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between gap-4">
            <button type="button" onClick={annuler} disabled={historique.length === 0} className={`-ml-3 ${BOUTON_DISCRET}`}>
              Revenir
            </button>
            <button type="button" onClick={passer} className={`-mr-3 ${BOUTON_DISCRET}`}>
              Passer
            </button>
          </div>
        </>
      ) : (
        <FinChapitre titre="Vos arbitrages sont enregistrés." teintes={chapitre.teintes} onSuite={onFini}>
          {historique.length > 0 ? (
            <button type="button" onClick={annuler} className={`-ml-3 mt-2 self-start ${BOUTON_DISCRET}`}>
              Revenir
            </button>
          ) : null}
        </FinChapitre>
      )}
    </section>
  );
}

/** Les deux causes se font face, puis glissent l'une vers l'autre autour du « ou ». */
function CarteDilemme({ dilemme }: { dilemme: Dilemme }) {
  return (
    <motion.div
      className={`${CADRE} min-h-[14rem]`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: RESSORT }}
      exit={{ opacity: 0, y: -8, transition: SORTIE }}
    >
      <h3 className={TITRE_CARTE}>{dilemme.question}</h3>
      <div aria-hidden className="mt-auto flex items-center gap-3 pt-8 font-donnee text-xs text-machine">
        <motion.span initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ ...RESSORT, delay: 0.15 }}>
          {libelleTheme(dilemme.a.theme)}
        </motion.span>
        <motion.span
          className="h-px flex-1 origin-center bg-trait"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ ...RESSORT, delay: 0.25 }}
        />
        <span className="text-attenue">ou</span>
        <motion.span
          className="h-px flex-1 origin-center bg-trait"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ ...RESSORT, delay: 0.25 }}
        />
        <motion.span initial={{ x: 16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ ...RESSORT, delay: 0.15 }}>
          {libelleTheme(dilemme.b.theme)}
        </motion.span>
      </div>
      <p className="sr-only">
        Thèmes : {libelleTheme(dilemme.a.theme)} ou {libelleTheme(dilemme.b.theme)}
      </p>
    </motion.div>
  );
}

/** Le premier dilemme sans réponse, et son rang. */
export function dilemmeEnCours(reponses: Record<string, ReponseDilemme>): { dilemme: Dilemme | null; numero: number } {
  const indice = DILEMMES.findIndex((d) => !reponses[d.id]);
  return indice < 0 ? { dilemme: null, numero: DILEMMES.length } : { dilemme: DILEMMES[indice], numero: indice + 1 };
}
