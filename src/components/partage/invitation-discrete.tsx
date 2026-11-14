"use client";

import { useId, useRef } from "react";

import { cn } from "@/lib/utils";
import { useClassement } from "@/lib/ma-candidate";
import {
  affiniteEntiere,
  cheminImageInvitation,
  cheminInvitation,
  TEXTE_INVITATION_GENERIQUE,
  texteMonIA,
} from "@/lib/partage";

import { PanneauPartage } from "./panneau-partage";

const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";

/**
 * Une ligne discrète, « Invitez quelqu'un à passer le test », qui ouvre le partage dans une fenêtre.
 * Test fini : le lien d'invitation personnalisé (l'IA du citoyen et son pourcentage).
 * Sinon : un lien vers le test, avec un texte d'invitation générique.
 */
export function InvitationDiscrete({ className }: { className?: string }) {
  const fenetre = useRef<HTMLDialogElement>(null);
  const idTitre = useId();
  const { classement, regle, chargement } = useClassement();
  const tete = regle && !chargement ? classement[0] : null;
  const pourcent = tete ? affiniteEntiere(tete.score) : null;

  const partage = tete
    ? {
        chemin: cheminInvitation(tete.candidate.id, pourcent),
        texte: texteMonIA(tete.candidate, pourcent ?? 0),
        apercu: cheminImageInvitation(tete.candidate.id, pourcent),
      }
    : { chemin: "/test", texte: TEXTE_INVITATION_GENERIQUE, apercu: "/opengraph-image" };

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => fenetre.current?.showModal()}
        className={cn(
          "inline-flex min-h-11 items-center px-3 text-[15px] text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current",
          FOCUS,
          className,
        )}
      >
        Invitez quelqu&apos;un à passer le test
      </button>

      <dialog
        ref={fenetre}
        aria-labelledby={idTitre}
        // Un clic sur le voile, autour de la fenêtre, la referme.
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className={cn(
          "m-auto w-[min(34rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-trait bg-fond p-0 text-left text-texte shadow-[0_24px_64px_-24px_rgb(17_19_24/0.35)]",
          "opacity-0 translate-y-3 transition-[opacity,translate,display,overlay] duration-300 ease-out transition-discrete",
          "open:opacity-100 open:translate-y-0 starting:open:opacity-0 starting:open:translate-y-3",
          "backdrop:bg-[rgb(17_19_24/0)] backdrop:transition-[background-color,display,overlay] backdrop:duration-300 backdrop:transition-discrete open:backdrop:bg-[rgb(17_19_24/0.28)] starting:open:backdrop:bg-[rgb(17_19_24/0)]",
          "motion-reduce:translate-y-0 motion-reduce:transition-none motion-reduce:backdrop:transition-none",
        )}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2
              id={idTitre}
              className="font-titre text-2xl font-semibold leading-tight tracking-[-0.03em] text-balance"
            >
              {tete ? `Invitez quelqu'un à comparer avec ${tete.candidate.prenom}` : "Invitez quelqu'un à passer le test"}
            </h2>
            <form method="dialog">
              <button
                type="submit"
                aria-label="Fermer"
                className={cn(
                  "-mr-2 -mt-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-attenue transition-colors duration-150 hover:bg-relief hover:text-texte",
                  FOCUS,
                )}
              >
                <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round">
                  <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
                </svg>
              </button>
            </form>
          </div>
          <div className="mt-6">
            <PanneauPartage
              key={partage.chemin}
              chemin={partage.chemin}
              texteInitial={partage.texte}
              apercu={partage.apercu}
              teintes={tete?.candidate.teintes}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
