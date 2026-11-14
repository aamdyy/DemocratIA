import Link from "next/link";

import { Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { DEFINITION_AFFINITE, type Affinite } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";
import { pourcent } from "@/lib/format";

/** Le classement des autres candidates, de la plus proche à la plus éloignée. */
export function AutresCandidates({ autres }: { autres: Affinite[] }) {
  if (autres.length === 0) return null;
  return (
    <section aria-labelledby="titre-autres" className="mt-24 border-t border-trait pt-12">
      <h2 id="titre-autres" className="font-titre text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
        Les autres candidates
      </h2>
      <p className="mt-3 max-w-xl text-[17px] leading-7 text-attenue">
        De la plus proche de vous à la plus éloignée. Chacune a une fiche.
      </p>
      <SourceBadge source={sourceCalcul(DEFINITION_AFFINITE)} className="mt-3" />

      <ol className="mt-8 border-t border-trait">
        {autres.map(({ candidate, score }, i) => (
          <li key={candidate.id} className="border-b border-trait">
            <Link
              href={`/candidates/${candidate.id}`}
              className="group flex min-h-20 items-center gap-5 py-4 transition-colors duration-150"
            >
              <span aria-hidden className="w-5 shrink-0 text-sm tabular-nums text-attenue">
                {i + 2}
              </span>
              <Sphere teintes={candidate.teintes} duree={14} className="size-12 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-semibold leading-6 tracking-[-0.01em] underline decoration-transparent underline-offset-4 group-hover:decoration-current">
                  {candidate.prenom}
                </span>
                <span className="block truncate text-sm text-attenue">{candidate.doctrine}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-lg font-semibold tabular-nums tracking-[-0.02em]">{pourcent(score)}</span>
                <span className="block text-xs text-attenue">d&apos;affinité</span>
              </span>
              <span className="sr-only">, voir la fiche de {candidate.prenom}</span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-6">
        <Link
          href="/candidates"
          className="inline-flex min-h-11 items-center text-[15px] font-medium underline decoration-trait underline-offset-4 transition-colors hover:decoration-current"
        >
          Voir toutes les candidates
        </Link>
      </p>
    </section>
  );
}
