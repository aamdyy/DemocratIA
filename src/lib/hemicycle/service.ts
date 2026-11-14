import "server-only";

import type {
  Depute,
  Enveloppe,
  MetaReponse,
  PositionGroupe,
  PositionsParScrutin,
  ResultatScrutin,
  Scrutin,
} from "@/lib/types";
import { themeDe, type ThemeId } from "@/lib/themes";
import { ErreurHemicycle, cleHemicycle, hemicycle, memoriserSolde, soldeMemorise, type ReponseHemicycle } from "./client";
import {
  DEPUTES_EXEMPLE,
  SCRUTINS_EXEMPLE,
  positionsExemple,
  resultatExemple,
} from "./exemples";
import {
  donnees,
  normaliserDepute,
  normaliserPositionsGroupes,
  normaliserResultat,
  normaliserScrutin,
} from "./normaliser";

const meta = (reponse: ReponseHemicycle<unknown>): MetaReponse => ({
  origine: reponse.origine,
  recuLe: reponse.recuLe,
  credits: reponse.credits,
});

const RAISON_CLE_ABSENTE = "Données d'exemple : la connexion à Hémicycle n'est pas active.";

/** Quand Hémicycle ne répond pas, la démo continue sur des données d'exemple, et le dit. */
function repli<T>(data: T, erreur: unknown): Enveloppe<T> {
  const raison =
    erreur instanceof ErreurHemicycle
      ? erreur.code === "cle-absente"
        ? RAISON_CLE_ABSENTE
        : erreur.code === "reponse-vide"
          ? erreur.message
          : `Hémicycle a refusé l'appel (${erreur.statut}) : ${erreur.message}`
      : erreur instanceof Error && erreur.name === "TimeoutError"
        ? "Hémicycle met trop de temps à répondre : réessayez dans un instant."
        : "Hémicycle est injoignable : vérifiez le réseau.";
  return { data, meta: { origine: "exemple", raison, recuLe: new Date().toISOString() } };
}

/** Une pièce d'exemple demandée par son identifiant : la raison dépend de la présence de la clé. */
function exemple<T>(data: T): Enveloppe<T> {
  const raison = cleHemicycle()
    ? "Cette pièce est un exemple aux valeurs fictives : elle ne vient pas d'Hémicycle."
    : RAISON_CLE_ABSENTE;
  return { data, meta: { origine: "exemple", raison, recuLe: new Date().toISOString() } };
}


/** Un même thème ne pèse pas plus de trois textes : le test couvre l'éventail des sujets. */
const MAX_PAR_THEME = 3;

/** Garde les premiers textes de chaque thème, dans l'ordre reçu, jusqu'à `nombre` textes. */
function diversifier(scrutins: Scrutin[], nombre: number): Scrutin[] {
  const compte = new Map<ThemeId, number>();
  const retenus: Scrutin[] = [];
  for (const scrutin of scrutins) {
    const theme = themeDe(scrutin.titre);
    const deja = compte.get(theme) ?? 0;
    if (deja >= MAX_PAR_THEME) continue;
    compte.set(theme, deja + 1);
    retenus.push(scrutin);
    if (retenus.length >= nombre) break;
  }
  return retenus;
}

/** Scrutins déjà lus dans la liste : sert à compléter un résultat qui ne répète pas l'intitulé. */
const scrutinsConnus = new Map<string, Scrutin>();

/**
 * Les scrutins que le citoyen arbitre dans la vue 1 : des votes sur l'ensemble d'un texte,
 * plus parlants qu'un amendement isolé. On en vise vingt, trois par thème au plus, pris dans les pages
 * déjà lues. Quatre pages au plus, soit 4 crédits, une seule fois.
 */
/** Ligne du jeu « scrutins » d'Hémicycle (POST /jeux/interroger). */
interface LigneScrutin {
  uid?: string;
  numero?: string | number;
  legislature?: string | number;
  date_scrutin?: string;
  titre?: string;
  sort_code?: string;
  nb_pour?: number;
  nb_contre?: number;
  nb_abstentions?: number;
  nb_non_votants?: number;
}

interface ReponseJeu {
  lignes?: LigneScrutin[];
  source?: { nom?: string; url?: string; licence?: string };
}

/** « l'ensemble du projet de loi X (première lecture). » et sa lecture suivante désignent le même texte. */
const cleTexte = (titre: string) =>
  titre
    .toLowerCase()
    .replace(/\s*\((première|deuxième|nouvelle|dernière) lecture\)\.?$/, "")
    .replace(/\s*\(texte de la commission[^)]*\)\.?$/, "")
    .replace(/^l['’]ensemble (du |de la |de l['’])(projet|proposition) de loi (organique )?/, "")
    .trim();

