import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = "https://api.hemicycle.ai/v1";
const VERSION = "2026-10-01";

/**
 * Les réponses sont gardées sur disque : la démo ne dépense un crédit qu'une fois par requête,
 * et elle continue de tourner si le réseau ou le quota lâche à 19 h.
 */
const DOSSIER_CACHE = path.join(process.cwd(), "data", "cache-hemicycle");

export class ErreurHemicycle extends Error {
  constructor(
    public statut: number,
    public code: string,
    message: string,
    public requestId?: string,
  ) {
    super(message);
    this.name = "ErreurHemicycle";
  }
}

export interface ReponseHemicycle<T> {
  corps: T;
  origine: "api" | "cache";
  recuLe: string;
  credits: { cout: number | null; restant: number | null };
}

interface Options {
  methode?: "GET" | "POST";
  requete?: Record<string, string | number | undefined>;
  corps?: unknown;
  /** Ignore le cache, en lecture comme en écriture : la réponse est relue à chaque fois. */
  frais?: boolean;
  /** Dit si une réponse 200 mérite d'être gardée. Une réponse vide ne doit pas figer le cache. */
  garder?: (corps: unknown) => boolean;
}

interface EntreeCache {
  requete: { methode: string; chemin: string; corps?: unknown };
  recuLe: string;
  credits: { cout: number | null; restant: number | null };
  corps: unknown;
}

export function cleHemicycle(): string | null {
  const cle = process.env.HEMICYCLE_API_KEY?.trim();
  return cle ? cle : null;
}

export function natureCle(): "absente" | "test" | "production" {
  const cle = cleHemicycle();
  if (!cle) return "absente";
  return cle.startsWith("hmc_test_") ? "test" : "production";
}

/** Un message d'erreur part vers le navigateur : on en retire tout ce qui ressemble à une clé. */
function sansCle(message: string): string {
  const cle = cleHemicycle();
  const propre = cle ? message.split(cle).join("[clé masquée]") : message;
  return propre.replace(/hmc_(test|live)_[A-Za-z0-9_-]+/g, "[clé masquée]");
}

function cheminComplet(chemin: string, requete?: Options["requete"]): string {
  const params = new URLSearchParams();
  for (const [nom, valeur] of Object.entries(requete ?? {})) {
    if (valeur !== undefined && valeur !== "") params.set(nom, String(valeur));
  }
  params.sort();
  const suffixe = params.toString();
  return suffixe ? `${chemin}?${suffixe}` : chemin;
}

function fichierCache(methode: string, chemin: string, corps: unknown): string {
  const empreinte = createHash("sha1")
    .update(JSON.stringify([methode, chemin, corps ?? null]))
    .digest("hex")
    .slice(0, 16);
  const lisible = chemin.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  return path.join(DOSSIER_CACHE, `${lisible}-${empreinte}.json`);
}

function nombre(valeur: string | null): number | null {
  if (valeur === null || valeur.trim() === "") return null;
  const n = Number(valeur);
  return Number.isFinite(n) ? n : null;
}

const attendre = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Dernier solde lu dans un en-tête X-Credits-Remaining : évite de rappeler /credits sans cesse. */
let soldeConnu: { valeur: number; le: number } | null = null;

export function soldeMemorise(ageMaxMs: number): number | null {
  return soldeConnu && Date.now() - soldeConnu.le <= ageMaxMs ? soldeConnu.valeur : null;
}

export function memoriserSolde(valeur: number) {
  soldeConnu = { valeur, le: Date.now() };
}

async function lireCache(fichier: string): Promise<EntreeCache | null> {
  try {
    const entree = JSON.parse(await readFile(fichier, "utf8")) as Partial<EntreeCache> | null;
    // Un fichier tronqué ou d'une autre forme compte comme absent.
    if (!entree || typeof entree !== "object" || entree.corps === undefined || entree.corps === null) return null;
    return {
      requete: entree.requete ?? { methode: "", chemin: "" },
      recuLe: typeof entree.recuLe === "string" ? entree.recuLe : new Date(0).toISOString(),
      credits: { cout: entree.credits?.cout ?? null, restant: entree.credits?.restant ?? null },
      corps: entree.corps,
    };
  } catch {
    return null;
  }
}

