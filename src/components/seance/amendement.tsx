"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { deCandidate } from "@/components/candidates/prenom";
import type { Candidate } from "@/lib/candidates";
import { THEMES } from "@/lib/themes";
import type { Position } from "@/lib/types";
import { cn } from "@/lib/utils";

const PILULE =
  "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full px-7 text-[15px] font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors duration-150 focus-visible:outline-texte disabled:cursor-not-allowed disabled:opacity-40";
const PILULE_NOIRE = `${PILULE} bg-texte text-fond hover:bg-texte/85`;
const PILULE_CLAIRE = `${PILULE} border border-texte text-texte hover:bg-relief`;

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

/**
 * L'amendement de l'IA présidente, dicté en direct. Le texte arrive en flux : il s'écrit à l'écran au fur et à mesure,
 * et la sphère émet des ondes tant que la dictée dure. À remonter avec une `key` propre au texte et à la position,
 * pour qu'un nouvel amendement ne reste pas accroché à l'ancien.
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
  const reduit = useReducedMotion();
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
  const couleur = teintes[1];

  return (
    <div className="grid items-start gap-x-12 gap-y-8 lg:grid-cols-[14rem_1fr]">
      <div className="relative mx-auto size-44 sm:size-56 lg:mx-0">
        {/* Des ondes concentriques quittent la sphère tant qu'elle dicte. */}
        {ecrit && !reduit
          ? [0, 1, 2].map((i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute inset-[16%] rounded-full border"
                style={{ borderColor: couleur }}
                animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
              />
            ))
          : null}
        {ecrit && reduit ? (
          <span aria-hidden className="absolute inset-[12%] rounded-full border" style={{ borderColor: couleur }} />
        ) : null}
        <motion.div
          className="absolute inset-[16%]"
          animate={{ scale: ecrit && !reduit ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 1.2, repeat: ecrit && !reduit ? Infinity : 0, ease: "easeInOut" }}
        >
          <Sphere teintes={teintes} duree={ecrit ? 7 : 14} description={`La sphère ${deCandidate(prenom)}`} />
        </motion.div>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-4">
          {ecrit ? (
            <button type="button" onClick={() => controleur.current?.abort()} className={PILULE_CLAIRE}>
              Arrêter
            </button>
          ) : (
            <button type="button" onClick={() => void demander()} disabled={!demande} className={PILULE_NOIRE}>
              {etat.statut === "erreur"
                ? "Réessayer"
                : aDuTexte
                  ? "Réécrire l'amendement"
                  : "Rédiger l'amendement"}
            </button>
          )}
          <p role="status" className="text-[15px] leading-6 text-attenue">
            {ecrit
              ? `${prenom} rédige…`
              : etat.statut === "termine"
                ? "Amendement déposé."
                : etat.statut === "arrete"
                  ? "Dictée arrêtée : texte incomplet."
                  : null}
          </p>
        </div>

        {ecrit || aDuTexte ? (
          <div
            aria-busy={ecrit}
            className={cn(
              "mt-8 min-h-40 border-l-2 pl-6 font-donnee text-[15px] leading-7 whitespace-pre-wrap text-texte [overflow-wrap:anywhere]",
              ecrit && "curseur-machine",
            )}
            style={{ borderColor: couleur }}
          >
            {etat.texte}
          </div>
        ) : null}

        {etat.statut === "erreur" ? (
          <p role="alert" className="mt-6 rounded-md bg-relief px-4 py-3 text-[15px] leading-6 text-texte">
            {etat.message}
          </p>
        ) : null}

        {aDuTexte && !ecrit && etat.origine === "featherless" ? (
          <SourceBadge
            className="mt-6"
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
          <p className="mt-6 flex items-center gap-2 text-xs leading-5 text-attenue">
            <span aria-hidden className="size-2 shrink-0 rounded-full border border-dashed border-attenue" />
            {etat.raison || "Texte d'exemple : le modèle de langage n'a pas répondu."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
