"use client";

import { motion } from "motion/react";
import { useState } from "react";

import { BoutonIA } from "@/components/bouton-ia";
import { POIDS_RANG, prioritesFinales, selectionEnregistree } from "@/lib/dilemmes";
import { mandat, type Mandat } from "@/lib/mandat";
import { SEUIL_PRECISION } from "@/lib/precision";
import { THEMES, type ThemeId } from "@/lib/themes";

const MAXIMUM = POIDS_RANG.length;

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-republique";

/**
 * Traduit la sélection en mandat. Les dix thèmes sont réglés d'un coup : les trois choisis passent en tête,
 * les autres gardent la valeur que leur ont donnée les dilemmes (50 sans dilemme). Sans sélection, tout
 * revient à cette base.
 */
function appliquer(choix: ThemeId[], reponses: Mandat["dilemmes"]) {
  for (const [theme, poids] of prioritesFinales(choix, reponses)) mandat.regler(theme, poids);
}

/** Dix pastilles de thèmes, trois au plus : l'ordre du toucher est l'ordre d'importance. */
export function Priorites({
  reglages,
  manquants,
  precision,
  onRevenir,
}: {
  reglages: Mandat;
  /** Nombre de textes qu'il reste à trancher avant de pouvoir découvrir son IA. */
  manquants: number;
  /** Précision du résultat, de 0 à 100 : sous le seuil, une ligne invite à continuer. */
  precision: number;
  onRevenir: () => void;
}) {
  const [choix, setChoix] = useState<ThemeId[]>(() => selectionEnregistree(reglages.priorites));
  const [annonce, setAnnonce] = useState("");

  function basculer(theme: ThemeId, libelle: string) {
    const rang = choix.indexOf(theme);
    if (rang < 0 && choix.length >= MAXIMUM) {
      setAnnonce("Vous avez déjà trois priorités. Retirez-en une pour en choisir une autre.");
      return;
    }
    const suivant = rang >= 0 ? choix.filter((c) => c !== theme) : [...choix, theme];
    setChoix(suivant);
    appliquer(suivant, reglages.dilemmes);
    setAnnonce(
      rang >= 0
        ? `${libelle} retiré. ${suivant.length} priorité${suivant.length > 1 ? "s" : ""} sur ${MAXIMUM}.`
        : `${libelle} : priorité ${suivant.length} sur ${MAXIMUM}.`,
    );
  }

  const pret = manquants === 0 && choix.length > 0;
  const raison =
    manquants > 0
      ? `Encore ${manquants} texte${manquants > 1 ? "s" : ""} à trancher.`
      : choix.length === 0
        ? "Choisissez au moins une priorité."
        : null;

  return (
    <div>
      <p className="sr-only" role="status" aria-live="polite">
        {annonce}
      </p>
      <div role="group" aria-label="Vos priorités, de la plus importante à la moins importante" className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
        {THEMES.map((theme) => {
          const rang = choix.indexOf(theme.id);
          const choisi = rang >= 0;
          const plein = !choisi && choix.length >= MAXIMUM;
          return (
            <motion.button
              key={theme.id}
              type="button"
              aria-pressed={choisi}
              aria-disabled={plein || undefined}
              onClick={() => basculer(theme.id, theme.libelle)}
              whileTap={{ scale: 0.96 }}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[15px] font-medium transition-colors duration-150 ${FOCUS} ${
                choisi
                  ? "border-texte bg-texte text-fond"
                  : plein
                    ? "border-trait text-attenue opacity-60"
                    : "border-trait bg-surface hover:border-texte"
              }`}
            >
              {choisi ? (
                <motion.span
                  aria-hidden
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className="flex size-6 items-center justify-center rounded-full bg-fond text-sm font-semibold tabular-nums text-texte"
                >
                  {rang + 1}
                </motion.span>
              ) : null}
              {choisi ? <span className="sr-only">Priorité {rang + 1} : </span> : null}
              {theme.libelle}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col items-center gap-1">
        {pret ? (
          <>
            <BoutonIA href="/resultat">Découvrir mon IA</BoutonIA>
            {precision < SEUIL_PRECISION ? (
              <p className="text-sm text-attenue">Quelques réponses de plus rendraient le classement plus fiable.</p>
            ) : null}
          </>
        ) : (
          <>
            <button
              type="button"
              aria-disabled
              aria-describedby="raison-inactif"
              className={`inline-flex h-14 cursor-not-allowed items-center rounded-full bg-relief px-8 font-medium text-attenue ${FOCUS}`}
            >
              Découvrir mon IA
            </button>
            <p id="raison-inactif" className="text-sm text-attenue">
              {raison}
            </p>
          </>
        )}
        <button
          type="button"
          onClick={onRevenir}
          className={`inline-flex min-h-11 items-center px-3 text-[15px] text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current ${FOCUS}`}
        >
          Revenir aux dilemmes
        </button>
      </div>
    </div>
  );
}

/** Le nombre de priorités déjà choisies, lu depuis le mandat : 0 à 3. */
export const nombreDePriorites = (reglages: Mandat) => selectionEnregistree(reglages.priorites).length;
