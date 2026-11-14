"use client";

import { MotionConfig } from "motion/react";
import { useState } from "react";

import { AvisExemple } from "@/components/avis-exemple";
import { FiltreSphere } from "@/components/sphere";
import { usePositions, useScrutins } from "@/lib/api";
import { concordanceParGroupe } from "@/lib/concordance";
import { LIBELLE_POSITION, titreLisible } from "@/lib/format";
import { mandat, useMandat } from "@/lib/mandat";
import { PRENOM_DEPUTE_IA, sphereDuMandat } from "@/lib/sphere-mandat";
import type { Position, PositionsParScrutin, Provenance, Scrutin } from "@/lib/types";

import { AccordGroupes } from "./accord-groupes";
import { Arbitrages } from "./arbitrages";
import { Olympe } from "./olympe";
import { PileEnAttente, PileEnErreur, PileTextes, PileVide } from "./pile-textes";
import { Priorites } from "./priorites";

const AUCUN_SCRUTIN: Scrutin[] = [];
const AUCUNE_POSITION: PositionsParScrutin = {};

/** Vue 1 : le citoyen tranche des textes et règle ses priorités ; la sphère et l'accord suivent. */
export function VueMandat() {
  const reglages = useMandat();
  const lectureScrutins = useScrutins();
  const scrutins = lectureScrutins.data?.data ?? AUCUN_SCRUTIN;
  const lecturePositions = usePositions(scrutins.map((scrutin) => scrutin.id));
  const positions = lecturePositions.data?.data ?? AUCUNE_POSITION;

  // Sens du dernier geste : la carte sort de ce côté. Nul quand un arbitrage vient d'être retiré.
  const [geste, setGeste] = useState<Position | null>(null);
  const [annonce, setAnnonce] = useState("");

  const restants = scrutins.filter((scrutin) => !reglages.votes[scrutin.id]);
  const enCours = restants[0] ?? null;
  const parId = new Map(scrutins.map((scrutin) => [scrutin.id, scrutin]));
  // Le dernier texte tranché apparaît en premier, juste sous la pile.
  const arbitres = Object.keys(reglages.votes)
    .flatMap((id) => parId.get(id) ?? [])
    .reverse();
  const concordance = concordanceParGroupe(reglages, positions, scrutins);
  const sphere = sphereDuMandat(reglages);

  const metaScrutins = lectureScrutins.data?.meta;
  const metaAvis = metaScrutins?.origine === "exemple" ? metaScrutins : lecturePositions.data?.meta;

  // Les positions des groupes portent sur les mêmes scrutins : elles ont le même éditeur et la même licence.
  const sourcePositions: Provenance | null = arbitres[0] ? { ...arbitres[0].source, url: null, date: null } : null;

  function arbitrer(position: Position) {
    if (!enCours) return;
    const suivant = restants[1];
    setGeste(position);
    setAnnonce(
      `Arbitrage enregistré : ${LIBELLE_POSITION[position].toLowerCase()}, sur « ${titreLisible(enCours.titre)} ». ${
        suivant ? `Texte suivant : ${titreLisible(suivant.titre)}.` : "Tous les textes sont arbitrés."
      }`,
    );
    mandat.voter(enCours.id, position);
  }

  function modifier(scrutin: Scrutin) {
    setGeste(null);
    setAnnonce(`Arbitrage retiré : « ${titreLisible(scrutin.titre)} » revient dans la pile.`);
    mandat.retirerVote(scrutin.id);
  }

  return (
    <MotionConfig reducedMotion="user">
      <FiltreSphere />
      <AvisExemple meta={metaAvis} />

      <header className="max-w-2xl">
        <h1 className="font-titre text-[clamp(2rem,4vw,2.75rem)] font-medium leading-[1.08] tracking-[-0.03em]">
          Façonnez votre Député IA
        </h1>
        <p className="mt-4 text-lg leading-8 text-attenue">
          Tranchez de vrais textes de loi, puis dites ce qui compte le plus pour vous. {PRENOM_DEPUTE_IA} votera à votre
          place, exactement comme vous l&apos;avez réglée.
        </p>
      </header>

      <div className="mt-12 grid gap-x-16 gap-y-16 lg:grid-cols-2">
        <div className="min-w-0">
          {lectureScrutins.error ? (
            <PileEnErreur
              message={lectureScrutins.error instanceof Error ? lectureScrutins.error.message : null}
              onReessayer={() => void lectureScrutins.mutate()}
            />
          ) : !lectureScrutins.data ? (
            <PileEnAttente />
          ) : scrutins.length === 0 ? (
            <PileVide />
          ) : (
            <PileTextes
              scrutin={enCours}
              rang={Math.min(scrutins.length - restants.length + 1, scrutins.length)}
              total={scrutins.length}
              enReserve={Math.max(restants.length - 1, 0)}
              geste={geste}
              onArbitrer={arbitrer}
            />
          )}
          <Arbitrages arbitres={arbitres} votes={reglages.votes} onModifier={modifier} />
        </div>

        <section aria-labelledby="titre-olympe" className="min-w-0">
          <Olympe sphere={sphere} aucunReglage={Object.keys(reglages.priorites).length === 0} />
          <Priorites reglages={reglages} dominantes={sphere.dominantes.map((dominante) => dominante.theme)} />
          <AccordGroupes
            concordance={concordance}
            nombreArbitres={arbitres.length}
            etatPositions={lecturePositions.error ? "erreur" : lecturePositions.data ? "pret" : "chargement"}
            sourcePositions={sourcePositions}
          />
        </section>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {annonce}
      </p>
    </MotionConfig>
  );
}
