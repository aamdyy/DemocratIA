"use client";

import { AnimatePresence, motion, useIsPresent, useMotionValue, useTransform } from "motion/react";
import { useEffect, useEffectEvent, useRef } from "react";

import { PositionLibelle } from "@/components/position";
import { SourceBadge } from "@/components/source-badge";
import { dateLongue, titreLisible } from "@/lib/format";
import { libelleTheme, themeDe } from "@/lib/themes";
import type { Position, Scrutin } from "@/lib/types";

/** Distance, en pixels, au-delà de laquelle un glissement vaut une réponse. */
const SEUIL = 120;

/** Sens de la dernière réponse : la carte sort de ce côté. « passe » la fait partir vers le haut. */
export type Geste = Position | "passe" | null;

const REPONSES: { position: Position; touche: string }[] = [
  { position: "contre", touche: "ArrowLeft" },
  { position: "abstention", touche: "ArrowDown" },
  { position: "pour", touche: "ArrowRight" },
];

const CADRE =
  "col-start-1 row-start-1 flex min-h-[17rem] flex-col rounded-2xl border border-trait bg-surface p-6 sm:p-8";

const TITRE = "text-balance font-titre text-[clamp(1.375rem,2.4vw,1.75rem)] font-semibold leading-[1.15] tracking-[-0.03em]";

const BOUTON_DISCRET =
  "inline-flex min-h-11 items-center px-3 text-[15px] text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current disabled:pointer-events-none disabled:opacity-60";

const CARTE = {
  entree: { opacity: 0, scale: 0.96, y: 18 },
  posee: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.4, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] as const },
  },
  sortie: (geste: Geste) => ({
    opacity: 0,
    x: geste === "pour" ? 420 : geste === "contre" ? -420 : 0,
    y: geste === "abstention" ? 150 : geste === "passe" ? -60 : 0,
    scale: geste ? 1 : 0.96,
    transition: { duration: 0.32, ease: [0.4, 0, 0.8, 0.4] as const },
  }),
};

