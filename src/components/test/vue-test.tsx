"use client";

import { MotionConfig, motion } from "motion/react";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import { BoutonIA } from "@/components/bouton-ia";
import { AvisExemple } from "@/components/avis-exemple";
import { useScrutins } from "@/lib/api";
import { CANDIDATES, classerCandidates, positionCandidate } from "@/lib/candidates";
import { LIBELLE_POSITION, nombre, titreLisible } from "@/lib/format";
import { DILEMMES, nombreDeDilemmes, selectionEnregistree, type ReponseDilemme } from "@/lib/dilemmes";
import { mandat, useMandat } from "@/lib/mandat";
import { MAX_PRIORITES, precision as calculerPrecision } from "@/lib/precision";
import type { Position, Scrutin } from "@/lib/types";

import { CourseIA } from "./course";
import { Dilemmes, dernierDilemmeRepondu, dilemmeEnCours } from "./dilemmes";
import { Precision } from "./precision";
import {
  DUREE_RETOUR,
  PileEnAttente,
  PileEnErreur,
  PileTextes,
  PileVide,
  type Geste,
  type Retour,
} from "./pile-textes";
import { Priorites } from "./priorites";

const AUCUN_SCRUTIN: Scrutin[] = [];

/** Nombre de textes à trancher avant de pouvoir découvrir son IA. */
const TEXTES_REQUIS = 5;

const TITRE = "font-titre text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-[1.1] tracking-[-0.03em]";


const DOUX = [0.2, 0.8, 0.2, 1] as const;

type Historique = { id: string; genre: "vote" | "passe" };

