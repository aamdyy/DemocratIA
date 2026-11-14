"use client";

import { useId } from "react";
import { AnimatePresence, motion } from "motion/react";

import { CASCADE, DOUX, DUREE, RESSORT } from "@/lib/animation";

import { cn } from "@/lib/utils";
import type { Depute } from "@/lib/types";

import { nomComplet } from "./calcul";

const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";

/** Champ de recherche d'un député par son nom, et résultats sous forme de boutons. */
export function RechercheDepute({
  saisie,
  onSaisie,
  enAttente,
  erreur,
  resultats,
  choisiId,
  onChoisir,
}: {
  saisie: string;
  onSaisie: (valeur: string) => void;
  /** Vrai tant que la recherche correspondant à la saisie n'est pas revenue. */
  enAttente: boolean;
  erreur: string | null;
  /** Députés trouvés, ou null tant qu'aucune recherche n'a abouti. */
  resultats: Depute[] | null;
  choisiId: string | null;
  onChoisir: (depute: Depute) => void;
}) {
  const champ = useId();
  const aide = useId();
  const assezLong = saisie.trim().length >= 2;

  const etat = !assezLong
    ? "Deux lettres suffisent pour lancer la recherche."
    : erreur
      ? `La recherche n'a pas abouti. ${erreur}`
      : enAttente || !resultats
        ? "Recherche en cours…"
        : resultats.length === 0
          ? "Aucun député ne porte ce nom."
          : `${resultats.length} ${resultats.length === 1 ? "député trouvé" : "députés trouvés"}.`;

  return (
    <div>
      <label htmlFor={champ} className="block text-sm font-medium text-texte">
        Nom du député
      </label>
      <input
        id={champ}
        type="search"
        value={saisie}
        onChange={(evenement) => onSaisie(evenement.target.value)}
        aria-describedby={aide}
        autoComplete="off"
        spellCheck={false}
        placeholder="Nom de famille"
        className={cn(
          "mt-2 h-12 w-full max-w-xl rounded-md border border-trait bg-surface px-4 text-base text-texte transition-colors duration-150 placeholder:text-attenue hover:border-attenue",
          FOCUS,
        )}
      />
      <p id={aide} role="status" aria-live="polite" className={cn("mt-2 text-sm leading-6 text-attenue", erreur && assezLong && "text-texte")}>
        {etat}
      </p>

      <ul
        className={cn(
          "mt-4 grid max-w-3xl sm:grid-cols-2 sm:gap-x-8",
          enAttente && "opacity-60 transition-opacity duration-150",
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {assezLong && !erreur && resultats
            ? resultats.map((depute, i) => {
                const choisi = depute.id === choisiId;
                return (
                  <motion.li
                    key={depute.id}
                    layout="position"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: DUREE.etat, ease: DOUX, delay: i * CASCADE } }}
                    exit={{ opacity: 0, transition: { duration: DUREE.micro } }}
                    transition={RESSORT}
                    className="border-b border-trait"
                  >
                    <button
                      type="button"
                      aria-pressed={choisi}
                      onClick={() => onChoisir(depute)}
                      className={cn(
                        "group flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 rounded-md px-3 py-2.5 text-left text-[15px] leading-6 transition-colors duration-150 hover:bg-relief",
                        choisi && "bg-relief font-medium",
                        FOCUS,
                      )}
                    >
                      <span className="inline-flex min-w-0 items-center gap-2.5">
                        <span
                          aria-hidden
                          className={cn(
                            "size-2.5 shrink-0 rounded-full border transition-colors duration-150",
                            choisi ? "border-texte bg-texte" : "border-attenue group-hover:border-texte",
                          )}
                        />
                        <span className="truncate">{nomComplet(depute)}</span>
                        {choisi ? <span className="sr-only">(choisi)</span> : null}
                      </span>
                      <span className="shrink-0 text-sm font-normal text-attenue">{depute.groupe ?? "Groupe non renseigné"}</span>
                    </button>
                  </motion.li>
                );
              })
            : null}
        </AnimatePresence>
      </ul>
    </div>
  );
}
