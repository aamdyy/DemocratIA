"use client";

import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AvisExemple } from "@/components/avis-exemple";
import { DUREE, ENTREE, RESSORT } from "@/lib/animation";
import { useScrutins } from "@/lib/api";
import { classerCandidates } from "@/lib/candidates";
import { DILEMMES } from "@/lib/dilemmes";
import { useMandat } from "@/lib/mandat";
import { precision as calculerPrecision } from "@/lib/precision";
import { AFFIRMATIONS } from "@/lib/questions/accords";
import { CHAPITRES, TEXTES_CHAPITRE, TEXTES_PRONOSTIC, type ChapitreId } from "@/lib/questions/chapitres";
import { resumeDuMandat } from "@/lib/questions/poids";
import { SCENARIOS } from "@/lib/questions/scenarios";
import type { Scrutin } from "@/lib/types";

import { ChapitreAccords } from "./accords";
import { ChapitreBudget } from "./budget";
import { ContexteTest, IntroChapitre, Sommaire, type Avancement, type EtatTest } from "./chapitre";
import { ChapitreTextes } from "./chapitre-textes";
import { ChapitreClassement } from "./classement";
import { CourseCompacte, CourseIA } from "./course";
import { ChapitreDilemmes } from "./dilemmes";
import { FinDuTest } from "./fin";
import { PileEnAttente, PileEnErreur } from "./pile-textes";
import { Precision } from "./precision";
import { ChapitrePronostics } from "./pronostics";
import { ChapitreScenarios } from "./scenarios";

const AUCUN_SCRUTIN: Scrutin[] = [];

/** Nombre de textes tranchés à partir duquel on peut voir son IA sans finir le test. */
const TEXTES_REQUIS = 5;
/** Ou, à défaut, la précision à partir de laquelle le lien « Voir mon IA » apparaît. */
const PRECISION_POUR_VOIR = 30;

/** Le passage d'un écran à l'autre : l'ancien s'efface vite, le nouveau monte en place. */
const ECRAN = {
  entree: { opacity: 0, y: 20 },
  pose: { opacity: 1, y: 0, transition: RESSORT },
  sortie: { opacity: 0, y: -10, transition: { duration: DUREE.micro, ease: "easeIn" } },
} as const;

/**
 * Une boîte dont la hauteur suit son contenu en douceur : quand une carte change,
 * le bas de la page glisse au lieu de sauter.
 */
