"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, ViewTransition } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";

import { AvisExemple } from "@/components/avis-exemple";
import { BoutonIA } from "@/components/bouton-ia";
import { InvitationDiscrete } from "@/components/partage/invitation-discrete";
import { FiltreSphere, Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { useScrutins } from "@/lib/api";
import { CASCADE, DOUX, DUREE, ENTREE, RESSORT } from "@/lib/animation";
import { CANDIDATES, DEFINITION_AFFINITE, type Candidate } from "@/lib/candidates";
import { sourceCalcul } from "@/lib/concordance";
import { useClassement } from "@/lib/ma-candidate";

import { Composition, Votes, VotesEnAttente } from "./composition-candidate";
import { TITRE_CANDIDATES } from "./nombre";
import { affinitePourcent } from "./prenom";

const DERIVE = (c: Candidate) => 13 + CANDIDATES.indexOf(c) * 2;

const LIEN =
  "inline-flex min-h-11 items-center text-[15px] text-attenue underline decoration-trait underline-offset-4 outline-none transition-colors duration-150 hover:text-texte hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";

/** La grande sphère : assez grande pour régner, assez petite pour que la rangée du bas tienne sur un écran de portable. */
const TAILLE_CENTRE = "w-[min(52vw,220px)] sm:w-[min(62vw,260px)] lg:w-[min(320px,34dvh)]";

const sansAbonnement = () => () => {};
/** Faux pendant le rendu serveur : le classement vit dans le navigateur, on n'affiche personne au centre avant de l'avoir lu. */
const useNavigateur = () =>
  useSyncExternalStore(
    sansAbonnement,
    () => true,
    () => false,
  );

/** Une entrée décalée : chaque bloc de la page arrive à son tour, dans l'ordre de lecture. */
const entree = (rang: number, depuis: { x?: number; y?: number } = { y: 14 }) => ({
  initial: { opacity: 0, ...depuis },
  animate: { opacity: 1, x: 0, y: 0 },
  transition: { ...ENTREE.transition, delay: rang * CASCADE * 2 },
});

/**
 * /candidates : une candidate au centre, en grand (celle du citoyen s'il a passé le test), ce qui la
 * compose à gauche, ses votes sur de vrais textes à droite, et toutes les autres en petit dessous.
 * Appuyer sur une petite sphère la fait glisser au centre (layoutId partagé entre les deux tailles).
 */
export function ListeCandidates() {
  const navigateur = useNavigateur();
  const { classement, regle, chargement } = useClassement();
  const scrutins = useScrutins();
  const [choisie, setChoisie] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState("");

  // Le classement dépend du test (navigateur) et des textes (réseau) : on attend les deux pour ne pas
  // montrer une candidate au centre, puis la remplacer sous les yeux du visiteur.
  const pret = navigateur && !(regle && chargement);

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

      <motion.header {...entree(0, { y: 10 })} className="text-center">
        <h1 className="font-titre text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-tight tracking-[-0.03em] text-texte">
          {TITRE_CANDIDATES}
        </h1>
        <p className="mx-auto mt-1.5 max-w-2xl text-[15px] leading-6 text-balance text-attenue">
          Touchez une sphère pour la placer au centre<span className="max-lg:hidden"> : sa doctrine à gauche, ses votes à droite</span>.
        </p>
      </motion.header>
      <p aria-live="polite" className="sr-only">
        {annonce}
      </p>

      {!pret ? (
        <Squelette />
      ) : (
        <LayoutGroup>
          <div className="mx-auto mt-6 grid max-w-[76rem] grid-cols-1 gap-10 sm:mt-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-14 lg:gap-y-6">
            {/* Au centre : la grande sphère, son prénom, son affinité. */}
            <section
              aria-labelledby="candidate-centre"
              className="flex flex-col items-center text-center lg:col-start-2 lg:row-start-1"
            >
              <motion.div layoutId={`sphere-${centre.id}`} transition={RESSORT} className={TAILLE_CENTRE}>
                {/* Nommée comme celle de la fiche : en ouvrant la fiche, cette sphère y glisse (template.tsx). */}
                <ViewTransition name={`sphere-${centre.id}`} share="sphere-partagee" default="none">
                  <Sphere aquarelle teintes={centre.teintes} description={`Sphère de ${centre.prenom}`} className="w-full" />
                </ViewTransition>
              </motion.div>
              <div className="mt-4 grid">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={centre.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: DUREE.etat, ease: DOUX }}
                    className="col-start-1 row-start-1 flex flex-col items-center"
                  >
                    {sienne ? (
                      <p className="font-donnee text-[13px] leading-5 tracking-[0.04em] text-attenue uppercase">Votre IA</p>
                    ) : regle ? (
                      <p aria-hidden className="h-5" />
                    ) : null}
                    <h2
                      id="candidate-centre"
                      className="font-titre text-[2.25rem] font-semibold leading-tight tracking-[-0.03em] text-texte"
                    >
                      {centre.prenom}
                    </h2>
                    {scoreCentre !== null ? (
                      <p className="text-[15px] leading-6 text-texte">
                        {affinitePourcent(scoreCentre)} d&apos;affinité
                      </p>
                    ) : null}
                    <Link href={`/candidates/${centre.id}`} className={LIEN}>
                      Voir sa fiche complète
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>

            {/* En bas sur grand écran, juste sous la sphère sur téléphone : les autres, en petit. */}
            <motion.section
              {...entree(3)}
              aria-labelledby="autres-candidates"
              className="lg:col-span-3 lg:row-start-2"
            >
              <h2 id="autres-candidates" className="sr-only">
                Les autres candidates
              </h2>
              <ul role="list" className="grid grid-cols-3 gap-x-1 gap-y-1 sm:grid-cols-6 lg:flex lg:justify-center lg:gap-4">
                {autres.map((c, i) => {
                  const s = score(c);
                  return (
                    <motion.li
                      key={c.id}
                      layout="position"
                      transition={RESSORT}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0, transition: { ...ENTREE.transition, delay: 0.3 + i * CASCADE } }}
                      className="flex justify-center"
                    >
                      <button
                        type="button"
                        aria-label={`Placer ${c.prenom} au centre${s === null ? "" : `, ${affinitePourcent(s)} d'affinité`}`}
                        onClick={() => choisir(c)}
                        className="group flex min-h-11 w-24 cursor-pointer flex-col items-center rounded-2xl px-1 py-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte lg:w-28"
                      >
                        <motion.div layoutId={`sphere-${c.id}`} transition={RESSORT} className="w-16 lg:w-20">
                          <Sphere
                            teintes={c.teintes}
                            duree={DERIVE(c)}
                            className="w-full transition-transform duration-300 ease-out group-hover:scale-[1.08] group-active:scale-95 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                          />
                        </motion.div>
                        <span className="mt-2 text-base font-semibold tracking-[-0.02em] text-texte underline decoration-transparent decoration-1 underline-offset-4 transition-colors duration-150 group-hover:decoration-trait lg:text-lg">
                          {c.prenom}
                        </span>
                        {s !== null ? (
                          <span className="text-sm leading-5 tabular-nums text-attenue">{affinitePourcent(s)}</span>
                        ) : null}
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.section>

            {/* À gauche : ce qui la compose. */}
            <motion.div
              {...entree(1, { x: -16 })}
              className="self-center lg:col-start-1 lg:row-start-1"
            >
              <Composition candidate={centre} />
            </motion.div>

            {/* À droite : ses votes sur de vrais textes. */}
            <motion.div
              {...entree(2, { x: 16 })}
              className="self-center lg:col-start-3 lg:row-start-1"
              aria-busy={scrutins.isLoading}
            >
              {scrutins.isLoading ? <VotesEnAttente /> : <Votes candidate={centre} scrutins={scrutins.data?.data ?? []} />}
            </motion.div>
          </div>
        </LayoutGroup>
      )}

      {pret && !regle ? (
        <motion.div
          {...entree(4)}
          className="mt-10 flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-6"
        >
          <p className="text-[15px] leading-6 text-attenue">Laquelle vous ressemble ? Le test le dit en quelques minutes.</p>
          <BoutonIA href="/test" variante="contour">
            Passer le test
          </BoutonIA>
        </motion.div>
      ) : null}

      {pret ? (
        <motion.div {...entree(5)} className="mt-8 flex justify-center">
          <InvitationDiscrete />
        </motion.div>
      ) : null}

      <SourceBadge source={sourceCalcul(DEFINITION_AFFINITE)} className="mx-auto mt-12 max-w-xl justify-center text-center" />
    </>
  );
}

/** Avant la lecture du test : la place exacte de chaque sphère, en gris, pour que rien ne saute à l'arrivée. */
function Squelette() {
  return (
    <div role="status" className="mx-auto mt-6 max-w-[76rem] sm:mt-5">
      <span className="sr-only">Lecture de votre test…</span>
      <div aria-hidden className="flex flex-col items-center">
        <div className={`${TAILLE_CENTRE} aspect-square rounded-full bg-relief motion-safe:animate-pulse`} />
        <div className="mt-6 h-9 w-40 rounded-full bg-relief" />
        <div className="mt-4 h-4 w-32 rounded-full bg-relief" />
        <div className="mt-10 grid grid-cols-3 gap-x-8 gap-y-6 sm:grid-cols-6 lg:mt-24 lg:gap-x-12">
          {CANDIDATES.slice(1).map((c) => (
            <div key={c.id} className="flex flex-col items-center">
              <div className="size-16 rounded-full bg-relief motion-safe:animate-pulse lg:size-20" />
              <div className="mt-3 h-4 w-14 rounded-full bg-relief" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
