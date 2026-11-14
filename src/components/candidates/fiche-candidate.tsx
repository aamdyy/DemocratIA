"use client";

import Link from "next/link";
import { useState } from "react";
import { MotionConfig } from "motion/react";

import { AvisExemple } from "@/components/avis-exemple";
import { PositionLibelle } from "@/components/position";
import { FiltreSphere, Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { useScrutins } from "@/lib/api";
import { DEFINITION_AFFINITE, REGLE_POSITION, positionCandidate, type Candidate } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";
import { dateLongue, titreLisible } from "@/lib/format";
import { useClassement } from "@/lib/ma-candidate";
import { useMandat } from "@/lib/mandat";
import { libelleTheme, themeDe, THEMES } from "@/lib/themes";
import type { Position, Scrutin } from "@/lib/types";

import { affinitePourcent } from "./prenom";

const LIEN = "underline decoration-trait underline-offset-4 outline-none hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";
const PILULE_NOIRE =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-texte px-7 text-[15px] font-medium text-fond outline-none hover:bg-texte/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";
const PILULE_CLAIRE =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-texte px-6 text-[15px] font-medium text-texte outline-none hover:bg-relief focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";

const PAR_PAGE = 8;

/** Le programme : un poids de 0 à 100 par thème, du plus fort au plus faible. */
function Programme({ candidate }: { candidate: Candidate }) {
  const themes = THEMES.map((t) => ({ id: t.id, libelle: t.libelle, poids: candidate.poids[t.id] })).sort(
    (a, b) => b.poids - a.poids,
  );
  return (
    <section aria-labelledby="programme" className="mt-20">
      <h2 id="programme" className="font-titre text-2xl font-semibold tracking-[-0.03em] text-texte">
        Son programme
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-6 text-attenue">
        Plus le poids est haut, plus {candidate.prenom} défend le thème. Ces poids sont fictifs : l&apos;équipe de DemocratIA les a
        fixés pour la démonstration.
      </p>
      <ul role="list" className="mt-6 border-t border-trait">
        {themes.map((t) => (
          <li key={t.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-b border-trait py-4 sm:grid-cols-[14rem_1fr_7rem]">
            <span className="flex items-center gap-2.5 text-[15px] leading-6 text-texte">
              <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: candidate.teintes[1] }} />
              {t.libelle}
            </span>
            <span className="col-span-2 row-start-2 h-1 bg-relief sm:col-span-1 sm:col-start-2 sm:row-start-1" aria-hidden>
              <span className="block h-full bg-texte" style={{ width: `${t.poids}%` }} />
            </span>
            <span className="text-right text-[15px] leading-6 tabular-nums text-texte">{t.poids} sur 100</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LigneVote({ scrutin, candidate, moi }: { scrutin: Scrutin; candidate: Candidate; moi: Position | false | null }) {
  const elle = positionCandidate(candidate, scrutin);
  return (
    <li className="border-b border-trait py-6">
      <p className="text-sm text-attenue">
        {libelleTheme(themeDe(scrutin.titre))} · scrutin n° {scrutin.numero} du {dateLongue(scrutin.date)}
      </p>
      <h3 className="mt-1 max-w-3xl text-lg leading-7 font-medium text-texte">{titreLisible(scrutin.titre)}</h3>
      <dl className="mt-4 grid gap-x-8 gap-y-3 text-[15px] leading-6 sm:grid-cols-3">
        <div>
          <dt className="text-attenue">{candidate.prenom} vote</dt>
          <dd className="mt-0.5 text-texte">
            <PositionLibelle position={elle} machine />
          </dd>
        </div>
        <div>
          <dt className="text-attenue">Résultat réel de l&apos;Assemblée</dt>
          <dd className="mt-0.5 text-texte">
            {scrutin.resultat === "adopte" ? "Adopté" : "Rejeté"} ({scrutin.decompte.pour} pour, {scrutin.decompte.contre} contre)
          </dd>
        </div>
        {moi !== null ? (
          <div>
            <dt className="text-attenue">Votre position</dt>
            <dd className="mt-0.5 text-texte">
              {moi ? (
                <>
                  <PositionLibelle position={moi} />
                  <span className="block text-sm text-attenue">{moi === elle ? "Comme elle." : "Pas comme elle."}</span>
                </>
              ) : (
                <span className="text-attenue">Pas tranché</span>
              )}
            </dd>
          </div>
        ) : null}
      </dl>
      <SourceBadge source={scrutin.source} className="mt-4" />
    </li>
  );
}

function Votes({ candidate, testFait, votes }: { candidate: Candidate; testFait: boolean; votes: Record<string, Position> }) {
  const scrutins = useScrutins();
  const [tout, setTout] = useState(false);
  const textes = scrutins.data?.data ?? [];
  const visibles = tout ? textes : textes.slice(0, PAR_PAGE);

  return (
    <section aria-labelledby="votes" className="mt-20" aria-busy={scrutins.isLoading}>
      <AvisExemple meta={scrutins.data?.meta} />
      <h2 id="votes" className="font-titre text-2xl font-semibold tracking-[-0.03em] text-texte">
        Ses votes sur les vrais textes
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-6 text-attenue">
        {candidate.prenom} n&apos;a pas voté ces textes : sa position est déduite de son programme, par une règle publique que chacun
        peut refaire.
      </p>
      <SourceBadge source={sourceCalcul(REGLE_POSITION)} className="mt-3" />

      {scrutins.isLoading ? (
        <div role="status" className="mt-6 border-t border-trait">
          <span className="sr-only">Lecture des textes de l&apos;Assemblée…</span>
          <div aria-hidden className="mt-6 h-48 bg-relief motion-safe:animate-pulse" />
        </div>
      ) : scrutins.error ? (
        <div role="alert" className="mt-6 border border-trait px-5 py-5">
          <p className="font-medium text-texte">La liste des textes n&apos;a pas pu être lue.</p>
          <p className="mt-1 text-[15px] leading-6 text-attenue">{(scrutins.error as Error).message}</p>
          <button type="button" onClick={() => void scrutins.mutate()} className={`${PILULE_CLAIRE} mt-4`}>
            Réessayer
          </button>
        </div>
      ) : textes.length === 0 ? (
        <p className="mt-6 border border-dashed border-trait px-5 py-5 text-[15px] leading-6 text-attenue">
          Aucun texte à afficher pour le moment.
        </p>
      ) : (
        <>
          <ul role="list" className="mt-6 border-t border-trait">
            {visibles.map((s) => (
              <LigneVote key={s.id} scrutin={s} candidate={candidate} moi={testFait ? (votes[s.id] ?? false) : null} />
            ))}
          </ul>
          {textes.length > PAR_PAGE ? (
            <button type="button" aria-expanded={tout} onClick={() => setTout((v) => !v)} className={`${PILULE_CLAIRE} mt-6`}>
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

  return (
    <MotionConfig reducedMotion="user">
      <FiltreSphere />
      <p>
        <Link href="/candidates" className={`${LIEN} inline-flex min-h-11 items-center text-[15px] text-attenue`}>
          Toutes les candidates
        </Link>
      </p>

      <header className="mt-4 flex flex-col items-center text-center">
        <Sphere
          teintes={candidate.teintes}
          aquarelle
          duree={16}
          description={`La sphère de ${candidate.prenom}`}
          className="w-[min(70vw,20rem)]"
        />
        <h1 className="mt-10 font-titre text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-texte">
          {candidate.prenom}
        </h1>
        <p className="mt-3 text-xl leading-8 text-texte">{candidate.doctrine}</p>
        <p className="mt-4 max-w-xl text-lg leading-8 text-attenue">{candidate.portrait}</p>

        <div aria-live="polite" className="mt-8 flex flex-col items-center gap-3">
          {affinite ? (
            <>
              <p className="text-lg leading-7 text-texte">
                {rang === 0 ? <strong className="font-semibold">Votre IA. </strong> : null}
                <span className="tabular-nums">{affinitePourcent(affinite.score)}</span> d&apos;affinité avec vous
                {rang > 0 ? `, ${rang + 1}e sur ${classement.length}` : ""}.
              </p>
              <SourceBadge source={sourceCalcul(DEFINITION_AFFINITE)} className="justify-center" />
            </>
          ) : (
            <Link href="/test" className={PILULE_NOIRE}>
              Faire le test pour mesurer votre affinité
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl">
        <Programme candidate={candidate} />
        <Votes candidate={candidate} testFait={regle} votes={mandatVotes} />
      </div>
    </MotionConfig>
  );
}
