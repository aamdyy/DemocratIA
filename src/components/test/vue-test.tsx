"use client";

import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { AvisExemple } from "@/components/avis-exemple";
import { FiltreSphere, Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { useScrutins } from "@/lib/api";
import { sourceCalcul } from "@/lib/concordance";
import { LIBELLE_POSITION, titreLisible } from "@/lib/format";
import { mandat, useMandat } from "@/lib/mandat";
import type { Position, Scrutin } from "@/lib/types";

import { PileEnAttente, PileEnErreur, PileTextes, PileVide, type Geste } from "./pile-textes";
import { Priorites } from "./priorites";
import { sphereDuTest } from "./sphere-test";

const AUCUN_SCRUTIN: Scrutin[] = [];

/** Quand une couleur entre dans la sphère, elle fond au lieu de sauter. */
const STYLE_SPHERE = `
.sphere-test .sphere-nuage { transition: scale 400ms ease-out, background-color 600ms ease-out; }
@media (prefers-reduced-motion: reduce) { .sphere-test .sphere-nuage { transition: none; } }
`;

const DEFINITION_SPHERE = "Les couleurs de la sphère viennent des thèmes de vos réponses et de vos priorités.";

const TITRE = "font-titre text-[clamp(1.75rem,3.6vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]";

const DOUX = [0.2, 0.8, 0.2, 1] as const;

type Historique = { id: string; genre: "vote" | "passe" };

/** L'onboarding : deux étapes, des textes à trancher puis des priorités, pendant qu'une sphère se colore. */
export function VueTest() {
  const reglages = useMandat();
  const lecture = useScrutins();
  const scrutins = lecture.data?.data ?? AUCUN_SCRUTIN;

  const [etape, setEtape] = useState<1 | 2>(1);
  const [geste, setGeste] = useState<Geste>(null);
  const [passes, setPasses] = useState<string[]>([]);
  const [historique, setHistorique] = useState<Historique[]>([]);
  const [annonce, setAnnonce] = useState("");

  const titreEtape = useRef<HTMLHeadingElement>(null);
  const premierRendu = useRef(true);
  useEffect(() => {
    // Au changement d'étape, le clavier et les lecteurs d'écran suivent le nouveau titre.
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    titreEtape.current?.focus({ preventScroll: false });
  }, [etape]);

  const restants = scrutins.filter((s) => !reglages.votes[s.id] && !passes.includes(s.id));
  const enCours = restants[0] ?? null;
  const traites = scrutins.length - restants.length;
  const sphere = sphereDuTest(reglages, scrutins);

  function arbitrer(position: Position) {
    if (!enCours) return;
    const suivant = restants[1];
    setGeste(position);
    setHistorique((h) => [...h, { id: enCours.id, genre: "vote" }]);
    setAnnonce(
      `Réponse enregistrée : ${LIBELLE_POSITION[position].toLowerCase()}, sur « ${titreLisible(enCours.titre)} ». ${
        suivant ? `Texte suivant : ${titreLisible(suivant.titre)}.` : "Tous les textes sont parcourus."
      }`,
    );
    mandat.voter(enCours.id, position);
  }

  function passer() {
    if (!enCours) return;
    const suivant = restants[1];
    setGeste("passe");
    setHistorique((h) => [...h, { id: enCours.id, genre: "passe" }]);
    setPasses((p) => [...p, enCours.id]);
    setAnnonce(
      `Texte passé : « ${titreLisible(enCours.titre)} ». ${
        suivant ? `Texte suivant : ${titreLisible(suivant.titre)}.` : "Tous les textes sont parcourus."
      }`,
    );
  }

  function annuler() {
    const dernier = historique[historique.length - 1];
    if (!dernier) return;
    setGeste(null);
    setHistorique((h) => h.slice(0, -1));
    if (dernier.genre === "vote") mandat.retirerVote(dernier.id);
    else setPasses((p) => p.filter((id) => id !== dernier.id));
    const scrutin = scrutins.find((s) => s.id === dernier.id);
    setAnnonce(scrutin ? `Retour au texte « ${titreLisible(scrutin.titre)} ».` : "Retour au texte précédent.");
  }

  function aller(vers: 1 | 2) {
    setEtape(vers);
    setAnnonce(vers === 1 ? "Étape 1 sur 2 : les textes." : "Étape 2 sur 2 : vos priorités.");
  }

  const erreur = lecture.error;

  const avancement = etape === 2 ? 1 : scrutins.length ? traites / scrutins.length : 0;

  return (
    <MotionConfig reducedMotion="user">
      <FiltreSphere />
      <style>{STYLE_SPHERE}</style>
      <div className="mx-auto max-w-2xl">
        <AvisExemple meta={lecture.data?.meta} />

        <div>
          <p className="text-sm font-medium">Étape {etape} sur 2</p>
          <div aria-hidden className="mt-2 flex gap-2">
            <span className="h-0.5 flex-1 overflow-hidden bg-trait">
              <span
                className="block h-full origin-left bg-texte transition-transform duration-300 ease-out motion-reduce:transition-none"
                style={{ transform: `scaleX(${avancement})` }}
              />
            </span>
            <span className={`h-0.5 flex-1 transition-colors duration-300 ${etape === 2 ? "bg-texte" : "bg-trait"}`} />
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: DOUX }}
          >
            <Sphere teintes={sphere.teintes} poids={sphere.poids} duree={13} className="sphere-test size-12 sm:size-16" />
          </motion.div>
          <p className="sr-only">
            {sphere.themes.length
              ? `La sphère prend les couleurs de : ${sphere.themes.join(", ").toLowerCase()}.`
              : "La sphère est grise : vous n'avez encore rien répondu."}
          </p>
        </div>

        {/* Chaque étape se pose d'un court fondu ; au premier rendu, c'est l'entrée de la page. */}
        <motion.div
          key={etape}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: DOUX }}
        >
          <div className="mt-5 flex flex-col items-center text-center">
            <h1 ref={titreEtape} tabIndex={-1} className={`text-balance outline-none ${TITRE}`}>
              {etape === 1 ? "Tranchez de vrais textes de loi." : "Qu'est-ce qui compte le plus ?"}
            </h1>
            {etape === 1 ? <p className="mt-3 text-base leading-7 text-attenue sm:text-lg">Pour, contre ou abstention.</p> : null}
          </div>

          {etape === 1 ? (
            <div className="mt-8">
              {erreur ? (
                <PileEnErreur message={erreur instanceof Error ? erreur.message : null} onReessayer={() => void lecture.mutate()} />
              ) : !lecture.data ? (
                <PileEnAttente />
              ) : scrutins.length === 0 ? (
                <PileVide onTerminer={() => aller(2)} />
              ) : (
                <PileTextes
                  scrutin={enCours}
                  rang={Math.min(traites + 1, scrutins.length)}
                  total={scrutins.length}
                  geste={geste}
                  peutAnnuler={historique.length > 0}
                  onArbitrer={arbitrer}
                  onPasser={passer}
                  onAnnuler={annuler}
                  onTerminer={() => aller(2)}
                />
              )}
              {enCours ? (
                <p className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => aller(2)}
                    className="inline-flex min-h-11 items-center rounded-full border border-trait px-6 text-[15px] font-medium transition-colors duration-150 hover:border-texte"
                  >
                    Régler mes priorités
                  </button>
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-10">
              <Priorites reglages={reglages} />
              <div className="mt-10 flex flex-col items-center gap-1">
                <Link
                  href="/resultat"
                  className="inline-flex h-14 items-center rounded-full bg-texte px-8 font-medium text-fond transition-opacity duration-150 hover:opacity-80"
                >
                  Découvrir mon IA
                </Link>
                <button
                  type="button"
                  onClick={() => aller(1)}
                  className="inline-flex min-h-11 items-center px-3 text-[15px] text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current"
                >
                  Revenir aux textes
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <SourceBadge source={sourceCalcul(DEFINITION_SPHERE)} className="mt-12 justify-center text-center" />
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {annonce}
      </p>
    </MotionConfig>
  );
}
