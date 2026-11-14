"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { BoutonIA } from "@/components/bouton-ia";
import { Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { deCandidate } from "@/components/candidates/prenom";
import type { Candidate } from "@/lib/candidates";
import { THEMES } from "@/lib/themes";
import type { Position } from "@/lib/types";
import { cn } from "@/lib/utils";

type Statut = "repos" | "ecriture" | "termine" | "arrete" | "erreur";

interface Etat {
  statut: Statut;
  texte: string;
  origine: "featherless" | "exemple" | null;
  modele: string;
  raison: string;
  message: string;
  /** Date du jour de la rédaction (ISO 8601), lue au moment de la demande. */
  date: string | null;
}

const REPOS: Etat = { statut: "repos", texte: "", origine: null, modele: "", raison: "", message: "", date: null };

/** Les lignes grisées d'une feuille encore vierge : des largeurs fixes, pour un rendu identique au serveur. */
const LIGNES_EN_ATTENTE = ["w-11/12", "w-full", "w-10/12", "w-full", "w-8/12", "w-full", "w-11/12", "w-5/12"];

/** Une réponse refusée par la route : le message est déjà écrit pour le citoyen. */
class RefusDeLaRoute extends Error {}

function decoder(valeur: string | null): string {
  if (!valeur) return "";
  try {
    return decodeURIComponent(valeur);
  } catch {
    return valeur;
  }
}

export interface DemandeAmendement {
  titre: string;
  date: string;
  position: Position;
}

const EN_TETE = "AMENDEMENT N°";

/**
 * Le modèle ouvre son texte par « AMENDEMENT N° IA-1234 » : ce numéro monte dans l'en-tête de la feuille, et la ligne
 * quitte le corps. Tant que cette première ligne arrive, elle reste cachée, pour ne pas clignoter.
 */
function separer(texte: string): { numero: string | null; corps: string } {
  const debut = texte.trimStart();
  const ligne = /^AMENDEMENT\s+N\s*[°o]\.?\s*([^\n]*)(\n|$)/i.exec(debut);
  if (ligne) return { numero: ligne[2] ? ligne[1].trim() || null : null, corps: debut.slice(ligne[0].length).replace(/^\n+/, "") };
  if (debut && EN_TETE.startsWith(debut.toUpperCase())) return { numero: null, corps: "" };
  return { numero: null, corps: texte };
}

/** La petite sphère de l'en-tête : elle émet des ondes concentriques tant qu'elle rédige. */
function SphereEmettrice({ candidate, ecrit }: { candidate: Candidate; ecrit: boolean }) {
  const reduit = useReducedMotion();
  const couleur = candidate.teintes[1];
  return (
    <div className="relative size-12 shrink-0">
      {ecrit && !reduit
        ? [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: couleur }}
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: [1, 1.85], opacity: [0.5, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
            />
          ))
        : null}
      {ecrit && reduit ? (
        <span aria-hidden className="absolute -inset-1.5 rounded-full border" style={{ borderColor: couleur }} />
      ) : null}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: ecrit && !reduit ? [1, 1.06, 1] : 1 }}
        transition={{ duration: 1.2, repeat: ecrit && !reduit ? Infinity : 0, ease: "easeInOut" }}
      >
        <Sphere teintes={candidate.teintes} duree={ecrit ? 6 : 12} description={`La sphère ${deCandidate(candidate.prenom)}`} />
      </motion.div>
    </div>
  );
}

/**
 * L'amendement de l'IA présidente, dicté en direct sur une feuille d'amendement. Le texte arrive en flux : il s'écrit
 * dans la feuille au fur et à mesure, et la sphère de l'en-tête émet des ondes tant que la dictée dure. À remonter avec
 * une `key` propre au texte et à la position, pour qu'un nouvel amendement ne reste pas accroché à l'ancien.
 */
