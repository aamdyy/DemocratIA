"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { MotionConfig, motion } from "motion/react";

import { AvisExemple } from "@/components/avis-exemple";
import { Hemicycle, NOMBRE_SIEGES } from "@/components/hemicycle";
import { deCandidate } from "@/components/candidates/prenom";
import { PositionLibelle } from "@/components/position";
import { Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { useResultat, useScrutins } from "@/lib/api";
import { CANDIDATES, REGLE_POSITION, positionCandidate, type Candidate } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";
import { dateLongue, nombre, titreLisible } from "@/lib/format";
import { useClassement } from "@/lib/ma-candidate";
import { useMandat } from "@/lib/mandat";
import type { Position, ResultatScrutin, Scrutin } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Amendement } from "./amendement";
import { ETATS_2050, definitionSimulation, etatsDeLAssemblee2026, simuler2050, type Simulation2050 } from "./calcul";
import { TableauGroupes } from "./tableau-groupes";

type Seance = "2026" | "2050";

const LIEN =
  "inline-flex min-h-11 items-center border border-texte px-5 text-[15px] font-medium text-texte outline-none hover:bg-relief focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";
const BOUTON = `${LIEN} cursor-pointer`;
const PILULE_NOIRE =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-texte px-7 text-[15px] font-medium text-fond outline-none hover:bg-texte/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";
const PILULE =
  "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-6 text-[15px] font-medium outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";

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
    <div role="status" className="border-t border-trait">
      <span className="sr-only">{libelle}</span>
      <div aria-hidden className={cn("mt-6 bg-relief motion-safe:animate-pulse", hauteur)} />
    </div>
  );
}

function Panne({ titre, detail, onReessayer }: { titre: string; detail: string; onReessayer: () => void }) {
  return (
    <div role="alert" className="border border-trait px-5 py-5">
      <p className="font-medium text-texte">{titre}</p>
      <p className="mt-1 text-[15px] leading-6 text-attenue">{detail}</p>
      <button type="button" onClick={onReessayer} className={`${BOUTON} mt-4`}>
        Réessayer
      </button>
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
    <div className="min-w-0 flex-1">
      <label htmlFor="seance-texte" className="text-sm text-attenue">
        Texte examiné en séance
      </label>
      <select
        id="seance-texte"
        value={choisi ?? ""}
        onChange={(evenement) => onChoisir(evenement.target.value)}
        className="mt-1 block min-h-11 w-full border border-trait bg-fond px-3 text-[15px] text-texte outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte"
      >
        {textes.map((texte) => (
          <option key={texte.id} value={texte.id}>
            {arbitres.has(texte.id) ? "Tranché par vous · " : ""}
            {titreLisible(texte.titre)}
          </option>
        ))}
      </select>
    </div>
  );
}

