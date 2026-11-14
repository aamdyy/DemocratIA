"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useState, useSyncExternalStore } from "react";

import { BoutonIA } from "@/components/bouton-ia";
import type { Teintes } from "@/components/sphere";
import { DOUX, DUREE } from "@/lib/animation";
import { liensIntention, TITRE_PARTAGE } from "@/lib/partage";

const sansAbonnement = () => () => {};

/** L'adresse du site vue par le navigateur ; vide pendant le rendu serveur (les liens restent relatifs). */
const useOrigine = () =>
  useSyncExternalStore(
    sansAbonnement,
    () => window.location.origin,
    () => "",
  );

/** Vrai quand le navigateur propose sa feuille de partage (téléphones, certains navigateurs de bureau). */
const usePartageNatif = () =>
  useSyncExternalStore(
    sansAbonnement,
    () => typeof navigator.share === "function",
    () => false,
  );

const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";

const PASTILLE = `inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-trait bg-fond px-4 text-sm font-medium text-texte transition-[border-color,background-color,scale] duration-150 hover:border-texte active:scale-[0.97] motion-reduce:active:scale-100 ${FOCUS}`;

type Etat = "repos" | "copie" | "echec";

/**
 * Le partage : un message modifiable, un bouton principal (la feuille de partage du téléphone, ou la
 * copie du lien), les réseaux en simples liens d'intention, et l'aperçu de l'image qui accompagnera le lien.
 * Rien n'est envoyé ailleurs : le navigateur ouvre l'adresse publique du réseau choisi, c'est tout.
 */
export function PanneauPartage({
  chemin,
  texteInitial,
  apercu,
  teintes,
  libelleNatif = "Partager",
}: {
  /** Chemin de la page partagée (« /invitation/hygie?a=84 »). */
  chemin: string;
  texteInitial: string;
  /** Chemin de l'image de partage, montrée en miniature. */
  apercu?: string;
  teintes?: Teintes;
  libelleNatif?: string;
}) {
  const origine = useOrigine();
  const natif = usePartageNatif();
  const [texte, setTexte] = useState(texteInitial);
  const [etat, setEtat] = useState<Etat>("repos");
  const idTexte = useId();
  const lien = `${origine}${chemin}`;

  // La confirmation s'efface d'elle-même.
  useEffect(() => {
    if (etat !== "copie") return;
    const minuterie = setTimeout(() => setEtat("repos"), 2600);
    return () => clearTimeout(minuterie);
  }, [etat]);

  async function copier() {
    try {
      await navigator.clipboard.writeText(lien);
      setEtat("copie");
    } catch {
      setEtat("echec");
    }
  }

  async function partager() {
    if (natif) {
      try {
        await navigator.share({ title: TITRE_PARTAGE, text: texte, url: lien });
        return;
      } catch (erreur) {
        // Fermer la feuille de partage n'est pas une erreur ; tout autre refus retombe sur la copie.
        if (erreur instanceof DOMException && erreur.name === "AbortError") return;
      }
    }
    await copier();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={idTexte} className="text-sm text-attenue">
          Votre message
        </label>
        <textarea
          id={idTexte}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          rows={3}
          maxLength={280}
          className={`field-sizing-content min-h-20 w-full resize-none rounded-2xl border border-trait bg-fond px-4 py-3 text-base leading-6 text-texte transition-colors duration-150 hover:border-attenue focus-visible:border-texte ${FOCUS}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <BoutonIA onClick={() => void partager()} teintes={teintes}>
          {natif ? libelleNatif : "Copier le lien"}
        </BoutonIA>
        {natif ? (
          <button type="button" onClick={() => void copier()} className={PASTILLE}>
            Copier le lien
          </button>
        ) : null}
        <p role="status" aria-live="polite" className="text-[15px] leading-6">
          <AnimatePresence mode="wait" initial={false}>
            {etat === "copie" ? (
              <motion.span
                key="copie"
                className="inline-flex min-h-11 items-center gap-2 text-texte"
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: DUREE.etat, ease: DOUX }}
              >
                <motion.svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M3 8.5 6.5 12 13 4.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: DUREE.etat, delay: 0.08, ease: DOUX }}
                  />
                </motion.svg>
                Lien copié
              </motion.span>
            ) : etat === "echec" ? (
              <motion.span
                key="echec"
                className="inline-flex min-h-11 flex-wrap items-center gap-x-2 text-attenue"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DUREE.etat, ease: DOUX }}
              >
                Copie impossible, voici le lien :
                <span className="select-all break-all text-texte">{lien}</span>
              </motion.span>
            ) : null}
          </AnimatePresence>
        </p>
      </div>

      <div>
        <p className="text-sm text-attenue">Ou partager sur</p>
        <ul role="list" className="mt-2 flex flex-wrap gap-2">
          {liensIntention(texte, lien).map(({ nom, href }) => {
            const courriel = href.startsWith("mailto:");
            return (
              <li key={nom}>
                <a
                  href={href}
                  target={courriel ? undefined : "_blank"}
                  rel={courriel ? undefined : "noopener noreferrer"}
                  aria-label={courriel ? "Envoyer par e-mail" : `Partager sur ${nom} (nouvel onglet)`}
                  className={PASTILLE}
                >
                  {nom}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {apercu ? <ApercuPartage src={apercu} /> : null}
    </div>
  );
}

/** La miniature de l'image de partage : ce que verra la personne qui reçoit le lien. */
export function ApercuPartage({ src, className }: { src: string; className?: string }) {
  return (
    <figure className={`flex flex-col gap-2 ${className ?? ""}`}>
      <figcaption className="text-sm text-attenue">L&apos;image qui accompagnera le lien</figcaption>
      {/* Une image servie par le site, déjà à la bonne taille : l'optimiseur d'images n'apporterait rien. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Aperçu de l'image de partage"
        width={1200}
        height={630}
        loading="lazy"
        decoding="async"
        className="aspect-[1200/630] h-auto w-full max-w-[22rem] rounded-xl border border-trait bg-fond object-cover"
      />
    </figure>
  );
}
