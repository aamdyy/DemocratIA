"use client";

import { EXPLICATION_PRECISION } from "@/lib/precision";

/**
 * La précision du résultat, sobre : une phrase et une fine barre qui se remplit.
 * C'est un indicateur de complétude, pas une marge d'erreur : l'infobulle et l'aria-label le disent.
 */
export function Precision({ valeur }: { valeur: number }) {
  const texte = `${valeur} %`;
  return (
    <div title="Plus vous répondez, plus le classement est fiable" className="mt-6">
      <p aria-live="polite" aria-atomic className="text-sm text-attenue">
        Précision du résultat : <span className="font-medium tabular-nums text-texte">{texte}</span>
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={valeur}
        aria-valuetext={texte}
        aria-label={`Précision du résultat. ${EXPLICATION_PRECISION}`}
        className="mt-2 h-1 overflow-hidden rounded-full bg-relief"
      >
        <span
          className="block h-full origin-left rounded-full bg-republique transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `scaleX(${valeur / 100})` }}
        />
      </div>
    </div>
  );
}