/** Écrit dans un fichier provisoire puis renomme : un lecteur ne voit jamais un fichier à moitié écrit. */
async function ecrireCache(fichier: string, entree: EntreeCache) {
  const provisoire = `${fichier}.${process.pid}-${randomUUID().slice(0, 8)}.tmp`;
  try {
    await mkdir(DOSSIER_CACHE, { recursive: true });
    await writeFile(provisoire, JSON.stringify(entree, null, 2), "utf8");
    await rename(provisoire, fichier);
  } catch {
    // Disque en lecture seule (hébergement) : on sert la réponse sans la garder.
    await unlink(provisoire).catch(() => {});
  }
}

/** Appels en cours, par fichier de cache : deux vues qui demandent la même chose ne paient qu'une fois. */
const enCours = new Map<string, Promise<ReponseHemicycle<unknown>>>();

export async function hemicycle<T>(chemin: string, options: Options = {}): Promise<ReponseHemicycle<T>> {
  const methode = options.methode ?? "GET";
  const complet = cheminComplet(chemin, options.requete);
  const fichier = fichierCache(methode, complet, options.corps);

  if (!options.frais) {
    const entree = await lireCache(fichier);
    if (entree) {
      return { corps: entree.corps as T, origine: "cache", recuLe: entree.recuLe, credits: entree.credits };
    }
  }

  const dejaParti = enCours.get(fichier);
  if (dejaParti) return dejaParti as Promise<ReponseHemicycle<T>>;

  const appel = appeler(methode, complet, fichier, options).finally(() => enCours.delete(fichier));
  enCours.set(fichier, appel);
  return appel as Promise<ReponseHemicycle<T>>;
}

async function appeler(
  methode: string,
  complet: string,
  fichier: string,
  options: Options,
): Promise<ReponseHemicycle<unknown>> {
  const cle = cleHemicycle();
  if (!cle) {
    throw new ErreurHemicycle(401, "cle-absente", "HEMICYCLE_API_KEY n'est pas renseignée dans .env.local.");
  }

  // Seules les erreurs 429, 500 et 503 justifient une nouvelle tentative (doc Hémicycle, « Erreurs »).
  for (let essai = 0; ; essai++) {
    const reponse = await fetch(`${BASE}${complet}`, {
      method: methode,
      headers: {
        Authorization: `Bearer ${cle}`,
        "Hemicycle-Version": VERSION,
        Accept: "application/json",
        ...(options.corps !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: options.corps !== undefined ? JSON.stringify(options.corps) : undefined,
      signal: AbortSignal.timeout(20_000),
    });

    const credits = {
      cout: nombre(reponse.headers.get("X-Credits-Cost")),
      restant: nombre(reponse.headers.get("X-Credits-Remaining")),
    };
    if (credits.restant !== null) memoriserSolde(credits.restant);

    if (reponse.ok) {
      const corps: unknown = await reponse.json().catch(() => null);
      if (corps === null || corps === undefined) {
        // Un 200 sans JSON lisible n'est pas une donnée : on ne le garde pas et on le dit.
        throw new ErreurHemicycle(502, "reponse-illisible", "Hémicycle a répondu sans contenu lisible.");
      }
      const entree: EntreeCache = {
        requete: { methode, chemin: complet, corps: options.corps },
        recuLe: new Date().toISOString(),
        credits,
        corps,
      };
      if (!options.frais && (options.garder?.(corps) ?? true)) await ecrireCache(fichier, entree);
      return { corps, origine: "api", recuLe: entree.recuLe, credits };
    }

    const reessayable = reponse.status === 429 || reponse.status === 500 || reponse.status === 503;
    const demande = Number(reponse.headers.get("Retry-After"));
    const delai = Number.isFinite(demande) && demande > 0 ? demande : 2 ** essai;
    // Un quota épuisé annonce une longue attente : inutile de faire patienter la vue, on passe au repli.
    if (reessayable && essai < 2 && delai <= 5) {
      await reponse.body?.cancel().catch(() => {});
      await attendre(delai * 1000);
      continue;
    }

    const probleme = (await reponse.json().catch(() => ({}))) as {
      type?: unknown;
      title?: unknown;
      detail?: unknown;
      request_id?: unknown;
    } | null;
    const champ = (valeur: unknown) => (typeof valeur === "string" && valeur.trim() ? valeur.trim() : undefined);
    const type = champ(probleme?.type);
    throw new ErreurHemicycle(
      reponse.status,
      type?.split(/[#/]/).filter(Boolean).pop() ?? `http-${reponse.status}`,
      sansCle(
        [champ(probleme?.title), champ(probleme?.detail)].filter(Boolean).join(" — ") ||
          `Hémicycle a répondu ${reponse.status}.`,
      ).slice(0, 300),
      champ(probleme?.request_id),
    );
  }
}
