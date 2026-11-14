"use client";

import { useId } from "react";

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
    ? "Saisissez au moins deux lettres du nom."
    : erreur
      ? `La recherche n'a pas abouti. ${erreur}`
      : enAttente || !resultats
        ? "Recherche en cours…"
        : resultats.length === 0
          ? "Aucun député ne porte ce nom. Vérifiez l'orthographe ou essayez un nom plus court."
          : resultats.length === 1
            ? "1 député trouvé. Choisissez-le pour lancer la comparaison."
            : `${resultats.length} députés trouvés. Choisissez-en un pour lancer la comparaison.`;

  return (
    <div>
      <label htmlFor={champ} className="block text-sm font-medium text-texte">
        Nom du député à auditer
      </label>
      <input
        id={champ}
        type="search"
        value={saisie}
        onChange={(evenement) => onSaisie(evenement.target.value)}
        aria-describedby={aide}
        autoComplete="off"
        spellCheck={false}
        placeholder="Par exemple : Dupont"
        className={cn(
          "mt-2 h-12 w-full max-w-xl border border-trait bg-surface px-4 text-base text-texte placeholder:text-attenue",
          FOCUS,
        )}
      />
      <p id={aide} role="status" aria-live="polite" className={cn("mt-2 text-sm leading-6 text-attenue", erreur && assezLong && "text-texte")}>
        {etat}
      </p>

      {assezLong && !erreur && resultats && resultats.length > 0 ? (
        <ul className={cn("mt-3 grid max-w-3xl border-t border-trait sm:grid-cols-2 sm:gap-x-8", enAttente && "opacity-60")}>
          {resultats.map((depute) => {
            const choisi = depute.id === choisiId;
            return (
              <li key={depute.id} className="border-b border-trait">
                <button
                  type="button"
                  aria-pressed={choisi}
                  onClick={() => onChoisir(depute)}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between gap-4 px-1 py-2.5 text-left text-[15px] leading-6 hover:bg-relief",
                    choisi && "font-medium",
                    FOCUS,
                  )}
                >
                  <span>
                    {nomComplet(depute)}
                    {choisi ? <span className="ml-2 text-sm font-normal text-attenue">· choisi</span> : null}
                  </span>
                  <span className="shrink-0 text-sm text-attenue">{depute.groupe ?? "Groupe non renseigné"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
