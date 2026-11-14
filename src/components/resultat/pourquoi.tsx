import { Barre } from "@/components/graphiques";
import { PositionLibelle } from "@/components/position";
import { SourceBadge } from "@/components/source-badge";
import { REGLE_POSITION, positionCandidate, type Affinite } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";
import { pourcent, titreLisible } from "@/lib/format";
import { prioriteDe, type Mandat } from "@/lib/mandat";
import { themeDe } from "@/lib/themes";
import type { Scrutin } from "@/lib/types";

const SOUS_TITRE = "font-titre text-lg font-semibold tracking-[-0.02em]";

/** « Pourquoi elle » : l'accord décomposé en deux barres, les textes communs, le principal désaccord, les thèmes partagés. */
export function Pourquoi({ affinite, mandat }: { affinite: Affinite; mandat: Mandat }) {
  const { candidate } = affinite;
  const couleur = candidate.teintes[1];
  // Le désaccord qui compte le plus est celui sur le thème que le citoyen a le plus priorisé.
  const desaccord =
    [...affinite.textesDivergents].sort(
      (a, b) => prioriteDe(mandat, themeDe(b.titre)) - prioriteDe(mandat, themeDe(a.titre)),
    )[0] ?? null;
  const mesures = [
    ...(affinite.accordTextes === null ? [] : [{ libelle: "Accord sur les textes", valeur: affinite.accordTextes }]),
    { libelle: "Priorités proches", valeur: affinite.accordPriorites },
  ];
  const premier = affinite.textesCommuns[0] ?? desaccord;

  return (
    <section aria-labelledby="titre-pourquoi" className="mt-24">
      <h2 id="titre-pourquoi" className="font-titre text-3xl font-semibold leading-[1.1] tracking-[-0.03em] sm:text-4xl">
        Pourquoi {candidate.prenom}
      </h2>

      <ul role="list" className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-10">
        {mesures.map((m, i) => (
          <li key={m.libelle}>
            <p className="flex items-baseline justify-between gap-4 text-[15px] leading-6">
              <span>{m.libelle}</span>
              <span className="font-semibold tabular-nums">{pourcent(m.valeur)}</span>
            </p>
            <Barre
              className="mt-2"
              valeur={m.valeur * 100}
              couleur={couleur}
              etiquette={`${m.libelle} avec ${candidate.prenom} : ${pourcent(m.valeur)}`}
              delai={i * 0.12}
            />
          </li>
        ))}
      </ul>

      {affinite.textesCommuns.length > 0 ? (
        <div className="mt-14">
          <h3 className={SOUS_TITRE}>Les textes où vous votez pareil</h3>
          <ul className="mt-4 border-t border-trait">
            {affinite.textesCommuns.map((scrutin) => (
              <LigneTexte key={scrutin.id} scrutin={scrutin} affinite={affinite} mandat={mandat} />
            ))}
          </ul>
        </div>
      ) : null}

      {desaccord ? (
        <div className="mt-14">
          <h3 className={SOUS_TITRE}>Votre principal désaccord</h3>
          <ul className="mt-4 border-t border-trait">
            <LigneTexte scrutin={desaccord} affinite={affinite} mandat={mandat} />
          </ul>
        </div>
      ) : null}

      {affinite.themesCommuns.length > 0 ? (
        <div className="mt-14">
          <h3 className={SOUS_TITRE}>Les thèmes que vous partagez</h3>
          <ul className="mt-4 flex flex-wrap gap-3">
            {affinite.themesCommuns.map((theme) => (
              <li key={theme.theme} className="inline-flex min-h-11 flex-wrap items-center rounded-full border border-trait px-5 py-2 text-[15px] font-medium">
                {theme.libelle}
                <span className="ml-2 text-sm font-normal tabular-nums text-attenue">
                  vous {prioriteDe(mandat, theme.theme)}, elle {candidate.poids[theme.theme]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-10 space-y-2">
        {premier ? <SourceBadge source={premier.source} /> : null}
        <SourceBadge source={sourceCalcul(REGLE_POSITION)} />
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
    </li>
  );
}
