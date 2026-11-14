"use client";

import Link from "next/link";
import { useState } from "react";
import { MotionConfig, motion } from "motion/react";

import { BoutonIA } from "@/components/bouton-ia";
import { AvisExemple } from "@/components/avis-exemple";
import { Barre, BarreEmpilee } from "@/components/graphiques";
import { PositionLibelle } from "@/components/position";
import { FiltreSphere, Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { useScrutins } from "@/lib/api";
import { DEFINITION_AFFINITE, REGLE_POSITION, positionCandidate, type Candidate } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";
import { titreLisible } from "@/lib/format";
import { useClassement } from "@/lib/ma-candidate";
import { useMandat } from "@/lib/mandat";
import { libelleTheme, themeDe, THEMES } from "@/lib/themes";
import type { Position, Scrutin } from "@/lib/types";

import { affinitePourcent } from "./prenom";

const LIEN =
  "inline-flex min-h-11 items-center text-[15px] text-attenue underline decoration-trait underline-offset-4 outline-none transition-colors duration-150 hover:text-texte hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";
const PILULE_CLAIRE =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-texte px-6 text-[15px] font-medium text-texte outline-none transition-colors duration-150 hover:bg-relief focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";
const H2 = "font-titre text-2xl font-semibold leading-8 tracking-[-0.03em] text-texte";

const PAR_PAGE = 5;

/** Le programme : un poids de 0 à 100 par thème, du plus fort au plus faible, en barres qui se remplissent. */
function Programme({ candidate }: { candidate: Candidate }) {
  const themes = THEMES.map((t) => ({ id: t.id, libelle: t.libelle, poids: candidate.poids[t.id] })).sort(
    (a, b) => b.poids - a.poids,
  );
  return (
    <section aria-labelledby="programme" className="mt-24">
      <h2 id="programme" className={H2}>
        Son programme
      </h2>
      <ul role="list" className="mt-8 grid gap-x-16 gap-y-5 lg:grid-cols-2">
        {themes.map((t, i) => (
          <li key={t.id}>
            <div className="flex items-baseline justify-between gap-4 text-[15px] leading-6 text-texte">
              <span>{t.libelle}</span>
              <span className="font-semibold tabular-nums">{t.poids}</span>
            </div>
            <Barre
              className="mt-2"
              valeur={t.poids}
              couleur={candidate.teintes[1]}
              etiquette={`${t.libelle} : ${t.poids} sur 100`}
              delai={(i % 5) * 0.06}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function LigneVote({ scrutin, candidate, moi }: { scrutin: Scrutin; candidate: Candidate; moi: Position | false | null }) {
  const elle = positionCandidate(candidate, scrutin);
  const { pour, abstention, contre, non_votants } = scrutin.decompte;
  const adopte = scrutin.resultat === "adopte";
  return (
    <li className="border-b border-trait py-6">
      <p className="text-sm leading-6 font-medium text-texte">{libelleTheme(themeDe(scrutin.titre))}</p>
      <h3 className="mt-1 max-w-3xl text-lg leading-7 font-medium text-texte">{titreLisible(scrutin.titre)}</h3>
      <dl className="mt-4 grid gap-x-8 gap-y-3 text-[15px] leading-6 sm:grid-cols-[7rem_7rem_minmax(0,1fr)]">
        <div>
          <dt className="text-attenue">{candidate.prenom}</dt>
          <dd className="mt-0.5 text-texte">
            <PositionLibelle position={elle} machine />
          </dd>
        </div>
        {moi !== null ? (
          <div>
            <dt className="text-attenue">Vous</dt>
            <dd className="mt-0.5 text-texte">
              {moi ? (
                <>
                  <PositionLibelle position={moi} />
                  <span className="sr-only">{moi === elle ? ", comme elle" : ", pas comme elle"}</span>
                </>
              ) : (
                <span className="text-attenue">Pas tranché</span>
              )}
            </dd>
          </div>
        ) : null}
        <div className="min-w-0 sm:col-start-3 sm:row-start-1">
          <dt className="text-attenue">Assemblée : {adopte ? "adopté" : "rejeté"}</dt>
          <dd className="mt-2">
            <BarreEmpilee
              segments={[
                { libelle: "Pour", valeur: pour, fond: "bg-pour" },
                { libelle: "Abstention", valeur: abstention, fond: "bg-abstention" },
                { libelle: "Contre", valeur: contre, fond: "bg-contre" },
                { libelle: "Non-votants", valeur: non_votants, fond: "bg-absent" },
              ]}
              etiquette={`Assemblée : ${pour} pour, ${abstention} abstentions, ${contre} contre, ${non_votants} non-votants`}
              className="h-2.5"
            />
            <span className="mt-1.5 block text-sm tabular-nums text-attenue">
              {pour} pour · {abstention} abst. · {contre} contre
            </span>
          </dd>
        </div>
      </dl>
    </li>
  );
}

function Votes({ candidate, testFait, votes }: { candidate: Candidate; testFait: boolean; votes: Record<string, Position> }) {
  const scrutins = useScrutins();
  const [tout, setTout] = useState(false);
  const textes = scrutins.data?.data ?? [];
  const visibles = tout ? textes : textes.slice(0, PAR_PAGE);

  return (
    <section aria-labelledby="votes" className="mt-24" aria-busy={scrutins.isLoading}>
      <h2 id="votes" className={H2}>
        Ses votes sur les vrais textes
      </h2>

      {scrutins.isLoading ? (
        <div role="status" className="mt-8">
          <span className="sr-only">Lecture des textes de l&apos;Assemblée…</span>
          <div aria-hidden className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 rounded-md bg-relief motion-safe:animate-pulse" />
            ))}
          </div>
        </div>
      ) : scrutins.error ? (
        <div role="alert" className="mt-8 rounded-md bg-relief px-5 py-5">
          <p className="font-medium text-texte">La liste des textes n&apos;a pas pu être lue.</p>
          <p className="mt-1 text-[15px] leading-6 text-attenue">{(scrutins.error as Error).message}</p>
          <BoutonIA variante="contour" teintes={candidate.teintes} onClick={() => void scrutins.mutate()} className="mt-4">
            Réessayer
          </BoutonIA>
        </div>
      ) : textes.length === 0 ? (
        <p className="mt-8 rounded-md bg-relief px-5 py-5 text-[15px] leading-6 text-attenue">Aucun texte à afficher pour le moment.</p>
      ) : (
        <>
          <ul role="list" className="mt-6 border-t border-trait">
            {visibles.map((s) => (
              <LigneVote key={s.id} scrutin={s} candidate={candidate} moi={testFait ? (votes[s.id] ?? false) : null} />
            ))}
          </ul>
          <div className="mt-6 space-y-2">
            <SourceBadge source={textes[0].source} />
            <SourceBadge source={sourceCalcul(REGLE_POSITION)} />
          </div>
          {textes.length > PAR_PAGE ? (
            <button type="button" aria-expanded={tout} onClick={() => setTout((v) => !v)} className={`${PILULE_CLAIRE} mt-8`}>
              {tout ? "Réduire la liste" : `Voir les ${textes.length - PAR_PAGE} autres textes`}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}

/** /candidates/[id] : la fiche d'une IA candidate. */
export function FicheCandidate({ candidate }: { candidate: Candidate }) {
  const { classement, regle } = useClassement();
  const rang = classement.findIndex((a) => a.candidate.id === candidate.id);
  const affinite = regle && rang >= 0 ? classement[rang] : null;
  const { votes: mandatVotes } = useMandat();
  const scrutins = useScrutins();

  return (
    <MotionConfig reducedMotion="user">
      <FiltreSphere />
      <div className="mx-auto max-w-5xl">
        <AvisExemple meta={scrutins.data?.meta} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        className="mx-auto max-w-5xl"
      >
        <p>
          <Link href="/candidates" className={LIEN}>
            Toutes les candidates
          </Link>
        </p>

        <header className="mt-6 flex flex-col items-center gap-10 text-center lg:flex-row lg:gap-20 lg:text-left">
          <Sphere
            teintes={candidate.teintes}
            aquarelle
            duree={16}
            description={`La sphère de ${candidate.prenom}`}
            className="w-[min(64vw,18rem)] shrink-0 lg:w-80"
          />
          <div className="min-w-0">
            <h1 className="font-titre text-[clamp(2.25rem,4.5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-texte">
              {candidate.prenom}
            </h1>
            <p className="mt-3 max-w-xl text-xl leading-8 text-texte">{candidate.doctrine}</p>

            <div aria-live="polite" className="mt-8 flex flex-col items-center gap-3 lg:items-start">
              {affinite ? (
                <div className="w-full max-w-sm">
                  <p className="flex items-baseline justify-between gap-4 text-lg leading-7 text-texte">
                    <span>{rang === 0 ? <strong className="font-semibold">Votre IA</strong> : "Affinité avec vous"}</span>
                    <span className="font-semibold tabular-nums">{affinitePourcent(affinite.score)}</span>
                  </p>
                  <Barre
                    className="mt-2"
                    valeur={affinite.score * 100}
                    couleur={candidate.teintes[1]}
                    etiquette={`${candidate.prenom} : ${affinitePourcent(affinite.score)} d'affinité avec vous${rang > 0 ? `, ${rang + 1}e sur ${classement.length}` : ""}`}
                  />
                  <SourceBadge source={sourceCalcul(DEFINITION_AFFINITE)} className="mt-3" />
                </div>
              ) : (
                <BoutonIA href="/test" teintes={candidate.teintes}>
                  Mesurer mon affinité
                </BoutonIA>
              )}
            </div>
          </div>
        </header>

        <Programme candidate={candidate} />
        <Votes candidate={candidate} testFait={regle} votes={mandatVotes} />
      </motion.div>
    </MotionConfig>
  );
}
