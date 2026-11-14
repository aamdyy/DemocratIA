"use client";

import { AnimatePresence, motion } from "motion/react";

import { PositionLibelle } from "@/components/position";
import { SourceBadge } from "@/components/source-badge";
import { DOUX, DUREE, RESSORT } from "@/lib/animation";
import { positionCandidate, type Candidate } from "@/lib/candidates";
import { COULEUR_THEME } from "@/lib/sphere-mandat";
import { THEMES, type ThemeId } from "@/lib/themes";
import type { Position, Scrutin } from "@/lib/types";

import { Chiffre } from "./chiffre";
import { titreCourt, titreEssentiel } from "./titre";

const H3 = "text-[15px] font-semibold leading-6 text-texte";

/** Ce qui change de contenu : l'ancien glisse et s'efface, le nouveau arrive juste derrière. */
const RELAIS = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: DUREE.etat, ease: DOUX },
} as const;

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
 * les plus lourds avec leur poids, et sa règle de vote, déduite de ces poids. Le bloc reste monté d'une
 * candidate à l'autre : les barres glissent vers leur nouveau poids, les thèmes se réordonnent.
 */
export function Composition({ candidate }: { candidate: Candidate }) {
  const themes = themesLourds(candidate);
  const { pour, contre } = regleDe(candidate);
  return (
    <div>
      <div className="grid">
        <AnimatePresence initial={false}>
          <motion.div key={candidate.id} {...RELAIS} className="col-start-1 row-start-1">
            <p className="font-titre text-2xl font-semibold leading-8 tracking-[-0.03em] text-texte">{candidate.doctrine}</p>
            <p className="mt-2 text-[15px] leading-6 text-attenue">{candidate.portrait.split(/(?<=\.)\s/)[0]}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <h3 className={`${H3} mt-6`}>Sa composition</h3>
      <ul role="list" className="relative mt-3 flex flex-col gap-3">
        <AnimatePresence initial={false} mode="popLayout">
          {themes.map((t, i) => (
            <motion.li
              key={t.id}
              layout="position"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ ...RESSORT, opacity: { duration: DUREE.etat, ease: DOUX } }}
            >
              <div className="flex items-baseline justify-between gap-4 text-[15px] leading-6 text-texte">
                <span className="inline-flex items-center gap-2.5">
                  <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: COULEUR_THEME[t.id] }} />
                  {t.libelle}
                </span>
                <Chiffre valeur={t.poids} className="font-semibold" />
              </div>
              <span aria-hidden className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-relief">
                <motion.span
                  className="block h-full w-full origin-left rounded-full"
                  style={{ background: COULEUR_THEME[t.id] }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: t.poids / 100 }}
                  transition={{ duration: DUREE.entree, delay: 0.1 + i * 0.07, ease: DOUX }}
                />
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className="mt-5 grid">
        <AnimatePresence initial={false}>
          <motion.p key={candidate.id} {...RELAIS} className="col-start-1 row-start-1 text-sm leading-6 text-attenue">
            <span className="font-medium text-texte">Règle de vote : </span>
            {pour.length ? `pour les textes ${pour.join(", ")}` : "jamais pour"}
            {contre.length ? `, contre ${contre.join(", ")}` : ""}, abstention ailleurs.
          </motion.p>
        </AnimatePresence>
      </div>
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

/** Les lignes grisées qui tiennent la place des votes pendant la lecture des textes : rien ne saute à l'arrivée. */
export function VotesEnAttente() {
  return (
    <div role="status">
      <span className="sr-only">Lecture des textes de l&apos;Assemblée…</span>
      <div aria-hidden>
        <div className="h-6 w-48 rounded-full bg-relief" />
        <div className="mt-4 flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-t border-trait pt-3">
              <div className="h-3 w-11/12 rounded-full bg-relief motion-safe:animate-pulse" />
              <div className="mt-2.5 h-3 w-7/12 rounded-full bg-relief motion-safe:animate-pulse" />
              <div className="mt-4 h-3 w-20 rounded-full bg-relief motion-safe:animate-pulse" />
              <div className="mt-4 h-8 w-56 rounded-full bg-relief motion-safe:animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * À droite de la grande sphère : sa position sur de vrais textes, chacun avec sa source. Un texte commun à deux
 * candidates reste en place et seule la position change ; les autres glissent dehors et dedans.
 */
export function Votes({ candidate, scrutins }: { candidate: Candidate; scrutins: Scrutin[] }) {
  const textes = textesParlants(candidate, scrutins);
  if (!textes.length) return null;
  return (
    <div>
      <h3 className={H3}>Ses votes sur de vrais textes</h3>
      <ul role="list" className="relative mt-3 flex flex-col gap-4">
        <AnimatePresence initial={false} mode="popLayout">
          {textes.map(({ scrutin, position }) => (
            <motion.li
              key={scrutin.id}
              layout="position"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ ...RESSORT, opacity: { duration: DUREE.etat, ease: DOUX } }}
              className="border-t border-trait pt-3"
            >
              <p className="line-clamp-2 text-[15px] leading-6 text-texte" title={titreCourt(scrutin.titre)}>
                {titreEssentiel(scrutin.titre)}
              </p>
              <span className="mt-1.5 grid">
                <AnimatePresence initial={false}>
                  <motion.span
                    key={position}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: DUREE.etat, ease: DOUX }}
                    className="col-start-1 row-start-1"
                  >
                    <PositionLibelle position={position} machine className="text-sm" />
                  </motion.span>
                </AnimatePresence>
              </span>
              <SourceBadge source={scrutin.source} className="mt-1" />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
