"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useEffectEvent } from "react";

import { PositionLibelle } from "@/components/position";
import { SourceBadge } from "@/components/source-badge";
import { sourceCalcul } from "@/lib/concordance";
import { dateLongue, titreLisible } from "@/lib/format";
import { PRENOM_DEPUTE_IA } from "@/lib/sphere-mandat";
import { libelleTheme, themeDe } from "@/lib/themes";
import type { Position, Scrutin } from "@/lib/types";

/** Distance, en pixels, au-delà de laquelle un glissement vaut un vote. */
const SEUIL = 120;

const DEFINITION_THEME = "Thème déduit des mots de l'intitulé du texte. Une estimation, pas un classement officiel.";

const REPONSES: { position: Position; touche: string }[] = [
  { position: "contre", touche: "ArrowLeft" },
  { position: "abstention", touche: "ArrowDown" },
  { position: "pour", touche: "ArrowRight" },
];

const CADRE = "col-start-1 row-start-1 flex min-h-[19rem] flex-col rounded-lg border border-trait bg-surface p-6 sm:p-8";

const CARTE = {
  entree: { opacity: 0, scale: 0.96, y: 18 },
  posee: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.4, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] as const },
  },
  // La carte part du côté du geste : à droite pour, à gauche contre, vers le bas pour l'abstention.
  sortie: (geste: Position | null) => ({
    opacity: 0,
    x: geste === "pour" ? 420 : geste === "contre" ? -420 : 0,
    y: geste === "abstention" ? 150 : 0,
    scale: geste ? 1 : 0.96,
    transition: { duration: 0.32, ease: [0.4, 0, 0.8, 0.4] as const },
  }),
};

