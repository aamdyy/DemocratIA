"use client";

import { useState, useSyncExternalStore } from "react";
import { MotionConfig, motion } from "motion/react";

import { AvisExemple } from "@/components/avis-exemple";
import { BarreEmpilee, type Segment } from "@/components/graphiques";
import { BoutonIA } from "@/components/bouton-ia";
import { Hemicycle, NOMBRE_SIEGES } from "@/components/hemicycle";
import { deCandidate } from "@/components/candidates/prenom";
import { PositionLibelle } from "@/components/position";
import { Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { useResultat, useScrutins } from "@/lib/api";
import { CANDIDATES, REGLE_POSITION, positionCandidate, type Candidate } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";
import { nombre, titreLisible } from "@/lib/format";
import { useClassement } from "@/lib/ma-candidate";
import { useMandat } from "@/lib/mandat";
import type { Position, ResultatScrutin, Scrutin } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Amendement } from "./amendement";
import { ETATS_2050, definitionSimulation, etatsDeLAssemblee2026, simuler2050, type Simulation2050 } from "./calcul";
import { TableauGroupes } from "./tableau-groupes";

type Seance = "2026" | "2050";

const H2 = "font-titre text-2xl font-semibold leading-8 tracking-[-0.03em] text-texte";

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

/** Choix du texte : un champ natif, au clavier comme au toucher. */
function ChoixTexte({
  textes,
  choisi,
  arbitres,
  onChoisir,
}: {
  textes: Scrutin[];
  choisi: string | null;
  arbitres: Set<string>;
  onChoisir: (id: string) => void;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <label htmlFor="seance-texte" className="text-sm text-attenue">
        Texte examiné
      </label>
      <select
        id="seance-texte"
        value={choisi ?? ""}
        onChange={(evenement) => onChoisir(evenement.target.value)}
        className="mt-2 block min-h-12 w-full rounded-md border border-trait bg-fond px-4 text-[15px] text-texte outline-none transition-colors duration-150 hover:border-attenue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte"
      >
        {textes.map((texte) => (
          <option key={texte.id} value={texte.id}>
            {titreLisible(texte.titre)}
            {arbitres.has(texte.id) ? " (tranché par vous)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

/** La bascule : l'Assemblée de 2026, puis l'hémicycle de 2050. */
function ChoixSeance({ seance, onChoisir }: { seance: Seance; onChoisir: (seance: Seance) => void }) {
  return (
    <div role="group" aria-label="Choisir la séance" className="mx-auto flex w-fit max-w-full gap-1 rounded-full bg-relief p-1">
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
            "inline-flex min-h-11 cursor-pointer items-center justify-center flex-1 whitespace-nowrap rounded-full px-3 text-[15px] font-medium outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte sm:flex-none sm:px-7",
            seance === valeur ? "bg-texte text-fond" : "text-attenue hover:text-texte",
          )}
        >
          {libelle}
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
}: {
  etats: Parameters<typeof Hemicycle>[0]["etats"];
  description: string;
  seance: Seance;
  candidate: Candidate;
}) {
  const machine = seance === "2050";
  return (
    <div
      className="@container relative mx-auto w-full max-w-4xl overflow-hidden"
      style={{ "--machine": candidate.teintes[1], "--pas-siege": "2.6ms" } as React.CSSProperties}
    >
      <Hemicycle etats={etats} description={description} className="block w-full" />
      <motion.div
        aria-hidden
        className="absolute -bottom-[7.4cqw] left-1/2 w-[18cqw] -translate-x-1/2 @2xl:-bottom-[8.9cqw] @2xl:w-[21cqw]"
        initial={false}
        animate={{ y: machine ? "0%" : "55%", opacity: machine ? 1 : 0 }}
        transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Sphere teintes={candidate.teintes} duree={12} />
      </motion.div>
      <p
        aria-hidden
        className={cn(
          "absolute bottom-[11.4cqw] left-1/2 -translate-x-1/2 text-[13px] leading-none font-semibold transition-opacity duration-700 @2xl:bottom-[13.8cqw] @2xl:text-[length:2.2cqw]",
          machine ? "opacity-100" : "opacity-0",
        )}
      >
        {candidate.prenom}
      </p>
    </div>
  );
}

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
  const lisible = segments.filter((s) => s.valeur > 0).map((s) => `${s.valeur} ${s.libelle.toLowerCase()}`);
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
      <ul role="list" className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-sm tabular-nums text-attenue">
        {segments
          .filter((s) => s.valeur > 0)
          .map((s) => (
            <li key={s.libelle} className="inline-flex items-center gap-1.5">
              <span aria-hidden className={cn("size-2 rounded-full", s.fond)} />
              {nombre(s.valeur)} {s.libelle.toLowerCase()}
            </li>
          ))}
      </ul>
      {children}
    </div>
  );
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
  return (
    <div className="space-y-12">
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
          <SourceBadge source={reel.scrutin.source} className="mt-4" />
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
        <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-attenue">
          <span>{prenom} vote</span>
          <PositionLibelle position={position} machine className="text-texte" />
          <span>
            · débat de 0 seconde
            {reel ? (reel.scrutin.resultat === (simulation.adopte ? "adopte" : "rejete") ? " · même issue qu'en 2026" : " · issue inverse de 2026") : ""}
          </span>
        </p>
        <SourceBadge source={sourceCalcul(`${definitionSimulation(prenom)} ${REGLE_POSITION}`, dateCalcul)} className="mt-4" />
      </LigneDecompte>
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
  const [seance, setSeance] = useState<Seance>("2026");

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

  const demande = texte && position ? { titre: titreLisible(texte.titre), date: texte.date, position } : null;

  return (
    <MotionConfig reducedMotion="user">
      <AvisExemple meta={metaExemple} />

      {/* Une seule entrée pour toute la page ; le reste ne bouge que sur un geste du visiteur. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <header className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
          <Sphere
            teintes={candidate.teintes}
            duree={14}
            description={`La sphère ${deCandidate(candidate.prenom)}`}
            className="size-28 shrink-0 sm:size-32"
          />
          <div>
            <h1 className="font-titre text-[clamp(2.25rem,4.5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-texte">
              Au pouvoir
            </h1>
            <p aria-live="polite" className="mt-4 text-lg leading-8 text-attenue">
              {testFait ? (
                <>
                  Votre IA, <strong className="font-medium text-texte">{candidate.prenom}</strong>, préside.
                </>
              ) : (
                <>
                  <strong className="font-medium text-texte">{candidate.prenom}</strong> préside.
                </>
              )}
            </p>
            {!testFait ? (
              <BoutonIA href="/test" className="mt-6">
                Trouver mon IA
              </BoutonIA>
            ) : null}
          </div>
        </header>

        <section aria-labelledby="seance-hemicycle" className="mt-16">
          <h2 id="seance-hemicycle" className="sr-only">
            L&apos;hémicycle
          </h2>

          {!pret ? (
            <Attente libelle="Lecture de vos choix et des textes…" hauteur="h-80" />
          ) : scrutins.error ? (
            <Panne
              titre="La liste des textes n'a pas pu être lue."
              detail={(scrutins.error as Error).message}
              onReessayer={() => void scrutins.mutate()}
            />
          ) : !texte || !position || !simulation ? (
            <div className="rounded-md bg-relief px-5 py-6">
              <p className="font-medium text-texte">Aucun texte à examiner pour le moment.</p>
            </div>
          ) : (
            <>
              <ChoixTexte textes={textes} choisi={texte.id} arbitres={arbitres} onChoisir={setChoix} />
              <div className="mt-8">
                <ChoixSeance seance={seance} onChoisir={setSeance} />
              </div>

              <div className="mt-10" aria-busy={resultat.isLoading}>
                <ScenePublique etats={etats} description={description} seance={seance} candidate={candidate} />
              </div>

              <div className="mx-auto mt-14 max-w-4xl" aria-busy={resultat.isLoading}>
                {resultat.error ? (
                  <Panne
                    titre="Le détail de ce scrutin n'est pas disponible."
                    detail={`${(resultat.error as Error).message} Choisissez un autre texte, ou réessayez.`}
                    onReessayer={() => void resultat.mutate()}
                  />
                ) : !reel ? (
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
              </div>
            </>
          )}
        </section>

        {texte && position ? (
          <section aria-labelledby="seance-amendement" className="mx-auto mt-28 max-w-4xl">
            <h2 id="seance-amendement" className={`mb-10 ${H2}`}>
              L&apos;amendement {deCandidate(candidate.prenom)}
            </h2>
            <Amendement key={`${candidate.id}:${texte.id}:${position}`} demande={demande} candidate={candidate} />
          </section>
        ) : null}

        {texte && position ? (
          <section aria-labelledby="seance-groupes" className="mx-auto mt-28 max-w-4xl">
            <h2 id="seance-groupes" className={`mb-8 ${H2}`}>
              Les groupes en 2026
            </h2>
            {reel ? (
              <>
                <TableauGroupes groupes={reel.groupes} prenom={candidate.prenom} position={position} />
                <SourceBadge source={reel.scrutin.source} className="mt-6" />
              </>
            ) : resultat.error ? (
              <p className="rounded-md bg-relief px-5 py-5 text-[15px] leading-6 text-attenue">
                Groupes indisponibles pour ce scrutin.
              </p>
            ) : (
              <Attente libelle="Lecture des groupes…" hauteur="h-56" />
            )}
          </section>
        ) : null}
      </motion.div>
    </MotionConfig>
  );
}
