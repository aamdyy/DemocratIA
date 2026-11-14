import Link from "next/link";

import { Barre } from "@/components/graphiques";
import { Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { DEFINITION_AFFINITE, type Affinite } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";
import { pourcent } from "@/lib/format";

/** L'affinité avec chacune des cinq candidates, en barres : la plus proche en tête. */
export function AutresCandidates({ classement }: { classement: Affinite[] }) {
  if (classement.length === 0) return null;
  return (
    <section aria-labelledby="titre-autres" className="mt-24">
      <h2 id="titre-autres" className="font-titre text-3xl font-semibold leading-[1.1] tracking-[-0.03em] sm:text-4xl">
        Votre affinité
      </h2>

      <ol className="mt-8 border-t border-trait">
        {classement.map(({ candidate, score }, i) => (
          <li key={candidate.id} className="border-b border-trait">
            <Link
              href={`/candidates/${candidate.id}`}
              className="group flex min-h-20 items-center gap-4 py-4 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-texte sm:gap-5"
            >
              <Sphere teintes={candidate.teintes} duree={14} className="size-11 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-4">
                  <span
                    className={`text-[17px] leading-6 tracking-[-0.01em] underline decoration-transparent underline-offset-4 group-hover:decoration-current ${i === 0 ? "font-semibold" : "font-medium"}`}
                  >
                    {candidate.prenom}
                    {i === 0 ? <span className="sr-only"> (votre IA)</span> : null}
                  </span>
                  <span className="shrink-0 text-lg font-semibold tabular-nums tracking-[-0.02em]">{pourcent(score)}</span>
                </span>
                <Barre
                  className="mt-2.5"
                  valeur={score * 100}
                  couleur={candidate.teintes[1]}
                  etiquette={`${candidate.prenom} : ${pourcent(score)} d'affinité`}
                  delai={i * 0.12}
                />
              </span>
              <span className="sr-only">, voir la fiche de {candidate.prenom}</span>
            </Link>
          </li>
        ))}
      </ol>
      <SourceBadge source={sourceCalcul(DEFINITION_AFFINITE)} className="mt-6" />
    </section>
  );
}
