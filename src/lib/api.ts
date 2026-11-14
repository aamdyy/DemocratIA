"use client";

import useSWR from "swr";

import type { Depute, Enveloppe, EtatConnexions, PositionsParScrutin, ResultatScrutin, Scrutin } from "@/lib/types";

async function lecteur<T>(url: string): Promise<T> {
  const reponse = await fetch(url);
  const corps = await reponse.json().catch(() => null);
  if (!reponse.ok) {
    throw new Error(corps?.erreur ?? `La lecture a échoué (${reponse.status}).`);
  }
  return corps as T;
}

// Les données parlementaires ne changent pas pendant une démo : on ne relit pas au retour sur l'onglet.
const STABLE = { revalidateOnFocus: false, revalidateIfStale: false, shouldRetryOnError: false } as const;

export const useScrutins = () => useSWR<Enveloppe<Scrutin[]>>("/api/scrutins", lecteur, STABLE);

export const useResultat = (id: string | null) =>
  useSWR<Enveloppe<ResultatScrutin>>(id ? `/api/scrutins/${encodeURIComponent(id)}` : null, lecteur, STABLE);

export const usePositions = (ids: string[]) =>
  useSWR<Enveloppe<PositionsParScrutin>>(
    ids.length ? `/api/positions?ids=${[...ids].sort().join(",")}` : null,
    lecteur,
    { ...STABLE, keepPreviousData: true },
  );

export const useDeputes = (nom: string) =>
  useSWR<Enveloppe<Depute[]>>(nom.trim().length >= 2 ? `/api/deputes?nom=${encodeURIComponent(nom.trim())}` : null, lecteur, {
    ...STABLE,
    keepPreviousData: true,
  });

export const useEtat = () => useSWR<EtatConnexions>("/api/etat", lecteur, { ...STABLE, revalidateOnFocus: true });
