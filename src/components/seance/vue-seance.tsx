"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { AvisExemple } from "@/components/avis-exemple";
import { BarreEmpilee, type Segment } from "@/components/graphiques";
import { BoutonIA } from "@/components/bouton-ia";
import { Hemicycle, NOMBRE_SIEGES } from "@/components/hemicycle";
import { Chiffre } from "@/components/candidates/chiffre";
import { deCandidate } from "@/components/candidates/prenom";
import { titreCourt } from "@/components/candidates/titre";
import { PositionLibelle } from "@/components/position";
import { Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { useResultat, useScrutins } from "@/lib/api";
import { CASCADE, DOUX, DUREE, ENTREE, RESSORT, VUE } from "@/lib/animation";
import { CANDIDATES, REGLE_POSITION, positionCandidate, type Candidate } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";
import { nombre } from "@/lib/format";
import { useClassement } from "@/lib/ma-candidate";
import { useMandat } from "@/lib/mandat";
import type { Position, ResultatScrutin } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Amendement } from "./amendement";
import {
  ADOPTION_SIMULEE,
  ETATS_2050,
  definitionSimulation,
  etatsDeLAssemblee2026,
  simuler2050,
  type Simulation2050,
} from "./calcul";
import { SelecteurTexte } from "./selecteur-texte";
import { TableauGroupes } from "./tableau-groupes";

type Seance = "2026" | "2050";

const H2 = "font-titre text-2xl font-semibold leading-8 tracking-[-0.03em] text-texte";

/** Pas entre deux sièges qui changent de couleur : la vague traverse les 577 sièges en un temps de scène et demi. */
const PAS_SIEGE_MS = 2.6;
/** Durée de la vague complète, en secondes : les compteurs défilent pendant ce temps, le verdict tombe à la fin. */
const VAGUE = (NOMBRE_SIEGES * PAS_SIEGE_MS) / 1000;

/** Entrée d'un bloc quand il arrive à l'écran en défilant. */
const A_LA_VUE = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: VUE,
  transition: ENTREE.transition,
} as const;

const sansAbonnement = () => () => {};
/** Faux pendant le rendu serveur : le mandat vit dans le navigateur, on ne conclut rien avant de l'avoir lu. */
const useNavigateur = () =>
  useSyncExternalStore(
    sansAbonnement,
    () => true,
    () => false,
  );

const adopte = (resultat: "adopte" | "rejete") => (resultat === "adopte" ? "Adopté" : "Rejeté");

function Attente({ libelle, hauteur = "h-40" }: { libelle: string; hauteur?: string }) {
  return (
    <div role="status">
      <span className="sr-only">{libelle}</span>
      <div aria-hidden className={cn("rounded-md bg-relief motion-safe:animate-pulse", hauteur)} />
    </div>
  );
}

function Panne({ titre, detail, onReessayer }: { titre: string; detail: string; onReessayer: () => void }) {
  return (
    <div role="alert" className="rounded-md bg-relief px-5 py-5">
      <p className="font-medium text-texte">{titre}</p>
      <p className="mt-1 text-[15px] leading-6 text-attenue">{detail}</p>
      <BoutonIA variante="contour" onClick={onReessayer} className="mt-4">
        Réessayer
      </BoutonIA>
    </div>
  );
}

