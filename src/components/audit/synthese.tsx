"use client";

import { SourceBadge } from "@/components/source-badge";
import { sourceCalcul } from "@/lib/concordance";
import { PRENOM_DEPUTE_IA } from "@/lib/sphere-mandat";

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

/** Synthèse en deux colonnes : l'élu d'un côté, Olympe de l'autre. Des calculs de DemocratIA, signalés comme tels. */
export function Synthese({ synthese, nomElu }: { synthese: SyntheseAudit; nomElu: string }) {
  const { textes: n, commeMandat, commeGroupe, comparablesGroupe } = synthese;

  return (
    <div role="status" aria-live="polite">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <section aria-label={`Synthèse pour ${nomElu}`}>
          <h3 className="text-lg font-medium leading-7 text-texte">{nomElu}</h3>
          <p className="text-sm leading-6 text-attenue">Élu humain · discipline de groupe</p>
          <dl className="mt-3 border-t border-trait">
            <Mesure libelle="A voté comme votre mandat" valeur={`${commeMandat} sur ${textes(n)}`} />
            <Mesure
              libelle="A voté comme son groupe"
              valeur={comparablesGroupe > 0 ? `${commeGroupe} sur ${comparablesGroupe}` : "Aucun vote à comparer"}
            />
          </dl>
        </section>

        <section aria-label={`Synthèse pour ${PRENOM_DEPUTE_IA}`}>
          <h3 className="text-lg font-medium leading-7 text-texte">{PRENOM_DEPUTE_IA}</h3>
          <p className="font-donnee text-sm leading-6 text-machine">Député IA · mandat citoyen</p>
          <dl className="mt-3 border-t border-trait">
            <Mesure libelle="A voté comme votre mandat" valeur={`${n} sur ${textes(n)}`} />
            <Mesure libelle="A voté comme son groupe" valeur="Ne suit aucun groupe" />
          </dl>
        </section>
      </div>
      <SourceBadge source={sourceCalcul(DEFINITION_AUDIT)} className="mt-6 max-w-4xl" />
    </div>
  );
}
