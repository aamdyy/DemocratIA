"use client";

import { useSyncExternalStore } from "react";

import type { Position } from "@/lib/types";
import { PRIORITE_PAR_DEFAUT, type ThemeId } from "@/lib/themes";

/**
 * Le mandat citoyen : ce que le citoyen a tranché et ce qui compte le plus pour lui.
 * Gardé dans le navigateur pour que les trois vues partagent le même mandat.
 */
export interface Mandat {
  /** Position du citoyen sur chaque texte arbitré, par identifiant de scrutin. */
  votes: Record<string, Position>;
  /** Poids de chaque thème, de 0 à 100. Un thème absent vaut 50. */
  priorites: Partial<Record<ThemeId, number>>;
}

const CLE = "democratia:mandat:v1";
const VIDE: Mandat = { votes: {}, priorites: {} };

let memoire: Mandat = VIDE;
let charge = false;
const abonnes = new Set<() => void>();

function lire(): Mandat {
  if (!charge) {
    charge = true;
    try {
      const brut = window.localStorage.getItem(CLE);
      if (brut) {
        const lu = JSON.parse(brut) as Partial<Mandat>;
        memoire = { votes: lu.votes ?? {}, priorites: lu.priorites ?? {} };
      }
    } catch {
      // Navigation privée ou stockage bloqué : le mandat vit le temps de la session.
    }
  }
  return memoire;
}

function ecrire(suivant: Mandat) {
  memoire = suivant;
  try {
    window.localStorage.setItem(CLE, JSON.stringify(suivant));
  } catch {
    // Voir lire().
  }
  abonnes.forEach((prevenir) => prevenir());
}

function abonner(prevenir: () => void) {
  abonnes.add(prevenir);
  return () => abonnes.delete(prevenir);
}

export const mandat = {
  voter(scrutinId: string, position: Position) {
    ecrire({ ...lire(), votes: { ...lire().votes, [scrutinId]: position } });
  },
  retirerVote(scrutinId: string) {
    const votes = { ...lire().votes };
    delete votes[scrutinId];
    ecrire({ ...lire(), votes });
  },
  regler(theme: ThemeId, poids: number) {
    ecrire({ ...lire(), priorites: { ...lire().priorites, [theme]: poids } });
  },
  effacer() {
    ecrire(VIDE);
  },
};

export function useMandat(): Mandat {
  return useSyncExternalStore(abonner, lire, () => VIDE);
}

export const prioriteDe = (m: Mandat, theme: ThemeId) => m.priorites[theme] ?? PRIORITE_PAR_DEFAUT;