/** La bascule : l'Assemblée de 2026, puis l'hémicycle de 2050. La pastille noire glisse d'un côté à l'autre. */
function ChoixSeance({
  seance,
  invite,
  onChoisir,
}: {
  seance: Seance;
  /** Vrai tant que le visiteur n'a jamais basculé : un point respire sur 2050 pour l'y inviter. */
  invite: boolean;
  onChoisir: (seance: Seance) => void;
}) {
  return (
    <div role="group" aria-label="Choisir la séance" className="flex w-full gap-1 rounded-full bg-relief p-1 md:w-fit">
      {(
        [
          ["2026", "Assemblée de 2026"],
          ["2050", "Hémicycle de 2050"],
        ] as const
      ).map(([valeur, libelle]) => (
        <button
          key={valeur}
          type="button"
          aria-pressed={seance === valeur}
          onClick={() => onChoisir(valeur)}
          className={cn(
            "relative inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-full px-3 text-[15px] font-medium outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte active:scale-[0.98] sm:px-6 md:flex-none",
            seance === valeur ? "text-fond" : "text-attenue hover:text-texte",
          )}
        >
          {seance === valeur ? (
            <motion.span
              layoutId="seance-pastille"
              transition={RESSORT}
              aria-hidden
              className="absolute inset-0 rounded-full bg-texte"
            />
          ) : null}
          <span className="relative">{libelle}</span>
          {invite && valeur === "2050" ? (
            <span aria-hidden className="relative ml-2 inline-flex size-2">
              <span className="absolute inset-0 rounded-full bg-machine opacity-60 motion-safe:animate-ping" />
              <span className="relative size-2 rounded-full bg-machine" />
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/**
 * L'hémicycle et, en 2050, la sphère de l'IA présidente qui se lève au creux de l'arc (comme dans la maquette 08).
 * La variable --machine donne aux 577 sièges la couleur dominante de sa sphère.
 */
function ScenePublique({
  etats,
  description,
  seance,
  candidate,
  attente = false,
}: {
  etats: Parameters<typeof Hemicycle>[0]["etats"];
  description: string;
  seance: Seance;
  candidate: Candidate;
  /** Vrai tant que les votes ne sont pas lus : les sièges gris respirent doucement. */
  attente?: boolean;
}) {
  const machine = seance === "2050";
  const reduit = useReducedMotion();
  return (
    <div
      className={cn("@container relative mx-auto w-full max-w-3xl overflow-hidden", attente && "motion-safe:animate-pulse")}
      style={{ "--machine": candidate.teintes[1], "--pas-siege": `${PAS_SIEGE_MS}ms` } as React.CSSProperties}
    >
      <Hemicycle etats={etats} description={description} className="block w-full" />
      {/* L'onde : au passage en 2050, un anneau à la couleur de l'IA part du creux de l'arc et balaie les gradins. */}
      <AnimatePresence>
        {machine && !reduit ? (
          <motion.span
            key={`onde-${candidate.id}`}
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 aspect-square w-[18cqw] -translate-x-1/2 translate-y-1/2 rounded-full border-[0.6cqw]"
            style={{ borderColor: candidate.teintes[1] }}
            initial={{ scale: 0.6, opacity: 0.7 }}
            animate={{ scale: 6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: VAGUE, ease: DOUX }}
          />
        ) : null}
      </AnimatePresence>
      <motion.div
        aria-hidden
        className="absolute -bottom-[7.4cqw] left-1/2 w-[18cqw] -translate-x-1/2 @2xl:-bottom-[8.9cqw] @2xl:w-[21cqw]"
        initial={false}
        animate={{ y: machine ? "0%" : "55%", opacity: machine ? 1 : 0, scale: machine ? 1 : 0.85 }}
        transition={{ duration: DUREE.scene, ease: DOUX }}
      >
        <Sphere teintes={candidate.teintes} duree={12} />
      </motion.div>
      <motion.p
        aria-hidden
        className="absolute bottom-[11.4cqw] left-1/2 -translate-x-1/2 text-[13px] leading-none font-semibold @2xl:bottom-[13.8cqw] @2xl:text-[length:2.2cqw]"
        initial={false}
        animate={{ opacity: machine ? 1 : 0, y: machine ? 0 : 6 }}
        transition={{ duration: DUREE.entree, delay: machine ? DUREE.etat : 0, ease: DOUX }}
      >
        {candidate.prenom}
      </motion.p>
    </div>
  );
}

/** « 95 abstentions », « 1 abstention » : le libellé s'accorde avec le nombre. */
const accorder = (libelle: string, valeur: number) =>
  libelle === "Abstention" && valeur > 1 ? "abstentions" : libelle.toLowerCase();

/** Une ligne de comparaison : un titre, sa barre empilée, ses chiffres lisibles en toutes lettres. */
function LigneDecompte({
  titre,
  issue,
  segments,
  machine = false,
  children,
}: {
  titre: string;
  issue: string;
  segments: Segment[];
  machine?: boolean;
  children?: React.ReactNode;
}) {
  const lisible = segments.filter((s) => s.valeur > 0).map((s) => `${s.valeur} ${accorder(s.libelle, s.valeur)}`);
  return (
    <div>
      <p className={cn("flex flex-wrap items-baseline justify-between gap-x-4 text-[15px] leading-6", machine && "font-donnee text-machine")}>
        <span className="font-medium">{titre}</span>
        <span className="font-semibold">{issue}</span>
      </p>
      <BarreEmpilee
        className="mt-3 h-5"
        segments={segments}
        etiquette={`${titre} : ${issue.toLowerCase()}, ${lisible.join(", ")}`}
      />
      <ul role="list" className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-sm leading-5 tabular-nums text-attenue">
        {segments
          .filter((s) => s.valeur > 0)
          .map((s) => (
            <li key={s.libelle} className="inline-flex items-center gap-1.5">
              <span aria-hidden className={cn("size-2 rounded-full", s.fond)} />
              <span className="font-medium text-texte">{nombre(s.valeur)}</span> {accorder(s.libelle, s.valeur)}
            </li>
          ))}
      </ul>
      {children}
    </div>
  );
}

/** Un filet vertical entre deux mentions ; les lecteurs d'écran n'en entendent rien. */
function Filet() {
  return <li aria-hidden className="h-3.5 w-px bg-trait" />;
}

/** Le décompte réel de 2026 face au résultat simulé de 2050, en deux barres empilées de même échelle. */
function Decomptes({
  candidate,
  position,
  simulation,
  reel,
  dateCalcul,
}: {
  candidate: Candidate;
  position: Position;
  simulation: Simulation2050;
  reel: ResultatScrutin | null;
  dateCalcul: string | null;
}) {
  const { prenom } = candidate;
  const fondPosition = position === "pour" ? "bg-pour" : position === "contre" ? "bg-contre" : "bg-abstention";
  const issue2050 = simulation.adopte ? "Adopté" : "Rejeté";
  const memeIssue = reel ? reel.scrutin.resultat === (simulation.adopte ? "adopte" : "rejete") : false;
  return (
    <div className="space-y-10">
      {reel ? (
        <LigneDecompte
          titre="Assemblée de 2026"
          issue={adopte(reel.scrutin.resultat)}
          segments={[
            { libelle: "Pour", valeur: reel.scrutin.decompte.pour, fond: "bg-pour" },
            { libelle: "Abstention", valeur: reel.scrutin.decompte.abstention, fond: "bg-abstention" },
            { libelle: "Contre", valeur: reel.scrutin.decompte.contre, fond: "bg-contre" },
            { libelle: "Non-votants", valeur: reel.scrutin.decompte.non_votants, fond: "bg-absent" },
          ]}
        >
          <SourceBadge source={reel.scrutin.source} className="mt-3" />
        </LigneDecompte>
      ) : null}

      <LigneDecompte
        titre={`${NOMBRE_SIEGES} sièges de 2050, ${prenom} préside`}
        issue={issue2050}
        machine
        segments={[
          { libelle: "Pour", valeur: simulation.pour, fond: fondPosition },
          { libelle: "Abstention", valeur: simulation.abstention, fond: fondPosition },
          { libelle: "Contre", valeur: simulation.contre, fond: fondPosition },
        ]}
      >
        <ul role="list" className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-5 text-attenue">
          <li className="inline-flex items-center gap-2">
            {prenom} vote
            <PositionLibelle position={position} machine className="font-medium text-texte" />
          </li>
          <Filet />
          <li>Débat de 0 seconde</li>
          {reel ? (
            <>
              <Filet />
              <li>{memeIssue ? "Même issue qu'en 2026" : "Issue inverse de 2026"}</li>
            </>
          ) : null}
        </ul>
        <div className="mt-5 border-t border-trait pt-4">
          <SourceBadge source={{ ...sourceCalcul("", dateCalcul), definition: undefined }} />
          <p className="mt-1.5 text-sm leading-6 text-attenue">{definitionSimulation(prenom)}</p>
          <details className="group mt-1 text-sm leading-6 text-attenue">
            <summary className="-mx-1 inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded px-1 font-medium text-texte underline decoration-trait underline-offset-4 outline-none transition-colors duration-150 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte [&::-webkit-details-marker]:hidden">
              <svg aria-hidden viewBox="0 0 12 12" className="size-3 shrink-0 transition-transform duration-200 group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 2.5 8 6l-3.5 3.5" />
              </svg>
              Comment c&apos;est calculé
            </summary>
            <ol className="mt-1 mb-2 max-w-2xl list-decimal space-y-1 pl-9 marker:text-attenue">
              <li>{REGLE_POSITION}</li>
              <li>{ADOPTION_SIMULEE}</li>
            </ol>
          </details>
        </div>
      </LigneDecompte>
    </div>
  );
}

/**
 * Le tableau d'affichage, juste sous l'arc : quatre compteurs qui défilent au rythme de la vague, et le verdict qui
 * tombe quand la vague a fini de passer. C'est la conclusion de la bascule, lisible sans défiler.
 */
function TableauAffichage({
  seance,
  candidate,
  reel,
  simulation,
  onBasculer,
}: {
  seance: Seance;
  candidate: Candidate;
  reel: ResultatScrutin | null;
  simulation: Simulation2050;
  onBasculer: (seance: Seance) => void;
}) {
  const en2050 = seance === "2050";
  const d = reel?.scrutin.decompte;
  const valeurs = en2050
    ? { pour: simulation.pour, contre: simulation.contre, abstention: simulation.abstention, absents: 0 }
    : { pour: d?.pour ?? 0, contre: d?.contre ?? 0, abstention: d?.abstention ?? 0, absents: d?.non_votants ?? 0 };
  const verdict = en2050 ? adopte(simulation.adopte ? "adopte" : "rejete") : reel ? adopte(reel.scrutin.resultat) : null;
  // En 2050, le verdict attend la fin de la vague ; en 2026, il suit les compteurs.
  const delaiVerdict = en2050 ? VAGUE * 0.85 : DUREE.etat;
  const compteurs = [
    { cle: "pour", libelle: "Pour", valeur: valeurs.pour, fond: "bg-pour" },
    { cle: "contre", libelle: "Contre", valeur: valeurs.contre, fond: "bg-contre" },
    { cle: "abstention", libelle: valeurs.abstention > 1 ? "Abstentions" : "Abstention", valeur: valeurs.abstention, fond: "bg-abstention" },
    { cle: "absents", libelle: "Non-votants", valeur: valeurs.absents, fond: "bg-absent" },
  ];
  const annonce = verdict
    ? en2050
      ? `En 2050, avec ${candidate.prenom} : ${verdict.toLowerCase()}, ${valeurs.pour} pour, ${valeurs.contre} contre, ${valeurs.abstention} abstentions.`
      : `Assemblée de 2026 : ${verdict.toLowerCase()}, ${valeurs.pour} pour, ${valeurs.contre} contre, ${valeurs.abstention} abstentions.`
    : "";

  return (
    <div className="mx-auto mt-4 flex max-w-3xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <p role="status" className="sr-only">
        {annonce}
      </p>
      {/* Le verdict : il tombe d'un cran et se pose, sans rebond. */}
      <div aria-hidden className="flex min-w-0 items-center gap-4">
        <div className="grid min-h-16 min-w-36">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={`${seance}:${verdict ?? "attente"}`}
              initial={{ opacity: 0, y: -18, scale: 1.08 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { ...RESSORT, delay: delaiVerdict } }}
              exit={{ opacity: 0, y: 10, transition: { duration: DUREE.micro } }}
              className="col-start-1 row-start-1 origin-left"
            >
              <p className={cn("text-[13px] leading-5 text-attenue", en2050 && "font-donnee text-machine")}>
                {en2050 ? `2050 · ${candidate.prenom} préside` : "2026 · vote réel"}
              </p>
              <p className="font-titre text-[2.5rem] leading-none font-semibold tracking-[-0.03em] text-texte">
                {verdict ?? <span className="text-attenue">…</span>}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <ul role="list" aria-hidden className="grid grid-cols-4 gap-x-4 sm:gap-x-6">
        {compteurs.map((c) => (
          <li key={c.cle} className={cn("transition-opacity duration-300", c.valeur === 0 && "opacity-45")}>
            <span className="flex items-center gap-1.5 text-[13px] leading-5 text-attenue">
              <span aria-hidden className={cn("size-2 rounded-full", en2050 && c.valeur > 0 ? "bg-machine" : c.fond)} />
              {c.libelle}
            </span>
            <Chiffre
              valeur={c.valeur}
              duree={en2050 ? VAGUE : DUREE.scene}
              className="mt-0.5 block font-titre text-2xl leading-8 font-semibold tracking-[-0.02em] text-texte sm:text-[1.75rem]"
            />
          </li>
        ))}
      </ul>

      {/* Le geste suivant, toujours à portée : basculer, ou revenir. */}
      <div className="sm:hidden">
        <BoutonIA
          variante={en2050 ? "contour" : "plein"}
          teintes={candidate.teintes}
          onClick={() => onBasculer(en2050 ? "2026" : "2050")}
          className="w-full justify-center"
        >
          {en2050 ? "Revenir à 2026" : `Basculer en 2050`}
        </BoutonIA>
      </div>
    </div>
  );
}

/** L'IA au pouvoir : l'IA en tête du classement du citoyen ou, à défaut, la première candidate. */
function useIaPresidente(): { candidate: Candidate; testFait: boolean } {
  const { classement, regle } = useClassement();
  return { candidate: regle && classement[0] ? classement[0].candidate : CANDIDATES[0], testFait: regle };
}

/** « Au pouvoir » : l'IA choisie tranche un vrai texte, face à l'Assemblée de 2026, puis rédige un amendement. */
export function VueSeance() {
  const navigateur = useNavigateur();
  const mandat = useMandat();
  const scrutins = useScrutins();
  const { candidate, testFait } = useIaPresidente();
  const [choix, setChoix] = useState<string | null>(null);
  const [seance, setSeanceBrute] = useState<Seance>("2026");
  const [aBascule, setABascule] = useState(false);
  const setSeance = (suivante: Seance) => {
    setSeanceBrute(suivante);
    if (suivante === "2050") setABascule(true);
  };

  const textes = scrutins.data?.data ?? [];
  const arbitres = new Set(textes.filter((texte) => mandat.votes[texte.id]).map((texte) => texte.id));
  const pret = navigateur && !scrutins.isLoading;

  // Par défaut : le premier texte que le citoyen a tranché, sinon le premier de la liste.
  const texte =
    (pret ? (textes.find((t) => t.id === choix) ?? textes.find((t) => arbitres.has(t.id)) ?? textes[0]) : undefined) ?? null;

  const resultat = useResultat(texte?.id ?? null);
  const reel = resultat.data?.data ?? null;

  const position = texte ? positionCandidate(candidate, texte) : null;
  const simulation = position ? simuler2050(position) : null;

  const metaExemple = [scrutins.data?.meta, resultat.data?.meta].find((meta) => meta?.origine === "exemple");

  const etats = seance === "2026" ? etatsDeLAssemblee2026(reel?.votes ?? []) : ETATS_2050;
  const description =
    seance === "2050"
      ? `Hémicycle de 2050 : les ${NOMBRE_SIEGES} sièges sont tenus par des sphères, toutes à la couleur ${deCandidate(candidate.prenom)}.`
      : reel
        ? `Assemblée de 2026 : ${reel.scrutin.decompte.pour} pour, ${reel.scrutin.decompte.contre} contre, ${reel.scrutin.decompte.abstention} abstentions, ${reel.scrutin.decompte.non_votants} non-votants.`
        : "Assemblée de 2026 : les votes du texte choisi ne sont pas encore affichés.";

  const demande = texte && position ? { titre: titreCourt(texte.titre), date: texte.date, position } : null;
  const enPanne = pret && (scrutins.error || !texte || !position || !simulation);

  return (
    <>
      <AvisExemple meta={metaExemple} />

      <motion.header {...ENTREE} className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="flex items-center gap-4">
          <Sphere
            teintes={candidate.teintes}
            duree={14}
            description={`La sphère ${deCandidate(candidate.prenom)}`}
            className="size-12 shrink-0 sm:size-14"
          />
          <h1 className="font-titre text-[clamp(2.25rem,4.5vw,3rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-texte">
            Au pouvoir
          </h1>
        </div>
        <p className="mt-3 text-lg leading-7 text-attenue">
          {navigateur && testFait ? "Votre IA, " : null}
          <strong className="font-medium text-texte">{candidate.prenom}</strong>
          {navigateur && testFait ? ", préside. " : " préside en attendant la vôtre. "}
          Choisissez un vrai texte de 2026, puis basculez en 2050.
        </p>
      </motion.header>

      <motion.section
        aria-labelledby="seance-hemicycle"
        className="mx-auto mt-8 max-w-4xl"
        initial={ENTREE.initial}
        animate={ENTREE.animate}
        transition={{ ...ENTREE.transition, delay: CASCADE * 2 }}
      >
        <h2 id="seance-hemicycle" className="sr-only">
          L&apos;hémicycle
        </h2>

        {enPanne ? (
          scrutins.error ? (
            <Panne
              titre="La liste des textes n'a pas pu être lue."
              detail={(scrutins.error as Error).message}
              onReessayer={() => void scrutins.mutate()}
            />
          ) : (
            <div className="rounded-md bg-relief px-5 py-6">
              <p className="font-medium text-texte">Aucun texte à examiner pour le moment.</p>
            </div>
          )
        ) : (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              {texte ? (
                <SelecteurTexte textes={textes} choisi={texte} votes={mandat.votes} onChoisir={setChoix} />
              ) : (
                <div aria-hidden className="min-w-0 flex-1">
                  <div className="h-5 w-28 rounded-full bg-relief" />
                  <div className="mt-2 h-12 rounded-full bg-relief motion-safe:animate-pulse" />
                </div>
              )}
              <ChoixSeance seance={seance} invite={!aBascule && !!reel} onChoisir={setSeance} />
            </div>

            <div className="mt-6" aria-busy={!reel && !resultat.error}>
              {/* L'arc est là dès la première image : gris le temps de la lecture, puis la couleur balaie les sièges. */}
              <ScenePublique
                etats={pret ? etats : []}
                description={pret ? description : "Lecture de vos choix et des textes…"}
                seance={seance}
                candidate={candidate}
                attente={!reel && !resultat.error && seance === "2026"}
              />
              {resultat.error ? (
                <div className="mt-6">
                  <Panne
                    titre="Le détail de ce scrutin n'est pas disponible."
                    detail={`${(resultat.error as Error).message} Choisissez un autre texte, ou réessayez.`}
                    onReessayer={() => void resultat.mutate()}
                  />
                </div>
              ) : simulation ? (
                <TableauAffichage
                  seance={seance}
                  candidate={candidate}
                  reel={reel}
                  simulation={simulation}
                  onBasculer={setSeance}
                />
              ) : (
                <div aria-hidden className="mx-auto mt-4 h-16 max-w-3xl" />
              )}
            </div>

            {navigateur && !testFait ? (
              <motion.div {...A_LA_VUE} className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-4 rounded-lg bg-relief px-6 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
                <p className="text-[15px] leading-6 text-texte">
                  {candidate.prenom} préside par défaut. Et si c&apos;était votre IA ?
                </p>
                <BoutonIA href="/test" className="shrink-0">
                  Trouver mon IA
                </BoutonIA>
              </motion.div>
            ) : null}

            {texte && position && simulation ? (
              <motion.div {...A_LA_VUE} className="mt-14" aria-busy={resultat.isLoading}>
                <h3 className="mb-6 text-[15px] font-semibold leading-6 text-texte">Le détail du décompte</h3>
                {resultat.error ? null : !reel ? (
                  <Attente libelle="Lecture des votes du scrutin…" hauteur="h-48" />
                ) : (
                  <Decomptes
                    candidate={candidate}
                    position={position}
                    simulation={simulation}
                    reel={reel}
                    dateCalcul={resultat.data?.meta.recuLe ?? null}
                  />
                )}
              </motion.div>
            ) : null}
          </>
        )}
      </motion.section>

      {texte && position ? (
        <motion.section {...A_LA_VUE} aria-labelledby="seance-amendement" className="mx-auto mt-20 max-w-4xl">
          <h2 id="seance-amendement" className={`mb-2 ${H2}`}>
            L&apos;amendement {deCandidate(candidate.prenom)}
          </h2>
          <p className="mb-6 text-[15px] leading-6 text-attenue">
            Elle ne fait pas que voter : elle réécrit le texte selon ses priorités, sous vos yeux.
          </p>
          <Amendement key={`${candidate.id}:${texte.id}:${position}`} demande={demande} candidate={candidate} />
        </motion.section>
      ) : null}

      {texte && position ? (
        <motion.section {...A_LA_VUE} aria-labelledby="seance-groupes" className="mx-auto mt-20 max-w-4xl">
          <h2 id="seance-groupes" className={`mb-6 ${H2}`}>
            Les groupes en 2026
          </h2>
          {reel ? (
            <>
              <TableauGroupes groupes={reel.groupes} prenom={candidate.prenom} position={position} />
              <SourceBadge source={reel.scrutin.source} className="mt-4" />
            </>
          ) : resultat.error ? (
            <p className="rounded-md bg-relief px-5 py-5 text-[15px] leading-6 text-attenue">
              Groupes indisponibles pour ce scrutin.
            </p>
          ) : (
            <Attente libelle="Lecture des groupes…" hauteur="h-56" />
          )}
        </motion.section>
      ) : null}
    </>
  );
}
