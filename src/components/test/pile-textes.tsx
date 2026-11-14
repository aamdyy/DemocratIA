"use client";

import {
  AnimatePresence,
  motion,
  useIsPresent,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useEffectEvent, useRef } from "react";

import { BoutonIA } from "@/components/bouton-ia";
import { BarreEmpilee } from "@/components/graphiques";
import { PositionLibelle } from "@/components/position";
import { Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import type { Candidate } from "@/lib/candidates";
import { nombre, titreLisible } from "@/lib/format";
import { libelleTheme, themeDe } from "@/lib/themes";
import type { Position, Scrutin } from "@/lib/types";

/** Distance, en pixels, au-delà de laquelle un glissement vaut une réponse. */
const SEUIL = 120;

/** Durée du retour après une réponse, en millisecondes. */
export const DUREE_RETOUR = 1200;

/** Sens de la dernière réponse : la carte sort de ce côté. « passe » la fait partir vers le haut. */
export type Geste = Position | "passe" | null;

/** Ce que le citoyen vient de répondre, et ce qu'en dit l'Assemblée et les IA. */
export interface Retour {
  scrutin: Scrutin;
  position: Position;
  /** Les IA candidates qui ont voté comme lui. */
  comme: Candidate[];
}

const REPONSES: { position: Position; touche: string }[] = [
  { position: "contre", touche: "ArrowLeft" },
  { position: "abstention", touche: "ArrowDown" },
  { position: "pour", touche: "ArrowRight" },
];

/** Les touches qui servent à naviguer ne passent pas le retour. */
const TOUCHES_NEUTRES = new Set(["Tab", "Shift", "Control", "Alt", "Meta", "CapsLock", "Escape"]);

const CADRE =
  "col-start-1 row-start-1 flex min-h-[18rem] flex-col rounded-2xl border border-trait bg-surface p-6 sm:p-8";

const TITRE = "text-balance font-titre text-[clamp(1.5rem,3.2vw,2.125rem)] font-semibold leading-[1.12] tracking-[-0.03em]";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-republique";

const BOUTON_DISCRET = `inline-flex min-h-11 items-center px-3 text-[15px] text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current disabled:pointer-events-none disabled:opacity-60 ${FOCUS}`;

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

/** Le retour apparaît à la place de la carte et s'efface sur place. */
const RETOUR = {
  entree: { opacity: 0, y: 14 },
  posee: { opacity: 1, y: 0, transition: { duration: 0.28, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] as const } },
  sortie: { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn" as const } },
};

/** La pile : le texte en cours, trois réponses, « Passer », et le retour instantané après chaque réponse. */
export function PileTextes({
  scrutin,
  retour,
  geste,
  peutAnnuler,
  onArbitrer,
  onPasser,
  onAnnuler,
  onContinuer,
  onTerminer,
}: {
  /** Le premier texte sans réponse, ou null quand tout est répondu. */
  scrutin: Scrutin | null;
  /** Le retour à afficher à la place de la carte, ou null. */
  retour: Retour | null;
  geste: Geste;
  peutAnnuler: boolean;
  onArbitrer: (position: Position) => void;
  onPasser: () => void;
  onAnnuler: () => void;
  onContinuer: () => void;
  onTerminer: () => void;
}) {
  const actif = scrutin !== null || retour !== null;

  const surTouche = useEffectEvent((evenement: KeyboardEvent) => {
    if (evenement.defaultPrevented || evenement.repeat) return;
    if (evenement.altKey || evenement.ctrlKey || evenement.metaKey) return;
    // Gauche et droite répondent si le clavier est sur la pile ou nulle part. Ailleurs (lien, bouton
    // hors de la pile), les flèches gardent leur rôle. La flèche du bas fait défiler la page : elle
    // ne répond que lorsque le clavier est déjà dans la pile.
    const cible = evenement.target instanceof Element ? evenement.target : null;
    const nullePart = cible === null || cible === document.body || cible === document.documentElement;
    const dansLaPile = cible !== null && cible.closest("[data-pile-textes]") !== null;

    // Pendant le retour, n'importe quelle touche passe à la carte suivante.
    if (retour) {
      if (TOUCHES_NEUTRES.has(evenement.key) || (!dansLaPile && !nullePart)) return;
      evenement.preventDefault();
      onContinuer();
      return;
    }

    if (evenement.shiftKey) return;
    const reponse = REPONSES.find((r) => r.touche === evenement.key);
    if (!reponse) return;
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

      <div className="relative grid pb-2">
        {/* Une carte qui dépasse derrière : il en reste d'autres à trancher. */}
        {actif ? <div aria-hidden className="col-start-1 row-start-1 translate-y-2 scale-[0.95] rounded-2xl border border-trait" /> : null}
        <AnimatePresence custom={geste} initial={false}>
          {retour ? (
            <CarteRetour key={`retour-${retour.scrutin.id}`} retour={retour} onContinuer={onContinuer} />
          ) : scrutin ? (
            <CarteTexte key={scrutin.id} scrutin={scrutin} onArbitrer={onArbitrer} />
          ) : (
            <CarteFin key="fin" prendreLeFocus={geste !== null} onTerminer={onTerminer} />
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
                className={`flex min-h-14 items-center justify-center rounded-full border border-trait bg-surface px-2 text-[15px] font-medium transition-colors duration-150 hover:border-texte active:bg-relief ${FOCUS}`}
              >
                <PositionLibelle position={reponse.position} />
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between gap-4">
            <button type="button" onClick={onAnnuler} disabled={!peutAnnuler} className={`-ml-3 ${BOUTON_DISCRET}`}>
              Revenir
            </button>
            <button type="button" onClick={onPasser} className={`-mr-3 ${BOUTON_DISCRET}`}>
              Passer
            </button>
          </div>
        </>
      ) : peutAnnuler ? (
        <p className="mt-2">
          <button type="button" onClick={onAnnuler} className={`-ml-3 ${BOUTON_DISCRET}`}>
            Revenir
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
  const rotate = useTransform(x, [-320, 320], [-7, 7]);
  const marquePour = useTransform(x, [24, SEUIL], [0, 1]);
  const marqueContre = useTransform(x, [-SEUIL, -24], [1, 0]);
  // Pendant le geste, la carte vire au bleu (pour) ou au rouge (contre). Le libellé reste le vrai signal.
  const fond = useTransform(x, [-SEUIL, 0, SEUIL], ["#fde5e7", "#ffffff", "#e5eafc"]);
  const bord = useTransform(x, [-SEUIL, 0, SEUIL], ["#e1000f", "#e3e5ea", "#1d3fd8"]);

  return (
    <motion.article
      className={`${CADRE} relative cursor-grab touch-pan-y select-none active:cursor-grabbing`}
      style={{ x, rotate, backgroundColor: fond, borderColor: bord }}
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
        className="pointer-events-none absolute -top-3.5 right-6 rounded-full border border-pour bg-surface px-3 py-1.5 text-sm font-medium"
      >
        <PositionLibelle position="pour" />
      </motion.span>
      <motion.span
        aria-hidden
        style={{ opacity: marqueContre }}
        className="pointer-events-none absolute -top-3.5 left-6 rounded-full border border-contre bg-surface px-3 py-1.5 text-sm font-medium"
      >
        <PositionLibelle position="contre" />
      </motion.span>

      <h3 className={TITRE}>{titreLisible(scrutin.titre)}</h3>

      <div className="mt-auto space-y-1.5 pt-8">
        <p className="font-donnee text-xs text-machine">Thème estimé : {libelleTheme(themeDe(scrutin.titre))}</p>
        <SourceBadge source={scrutin.source} />
      </div>
    </motion.article>
  );
}

/**
 * Le retour instantané : ce que l'Assemblée a vraiment décidé, et quelles IA ont voté comme vous.
 * Il part seul au bout de DUREE_RETOUR ; un clic ou une touche le passe.
 */
function CarteRetour({ retour, onContinuer }: { retour: Retour; onContinuer: () => void }) {
  const reduit = useReducedMotion();
  const { scrutin, position, comme } = retour;
  const { pour, contre, abstention } = scrutin.decompte;
  const verbe = scrutin.resultat === "adopte" ? "adopté" : "rejeté";

  return (
    <motion.div
      className={`${CADRE} relative cursor-pointer overflow-hidden`}
      variants={RETOUR}
      initial="entree"
      animate="posee"
      exit="sortie"
      onClick={onContinuer}
    >
      <p className="flex items-center gap-2 text-sm text-attenue">
        Vous : <PositionLibelle position={position} className="font-medium text-texte" />
      </p>

      <h3 className="mt-4 text-balance font-titre text-[clamp(1.25rem,2.6vw,1.625rem)] font-semibold leading-[1.2] tracking-[-0.02em]">
        L&apos;Assemblée a {verbe} ce texte : {nombre(pour)} pour, {nombre(contre)} contre
      </h3>

      <div className="mt-4">
        <BarreEmpilee
          etiquette={`Résultat du scrutin : ${nombre(pour)} pour, ${nombre(abstention)} abstentions, ${nombre(contre)} contre`}
          segments={[
            { libelle: "Pour", valeur: pour, fond: "bg-pour" },
            { libelle: "Abstention", valeur: abstention, fond: "bg-abstention" },
            { libelle: "Contre", valeur: contre, fond: "bg-contre" },
          ]}
        />
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums text-attenue">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-pour" />
            Pour {nombre(pour)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-abstention" />
            Abstention {nombre(abstention)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-contre" />
            Contre {nombre(contre)}
          </span>
        </p>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-2 pt-6 text-[15px]">
        {comme.length > 0 ? (
          <>
            <span className="text-attenue">Comme vous :</span>
            {comme.map((candidate, i) => (
              <span key={candidate.id} className="inline-flex items-center gap-1.5 font-semibold">
                <Sphere teintes={candidate.teintes} duree={9 + i * 2} className="size-5" />
                {candidate.prenom}
                {i < comme.length - 1 ? <span className="sr-only">,</span> : null}
              </span>
            ))}
          </>
        ) : (
          <span className="text-attenue">Aucune IA n&apos;a voté comme vous.</span>
        )}
      </div>

      {/* Le temps qu'il reste, en un trait. */}
      {reduit ? null : (
        <motion.span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-texte/25"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: DUREE_RETOUR / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

function CarteFin({ prendreLeFocus, onTerminer }: { prendreLeFocus: boolean; onTerminer: () => void }) {
  // Le dernier bouton de réponse disparaît avec la carte : le clavier se pose sur le message de fin.
  const titre = useRef<HTMLHeadingElement>(null);
  const poserLeFocus = useEffectEvent(() => {
    if (prendreLeFocus) titre.current?.focus({ preventScroll: true });
  });
  useEffect(() => poserLeFocus(), []);

  return (
    <motion.div className={CADRE} variants={CARTE} initial="entree" animate="posee" exit="sortie">
      <h3 ref={titre} tabIndex={-1} className={`${TITRE} outline-none`}>
        Tous les textes sont parcourus.
      </h3>
      <p className="mt-auto pt-8">
        <BoutonIA onClick={onTerminer}>Passer aux dilemmes</BoutonIA>
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
        <div className="h-7 w-11/12 rounded bg-relief" />
        <div className="h-7 w-8/12 rounded bg-relief" />
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
      <p className="mt-3 max-w-md text-base leading-7 text-attenue">{message ?? "Vérifiez votre connexion."}</p>
      <p className="mt-auto pt-8">
        <BoutonIA variante="contour" onClick={onReessayer}>
          Réessayer
        </BoutonIA>
      </p>
    </div>
  );
}

export function PileVide({ onTerminer }: { onTerminer: () => void }) {
  return (
    <div className={CADRE}>
      <h2 className={TITRE}>Aucun texte à trancher pour le moment.</h2>
      <p className="mt-auto pt-8">
        <BoutonIA onClick={onTerminer}>Passer aux dilemmes</BoutonIA>
      </p>
    </div>
  );
}