/** La pile : le texte en cours, les trois réponses, et le message de fin quand tout est tranché. */
export function PileTextes({
  scrutin,
  rang,
  total,
  enReserve,
  geste,
  onArbitrer,
}: {
  /** Le premier texte non arbitré, ou null quand tout est tranché. */
  scrutin: Scrutin | null;
  rang: number;
  total: number;
  /** Nombre de textes qui attendent derrière la carte en cours. */
  enReserve: number;
  geste: Position | null;
  onArbitrer: (position: Position) => void;
}) {
  const actif = scrutin !== null;

  const surTouche = useEffectEvent((evenement: KeyboardEvent) => {
    if (evenement.defaultPrevented || evenement.repeat) return;
    if (evenement.altKey || evenement.ctrlKey || evenement.metaKey || evenement.shiftKey) return;
    const reponse = REPONSES.find((r) => r.touche === evenement.key);
    if (!reponse) return;
    // Les flèches ne votent que si le clavier est sur la pile ou nulle part : ailleurs
    // (curseur de priorité, lien, bouton), elles gardent leur rôle habituel.
    const cible = evenement.target instanceof Element ? evenement.target : null;
    const nullePart = cible === null || cible === document.body || cible === document.documentElement;
    if (!nullePart && !cible.closest("[data-pile-textes]")) return;
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
        Textes à arbitrer
      </h2>
      <div className="flex items-center gap-4">
        <p className="shrink-0 text-sm tabular-nums text-attenue">
          {actif ? `Texte ${rang} sur ${total}` : `${total} textes arbitrés sur ${total}`}
        </p>
        <div aria-hidden className="h-px flex-1 bg-trait">
          <div
            className="h-px bg-texte transition-[width] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${((actif ? rang - 1 : total) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="relative mt-4">
        {/* Les tranches des textes suivants dépassent sous la carte : c'est une pile. */}
        {enReserve >= 2 ? (
          <span aria-hidden className="absolute inset-x-6 -bottom-4 h-6 rounded-b-lg border border-t-0 border-trait" />
        ) : null}
        {enReserve >= 1 ? (
          <span aria-hidden className="absolute inset-x-3 -bottom-2 h-6 rounded-b-lg border border-t-0 border-trait bg-surface" />
        ) : null}
        <div className="relative grid">
          <AnimatePresence custom={geste} initial={false}>
            {scrutin ? (
              <CarteTexte key={scrutin.id} scrutin={scrutin} onArbitrer={onArbitrer} />
            ) : (
              <CarteFin key="fin" total={total} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {actif ? (
        <>
          <div role="group" aria-label="Votre position sur ce texte" className="mt-9 grid grid-cols-3 gap-3">
            {REPONSES.map((reponse) => (
              <button
                key={reponse.position}
                type="button"
                aria-keyshortcuts={reponse.touche}
                onClick={() => onArbitrer(reponse.position)}
                className="flex min-h-14 items-center justify-center rounded-lg border border-trait bg-surface px-2 text-[15px] font-medium transition-colors duration-150 hover:border-texte active:bg-relief"
              >
                <PositionLibelle position={reponse.position} />
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-attenue">
            Vous pouvez aussi glisser la carte (à droite : pour, à gauche : contre) ou utiliser les flèches du clavier
            (gauche : contre, bas : abstention, droite : pour).
          </p>
        </>
      ) : null}
    </section>
  );
}

function CarteTexte({ scrutin, onArbitrer }: { scrutin: Scrutin; onArbitrer: (position: Position) => void }) {
  const x = useMotionValue(0);
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
      drag="x"
      dragSnapToOrigin
      onDragEnd={(_, geste) => {
        if (geste.offset.x > SEUIL) onArbitrer("pour");
        else if (geste.offset.x < -SEUIL) onArbitrer("contre");
      }}
    >
      {/* Pendant le glissement, la carte annonce le vote qu'elle va enregistrer. */}
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
      <h3 className="mt-4 text-balance font-titre text-[clamp(1.5rem,2.4vw,2rem)] font-medium leading-[1.18] tracking-[-0.02em]">
        {titreLisible(scrutin.titre)}
      </h3>

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

function CarteFin({ total }: { total: number }) {
  return (
    <motion.div className={CADRE} variants={CARTE} initial="entree" animate="posee" exit="sortie">
      <h3 className="font-titre text-[clamp(1.5rem,2.4vw,2rem)] font-medium leading-[1.18] tracking-[-0.02em]">
        Votre mandat est complet.
      </h3>
      <p className="mt-4 max-w-md text-[17px] leading-7 text-attenue">
        Vous avez tranché {total > 1 ? `les ${total} textes` : "le texte"}. {PRENOM_DEPUTE_IA} sait quoi voter à votre
        place, et elle ne changera pas d&apos;avis toute seule.
      </p>
      <p className="mt-auto pt-8">
        <Link
          href="/audit"
          className="inline-flex min-h-12 items-center rounded-full bg-texte px-6 font-medium text-fond transition-opacity duration-150 hover:opacity-80"
        >
          Comparer ce mandat aux votes d&apos;un député
        </Link>
      </p>
    </motion.div>
  );
}

/** Pendant la lecture des textes : la place de la carte est déjà là, vide. */
export function PileEnAttente() {
  return (
    <div role="status" className={`${CADRE} mt-9`}>
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
    <div role="alert" className={`${CADRE} mt-9`}>
      <h2 className="font-titre text-2xl font-medium">Les textes de loi n&apos;ont pas pu être lus.</h2>
      <p className="mt-3 text-[15px] leading-6 text-attenue">
        {message ?? "Vérifiez votre connexion."} Vos arbitrages déjà enregistrés sont conservés.
      </p>
      <p className="mt-auto pt-8">
        <button
          type="button"
          onClick={onReessayer}
          className="inline-flex min-h-12 items-center rounded-full border border-texte px-6 font-medium transition-colors duration-150 hover:bg-relief"
        >
          Réessayer
        </button>
      </p>
    </div>
  );
}

export function PileVide() {
  return (
    <div className={`${CADRE} mt-9`}>
      <h2 className="font-titre text-2xl font-medium">Aucun texte à arbitrer pour le moment.</h2>
      <p className="mt-3 text-[15px] leading-6 text-attenue">
        L&apos;Assemblée n&apos;a publié aucun vote sur l&apos;ensemble d&apos;un texte dans la période lue. Vous pouvez
        déjà régler les priorités de {PRENOM_DEPUTE_IA}, à droite.
      </p>
    </div>
  );
}