/** La pile : le texte en cours, trois réponses, « Passer », et le message de fin quand tout est répondu. */
export function PileTextes({
  scrutin,
  rang,
  total,
  geste,
  peutAnnuler,
  onArbitrer,
  onPasser,
  onAnnuler,
  onTerminer,
}: {
  /** Le premier texte sans réponse, ou null quand tout est répondu. */
  scrutin: Scrutin | null;
  rang: number;
  total: number;
  geste: Geste;
  peutAnnuler: boolean;
  onArbitrer: (position: Position) => void;
  onPasser: () => void;
  onAnnuler: () => void;
  onTerminer: () => void;
}) {
  const actif = scrutin !== null;

  const surTouche = useEffectEvent((evenement: KeyboardEvent) => {
    if (evenement.defaultPrevented || evenement.repeat) return;
    if (evenement.altKey || evenement.ctrlKey || evenement.metaKey || evenement.shiftKey) return;
    const reponse = REPONSES.find((r) => r.touche === evenement.key);
    if (!reponse) return;
    // Gauche et droite répondent si le clavier est sur la pile ou nulle part. Ailleurs (lien, bouton
    // hors de la pile), les flèches gardent leur rôle. La flèche du bas fait défiler la page : elle
    // ne répond que lorsque le clavier est déjà dans la pile.
    const cible = evenement.target instanceof Element ? evenement.target : null;
    const nullePart = cible === null || cible === document.body || cible === document.documentElement;
    const dansLaPile = cible !== null && cible.closest("[data-pile-textes]") !== null;
    if (!dansLaPile && !(nullePart && evenement.key !== "ArrowDown")) return;
    evenement.preventDefault();
    onArbitrer(reponse.position);
  });

  useEffect(() => {
    if (!actif) return;
    const ecouter = (evenement: KeyboardEvent) => surTouche(evenement);
    window.addEventListener("keydown", ecouter);
    return () => window.removeEventListener("keydown", ecouter);
  }, [actif]);

  return (
    <section aria-labelledby="titre-pile" data-pile-textes>
      <h2 id="titre-pile" className="sr-only">
        Textes à trancher
      </h2>
      <p className="text-sm tabular-nums text-attenue">
        {actif ? `Texte ${rang} sur ${total}` : `${total} textes sur ${total}`}
      </p>

      <div className="relative mt-3 grid pb-2">
        {/* Une carte qui dépasse derrière : il en reste d'autres à trancher. */}
        {actif && rang < total ? (
          <div aria-hidden className="col-start-1 row-start-1 translate-y-2 scale-[0.95] rounded-2xl border border-trait" />
        ) : null}
        <AnimatePresence custom={geste} initial={false}>
          {scrutin ? (
            <CarteTexte key={scrutin.id} scrutin={scrutin} onArbitrer={onArbitrer} />
          ) : (
            <CarteFin key="fin" total={total} prendreLeFocus={geste !== null} onTerminer={onTerminer} />
          )}
        </AnimatePresence>
      </div>

      {actif ? (
        <>
          <div role="group" aria-label="Votre position sur ce texte" className="mt-6 grid grid-cols-3 gap-3">
            {REPONSES.map((reponse) => (
              <button
                key={reponse.position}
                type="button"
                aria-keyshortcuts={reponse.touche}
                onClick={() => onArbitrer(reponse.position)}
                className="flex min-h-14 items-center justify-center rounded-full border border-trait bg-surface px-2 text-[15px] font-medium transition-colors duration-150 hover:border-texte active:bg-relief"
              >
                <PositionLibelle position={reponse.position} />
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between gap-4">
            <button type="button" onClick={onAnnuler} disabled={!peutAnnuler} className={`-ml-3 ${BOUTON_DISCRET}`}>
              Revenir en arrière
            </button>
            <button type="button" onClick={onPasser} className={`-mr-3 ${BOUTON_DISCRET}`}>
              Passer ce texte
            </button>
          </div>
        </>
      ) : peutAnnuler ? (
        <p className="mt-2">
          <button type="button" onClick={onAnnuler} className={`-ml-3 ${BOUTON_DISCRET}`}>
            Revenir en arrière
          </button>
        </p>
      ) : null}
    </section>
  );
}

function CarteTexte({ scrutin, onArbitrer }: { scrutin: Scrutin; onArbitrer: (position: Position) => void }) {
  const x = useMotionValue(0);
  // Une carte en train de sortir ne doit plus rien enregistrer : elle ne répond pas pour le texte suivant.
  const presente = useIsPresent();
  const rotate = useTransform(x, [-320, 320], [-6, 6]);
  const marquePour = useTransform(x, [24, SEUIL], [0, 1]);
  const marqueContre = useTransform(x, [-SEUIL, -24], [1, 0]);

  return (
    <motion.article
      className={`${CADRE} relative cursor-grab touch-pan-y select-none active:cursor-grabbing`}
      style={{ x, rotate }}
      variants={CARTE}
      initial="entree"
      animate="posee"
      exit="sortie"
      drag={presente ? "x" : false}
      dragSnapToOrigin
      onDragEnd={(_, mouvement) => {
        if (!presente) return;
        if (mouvement.offset.x > SEUIL) onArbitrer("pour");
        else if (mouvement.offset.x < -SEUIL) onArbitrer("contre");
      }}
    >
      {/* Pendant le glissement, la carte annonce la réponse qu'elle va enregistrer. */}
      <motion.span
        aria-hidden
        style={{ opacity: marquePour }}
        className="pointer-events-none absolute left-5 top-5 rounded-full border border-pour bg-surface px-3 py-1.5 text-sm font-medium"
      >
        <PositionLibelle position="pour" />
      </motion.span>
      <motion.span
        aria-hidden
        style={{ opacity: marqueContre }}
        className="pointer-events-none absolute right-5 top-5 rounded-full border border-contre bg-surface px-3 py-1.5 text-sm font-medium"
      >
        <PositionLibelle position="contre" />
      </motion.span>

      <p className="text-sm text-attenue">
        {scrutin.numero ? `Scrutin n° ${scrutin.numero}, ` : "Scrutin "}
        du {dateLongue(scrutin.date)}
      </p>
      <h3 className={`mt-3 ${TITRE}`}>{titreLisible(scrutin.titre)}</h3>

      <div className="mt-auto space-y-3 pt-6">
        <p className="font-donnee text-sm text-machine">Thème estimé : {libelleTheme(themeDe(scrutin.titre))}</p>
        <SourceBadge source={scrutin.source} />
      </div>
    </motion.article>
  );
}

function CarteFin({
  total,
  prendreLeFocus,
  onTerminer,
}: {
  total: number;
  prendreLeFocus: boolean;
  onTerminer: () => void;
}) {
  // Le dernier bouton de réponse disparaît avec la carte : le clavier se pose sur le message de fin.
  const titre = useRef<HTMLHeadingElement>(null);
  const poserLeFocus = useEffectEvent(() => {
    if (prendreLeFocus) titre.current?.focus({ preventScroll: true });
  });
  useEffect(() => poserLeFocus(), []);

  return (
    <motion.div className={CADRE} variants={CARTE} initial="entree" animate="posee" exit="sortie">
      <h3 ref={titre} tabIndex={-1} className={`${TITRE} outline-none`}>
        {total > 1 ? `Vous avez parcouru les ${total} textes.` : "Vous avez parcouru le texte."}
      </h3>
      <p className="mt-auto pt-8">
        <button
          type="button"
          onClick={onTerminer}
          className="inline-flex h-14 items-center rounded-full bg-texte px-8 font-medium text-fond transition-opacity duration-150 hover:opacity-80"
        >
          Régler mes priorités
        </button>
      </p>
    </motion.div>
  );
}

/** Pendant la lecture des textes : la place de la carte est déjà là, vide, aux mêmes dimensions. */
export function PileEnAttente() {
  return (
    <div role="status" className={CADRE}>
      <p className="text-sm text-attenue">Lecture des textes de loi…</p>
      <div aria-hidden className="mt-5 space-y-3 motion-safe:animate-pulse">
        <div className="h-6 w-11/12 rounded bg-relief" />
        <div className="h-6 w-8/12 rounded bg-relief" />
      </div>
      <div aria-hidden className="mt-auto pt-8 motion-safe:animate-pulse">
        <div className="h-4 w-1/2 rounded bg-relief" />
      </div>
    </div>
  );
}

export function PileEnErreur({ message, onReessayer }: { message: string | null; onReessayer: () => void }) {
  return (
    <div role="alert" className={CADRE}>
      <h2 className={TITRE}>Les textes de loi n&apos;ont pas pu être lus.</h2>
      <p className="mt-3 max-w-md text-base leading-7 text-attenue">
        {message ?? "Vérifiez votre connexion."}
      </p>
      <p className="mt-auto pt-8">
        <button
          type="button"
          onClick={onReessayer}
          className="inline-flex h-12 items-center rounded-full border border-texte px-6 font-medium transition-colors duration-150 hover:bg-relief"
        >
          Réessayer
        </button>
      </p>
    </div>
  );
}

export function PileVide({ onTerminer }: { onTerminer: () => void }) {
  return (
    <div className={CADRE}>
      <h2 className={TITRE}>Aucun texte à trancher pour le moment.</h2>
      <p className="mt-auto pt-8">
        <button
          type="button"
          onClick={onTerminer}
          className="inline-flex h-14 items-center rounded-full bg-texte px-8 font-medium text-fond transition-opacity duration-150 hover:opacity-80"
        >
          Régler mes priorités
        </button>
      </p>
    </div>
  );
}