/** Le test : la course des IA en haut, puis des textes à trancher, des dilemmes, et trois priorités à choisir. */
export function VueTest() {
  const reglages = useMandat();
  const lecture = useScrutins();
  const scrutins = lecture.data?.data ?? AUCUN_SCRUTIN;

  const [etape, setEtape] = useState<1 | 2 | 3>(1);
  const [geste, setGeste] = useState<Geste>(null);
  const [passes, setPasses] = useState<string[]>([]);
  const [historique, setHistorique] = useState<Historique[]>([]);
  const [retour, setRetour] = useState<Retour | null>(null);
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
  const tranches = scrutins.filter((s) => reglages.votes[s.id]).length;
  const traites = scrutins.length - restants.length;
  const requis = Math.min(TEXTES_REQUIS, scrutins.length);

  const classement = useMemo(() => classerCandidates(reglages, scrutins), [reglages, scrutins]);
  const aCommence = tranches > 0 || Object.keys(reglages.priorites).length > 0;

  const nbDilemmes = nombreDeDilemmes(reglages.dilemmes);
  const nbPriorites = selectionEnregistree(reglages.priorites).length;
  const precision = calculerPrecision({
    textes: tranches,
    textesProposes: scrutins.length,
    dilemmes: nbDilemmes,
    priorites: nbPriorites,
  });
  const { dilemme: dilemmeCourant, numero: numeroDilemme } = dilemmeEnCours(reglages.dilemmes);
  const dernierDilemme = dernierDilemmeRepondu(reglages.dilemmes);

  function aller(vers: 1 | 2 | 3) {
    setEtape(vers);
    setAnnonce(
      vers === 1
        ? "Les textes."
        : vers === 2
          ? "Les dilemmes : choisissez ce qui compte le plus pour vous."
          : `Vos priorités : choisissez-en ${MAX_PRIORITES} au plus.`,
    );
  }

  function repondreDilemme(reponse: ReponseDilemme) {
    if (!dilemmeCourant) return;
    mandat.repondreDilemme(dilemmeCourant.id, reponse);
    const suivant = DILEMMES[numeroDilemme];
    setAnnonce(
      `Réponse enregistrée. ${suivant ? `Dilemme ${numeroDilemme + 1} sur ${DILEMMES.length} : ${suivant.question}` : "Les dilemmes sont terminés."}`,
    );
  }

  function annulerDilemme() {
    if (!dernierDilemme) return;
    mandat.repondreDilemme(dernierDilemme.id, null);
    setAnnonce(`Retour au dilemme : ${dernierDilemme.question}`);
  }

  function arbitrer(position: Position) {
    if (retour) {
      continuer();
      return;
    }
    if (!enCours) return;
    const comme = CANDIDATES.filter((c) => positionCandidate(c, enCours) === position);
    const { pour, contre } = enCours.decompte;
    setGeste(position);
    setHistorique((h) => [...h, { id: enCours.id, genre: "vote" }]);
    setRetour({ scrutin: enCours, position, comme });
    setAnnonce(
      `Réponse enregistrée : ${LIBELLE_POSITION[position].toLowerCase()}. L'Assemblée a ${
        enCours.resultat === "adopte" ? "adopté" : "rejeté"
      } ce texte : ${nombre(pour)} pour, ${nombre(contre)} contre. ${
        comme.length ? `Comme vous : ${comme.map((c) => c.prenom).join(", ")}.` : "Aucune IA n'a voté comme vous."
      }`,
    );
    mandat.voter(enCours.id, position);
  }

  function continuer() {
    setRetour(null);
    if (restants.length === 0) aller(2);
    else setAnnonce(`Texte suivant : ${titreLisible(restants[0].titre)}.`);
  }

  // Le retour part seul ; la minuterie repart à zéro à chaque nouveau retour.
  const finDuRetour = useEffectEvent(() => continuer());
  useEffect(() => {
    if (!retour) return;
    const minuterie = setTimeout(() => finDuRetour(), DUREE_RETOUR);
    return () => clearTimeout(minuterie);
  }, [retour]);

  function passer() {
    if (retour) {
      continuer();
      return;
    }
    if (!enCours) return;
    setGeste("passe");
    setHistorique((h) => [...h, { id: enCours.id, genre: "passe" }]);
    setPasses((p) => [...p, enCours.id]);
    setAnnonce(`Texte passé. ${restants[1] ? `Texte suivant : ${titreLisible(restants[1].titre)}.` : "Tous les textes sont parcourus."}`);
  }

  function annuler() {
    const dernier = historique[historique.length - 1];
    if (!dernier) return;
    setGeste(null);
    setRetour(null);
    setHistorique((h) => h.slice(0, -1));
    if (dernier.genre === "vote") mandat.retirerVote(dernier.id);
    else setPasses((p) => p.filter((id) => id !== dernier.id));
    const scrutin = scrutins.find((s) => s.id === dernier.id);
    setAnnonce(scrutin ? `Retour au texte « ${titreLisible(scrutin.titre)} ».` : "Retour au texte précédent.");
  }

  const erreur = lecture.error;
  const progression =
    etape === 1
      ? `Textes ${Math.min(traites + (retour || !enCours ? 0 : 1), scrutins.length)} sur ${scrutins.length}`
      : etape === 2
        ? `Dilemmes ${nbDilemmes} sur ${DILEMMES.length}`
        : "Priorités";
  const avancement =
    etape === 1
      ? scrutins.length
        ? traites / scrutins.length
        : 0
      : etape === 2
        ? nbDilemmes / DILEMMES.length
        : nbPriorites / MAX_PRIORITES;

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-3xl">
        <AvisExemple meta={lecture.data?.meta} />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: DOUX }}
        >
          <CourseIA classement={classement} actif={aCommence} />
          <Precision valeur={precision} />
        </motion.div>

        {/* Chaque étape se pose d'un court fondu ; au premier rendu, c'est l'entrée de la page. */}
        <motion.div
          key={etape}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: DOUX }}
          className="mt-8"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h1 ref={titreEtape} tabIndex={-1} className={`text-balance outline-none ${TITRE}`}>
              {etape === 1 ? "Pour ou contre ?" : etape === 2 ? "Lequel compte le plus ?" : "Choisissez vos trois priorités"}
            </h1>
            <p className="shrink-0 text-sm font-medium tabular-nums text-attenue">
              {progression}
            </p>
          </div>
          <div aria-hidden className="mt-3 h-0.5 overflow-hidden bg-trait">
            <span
              className="block h-full origin-left bg-texte transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{ transform: `scaleX(${avancement})` }}
            />
          </div>

          {etape === 1 ? (
            <div className="mt-6">
              {erreur ? (
                <PileEnErreur message={erreur instanceof Error ? erreur.message : null} onReessayer={() => void lecture.mutate()} />
              ) : !lecture.data ? (
                <PileEnAttente />
              ) : scrutins.length === 0 ? (
                <PileVide onTerminer={() => aller(2)} />
              ) : (
                <PileTextes
                  scrutin={enCours}
                  retour={retour}
                  geste={geste}
                  peutAnnuler={historique.length > 0}
                  onArbitrer={arbitrer}
                  onPasser={passer}
                  onAnnuler={annuler}
                  onContinuer={continuer}
                  onTerminer={() => aller(2)}
                />
              )}
              {enCours && tranches >= requis && tranches > 0 ? (
                <p className="mt-4 text-center">
                  <BoutonIA variante="contour" onClick={() => aller(2)}>
                    Passer aux dilemmes
                  </BoutonIA>
                </p>
              ) : null}
            </div>
          ) : etape === 2 ? (
            <div className="mt-6">
              <Dilemmes
                dilemme={dilemmeCourant}
                numero={numeroDilemme}
                peutAnnuler={dernierDilemme !== null}
                onRepondre={repondreDilemme}
                onAnnuler={annulerDilemme}
                onTerminer={() => aller(3)}
                onRevenir={() => aller(1)}
              />
              {dilemmeCourant ? (
                <p className="mt-4 text-center">
                  <BoutonIA variante="contour" onClick={() => aller(3)}>
                    Mes priorités
                  </BoutonIA>
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-8">
              <Priorites
                reglages={reglages}
                manquants={Math.max(0, requis - tranches)}
                precision={precision}
                onRevenir={() => aller(2)}
              />
            </div>
          )}
        </motion.div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {annonce}
      </p>
    </MotionConfig>
  );
}
