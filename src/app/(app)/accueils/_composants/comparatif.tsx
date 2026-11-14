"use client";

import Link from "next/link";

import { Barre } from "@/components/graphiques";
import { FOCUS, Reveal } from "@/components/accueil/reveal";
import { Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { CANDIDATES, candidateParId } from "@/lib/candidates";
import { EnTete, Nombre, SOURCE_EXEMPLE } from "./commun";

/** Critères satiriques : un élu imaginaire, jamais un élu réel, face à une IA candidate. Plus haut vaut mieux. */
const CRITERES = [
  { id: "programme", titre: "Programme tenu", humain: 38, ia: 100 },
  { id: "lecture", titre: "Textes lus en entier", humain: 9, ia: 100 },
  { id: "verifiables", titre: "Votes vérifiables", humain: 41, ia: 100 },
  { id: "lobbys", titre: "Indépendance face aux lobbys", humain: 46, ia: 92 },
] as const;

const MAELLE = candidateParId("maelle") ?? CANDIDATES[0];

function Cellule({
  qui,
  critere,
  valeur,
  couleur,
  delai,
}: {
  qui: string;
  critere: string;
  valeur: number;
  couleur: string;
  delai: number;
}) {
  return (
    <div>
      <p className="mb-2 flex items-baseline justify-between text-[15px] sm:mb-3 sm:justify-end">
        <span className="text-attenue sm:sr-only">{qui}</span>
        <Nombre valeur={valeur} suffixe=" %" className="text-2xl font-semibold tabular-nums tracking-[-0.03em]" />
      </p>
      <Barre
        valeur={valeur}
        couleur={couleur}
        etiquette={`${critere}, ${qui} : ${valeur} % (exemple fictif)`}
        delai={delai}
        className="h-3"
      />
    </div>
  );
}

/** Le comparatif : deux colonnes, un élu imaginaire et une IA, quatre critères. */
function Comparatif() {
  return (
    <section aria-labelledby="titre-comparatif" className="mx-auto max-w-[1120px]">
      <EnTete id="titre-comparatif" titre="Ce qu'un humain promet, une IA le tient." phrase="Quatre critères, sur un élu imaginaire et une IA candidate." />

      <div className="mt-16">
        <div className="hidden items-end gap-x-12 pb-2 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <p className="text-sm text-attenue">Exemple fictif</p>
          <div className="flex items-center gap-3">
            <span aria-hidden className="size-9 rounded-full bg-[radial-gradient(circle_at_35%_30%,#eceef1,#b4b8c2)]" />
            <p className="font-medium">Un élu imaginaire</p>
          </div>
          <div className="flex items-center gap-3">
            <Sphere teintes={MAELLE.teintes} className="size-9" />
            <p className="font-medium">Une IA candidate</p>
          </div>
        </div>

        <ul className="divide-y-0">
          {CRITERES.map((c, i) => (
            <li key={c.id} className="grid gap-x-12 gap-y-4 py-7 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-end">
              <h3 className="text-xl font-semibold tracking-[-0.02em]">{c.titre}</h3>
              <Cellule qui="Élu imaginaire" critere={c.titre} valeur={c.humain} couleur="var(--attenue)" delai={i * 0.1} />
              <Cellule qui="IA candidate" critere={c.titre} valeur={c.ia} couleur="var(--machine)" delai={i * 0.1 + 0.2} />
            </li>
          ))}
        </ul>
      </div>
      <SourceBadge source={SOURCE_EXEMPLE} className="mt-10" />
    </section>
  );
}

/** La grille des cinq candidates : sphère, prénom, doctrine, lien vers sa fiche. */
function Grille() {
  return (
    <section aria-labelledby="titre-grille" className="mx-auto max-w-[1120px]">
      <EnTete id="titre-grille" titre="Cinq IA, cinq doctrines." phrase="Chacune vote selon un programme public." />
      <ul className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-5">
        {CANDIDATES.map((c, i) => (
          <li key={c.id}>
            <Reveal delai={i * 0.08}>
              <Link href={`/candidates/${c.id}`} className={`group flex flex-col items-center text-center ${FOCUS}`}>
                <Sphere
                  teintes={c.teintes}
                  duree={14 + i * 3}
                  className="size-28 transition-transform duration-300 group-hover:scale-105 sm:size-32"
                />
                <span className="mt-5 text-2xl font-semibold tracking-[-0.03em]">{c.prenom}</span>
                <span className="mt-1.5 min-h-11 text-[15px] leading-6 text-attenue underline decoration-trait underline-offset-4 group-hover:decoration-current">
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