function ChoixSeance({ seance, onChoisir }: { seance: Seance; onChoisir: (seance: Seance) => void }) {
  return (
    <div role="group" aria-label="Choisir la séance" className="flex flex-wrap gap-2">
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
            PILULE,
            seance === valeur ? "border-texte bg-texte text-fond" : "border-trait text-texte hover:bg-relief",
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

function Mesure({ libelle, children, machine = false }: { libelle: string; children: React.ReactNode; machine?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-trait py-4">
      <dt className="text-[15px] leading-6 text-texte">{libelle}</dt>
      <dd className={cn("text-lg leading-7 tabular-nums", machine ? "font-donnee text-machine" : "text-texte")}>{children}</dd>
    </div>
  );
}

/** Le décompte réel de 2026, tel que publié. */
function DecompteReel({ resultat }: { resultat: ResultatScrutin }) {
  const { decompte, source } = resultat.scrutin;
  return (
    <div>
      <h3 className="font-titre text-lg font-semibold tracking-[-0.01em] text-texte">
        Séance de 2026 : {adopte(resultat.scrutin.resultat).toLowerCase()}
      </h3>
      <p className="mt-1 text-[15px] leading-6 text-attenue">
        Scrutin n° {resultat.scrutin.numero} du {dateLongue(resultat.scrutin.date)}. Chaque siège porte le vote réel de son
        député ; les sièges éteints n&apos;ont pas voté.
      </p>
      <dl className="mt-4 border-t border-trait">
        <Mesure libelle="Pour">{nombre(decompte.pour)}</Mesure>
        <Mesure libelle="Contre">{nombre(decompte.contre)}</Mesure>
        <Mesure libelle="Abstention">{nombre(decompte.abstention)}</Mesure>
        <Mesure libelle="Non-votants">{nombre(decompte.non_votants)}</Mesure>
      </dl>
      <SourceBadge source={source} className="mt-5" />
    </div>
  );
}

/** La séance de 2050 : une hypothèse, présentée comme telle, avec ses compteurs de machine. */
function Hypothese2050({
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
  return (
    <div>
      <h3 className="font-titre text-lg font-semibold tracking-[-0.01em] text-texte">577 sièges, une seule voix</h3>
      <p className="mt-1 max-w-3xl text-[15px] leading-6 text-attenue">
        En 2050, {prenom} préside. Les {nombre(NOMBRE_SIEGES)} sièges sont tenus par des sphères qui votent comme elle. C&apos;est
        un scénario, pas un fait : il montre ce que donnerait une présidence où une seule IA décide.
      </p>

      <div aria-live="polite">
        <dl className="mt-4 border-t border-trait">
          <Mesure libelle={`${prenom} vote`} machine>
            <PositionLibelle position={position} machine />
          </Mesure>
          <Mesure libelle="Pour" machine>
            {nombre(simulation.pour)}
          </Mesure>
          <Mesure libelle="Contre" machine>
            {nombre(simulation.contre)}
          </Mesure>
          <Mesure libelle="Abstention" machine>
            {nombre(simulation.abstention)}
          </Mesure>
          <Mesure libelle="Durée du débat" machine>
            0 seconde
          </Mesure>
          <Mesure libelle="Issue simulée" machine>
            {simulation.adopte ? "Adopté" : "Rejeté"}
          </Mesure>
        </dl>

        <p className="mt-4 text-[15px] leading-6 text-texte">
          La position {deCandidate(prenom)} se déduit de son programme : {REGLE_POSITION.charAt(0).toLowerCase()}
          {REGLE_POSITION.slice(1)}
        </p>
        {reel ? (
          <p className="mt-2 text-[15px] leading-6 text-texte">
            En 2026, ce texte a été {reel.scrutin.resultat === "adopte" ? "adopté" : "rejeté"}
            {" : "}
            {reel.scrutin.resultat === (simulation.adopte ? "adopte" : "rejete")
              ? "la séance de 2050 aboutirait à la même issue, sans débat."
              : "la séance de 2050 aboutirait à l'issue inverse, sans débat."}
          </p>
        ) : null}
        <SourceBadge source={sourceCalcul(`${definitionSimulation(prenom)} ${REGLE_POSITION}`, dateCalcul)} className="mt-5" />
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

      <header className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12">
        <Sphere
          teintes={candidate.teintes}
          duree={14}
          description={`La sphère ${deCandidate(candidate.prenom)}`}
          className="size-32 shrink-0 sm:size-40"
        />
        <div className="max-w-3xl">
          <p className="text-sm text-attenue">République française, an 2050</p>
          <h1 className="mt-3 font-titre text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-texte">
            Au pouvoir
          </h1>
          <p aria-live="polite" className="mt-5 text-lg leading-8 text-attenue">
            {testFait ? (
              <>
                Votre IA, <strong className="font-medium text-texte">{candidate.prenom}</strong>, préside. Elle tranche un vrai
                texte de loi de l&apos;Assemblée, puis rédige un amendement.
              </>
            ) : (
              <>
                Vous n&apos;avez pas encore passé le test. En attendant, <strong className="font-medium text-texte">{candidate.prenom}</strong>,
                la première candidate, préside.
              </>
            )}
          </p>
          {!testFait ? (
            <Link href="/test" className={`${PILULE_NOIRE} mt-6`}>
              Faire le test
            </Link>
          ) : null}
        </div>
      </header>

      <section aria-labelledby="seance-hemicycle" className="mt-16">
        <h2 id="seance-hemicycle" className="sr-only">
          L&apos;hémicycle
        </h2>

        {!pret ? (
          <Attente libelle="Lecture de vos choix et des textes…" hauteur="h-72" />
        ) : scrutins.error ? (
          <Panne
            titre="La liste des textes n'a pas pu être lue."
            detail={(scrutins.error as Error).message}
            onReessayer={() => void scrutins.mutate()}
          />
        ) : !texte || !position || !simulation ? (
          <div className="border border-trait px-5 py-6">
            <p className="font-medium text-texte">Aucun texte à examiner pour le moment.</p>
            <p className="mt-1 text-[15px] leading-6 text-attenue">
              La liste des scrutins est vide. Revenez dans un instant.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
              <ChoixTexte textes={textes} choisi={texte.id} arbitres={arbitres} onChoisir={setChoix} />
              <ChoixSeance seance={seance} onChoisir={setSeance} />
            </div>

            <p aria-live="polite" className="mt-8 text-[15px] font-medium leading-6 text-texte">
              {seance === "2026"
                ? "Assemblée de 2026 : le vote réel de chaque député."
                : `Hémicycle de 2050 : 577 sièges, une seule voix, celle ${deCandidate(candidate.prenom)}.`}
            </p>

            <div className="mt-4" aria-busy={resultat.isLoading}>
              <ScenePublique etats={etats} description={description} seance={seance} candidate={candidate} />
            </div>

            <div className="mx-auto mt-10 max-w-3xl">
              <motion.div
                key={seance}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {seance === "2026" ? (
                  resultat.error ? (
                    <Panne
                      titre="Le détail de ce scrutin n'est pas disponible."
                      detail={`${(resultat.error as Error).message} Choisissez un autre texte, ou réessayez.`}
                      onReessayer={() => void resultat.mutate()}
                    />
                  ) : !reel ? (
                    <Attente libelle="Lecture des votes du scrutin…" hauteur="h-48" />
                  ) : (
                    <DecompteReel resultat={reel} />
                  )
                ) : (
                  <Hypothese2050
                    candidate={candidate}
                    position={position}
                    simulation={simulation}
                    reel={reel}
                    dateCalcul={resultat.data?.meta.recuLe ?? null}
                  />
                )}
              </motion.div>
            </div>
          </>
        )}
      </section>

      {texte && position ? (
        <section aria-labelledby="seance-groupes" className="mt-16">
          <h2 id="seance-groupes" className="font-titre text-2xl font-semibold leading-8 tracking-[-0.02em] text-texte">
            Les groupes de 2026 sur ce texte
          </h2>
          <p className="mt-1 mb-6 max-w-3xl text-[15px] leading-6 text-attenue">
            Les groupes de l&apos;Assemblée, leurs votes publiés et leur position majoritaire, comparés à la position{" "}
            {deCandidate(candidate.prenom)} sur « {titreLisible(texte.titre)} ».
          </p>
          {reel ? (
            <>
              <TableauGroupes groupes={reel.groupes} prenom={candidate.prenom} position={position} />
              <SourceBadge source={reel.scrutin.source} className="mt-5" />
            </>
          ) : resultat.error ? (
            <p className="border border-dashed border-trait px-5 py-5 text-[15px] leading-6 text-attenue">
              Les groupes de ce scrutin ne sont pas disponibles. Choisissez un autre texte.
            </p>
          ) : (
            <Attente libelle="Lecture des groupes…" hauteur="h-56" />
          )}
        </section>
      ) : null}

      {texte && position ? (
        <section aria-labelledby="seance-amendement" className="mt-16">
          <h2 id="seance-amendement" className="font-titre text-2xl font-semibold leading-8 tracking-[-0.02em] text-texte">
            L&apos;amendement {deCandidate(candidate.prenom)}
          </h2>
          <p className="mt-1 mb-8 max-w-3xl text-[15px] leading-6 text-attenue">
            {candidate.prenom} rédige en direct un amendement fidèle à son programme sur ce texte. C&apos;est une fiction, écrite
            par un modèle de langage : elle n&apos;a aucune valeur juridique.
          </p>
          <Amendement key={`${candidate.id}:${texte.id}:${position}`} demande={demande} candidate={candidate} />
        </section>
      ) : null}
    </MotionConfig>
  );
}
