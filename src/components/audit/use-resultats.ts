"use client";

import useSWR from "swr";

import type { Enveloppe, ResultatScrutin } from "@/lib/types";

export interface LectureResultats {
  /** Résultat complet de chaque scrutin lu, par identifiant. */
  resultats: Record<string, Enveloppe<ResultatScrutin>>;
  /** Message d'erreur des scrutins qui n'ont pas pu être lus, par identifiant. */
  echecs: Record<string, string>;
}

async function lireUn(id: string): Promise<Enveloppe<ResultatScrutin>> {
  const reponse = await fetch(`/api/scrutins/${encodeURIComponent(id)}`);
  const corps = await reponse.json().catch(() => null);
  if (!reponse.ok || !corps?.data) {
    throw new Error(corps?.erreur ?? `La lecture a échoué (${reponse.status}).`);
  }
  return corps as Enveloppe<ResultatScrutin>;
}

async function lireTous([, ...ids]: readonly string[]): Promise<LectureResultats> {
  const lectures = await Promise.allSettled(ids.map(lireUn));
  const resultats: LectureResultats["resultats"] = {};
  const echecs: LectureResultats["echecs"] = {};
  lectures.forEach((lecture, i) => {
    if (lecture.status === "fulfilled") resultats[ids[i]] = lecture.value;
    else echecs[ids[i]] = lecture.reason instanceof Error ? lecture.reason.message : "La lecture a échoué.";
  });
  // Si rien n'a pu être lu, c'est une panne et non un détail : la vue affiche une erreur d'ensemble.
  if (ids.length > 0 && Object.keys(resultats).length === 0) {
    throw new Error(Object.values(echecs)[0] ?? "La lecture a échoué.");
  }
  return { resultats, echecs };
}

/**
 * Résultats complets (votes nominatifs et positions des groupes) d'une liste de scrutins,
 * lus en parallèle et gardés sous une seule clé : changer de député ne relit rien.
 */
export function useResultats(ids: string[]) {
  const tries = [...ids].sort();
  return useSWR<LectureResultats, Error>(tries.length ? ["audit:resultats", ...tries] : null, lireTous, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    shouldRetryOnError: false,
    keepPreviousData: true,
  });
}