/**
 * Les textes que le citoyen arbitre : uniquement des votes sur l'ensemble d'un texte de la 17e législature.
 * Le flux /scrutins est noyé d'amendements (2 votes sur l'ensemble sur 400 en période budgétaire) ; on lit donc
 * le jeu « scrutins » filtré sur l'intitulé, en deux requêtes (projets, propositions) : 2 crédits, mis en cache.
 */
export async function listerScrutinsDeTextes(nombre = 20): Promise<Enveloppe<Scrutin[]>> {
  try {
    const lire = (motif: string) =>
      hemicycle<ReponseJeu>("/jeux/interroger", {
        methode: "POST",
        corps: {
          jeu: "scrutins",
          colonnes: ["uid", "numero", "legislature", "date_scrutin", "titre", "sort_code", "nb_pour", "nb_contre", "nb_abstentions", "nb_non_votants"],
          filtres: [{ colonne: "titre", op: "like", valeur: motif }],
          tri: "date_scrutin",
          ordre: "desc",
          limite: 200,
        },
        garder: (corps) => Array.isArray((corps as ReponseJeu | null)?.lignes) && ((corps as ReponseJeu).lignes?.length ?? 0) > 0,
      });
    const [projets, propositions] = await Promise.all([lire("ensemble du projet de loi"), lire("ensemble de la proposition de loi")]);

    const parTexte = new Map<string, Scrutin>();
    for (const reponse of [projets, propositions]) {
      const source = reponse.corps?.source;
      for (const ligne of reponse.corps?.lignes ?? []) {
        if (String(ligne.legislature) !== "17" || !ligne.uid || !ligne.titre) continue;
        const scrutin = normaliserScrutin({
          id: ligne.uid,
          numero: ligne.numero,
          date: ligne.date_scrutin,
          titre: ligne.titre,
          resultat: ligne.sort_code,
          decompte: {
            pour: ligne.nb_pour,
            contre: ligne.nb_contre,
            abstention: ligne.nb_abstentions,
            non_votants: ligne.nb_non_votants,
          },
          legislature: ligne.legislature,
          source: {
            editeur: source?.nom ?? "Assemblée nationale",
            url: `https://www.assemblee-nationale.fr/dyn/17/scrutins/${ligne.numero ?? ""}`,
            licence: source?.licence ?? "Licence Ouverte 2.0",
          },
        });
        const cle = cleTexte(scrutin.titre);
        const deja = parTexte.get(cle);
        // On garde le vote le plus récent sur chaque texte (lecture définitive plutôt que première lecture).
        if (!deja || scrutin.date > deja.date) parTexte.set(cle, scrutin);
      }
    }

    const textes = [...parTexte.values()].sort((a, b) => b.date.localeCompare(a.date));
    if (textes.length === 0) {
      throw new ErreurHemicycle(502, "reponse-vide", "Hémicycle a répondu, mais sans vote sur l'ensemble d'un texte : la liste affichée est un exemple.");
    }
    for (const scrutin of textes) scrutinsConnus.set(scrutin.id, scrutin);
    const derniere = projets.recuLe >= propositions.recuLe ? projets : propositions;
    return {
      data: diversifier(textes, nombre),
      meta: { ...meta(derniere), credits: { cout: (projets.credits.cout ?? 0) + (propositions.credits.cout ?? 0), restant: derniere.credits.restant } },
    };
  } catch (erreur) {
    return repli(SCRUTINS_EXEMPLE, erreur);
  }
}

export async function lireResultat(id: string): Promise<Enveloppe<ResultatScrutin | null>> {
  if (id.startsWith("EXEMPLE-")) return exemple(resultatExemple(id));
  // Protection des crédits : seuls les scrutins proposés par le site (la liste du test) peuvent être lus.
  // Une instance qui démarre relit d'abord la liste (mise en cache), puis refuse tout identifiant inconnu.
  if (scrutinsConnus.size === 0) await listerScrutinsDeTextes();
  if (scrutinsConnus.size > 0 && !scrutinsConnus.has(id)) {
    throw new ErreurHemicycle(404, "introuvable", "Ce scrutin ne fait pas partie des textes proposés par DemocratIA.");
  }
  try {
    const reponse = await hemicycle<unknown>(`/scrutins/${encodeURIComponent(id)}/resultat`);
    const resultat = normaliserResultat(reponse.corps);
    // Le résultat peut ne pas répéter la fiche du scrutin : on la reprend de la liste déjà lue.
    const connu = scrutinsConnus.get(id);
    if (!resultat.scrutin.id) {
      const { pour, contre, abstention, non_votants } = resultat.scrutin.decompte;
      const decompteLu = pour + contre + abstention + non_votants > 0;
      resultat.scrutin = connu
        ? { ...connu, decompte: decompteLu ? resultat.scrutin.decompte : connu.decompte }
        : { ...resultat.scrutin, id };
    }
    if (resultat.groupes.length === 0 && resultat.votes.length === 0) {
      throw new ErreurHemicycle(502, "reponse-vide", "Hémicycle a répondu, mais sans vote lisible pour ce scrutin.");
    }
    return { data: resultat, meta: meta(reponse) };
  } catch (erreur) {
    if (erreur instanceof ErreurHemicycle && erreur.statut === 404) throw erreur;
    return repli(null, erreur);
  }
}

