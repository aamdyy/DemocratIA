"use client";

import Link from "next/link";
import { useState } from "react";
import { MotionConfig, motion } from "motion/react";

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

const LIEN =
  "inline-flex min-h-11 items-center text-[15px] text-attenue underline decoration-trait underline-offset-4 outline-none transition-colors duration-150 hover:text-texte hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";
const PILULE_NOIRE =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-texte px-8 text-[15px] font-medium text-fond outline-none transition-colors duration-150 hover:bg-texte/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";
const PILULE_CLAIRE =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-texte px-6 text-[15px] font-medium text-texte outline-none transition-colors duration-150 hover:bg-relief focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";
const H2 = "font-titre text-2xl font-semibold leading-8 tracking-[-0.03em] text-texte";

const PAR_PAGE = 8;

/** Le programme : un poids de 0 à 100 par thème, du plus fort au plus faible. */
function Programme({ candidate }: { candidate: Candidate }) {
  const themes = THEMES.map((t) => ({ id: t.id, libelle: t.libelle, poids: candidate.poids[t.id] })).sort(
    (a, b) => b.poids - a.poids,
  );
  return (
    <section aria-labelledby="programme" className="mt-24">
      <h2 id="programme" className={H2}>
        Son programme
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-6 text-attenue">
        Plus le poids est haut, plus {candidate.prenom} défend le thème. Ces poids sont fictifs : l&apos;équipe de DemocratIA les a
        fixés pour la démonstration.
      </p>
      <ul role="list" className="mt-8 grid gap-x-16 gap-y-6 lg:grid-cols-2">
        {themes.map((t) => (
          <li key={t.id}>
            <div className="flex items-baseline justify-between gap-4 text-[15px] leading-6 text-texte">
              <span>{t.libelle}</span>
              <span className="tabular-nums">{t.poids} sur 100</span>
            </div>
            <span aria-hidden className="mt-2 block h-1 rounded-full bg-relief">
              <span className="block h-full rounded-full bg-texte" style={{ width: `${t.poids}%` }} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LigneVote({ scrutin, candidate, moi }: { scrutin: Scrutin; candidate: Candidate; moi: Position | false | null }) {
  const elle = positionCandidate(candidate, scrutin);
  return (
    <li className="border-b border-trait py-7">
      <p className="flex flex-wrap gap-x-3 text-sm leading-6 text-attenue">
        <span className="font-medium text-texte">{libelleTheme(themeDe(scrutin.titre))}</span>
        <span>
          Scrutin n° {scrutin.numero} du {dateLongue(scrutin.date)}
        </span>
      </p>
      <h3 className="mt-1 max-w-3xl text-lg leading-7 font-medium text-texte">{titreLisible(scrutin.titre)}</h3>
      <dl className="mt-5 grid gap-x-8 gap-y-4 text-[15px] leading-6 sm:grid-cols-3">
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
      <SourceBadge source={scrutin.source} className="mt-5" />
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
      <p className="mt-2 max-w-2xl text-[15px] leading-6 text-attenue">
        {candidate.prenom} n&apos;a pas voté ces textes : sa position est déduite de son programme, par une règle publique que chacun
        peut refaire.
      </p>
      <SourceBadge source={sourceCalcul(REGLE_POSITION)} className="mt-3" />

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
          <button type="button" onClick={() => void scrutins.mutate()} className={`${PILULE_CLAIRE} mt-4`}>
            Réessayer
          </button>
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
            <p className="mt-3 text-xl leading-8 text-texte">{candidate.doctrine}</p>
            <p className="mt-4 max-w-xl text-lg leading-8 text-attenue">{candidate.portrait}</p>

            <div aria-live="polite" className="mt-8 flex flex-col items-center gap-3 lg:items-start">
              {affinite ? (
                <>
                  <p className="text-lg leading-7 text-texte">
                    {rang === 0 ? <strong className="font-semibold">Votre IA. </strong> : null}
                    <span className="tabular-nums">{affinitePourcent(affinite.score)}</span> d&apos;affinité avec vous
                    {rang > 0 ? `, ${rang + 1}e sur ${classement.length}` : ""}.
                  </p>
                  <SourceBadge source={sourceCalcul(DEFINITION_AFFINITE)} />
                </>
              ) : (
                <Link href="/test" className={PILULE_NOIRE}>
                  Faire le test pour mesurer votre affinité
                </Link>
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
