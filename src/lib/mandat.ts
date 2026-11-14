"use client";

import { useSyncExternalStore } from "react";

import type { ReponseDilemme } from "@/lib/dilemmes";
import type { Repartition } from "@/lib/questions/budget";
import { prioritesDuMandat } from "@/lib/questions/poids";
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
  /** Réponse du citoyen à chaque dilemme, par identifiant de dilemme. */
  dilemmes: Record<string, ReponseDilemme>;
  /** « D'accord ou pas » : un cran de −2 à +2 par affirmation (lib/questions/accords). */
  accords?: Record<string, number>;
  /** « Le budget de la République » : milliards par poste, 100 au total (lib/questions/budget). */
  budget?: Repartition;
  /** « Scénarios 2050 » : l'option choisie par scénario (lib/questions/scenarios). */
  scenarios?: Record<string, string>;
  /** « Classez » : les six thèmes, du plus au moins important (lib/questions/classement). */
  classement?: ThemeId[];
  /** « Devinez l'Assemblée » : le pari du citoyen par scrutin. Bonus, sans poids sur le résultat. */
  pronostics?: Record<string, "adopte" | "rejete">;
}

const CLE = "democratia:mandat:v1";
const VIDE: Mandat = { votes: {}, priorites: {}, dilemmes: {} };

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
        memoire = {
          ...lu,
          votes: lu.votes ?? {},
          priorites: lu.priorites ?? {},
          dilemmes: lu.dilemmes ?? {},
        };
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
  /**
   * Enregistre (ou retire, avec `null`) la réponse à un dilemme. Comme pour tous les formats, les priorités
   * sont recalculées depuis toutes les réponses (voir TRADUCTION dans lib/questions/poids).
   */
  repondreDilemme(dilemmeId: string, reponse: ReponseDilemme | null) {
    const actuel = lire();
    const dilemmes = { ...actuel.dilemmes };
    if (reponse) dilemmes[dilemmeId] = reponse;
    else delete dilemmes[dilemmeId];
    recalculer({ ...actuel, dilemmes });
  },
  /** « D'accord ou pas » : un cran de −2 à +2, ou `null` pour retirer la réponse. */
  accorder(affirmationId: string, cran: number | null) {
    const accords = { ...lire().accords };
    if (cran === null) delete accords[affirmationId];
    else accords[affirmationId] = Math.max(-2, Math.min(2, Math.round(cran)));
    recalculer({ ...lire(), accords });
  },
  /** « Le budget » : la répartition des 100 milliards, ou `null` pour la retirer. */
  budgeter(repartition: Repartition | null) {
    const suivant = { ...lire() };
    if (repartition) suivant.budget = { ...repartition };
    else delete suivant.budget;
    recalculer(suivant);
  },
  /** « Scénarios 2050 » : l'option choisie, ou `null` pour retirer la réponse. */
  choisirScenario(scenarioId: string, optionId: string | null) {
    const scenarios = { ...lire().scenarios };
    if (optionId === null) delete scenarios[scenarioId];
    else scenarios[scenarioId] = optionId;
    recalculer({ ...lire(), scenarios });
  },
  /** « Classez » : l'ordre des six thèmes, ou `null` pour le retirer. */
  classer(ordre: ThemeId[] | null) {
    const suivant = { ...lire() };
    if (ordre) suivant.classement = [...ordre];
    else delete suivant.classement;
    recalculer(suivant);
  },
  /** « Devinez l'Assemblée » : un pari, sans effet sur les priorités. */
  pronostiquer(scrutinId: string, pari: "adopte" | "rejete" | null) {
    const pronostics = { ...lire().pronostics };
    if (pari === null) delete pronostics[scrutinId];
    else pronostics[scrutinId] = pari;
    ecrire({ ...lire(), pronostics });
  },
  effacer() {
    ecrire(VIDE);
  },
};

/** Les priorités suivent toujours l'ensemble des réponses : sans aucune, le mandat revient au neutre. */
function recalculer(suivant: Mandat) {
  ecrire({ ...suivant, priorites: prioritesDuMandat(suivant) });
}

export function useMandat(): Mandat {
  return useSyncExternalStore(abonner, lire, () => VIDE);
}

export const prioriteDe = (m: Mandat, theme: ThemeId) => m.priorites[theme] ?? PRIORITE_PAR_DEFAUT;
