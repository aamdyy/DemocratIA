"use client";

import Image from "next/image";
import Link from "next/link";

import { Element, FOCUS, Reveal, Serie } from "@/components/accueil/reveal";
import { Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { CASCADE } from "@/lib/animation";
import { CANDIDATES, candidateParId } from "@/lib/candidates";
import type { Provenance } from "@/lib/types";
import { EnTete } from "./commun";
import {
  AssembleeBHumain,
  AssembleeBIA,
  DecisionsBHumain,
  DecisionsBIA,
  MandatCHumain,
  MandatCIA,
  ProgrammeCHumain,
  ProgrammeCIA,
} from "@/app/maquettes/schemas/variantes";

/** Les schémas retenus par l'équipe sur /maquettes/schemas : Mandat C, Programme C, Décisions B, Assemblée B. */
const SCHEMAS = {
  mandat: { humain: MandatCHumain, ia: MandatCIA },
  programme: { humain: ProgrammeCHumain, ia: ProgrammeCIA },
  decisions: { humain: DecisionsBHumain, ia: DecisionsBIA },
  assemblee: { humain: AssembleeBHumain, ia: AssembleeBIA },
} as const;

/**
 * Le président de 2026 face à une IA candidate. Uniquement des faits vrais sur la fonction, sourcés :
 * aucun chiffre ni aucune affirmation inventés sur la personne.
 */
const CRITERES = [
  {
    id: "mandat",
    titre: "Mandat",
    humain: "Élu pour cinq ans, sans retour devant les électeurs avant la fin.",
    ia: "Réglée à chaque vote des citoyens, à tout moment.",
  },
  {
    id: "programme",
    titre: "Programme",
    humain: "Des promesses de campagne, sans aucune valeur juridique.",
    ia: "Une règle publique, appliquée à chaque texte.",
  },
  {
    id: "decisions",
    titre: "Décisions",
    humain: "Prises en Conseil des ministres, dont les délibérations ne sont pas publiques.",
    ia: "Chaque position publiée et vérifiable.",
  },
  {
    id: "assemblee",
    titre: "Face à l'Assemblée",
    humain: "Peut la dissoudre (article 12 de la Constitution).",
    ia: "Ne dissout rien : elle vote, texte par texte.",
  },
] as const;

const HYGIE = candidateParId("hygie") ?? CANDIDATES[0];

const SOURCE_CONSTITUTION: Provenance = {
  editeur: "Constitution du 4 octobre 1958, articles 6 et 12 ; portrait officiel, Présidence de la République",
  url: "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006071194",
  licence: "Texte officiel ; photographie soumise aux droits de son auteur",
  date: null,
  nature: "publiee",
  via: null,
};

/** Le comparatif : le président de 2026 et une IA candidate, quatre faits sur la fonction. */
function Comparatif() {
  return (
    <section aria-labelledby="titre-comparatif" className="mx-auto max-w-[1120px]">
      <EnTete id="titre-comparatif" titre="Ce qu'un humain promet, une IA le tient." />

      <div className="mt-16">
        <div className="grid grid-cols-2 items-end gap-x-6 pb-6 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-12">
          <span className="hidden sm:block" />
          <Reveal className="flex flex-col items-start gap-4">
            <Image
              src="/president-2026.png"
              alt="Portrait officiel du dernier président humain"
              width={640}
              height={640}
              className="size-24 rounded-full object-cover grayscale sm:size-32"
            />
            <p className="font-medium">Le dernier président humain</p>
          </Reveal>
          <Reveal delai={CASCADE * 2} className="flex flex-col items-start gap-4">
            <Sphere teintes={HYGIE.teintes} className="size-24 sm:size-32" />
            <p className="font-medium">La première présidente IA</p>
          </Reveal>
        </div>

        <ul>
          {CRITERES.map((c) => {
            const { humain: SchemaHumain, ia: SchemaIA } = SCHEMAS[c.id];
            return (
            <li key={c.id} className="border-t border-trait">
              {/* Chaque ligne entre en trois temps : le critère, l'humain, puis l'IA. */}
              <Serie className="grid grid-cols-2 gap-x-6 gap-y-3 py-6 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-12">
                <Element className="col-span-2 sm:col-span-1">
                  <h3 className="text-lg font-semibold tracking-[-0.02em]">{c.titre}</h3>
                </Element>
                <Element className="flex flex-col gap-3">
                  <SchemaHumain />
                  <p className="text-[15px] leading-6 text-attenue">{c.humain}</p>
                </Element>
                <Element className="flex flex-col gap-3">
                  <SchemaIA />
                  <p className="text-[15px] font-medium leading-6 text-machine">{c.ia}</p>
                </Element>
              </Serie>
            </li>
            );
          })}
        </ul>
      </div>
      <SourceBadge source={SOURCE_CONSTITUTION} className="mt-8" />
    </section>
  );
}

/** La grille des sept candidates : sphère, prénom, doctrine, lien vers sa fiche. */
function Grille() {
  return (
    <section aria-labelledby="titre-grille" className="mx-auto max-w-[1120px]">
      <EnTete id="titre-grille" titre="Sept IA, sept doctrines." phrase="Chacune vote selon un programme public." />
      {/* Deux lignes centrées : quatre sphères, puis trois. */}
      <ul className="mt-16 flex flex-wrap justify-center gap-x-6 gap-y-14">
        {CANDIDATES.map((c, i) => (
          <li key={c.id} className="w-[calc(50%-0.75rem)] md:w-[calc(25%-1.125rem)]">
            {/* i % 4 : la cascade repart à chaque ligne, quatre sphères puis trois. */}
            <Reveal delai={(i % 4) * CASCADE}>
              <Link
                href={`/candidates/${c.id}`}
                className={`group flex flex-col items-center rounded-3xl text-center ${FOCUS}`}
              >
                {/* Au survol, la sphère se soulève ; à la pression, elle s'enfonce. */}
                <Sphere
                  teintes={c.teintes}
                  duree={14 + i * 3}
                  className="size-28 transition-[translate,scale] duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-105 group-active:scale-[0.97] group-active:duration-150 motion-reduce:transition-none sm:size-32"
                />
                <span className="mt-5 text-2xl font-semibold tracking-[-0.03em]">{c.prenom}</span>
                <span className="mt-1.5 min-h-11 text-[15px] leading-6 text-attenue underline decoration-trait underline-offset-4 transition-[color,text-decoration-color] duration-150 ease-out group-hover:text-texte group-hover:decoration-current">
                  {c.doctrine}
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Variante 3 : le comparatif puis la grille des candidates. */
export function HumainContreIA() {
  return (
    <>
      <Comparatif />
      <Grille />
    </>
  );
}