function HauteurDouce({ children, className }: { children: React.ReactNode; className?: string }) {
  const interieur = useRef<HTMLDivElement>(null);
  const [hauteur, setHauteur] = useState<number | "auto">("auto");

  useEffect(() => {
    const el = interieur.current;
    if (!el) return;
    const observateur = new ResizeObserver(([entree]) => setHauteur(entree.borderBoxSize[0]?.blockSize ?? el.offsetHeight));
    observateur.observe(el);
    return () => observateur.disconnect();
  }, []);

  return (
    <motion.div initial={false} animate={{ height: hauteur }} transition={RESSORT} className={className}>
      <div ref={interieur} className="relative">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Le test, en chapitres : la course des IA et la précision en haut, un sommaire, puis chaque chapitre
 * (une carte d'introduction, puis ses questions). Toutes les réponses règlent le même mandat (lib/mandat),
 * et classerCandidates reste la seule source du classement.
 */
export function VueTest() {
  const reglages = useMandat();
  const lecture = useScrutins();
  const scrutins = lecture.data?.data ?? AUCUN_SCRUTIN;
  const textes = useMemo(() => scrutins.slice(0, TEXTES_CHAPITRE), [scrutins]);
  const aDeviner = useMemo(() => scrutins.slice(TEXTES_CHAPITRE, TEXTES_CHAPITRE + TEXTES_PRONOSTIC), [scrutins]);

  const [courant, setCourant] = useState(0);
  const [intro, setIntro] = useState(true);
  const [annonce, setAnnonce] = useState("");
  const zone = useRef<HTMLDivElement>(null);

  // La grande course sort de l'écran ? Une version compacte reste visible en haut.
  const course = useRef<HTMLDivElement>(null);
  const [courseCachee, setCourseCachee] = useState(false);
  useEffect(() => {
    const el = course.current;
    if (!el) return;
    const observateur = new IntersectionObserver(([e]) => setCourseCachee(!e.isIntersecting && e.boundingClientRect.top < 0), {
      rootMargin: "-40px 0px 0px 0px",
    });
    observateur.observe(el);
    return () => observateur.disconnect();
  }, []);

  const classement = useMemo(() => classerCandidates(reglages, scrutins), [reglages, scrutins]);
  const resume = resumeDuMandat(reglages, scrutins);
  const aCommence = resume.textes > 0 || Object.keys(reglages.priorites).length > 0;
  const precision = calculerPrecision({
    textes: resume.textes,
    textesProposes: textes.length,
    dilemmes: resume.dilemmes,
    accords: resume.accords,
    budget: resume.budget,
    scenarios: resume.scenarios,
    classement: resume.classement,
  });

  const avancements: Record<ChapitreId, Avancement> = {
    textes: { fait: textes.filter((s) => reglages.votes[s.id]).length, total: textes.length },
    accords: { fait: resume.accords, total: AFFIRMATIONS.length },
    budget: { fait: resume.budget ? 1 : 0, total: 1 },
    scenarios: { fait: resume.scenarios, total: SCENARIOS.length },
    dilemmes: { fait: resume.dilemmes, total: DILEMMES.length },
    classement: { fait: resume.classement ? 1 : 0, total: 1 },
    pronostics: { fait: aDeviner.filter((s) => reglages.pronostics?.[s.id]).length, total: aDeviner.length },
  };

  function aller(indice: number, avecIntro = true) {
    setCourant(indice);
    setIntro(avecIntro);
    const chapitre = CHAPITRES[indice];
    setAnnonce(chapitre ? `Chapitre ${indice + 1} sur ${CHAPITRES.length} : ${chapitre.titre}. ${chapitre.phrase}` : "Fin du test : votre IA est prête.");
    // Si le haut du chapitre est sorti de l'écran, on y revient.
    const haut = zone.current?.getBoundingClientRect().top ?? 0;
    if (haut < 0) {
      const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      zone.current?.scrollIntoView({ behavior: reduit ? "auto" : "smooth", block: "start" });
    }
  }

  const suivant = () => aller(courant + 1);
  const chapitre = CHAPITRES[courant] ?? null;
  const peutVoir = aCommence && (resume.textes >= TEXTES_REQUIS || precision >= PRECISION_POUR_VOIR);
  const etat: EtatTest = {
    tete: aCommence ? (classement[0] ?? null) : null,
    precision,
    suivant: CHAPITRES[courant + 1] ?? null,
  };

  function contenu() {
    if (!chapitre) {
      return (
        <FinDuTest
          precision={precision}
          classement={classement}
          resume={resume}
          aCommence={aCommence}
          avancements={avancements}
          onAller={(i) => aller(i)}
        />
      );
    }
    if (intro) {
      return (
        <IntroChapitre
          chapitre={chapitre}
          numero={courant + 1}
          dejaFait={avancements[chapitre.id]}
          accueil={courant === 0 && !aCommence}
          onCommencer={() => {
            setIntro(false);
            setAnnonce(`${chapitre.titre} : c'est parti.`);
          }}
          onPasser={suivant}
        />
      );
    }
    const commun = { chapitre, reglages, onAnnonce: setAnnonce, onFini: suivant };
    switch (chapitre.id) {
      case "textes":
        if (lecture.error) {
          return <PileEnErreur message={lecture.error instanceof Error ? lecture.error.message : null} onReessayer={() => void lecture.mutate()} />;
        }
        if (!lecture.data) return <PileEnAttente />;
        return <ChapitreTextes {...commun} scrutins={textes} />;
      case "accords":
        return <ChapitreAccords {...commun} />;
      case "budget":
        return <ChapitreBudget {...commun} />;
      case "scenarios":
        return <ChapitreScenarios {...commun} />;
      case "dilemmes":
        return <ChapitreDilemmes {...commun} />;
      case "classement":
        return <ChapitreClassement {...commun} />;
      case "pronostics":
        if (!lecture.data) return <PileEnAttente />;
        return <ChapitrePronostics {...commun} scrutins={aDeviner} />;
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <ContexteTest value={etat}>
        <div className="mx-auto max-w-3xl">
          <AvisExemple meta={lecture.data?.meta} />

          <motion.div ref={course} {...ENTREE}>
            <CourseIA classement={classement} actif={aCommence} />
            <Precision valeur={precision} />
          </motion.div>

          <div ref={zone} className="scroll-mt-20">
            <Sommaire courant={courant} avancements={avancements} peutVoir={peutVoir} onAller={(i) => aller(i)} />
            <h1 className="sr-only">Le test : trouvez l&apos;IA candidate qui vous ressemble</h1>

            <LayoutGroup>
              {/* Hauteur minimale : la plupart des écrans y tiennent, le bas de page ne bouge pas d'un écran à l'autre. */}
              <HauteurDouce className="mt-4 min-h-[36rem]">
                {/* « wait » : l'écran sortant disparaît avant que l'entrant arrive, les deux textes ne se superposent jamais. */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${courant}-${intro ? "intro" : "questions"}`}
                    variants={ECRAN}
                    initial="entree"
                    animate="pose"
                    exit="sortie"
                  >
                    {contenu()}
                  </motion.div>
                </AnimatePresence>
              </HauteurDouce>
            </LayoutGroup>
          </div>
        </div>

        <CourseCompacte classement={classement} precision={precision} visible={courseCachee && aCommence && chapitre !== null} />

        <p role="status" aria-live="polite" className="sr-only">
          {annonce}
        </p>
      </ContexteTest>
    </MotionConfig>
  );
}
