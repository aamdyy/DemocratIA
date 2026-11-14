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

const estVoteSurUnTexte = (scrutin: Scrutin) => /^l['’]ensemble\b/i.test(scrutin.titre);

/** Scrutins déjà lus dans la liste : sert à compléter un résultat qui ne répète pas l'intitulé. */
const scrutinsConnus = new Map<string, Scrutin>();

/**
 * Les scrutins que le citoyen arbitre dans la vue 1 : des votes sur l'ensemble d'un texte,
 * plus parlants qu'un amendement isolé. Quatre pages au plus, soit 4 crédits, une seule fois.
 */
export async function listerScrutinsDeTextes(nombre = 12): Promise<Enveloppe<Scrutin[]>> {
  try {
    const parId = new Map<string, Scrutin>();
    let curseur: string | undefined;
    let derniere: ReponseHemicycle<unknown> | null = null;
    for (let page = 0; page < 4; page++) {
      let reponse: ReponseHemicycle<{ next_cursor?: unknown; has_more?: unknown } | null>;
      try {
        reponse = await hemicycle("/scrutins", {
          requete: { legislature: 17, limit: 100, cursor: curseur },
          // Une liste vide ne doit pas rester figée dans le cache.
          garder: (corps) => donnees(corps).length > 0,
        });
      } catch (erreur) {
        // La première page est indispensable ; une page suivante qui échoue ne fait pas perdre les précédentes.
        if (page === 0) throw erreur;
        break;
      }
      derniere = reponse;
      const avant = parId.size;
      for (const scrutin of donnees(reponse.corps).map(normaliserScrutin)) {
        if (scrutin.id && !parId.has(scrutin.id)) parId.set(scrutin.id, scrutin);
      }
      if ([...parId.values()].filter(estVoteSurUnTexte).length >= nombre) break;
      // Une page qui n'apporte rien de neuf (curseur ignoré) arrête la lecture : on ne paie pas pour des doublons.
      if (parId.size === avant) break;
      const suivant = reponse.corps?.next_cursor;
      if (reponse.corps?.has_more === false || typeof suivant !== "string" || !suivant || suivant === curseur) break;
      curseur = suivant;
    }
    const tous = [...parId.values()];
    if (tous.length === 0 || !derniere) {
      throw new ErreurHemicycle(
        502,
        "reponse-vide",
        "Hémicycle a répondu, mais sans aucun scrutin lisible : la liste affichée est un exemple.",
      );
    }
    for (const scrutin of tous) scrutinsConnus.set(scrutin.id, scrutin);
    const textes = tous.filter(estVoteSurUnTexte);
    const retenus = (textes.length >= 4 ? textes : tous).slice(0, nombre);
    return { data: retenus, meta: meta(derniere) };
  } catch (erreur) {
    return repli(SCRUTINS_EXEMPLE, erreur);
  }
}

export async function lireResultat(id: string): Promise<Enveloppe<ResultatScrutin | null>> {
  if (id.startsWith("EXEMPLE-")) return exemple(resultatExemple(id));
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