/** Positions déjà lues, par scrutin : chaque nouveau vote du citoyen ne redemande que ce qui manque. */
const positionsConnues = new Map<string, { groupes: PositionGroupe[]; recuLe: string }>();

export async function positionsDesGroupes(ids: string[]): Promise<Enveloppe<PositionsParScrutin>> {
  const reels = [...new Set(ids.filter((id) => !id.startsWith("EXEMPLE-")))].slice(0, 100);
  if (reels.length === 0) return exemple(positionsExemple(ids));
  try {
    const manquants = reels.filter((id) => !positionsConnues.has(id));
    let reponse: ReponseHemicycle<unknown> | null = null;
    if (manquants.length > 0) {
      // L'ordre n'a pas de sens pour l'API : on trie pour que le cache serve la même liste.
      reponse = await hemicycle<unknown>("/agregats/positions-groupes", {
        methode: "POST",
        corps: { scrutins: [...manquants].sort() },
        garder: (corps) => Object.keys(normaliserPositionsGroupes(corps)).length > 0,
      });
      for (const [id, groupes] of Object.entries(normaliserPositionsGroupes(reponse.corps))) {
        positionsConnues.set(id, { groupes, recuLe: reponse.recuLe });
      }
    }
    const data: PositionsParScrutin = {};
    let recuLe = reponse?.recuLe ?? "";
    for (const id of reels) {
      const connue = positionsConnues.get(id);
      if (!connue) continue;
      data[id] = connue.groupes;
      if (!recuLe || connue.recuLe < recuLe) recuLe = connue.recuLe;
    }
    if (Object.keys(data).length === 0) {
      throw new ErreurHemicycle(502, "reponse-vide", "Hémicycle a répondu, mais sans position de groupe lisible.");
    }
    return { data, meta: reponse ? { ...meta(reponse), recuLe } : { origine: "cache", recuLe } };
  } catch (erreur) {
    return repli({}, erreur);
  }
}

export async function chercherDeputes(nom: string): Promise<Enveloppe<Depute[]>> {
  try {
    const reponse = await hemicycle<unknown>("/acteurs", { requete: { nom, limit: 8 } });
    return { data: donnees(reponse.corps).map(normaliserDepute).filter((d) => d.id), meta: meta(reponse) };
  } catch (erreur) {
    const filtre = nom.toLowerCase();
    return repli(
      DEPUTES_EXEMPLE.filter((d) => `${d.prenom} ${d.nom} ${d.groupe}`.toLowerCase().includes(filtre)),
      erreur,
    );
  }
}

export async function lireDepute(id: string): Promise<Enveloppe<Depute | null>> {
  if (id.startsWith("EXEMPLE-")) return exemple(DEPUTES_EXEMPLE.find((d) => d.id === id) ?? null);
  try {
    const reponse = await hemicycle<unknown>(`/acteurs/${encodeURIComponent(id)}`);
    const fiche = normaliserDepute(reponse.corps);
    if (!fiche.id && !fiche.nom) {
      throw new ErreurHemicycle(502, "reponse-vide", "Hémicycle a répondu, mais sans fiche lisible.");
    }
    return { data: fiche.id ? fiche : { ...fiche, id }, meta: meta(reponse) };
  } catch (erreur) {
    return repli(null, erreur);
  }
}

const premierNombre = (...candidats: unknown[]): number | null => {
  for (const candidat of candidats) if (typeof candidat === "number" && Number.isFinite(candidat)) return candidat;
  return null;
};

/**
 * Solde de crédits : appel gratuit, jamais mis en cache sur disque.
 * On le garde une minute en mémoire pour ne pas entamer le quota d'appels à chaque retour sur l'onglet.
 */
export async function soldeCredits(): Promise<number | null> {
  const recent = soldeMemorise(60_000);
  if (recent !== null) return recent;
  try {
    const reponse = await hemicycle<Record<string, unknown> | null>("/credits", { frais: true });
    const corps = reponse.corps && typeof reponse.corps === "object" ? reponse.corps : {};
    const interne = corps.data && typeof corps.data === "object" ? (corps.data as Record<string, unknown>) : {};
    const solde = premierNombre(
      corps.solde,
      corps.credits,
      corps.restant,
      corps.remaining,
      interne.solde,
      interne.credits,
      interne.restant,
      interne.remaining,
      reponse.credits.restant,
    );
    if (solde !== null) memoriserSolde(solde);
    return solde;
  } catch {
    return null;
  }
}
