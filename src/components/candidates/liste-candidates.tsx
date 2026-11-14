"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";

import { AvisExemple } from "@/components/avis-exemple";
import { BoutonIA } from "@/components/bouton-ia";
import { FiltreSphere, Sphere } from "@/components/sphere";
import { SphereVocale } from "@/components/sphere-vocale";
import { SourceBadge } from "@/components/source-badge";
import { useScrutins } from "@/lib/api";
import { CANDIDATES, DEFINITION_AFFINITE, type Candidate } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";
import { useClassement } from "@/lib/ma-candidate";

import { Composition, Votes } from "./composition-candidate";
import { TITRE_CANDIDATES } from "./nombre";
import { affinitePourcent } from "./prenom";

/** Ressort doux, sans rebond : la sphère choisie glisse au centre, l'ancienne redescend. */
const RESSORT = { type: "spring", bounce: 0, duration: 0.7 } as const;
const FONDU = { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] } as const;
const DUREE = (c: Candidate) => 13 + CANDIDATES.indexOf(c) * 2;

const LIEN =
  "inline-flex min-h-11 items-center text-[15px] text-attenue underline decoration-trait underline-offset-4 outline-none transition-colors duration-150 hover:text-texte hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";

/**
 * /candidates : une candidate au centre, en grand (celle du citoyen s'il a passé le test), ce qui la
 * compose à gauche, ses votes sur de vrais textes à droite, et toutes les autres en petit dessous.
 * Appuyer sur une petite sphère la fait glisser au centre (layoutId partagé entre les deux tailles).
 */
export function ListeCandidates() {
  const { classement, regle } = useClassement();
  const scrutins = useScrutins();
  const [choisie, setChoisie] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState("");

  // Avec le test, la plus proche d'abord ; sans lui, l'ordre de la liste.
  const ordre = regle ? classement.map((a) => a.candidate) : CANDIDATES;
  const score = (c: Candidate) => (regle ? (classement.find((a) => a.candidate.id === c.id)?.score ?? null) : null);
  const centre = ordre.find((c) => c.id === choisie) ?? ordre[0];
  const autres = ordre.filter((c) => c.id !== centre.id);
  const sienne = regle && centre.id === ordre[0].id;
  const scoreCentre = score(centre);

  const choisir = (c: Candidate) => {
    setChoisie(c.id);
    const s = score(c);
    setAnnonce(`${c.prenom} au centre${s === null ? "" : `, ${affinitePourcent(s)} d'affinité`} : ${c.doctrine}`);
  };

  return (
    <>
      <FiltreSphere />
      <AvisExemple meta={scrutins.data?.meta} />

      <h1 className="text-center font-titre text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-tight tracking-[-0.03em] text-texte">
        {TITRE_CANDIDATES}
      </h1>
      <p aria-live="polite" className="sr-only">
        {annonce}
      </p>

      <LayoutGroup>
        <div className="mx-auto mt-6 grid max-w-[76rem] grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_360px_minmax(0,1fr)] lg:gap-14">
          {/* Au centre : la grande sphère, son prénom, son affinité. */}
          <section aria-labelledby="candidate-centre" className="flex flex-col items-center text-center lg:order-2">
            <motion.div
              layoutId={`sphere-${centre.id}`}
              transition={RESSORT}
              className="w-[min(78vw,360px)] lg:w-[360px]"
            >
              <SphereVocale teintes={centre.teintes} description={`Sphère de ${centre.prenom}`} className="w-full" />
            </motion.div>
            <div className="mt-5 grid">
              <AnimatePresence initial={false}>
                <motion.div
                  key={centre.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={FONDU}
                  className="col-start-1 row-start-1 flex flex-col items-center"
                >
                  {sienne ? <p className="text-[15px] font-medium leading-6 text-attenue">Votre IA</p> : null}
                  <h2
                    id="candidate-centre"
                    className="font-titre text-[2.75rem] font-semibold leading-tight tracking-[-0.03em] text-texte"
                  >
                    {centre.prenom}
                  </h2>
                  {scoreCentre !== null ? (
                    <p className="mt-1 text-[15px] leading-6 tabular-nums text-texte">
                      {affinitePourcent(scoreCentre)} d&apos;affinité
                    </p>
                  ) : null}
                  <Link href={`/candidates/${centre.id}`} className={`${LIEN} mt-1`}>
                    Voir sa fiche complète
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* À gauche : ce qui la compose. */}
          <Fondu id={centre.id} className="lg:order-1">
            <Composition candidate={centre} />
          </Fondu>

          {/* À droite : ses votes sur de vrais textes. */}
          <Fondu id={centre.id} className="lg:order-3">
            <Votes candidate={centre} scrutins={scrutins.data?.data ?? []} />
          </Fondu>
        </div>

        {/* En bas : les autres, en petit. */}
        <section aria-labelledby="autres-candidates" className="mt-8">
          <h2 id="autres-candidates" className="sr-only">
            Les autres candidates
          </h2>
          <ul
            role="list"
            className="-mx-4 flex snap-x gap-1 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:justify-center lg:gap-4 lg:overflow-visible lg:px-0"
          >
            {autres.map((c) => {
              const s = score(c);
              return (
                <li key={c.id} className="shrink-0 snap-start">
                  <button
                    type="button"
                    aria-pressed={false}
                    aria-label={`Voir ${c.prenom}`}
                    onClick={() => choisir(c)}
                    className="group flex min-h-11 w-28 cursor-pointer flex-col items-center rounded-2xl px-2 py-3 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte"
                  >
                    <motion.div layoutId={`sphere-${c.id}`} transition={RESSORT} className="w-24">
                      <Sphere
                        teintes={c.teintes}
                        duree={DUREE(c)}
                        className="w-full transition-transform duration-300 ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    </motion.div>
                    <span className="mt-3 text-lg font-semibold tracking-[-0.03em] text-texte underline decoration-transparent decoration-1 underline-offset-4 transition-colors duration-150 group-hover:decoration-trait">
                      {c.prenom}
                    </span>
                    {s !== null ? (
                      <span className="text-sm leading-5 tabular-nums text-attenue">{affinitePourcent(s)}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </LayoutGroup>

      {!regle ? (
        <div className="mt-10 flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-6">
          <p className="text-[15px] leading-6 text-attenue">Passez le test pour savoir laquelle est la vôtre</p>
          <BoutonIA href="/test" variante="contour">
            Passer le test
          </BoutonIA>
        </div>
      ) : null}

      <SourceBadge source={sourceCalcul(DEFINITION_AFFINITE)} className="mx-auto mt-12 max-w-xl justify-center text-center" />
    </>
  );
}

/** Fondu enchaîné : l'ancien contenu s'efface pendant que le nouveau apparaît, dans la même case. */
function Fondu({ id, className, children }: { id: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`grid self-center ${className ?? ""}`}>
      <AnimatePresence>
        <motion.div
          key={id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={FONDU}
          className="col-start-1 row-start-1"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