export function Amendement({
  demande,
  candidate,
}: {
  /** Absent tant qu'aucun texte n'est choisi. */
  demande: DemandeAmendement | null;
  /** L'IA présidente : c'est elle qui rédige, avec ses propres priorités. */
  candidate: Candidate;
}) {
  const { prenom, teintes } = candidate;
  const [etat, setEtat] = useState<Etat>(REPOS);
  const controleur = useRef<AbortController | null>(null);
  const ecrit = etat.statut === "ecriture";

  // Si la vue disparaît pendant la dictée, on coupe la connexion.
  useEffect(() => () => controleur.current?.abort(), []);

  async function demander() {
    if (!demande) return;
    controleur.current?.abort();
    const mien = new AbortController();
    controleur.current = mien;
    setEtat({ ...REPOS, statut: "ecriture", date: new Date().toISOString() });

    try {
      const reponse = await fetch("/api/amendement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: demande.titre,
          date: demande.date,
          position: demande.position,
          priorites: THEMES.map((theme) => ({ theme: theme.libelle, poids: candidate.poids[theme.id] })),
        }),
        signal: mien.signal,
      });
      if (!reponse.ok) {
        const corps = await reponse.json().catch(() => null);
        throw new RefusDeLaRoute(
          typeof corps?.erreur === "string" ? corps.erreur : `${prenom} n'a pas pu répondre (erreur ${reponse.status}).`,
        );
      }
      if (!reponse.body) throw new RefusDeLaRoute(`${prenom} n'a rien dicté. Réessayez dans un instant.`);

      const origine = reponse.headers.get("X-Democratia-Origine") === "featherless" ? "featherless" : "exemple";
      const modele = decoder(reponse.headers.get("X-Democratia-Modele"));
      const raison = decoder(reponse.headers.get("X-Democratia-Raison"));
      setEtat((avant) => ({ ...avant, origine, modele, raison }));

      const lecteur = reponse.body.getReader();
      const decodeur = new TextDecoder();
      for (;;) {
        const { done, value } = await lecteur.read();
        if (done) break;
        const morceau = decodeur.decode(value, { stream: true });
        if (morceau) setEtat((avant) => ({ ...avant, texte: avant.texte + morceau }));
      }
      const fin = decodeur.decode();
      setEtat((avant) =>
        (avant.texte + fin).trim()
          ? { ...avant, texte: avant.texte + fin, statut: "termine" }
          : { ...avant, statut: "erreur", message: `${prenom} n'a rien rédigé. Réessayez dans un instant.` },
      );
    } catch (erreur) {
      // Une demande plus récente a pris la place de celle-ci : elle seule a le droit d'écrire.
      if (controleur.current !== mien) return;
      if (mien.signal.aborted) {
        setEtat((avant) => (avant.statut === "ecriture" ? { ...avant, statut: "arrete" } : avant));
        return;
      }
      setEtat((avant) => ({
        ...avant,
        statut: "erreur",
        message:
          erreur instanceof RefusDeLaRoute
            ? erreur.message
            : `La connexion avec ${prenom} s'est coupée. Vérifiez votre réseau, puis réessayez.`,
      }));
    }
  }

  const aDuTexte = etat.texte.length > 0;
  const vierge = !ecrit && !aDuTexte;
  const { numero, corps } = separer(etat.texte);
  const statut = ecrit
    ? `${prenom} rédige…`
    : etat.statut === "termine"
      ? "Amendement déposé."
      : etat.statut === "arrete"
        ? "Dictée arrêtée : texte incomplet."
        : "";

  return (
    <article
      aria-label={`Amendement ${deCandidate(prenom)}`}
      className="rounded-lg border border-trait bg-fond shadow-[0_1px_2px_rgb(17_19_24/0.04)]"
    >
      {/* L'en-tête de la feuille, façon document parlementaire. */}
      <header className="flex items-center gap-4 border-b border-trait px-5 py-4 sm:px-8">
        <SphereEmettrice candidate={candidate} ecrit={ecrit} />
        <div className="min-w-0 flex-1">
          <p className="font-donnee text-[13px] leading-5 tracking-[0.04em] text-texte uppercase">
            Amendement n° <span className="whitespace-nowrap">{numero ?? "IA-…"}</span>
          </p>
          <p className="text-[15px] leading-6 text-attenue">
            Présenté par <span className="font-medium text-texte">{prenom}</span>, présidente IA
          </p>
        </div>
        {/* Le statut, annoncé poliment ; l'emplacement reste réservé pour que l'en-tête ne saute pas. */}
        <p role="status" className="sr-only text-sm leading-5 whitespace-nowrap text-attenue sm:not-sr-only">
          {statut}
        </p>
      </header>

      {demande ? (
        <p className="border-b border-trait px-5 py-3 text-sm leading-6 text-attenue sm:px-8">
          <span className="font-medium text-texte">Objet :</span> {demande.titre}
        </p>
      ) : null}

      <div className="relative px-5 py-6 sm:px-8 sm:py-7">
        {vierge ? (
          <>
            {/* La feuille vierge : des lignes en attente, et l'action au centre. */}
            <div aria-hidden className="space-y-3.5">
              {LIGNES_EN_ATTENTE.map((largeur, i) => (
                <div key={i} className={cn("h-2 rounded-full bg-relief", largeur)} />
              ))}
            </div>
            <div className="absolute inset-0 grid place-items-center px-5">
              <div className="flex max-w-md flex-col items-center gap-3 rounded-xl bg-fond/95 px-6 py-5 text-center">
                {etat.statut === "erreur" ? (
                  <p role="alert" className="text-[15px] leading-6 text-texte">
                    {etat.message}
                  </p>
                ) : null}
                <BoutonIA teintes={teintes} onClick={() => void demander()} desactive={!demande}>
                  {etat.statut === "erreur" ? "Réessayer" : "Rédiger l'amendement"}
                </BoutonIA>
                {etat.statut !== "erreur" ? (
                  <p className="text-sm leading-5 text-attenue">{prenom} l&apos;écrit en direct, selon ses priorités.</p>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div
            aria-live="polite"
            aria-busy={ecrit}
            className={cn(
              "min-h-44 font-donnee text-[14px] leading-7 whitespace-pre-wrap text-texte [overflow-wrap:anywhere] sm:text-[15px]",
              ecrit && "curseur-machine",
            )}
          >
            {ecrit || corps.trim() ? corps : etat.texte}
          </div>
        )}
      </div>

      {!vierge ? (
        <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-trait px-5 py-4 sm:px-8">
          <div className="min-w-0 space-y-1">
            {statut ? (
              <p aria-hidden className="text-sm leading-5 text-texte sm:hidden">
                {statut}
              </p>
            ) : null}
            {etat.statut === "erreur" ? (
              <p role="alert" className="text-sm leading-5 text-texte">
                {etat.message}
              </p>
            ) : null}
            {aDuTexte && !ecrit && etat.origine === "featherless" ? (
              <SourceBadge
                source={{
                  editeur: `${etat.modele || "Un modèle de langage"}, via Featherless`,
                  url: null,
                  licence: "Fiction, sans valeur juridique",
                  date: etat.date,
                  nature: "generee",
                }}
              />
            ) : null}
            {aDuTexte && etat.origine === "exemple" ? (
              <p className="flex items-center gap-2 text-xs leading-5 text-attenue">
                <span aria-hidden className="size-2 shrink-0 rounded-full border border-dashed border-attenue" />
                {etat.raison || "Texte d'exemple : le modèle de langage n'a pas répondu."}
              </p>
            ) : null}
            {ecrit && etat.origine === null ? <p className="text-xs leading-5 text-attenue">Connexion au modèle…</p> : null}
          </div>
          {ecrit ? (
            <BoutonIA variante="contour" teintes={teintes} onClick={() => controleur.current?.abort()}>
              Arrêter
            </BoutonIA>
          ) : (
            <BoutonIA variante="contour" teintes={teintes} onClick={() => void demander()} desactive={!demande}>
              {etat.statut === "erreur" ? "Réessayer" : "Réécrire l'amendement"}
            </BoutonIA>
          )}
        </footer>
      ) : null}
    </article>
  );
}
