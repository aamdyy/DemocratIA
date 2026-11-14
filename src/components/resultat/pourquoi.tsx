import { PositionLibelle } from "@/components/position";
import { SourceBadge } from "@/components/source-badge";
import { DEFINITION_AFFINITE, REGLE_POSITION, positionCandidate, type Affinite } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";
import { pourcent, titreLisible } from "@/lib/format";
import { prioriteDe, type Mandat } from "@/lib/mandat";
import { themeDe } from "@/lib/themes";
import type { Scrutin } from "@/lib/types";

const SOUS_TITRE = "font-titre text-xl font-semibold tracking-[-0.03em]";

/** « Pourquoi elle » : les textes où vous votez pareil, le principal désaccord, les thèmes en commun. */
export function Pourquoi({ affinite, mandat }: { affinite: Affinite; mandat: Mandat }) {
  const { candidate } = affinite;
  // Le désaccord qui compte le plus est celui sur le thème que le citoyen a le plus priorisé.
  const desaccord =
    [...affinite.textesDivergents].sort(
      (a, b) => prioriteDe(mandat, themeDe(b.titre)) - prioriteDe(mandat, themeDe(a.titre)),
    )[0] ?? null;
  const nombreTranches = Object.keys(mandat.votes).length;

  return (
    <section aria-labelledby="titre-pourquoi" className="mt-24 border-t border-trait pt-12">
      <h2 id="titre-pourquoi" className="font-titre text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
        Pourquoi {candidate.prenom}
      </h2>
      <p className="mt-3 max-w-xl text-[17px] leading-7 text-attenue">
        {affinite.accordTextes === null
          ? "Vous n'avez tranché aucun texte : l'affinité repose uniquement sur vos priorités."
          : `L'affinité mêle votre accord sur les textes (${pourcent(affinite.accordTextes)}) et la proximité de vos priorités (${pourcent(affinite.accordPriorites)}).`}
      </p>
      <SourceBadge source={sourceCalcul(DEFINITION_AFFINITE)} className="mt-3" />

      <div className="mt-12">
        <h3 className={SOUS_TITRE}>Les textes où vous votez pareil</h3>
        {affinite.textesCommuns.length === 0 ? (
          <p className="mt-3 max-w-xl text-[15px] leading-6 text-attenue">
            {nombreTranches === 0
              ? "Aucun texte tranché pour l'instant."
              : `Aucun des textes que vous avez tranchés n'est voté dans le même sens par ${candidate.prenom}.`}
          </p>
        ) : (
          <ul className="mt-4 border-t border-trait">
            {affinite.textesCommuns.map((scrutin) => (
              <LigneTexte key={scrutin.id} scrutin={scrutin} affinite={affinite} mandat={mandat} />
            ))}
          </ul>
        )}
      </div>

      <div className="mt-12">
        <h3 className={SOUS_TITRE}>Votre principal désaccord</h3>
        {desaccord ? (
          <ul className="mt-4 border-t border-trait">
            <LigneTexte scrutin={desaccord} affinite={affinite} mandat={mandat} />
          </ul>
        ) : (
          <p className="mt-3 max-w-xl text-[15px] leading-6 text-attenue">
            {nombreTranches === 0
              ? "Aucun texte tranché pour l'instant."
              : `Sur les textes que vous avez tranchés, ${candidate.prenom} ne vous contredit jamais frontalement.`}
          </p>
        )}
      </div>

      <div className="mt-12">
        <h3 className={SOUS_TITRE}>Les thèmes que vous partagez</h3>
        {affinite.themesCommuns.length === 0 ? (
          <p className="mt-3 max-w-xl text-[15px] leading-6 text-attenue">
            Réglez au moins un thème à 60 ou plus pour voir ce que vous partagez avec {candidate.prenom}.
          </p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-3">
            {affinite.themesCommuns.map((theme) => (
              <li key={theme.theme} className="inline-flex min-h-11 items-center rounded-full border border-trait px-5 text-[15px] font-medium">
                {theme.libelle}
                <span className="ml-2 text-sm font-normal tabular-nums text-attenue">
                  {prioriteDe(mandat, theme.theme)} sur 100, elle : {candidate.poids[theme.theme]}
                </span>
              </li>
            ))}
          </ul>
        )}
        <SourceBadge source={sourceCalcul(DEFINITION_AFFINITE)} className="mt-3" />
      </div>

      <div className="mt-12 max-w-xl">
        <h3 className={SOUS_TITRE}>Comment {candidate.prenom} vote</h3>
        <SourceBadge source={sourceCalcul(REGLE_POSITION)} className="mt-3 text-sm leading-6" />
      </div>
    </section>
  );
}

function LigneTexte({ scrutin, affinite, mandat }: { scrutin: Scrutin; affinite: Affinite; mandat: Mandat }) {
  const moi = mandat.votes[scrutin.id];
  const elle = positionCandidate(affinite.candidate, scrutin);
  return (
    <li className="border-b border-trait py-5">
      <h4 className="text-[17px] font-semibold leading-6 tracking-[-0.01em]">{titreLisible(scrutin.titre)}</h4>
      <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-2 text-[15px] leading-6">
        <dt className="text-attenue">Vous</dt>
        <dd>{moi ? <PositionLibelle position={moi} /> : null}</dd>
        <dt className="text-attenue">{affinite.candidate.prenom}</dt>
        <dd>
          <PositionLibelle position={elle} machine />
        </dd>
      </dl>
      <SourceBadge source={scrutin.source} className="mt-3" />
    </li>
  );
}
