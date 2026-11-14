"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { useMouvementReduit } from "@/components/accueil/hooks";
import { PositionLibelle } from "@/components/position";
import { Barre } from "@/components/graphiques";
import { SourceBadge } from "@/components/source-badge";
import { Reveal } from "@/components/accueil/reveal";
import { CANDIDATES } from "@/lib/candidates";
import { EnTete, Nombre, SOURCE_EXEMPLE } from "./commun";

const FOND_SCHEMA = "rounded-3xl bg-relief p-6 sm:p-8";

/** Une étape numérotée : son numéro, son titre, une phrase, et son schéma animé. */
function Etape({
  rang,
  titre,
  phrase,
  children,
}: {
  rang: number;
  titre: string;
  phrase: string;
  children: React.ReactNode;
}) {
  return (
    <li className="grid items-center gap-x-20 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
      <Reveal>
        <p aria-hidden className="text-[clamp(3.5rem,7vw,5.5rem)] font-semibold leading-none tracking-[-0.05em] tabular-nums">
          {rang}
        </p>
        <h3 className="mt-5 text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
          <span className="sr-only">Étape {rang} sur 3 : </span>
          {titre}
        </h3>
        <p className="mt-4 max-w-[28rem] text-lg leading-8 text-attenue">{phrase}</p>
      </Reveal>
      <div className={FOND_SCHEMA}>{children}</div>
    </li>
  );
}

/** Étape 1 : une carte de loi qui glisse seule à droite, puis à gauche. */
function SchemaCarte() {
  const temps = [0, 0.28, 0.5, 0.78, 1];
  const transition = { duration: 4.6, delay: 0.5, times: temps, ease: "easeInOut" as const };
  return (
    <div>
      <p className="text-sm text-attenue">Exemple fictif</p>
      <div aria-hidden className="relative mt-4 flex h-64 items-center justify-center overflow-x-clip">
        <motion.div
          className="relative w-[min(100%,17rem)] rounded-2xl bg-fond p-6 shadow-[0_10px_34px_rgb(17_19_24/0.08)]"
          initial={{ x: 0, rotate: 0 }}
          whileInView={{ x: [0, 70, 0, -70, 0], rotate: [0, 5, 0, -5, 0] }}
          viewport={{ once: true, amount: 0.7 }}
          transition={transition}
        >
          <motion.span
            className="absolute left-4 top-4 rounded-full bg-relief px-3 py-1.5 text-sm font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: [0, 1, 0, 0, 0] }}
            viewport={{ once: true, amount: 0.7 }}
            transition={transition}
          >
            <PositionLibelle position="pour" />
          </motion.span>
          <motion.span
            className="absolute right-4 top-4 rounded-full bg-relief px-3 py-1.5 text-sm font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: [0, 0, 0, 1, 0] }}
            viewport={{ once: true, amount: 0.7 }}
            transition={transition}
          >
            <PositionLibelle position="contre" />
          </motion.span>
          <p className="mt-10 text-sm text-attenue">Proposition de loi</p>
          <p className="mt-2 text-balance text-xl font-semibold leading-tight tracking-[-0.02em]">
            Plafonner les loyers en zone tendue
          </p>
          <p className="mt-6 font-donnee text-sm text-machine">Thème estimé : Logement</p>
        </motion.div>
      </div>
      <p className="sr-only">Une carte de loi glisse vers la droite pour répondre Pour, puis vers la gauche pour répondre Contre.</p>
    </div>
  );
}

/** Affinités d'exemple, de la plus forte à la plus faible. */
const AFFINITES: { id: string; valeur: number }[] = [
  { id: "maelle", valeur: 84 },
  { id: "noe", valeur: 67 },
  { id: "iris", valeur: 55 },
  { id: "sacha", valeur: 38 },
  { id: "leon", valeur: 26 },
];

/** Étape 2 : les barres d'affinité des cinq candidates se remplissent. */
function SchemaAffinites() {
  return (
    <div>
      <p className="text-sm text-attenue">Exemple fictif</p>
      <ul className="mt-5 space-y-4">
        {AFFINITES.map((a, i) => {
          const c = CANDIDATES.find((x) => x.id === a.id)!;
          return (
            <li key={a.id} className="grid grid-cols-[4.5rem_minmax(0,1fr)_3rem] items-center gap-x-3">
              <span className="flex items-center gap-2 text-[15px] font-medium">
                <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: c.teintes[1] }} />
                {c.prenom}
              </span>
              <Barre
                valeur={a.valeur}
                couleur={c.teintes[1]}
                etiquette={`${c.prenom} : ${a.valeur} % d'affinité (exemple)`}
                delai={i * 0.14}
                className="h-3"
              />
              <Nombre valeur={a.valeur} suffixe=" %" className="text-right text-[15px] tabular-nums text-attenue" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const AMENDEMENT =
  "Article 2. Dans les zones tendues, le loyer d'un logement ne peut pas augmenter de plus de 3 % par an.";

/** Écrit un texte lettre à lettre une fois `actif`. Sans animation, le texte est là d'emblée. */
function useFrappe(longueur: number, actif: boolean): number {
  const reduit = useMouvementReduit();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!actif || reduit || n >= longueur) return;
    const minuterie = setTimeout(() => setN(n + 1), n === 0 ? 700 : 38);
    return () => clearTimeout(minuterie);
  }, [actif, reduit, n, longueur]);
  return reduit ? longueur : n;
}

/** Étape 3 : un amendement s'écrit lettre à lettre, avec son curseur. */
function SchemaAmendement() {
  const racine = useRef<HTMLDivElement>(null);
  const vu = useInView(racine, { once: true, amount: 0.7 });
  const n = useFrappe(AMENDEMENT.length, vu);
  return (
    <div ref={racine}>
      <p className="text-sm text-attenue">Exemple fictif</p>
      <div className="mt-4 rounded-2xl bg-fond p-6 shadow-[0_10px_34px_rgb(17_19_24/0.08)]">
        <p className="text-sm text-attenue">Amendement rédigé par Maëlle</p>
        <p className="sr-only">{AMENDEMENT}</p>
        <p aria-hidden className="relative mt-4 font-donnee text-[15px] leading-7 text-machine">
          <span className="invisible">{AMENDEMENT}</span>
          <span className="absolute inset-0">
            {AMENDEMENT.slice(0, n)}
            <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[3px] bg-machine motion-safe:animate-pulse" />
          </span>
        </p>
      </div>
    </div>
  );
}

/** Variante 1 : trois étapes, parce que c'est une vraie séquence. */
export function Recit() {
  return (
    <section aria-labelledby="titre-recit" className="mx-auto max-w-[1120px]">
      <EnTete id="titre-recit" titre="Trois temps pour trouver votre IA." phrase="Quelques minutes suffisent, sur de vrais textes de loi." />
      <ol className="mt-20 list-none space-y-24 sm:space-y-32" role="list">
        <Etape rang={1} titre="Tranchez de vrais textes" phrase="Pour, contre ou abstention : une carte, un texte, une réponse.">
          <SchemaCarte />
        </Etape>
        <Etape rang={2} titre="Découvrez votre IA" phrase="Chaque réponse rapproche l'une des cinq candidates de vous.">
          <SchemaAffinites />
        </Etape>
        <Etape rang={3} titre="Elle gouverne" phrase="Elle tranche à votre place et rédige ses amendements en direct.">
          <SchemaAmendement />
        </Etape>
      </ol>
      <SourceBadge source={SOURCE_EXEMPLE} className="mt-16" />
    </section>
  );
}
