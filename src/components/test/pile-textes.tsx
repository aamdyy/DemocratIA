"use client";

import { AnimatePresence, motion, useIsPresent, useMotionValue, useTransform } from "motion/react";
import { useEffect, useEffectEvent, useRef } from "react";

import { PositionLibelle } from "@/components/position";
import { SourceBadge } from "@/components/source-badge";
import { sourceCalcul } from "@/lib/concordance";
import { dateLongue, titreLisible } from "@/lib/format";
import { libelleTheme, themeDe } from "@/lib/themes";
import type { Position, Scrutin } from "@/lib/types";

/** Distance, en pixels, au-delà de laquelle un glissement vaut une réponse. */
const SEUIL = 120;

/** Sens de la dernière réponse : la carte sort de ce côté. « passe » la fait partir vers le haut. */
export type Geste = Position | "passe" | null;

const DEFINITION_THEME = "Thème déduit des mots de l'intitulé du texte. Une estimation, pas un classement officiel.";

const REPONSES: { position: Position; touche: string }[] = [
  { position: "contre", touche: "ArrowLeft" },
  { position: "abstention", touche: "ArrowDown" },
  { position: "pour", touche: "ArrowRight" },
];

const CADRE = "col-start-1 row-start-1 flex min-h-[19rem] flex-col border border-trait bg-surface p-6 sm:p-8";

const TITRE = "text-balance font-titre text-[clamp(1.5rem,2.4vw,2rem)] font-semibold leading-[1.12] tracking-[-0.03em]";

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

      <div className="relative mt-3 grid">
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
          <div role="group" aria-label="Votre position sur ce texte" className="mt-8 grid grid-cols-3 gap-3">
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
          <div className="mt-3 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onPasser}
              className="inline-flex min-h-11 items-center px-3 text-[15px] font-medium underline decoration-trait underline-offset-4 transition-colors hover:decoration-current"
            >
              Passer
            </button>
            {peutAnnuler ? (
              <button
                type="button"
                onClick={onAnnuler}
                className="inline-flex min-h-11 items-center px-3 text-sm text-attenue underline decoration-trait underline-offset-4 transition-colors hover:text-texte hover:decoration-current"
              >
                Revenir au texte précédent
              </button>
            ) : null}
          </div>
          <p className="mt-4 text-sm leading-6 text-attenue">
            Glissez la carte à droite pour voter pour, à gauche pour voter contre. Au clavier : flèche gauche (contre),
            flèche droite (pour), flèche bas (abstention, depuis un bouton).
          </p>
        </>
      ) : peutAnnuler ? (
        <p className="mt-4">
          <button
            type="button"
            onClick={onAnnuler}
            className="inline-flex min-h-11 items-center px-3 text-sm text-attenue underline decoration-trait underline-offset-4 transition-colors hover:text-texte hover:decoration-current"
          >
            Revenir au texte précédent
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
        className="pointer-events-none absolute left-5 top-5 border border-pour bg-surface px-3 py-1.5 text-sm font-medium"
      >
        <PositionLibelle position="pour" />
      </motion.span>
      <motion.span
        aria-hidden
        style={{ opacity: marqueContre }}
        className="pointer-events-none absolute right-5 top-5 border border-contre bg-surface px-3 py-1.5 text-sm font-medium"
      >
        <PositionLibelle position="contre" />
      </motion.span>

      <p className="text-sm text-attenue">
        {scrutin.numero ? `Scrutin n° ${scrutin.numero}, ` : "Scrutin "}
        du {dateLongue(scrutin.date)}
      </p>
      <h3 className={`mt-4 ${TITRE}`}>{titreLisible(scrutin.titre)}</h3>

      <div className="mt-auto space-y-3 pt-8">
        <div>
          <p className="font-donnee text-sm text-machine">Thème estimé : {libelleTheme(themeDe(scrutin.titre))}</p>
          <SourceBadge source={sourceCalcul(DEFINITION_THEME)} className="mt-1" />
        </div>
        <SourceBadge source={scrutin.source} className="border-t border-trait pt-3" />
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
      <p className="mt-4 max-w-md text-[17px] leading-7 text-attenue">
        Il reste une dernière étape : dire ce qui compte le plus pour vous.
      </p>
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

/** Pendant la lecture des textes : la place de la carte est déjà là, vide. */
export function PileEnAttente() {
  return (
    <div role="status" className={CADRE}>
      <p className="text-sm text-attenue">Lecture des textes de loi…</p>
      <div aria-hidden className="mt-5 space-y-3 motion-safe:animate-pulse">
        <div className="h-7 w-11/12 bg-relief" />
        <div className="h-7 w-8/12 bg-relief" />
      </div>
    </div>
  );
}

export function PileEnErreur({ message, onReessayer }: { message: string | null; onReessayer: () => void }) {
  return (
    <div role="alert" className={CADRE}>
      <h2 className="font-titre text-2xl font-semibold tracking-[-0.03em]">Les textes de loi n&apos;ont pas pu être lus.</h2>
      <p className="mt-3 text-[15px] leading-6 text-attenue">
        {message ?? "Vérifiez votre connexion."} Vos réponses déjà enregistrées sont conservées.
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
      <h2 className="font-titre text-2xl font-semibold tracking-[-0.03em]">Aucun texte à trancher pour le moment.</h2>
      <p className="mt-3 text-[15px] leading-6 text-attenue">
        L&apos;Assemblée n&apos;a publié aucun vote sur l&apos;ensemble d&apos;un texte dans la période lue. Vous pouvez
        déjà régler vos priorités.
      </p>
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
