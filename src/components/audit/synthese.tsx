"use client";

import { SourceBadge } from "@/components/source-badge";
import { sourceCalcul } from "@/lib/concordance";
import type { Candidate } from "@/lib/candidates";

import { DEFINITION_AUDIT, type SyntheseAudit } from "./calcul";

const textes = (n: number) => (n > 1 ? `${n} textes` : `${n} texte`);

function Mesure({ libelle, valeur }: { libelle: string; valeur: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-trait py-4">
      <dt className="text-[15px] leading-6 text-texte">{libelle}</dt>
      <dd className="font-donnee text-lg leading-7 text-machine">{valeur}</dd>
    </div>
  );
}

/** Synthèse en deux colonnes : l'élu d'un côté, votre IA de l'autre. Des calculs de DemocratIA, signalés comme tels. */
export function Synthese({ synthese, nomElu, candidate }: { synthese: SyntheseAudit; nomElu: string; candidate: Candidate }) {
  const { textes: n, commeMandat, iaCommeMandat, commeGroupe, comparablesGroupe } = synthese;

  return (
    <div role="status" aria-live="polite">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <section aria-label={`Synthèse pour ${nomElu}`}>
          <h3 className="font-titre text-xl font-semibold leading-7 tracking-[-0.02em] text-texte">{nomElu}</h3>
          <p className="text-sm leading-6 text-attenue">Élu humain, discipline de groupe</p>
          <dl className="mt-3 border-t border-trait">
            <Mesure libelle="A voté comme vous" valeur={`${commeMandat} sur ${textes(n)}`} />
            <Mesure
              libelle="A voté comme son groupe"
              valeur={comparablesGroupe > 0 ? `${commeGroupe} sur ${comparablesGroupe}` : "Aucun vote à comparer"}
            />
          </dl>
        </section>

        <section aria-label={`Synthèse pour ${candidate.prenom}`}>
          <h3 className="font-titre text-xl font-semibold leading-7 tracking-[-0.02em] text-texte">{candidate.prenom}</h3>
          <p className="font-donnee text-sm leading-6 text-machine">Votre IA, candidate à la présidence</p>
          <dl className="mt-3 border-t border-trait">
            <Mesure libelle="Vote comme vous" valeur={`${iaCommeMandat} sur ${textes(n)}`} />
            <Mesure libelle="Suit un groupe" valeur="Aucun, seulement son programme" />
          </dl>
        </section>
      </div>
      <SourceBadge source={sourceCalcul(DEFINITION_AUDIT)} className="mt-8 max-w-4xl" />
    </div>
  );
}
