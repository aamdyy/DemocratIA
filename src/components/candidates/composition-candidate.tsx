"use client";

import { motion } from "motion/react";

import { PositionLibelle } from "@/components/position";
import { SourceBadge } from "@/components/source-badge";
import { positionCandidate, type Candidate } from "@/lib/candidates";
import { titreLisible } from "@/lib/format";
import { COULEUR_THEME } from "@/lib/sphere-mandat";
import { THEMES, type ThemeId } from "@/lib/themes";
import type { Position, Scrutin } from "@/lib/types";

const DOUX = [0.2, 0.8, 0.2, 1] as const;
const H3 = "text-[15px] font-semibold leading-6 text-texte";

/** Les thèmes les plus lourds d'une candidate : ceux au-dessus de 55, trois au moins, quatre au plus. */
function themesLourds(candidate: Candidate) {
  const tries = THEMES.map((t) => ({ id: t.id as ThemeId, libelle: t.libelle as string, poids: candidate.poids[t.id] })).sort(
    (a, b) => b.poids - a.poids,
  );
  return tries.slice(0, Math.max(3, Math.min(4, tries.filter((t) => t.poids > 55).length)));
}

/** Les thèmes où la candidate vote pour (poids au-dessus de 65) ou contre (sous 35). */
function regleDe(candidate: Candidate) {
  const libelles = (garder: (p: number) => boolean) =>
    THEMES.filter((t) => garder(candidate.poids[t.id])).map((t) => t.libelle as string);
  return { pour: libelles((p) => p > 65), contre: libelles((p) => p < 35) };
}

/**
 * À gauche de la grande sphère : ce qui compose la candidate. Sa doctrine, son portrait, ses thèmes
 * les plus lourds avec leur poids, et sa règle de vote, déduite de ces poids.
 */
export function Composition({ candidate }: { candidate: Candidate }) {
  const themes = themesLourds(candidate);
  const { pour, contre } = regleDe(candidate);
  return (
    <div>
      <p className="font-titre text-2xl font-semibold leading-8 tracking-[-0.03em] text-texte">{candidate.doctrine}</p>
      <p className="mt-3 text-[15px] leading-6 text-attenue">{candidate.portrait.split(/(?<=\.)\s/)[0]}</p>

      <h3 className={`${H3} mt-8`}>Sa composition</h3>
      <ul role="list" className="mt-3 flex flex-col gap-3.5">
        {themes.map((t, i) => (
          <li key={t.id}>
            <div className="flex items-baseline justify-between gap-4 text-[15px] leading-6 text-texte">
              <span className="inline-flex items-center gap-2.5">
                <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: COULEUR_THEME[t.id] }} />
                {t.libelle}
              </span>
              <span className="font-semibold tabular-nums">{t.poids}</span>
            </div>
            <span aria-hidden className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-relief">
              <motion.span
                className="block h-full origin-left rounded-full"
                style={{ width: `${t.poids}%`, background: COULEUR_THEME[t.id] }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.07, ease: DOUX }}
              />
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm leading-6 text-attenue">
        <span className="font-medium text-texte">Règle de vote : </span>
        {pour.length ? `pour les textes ${pour.join(", ")}` : "jamais pour"}
        {contre.length ? `, contre ${contre.join(", ")}` : ""}, abstention ailleurs.
      </p>
    </div>
  );
}

/** Deux ou trois vrais textes qui montrent la candidate à l'œuvre : un pour, un contre, puis un autre. */
function textesParlants(candidate: Candidate, scrutins: Scrutin[]) {
  const avecPosition = scrutins.map((s) => ({ scrutin: s, position: positionCandidate(candidate, s) }));
  const choisis: { scrutin: Scrutin; position: Position }[] = [];
  for (const voulue of ["pour", "contre", "abstention"] as const) {
    const trouve = avecPosition.find((x) => x.position === voulue);
    if (trouve) choisis.push(trouve);
  }
  for (const x of avecPosition) {
    if (choisis.length >= 3) break;
    if (!choisis.includes(x)) choisis.push(x);
  }
  return choisis.slice(0, 3);
}

/** À droite de la grande sphère : sa position sur de vrais textes, chacun avec sa source. */
export function Votes({ candidate, scrutins }: { candidate: Candidate; scrutins: Scrutin[] }) {
  const textes = textesParlants(candidate, scrutins);
  if (!textes.length) return null;
  return (
    <div>
      <h3 className={H3}>Ses votes sur de vrais textes</h3>
      <ul role="list" className="mt-4 flex flex-col gap-6">
        {textes.map(({ scrutin, position }) => (
          <li key={scrutin.id} className="border-t border-trait pt-4">
            <p className="line-clamp-3 text-[15px] leading-6 text-texte">{titreLisible(scrutin.titre)}</p>
            <PositionLibelle position={position} machine className="mt-2 text-sm" />
            <SourceBadge source={scrutin.source} className="mt-1.5" />
          </li>
        ))}
      </ul>
    </div>
  );
}
