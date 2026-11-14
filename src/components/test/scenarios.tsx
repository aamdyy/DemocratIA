"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { BoutonIA } from "@/components/bouton-ia";
import { mandat, type Mandat } from "@/lib/mandat";
import type { Chapitre } from "@/lib/questions/chapitres";
import { SCENARIOS, type OptionScenario, type Scenario } from "@/lib/questions/scenarios";
import { libelleTheme, type ThemeId } from "@/lib/themes";

import { BOUTON_DISCRET, CADRE, EnteteChapitre, FOCUS, FinChapitre, RESSORT, RESSORT_VIF } from "./chapitre";

/** Chapitre « Scénarios 2050 » : une dépêche fictive qui s'écrit, trois réponses en cartes, l'effet du choix. */
export function ChapitreScenarios({
  chapitre,
  reglages,
  onAnnonce,
  onFini,
}: {
  chapitre: Chapitre;
  reglages: Mandat;
  onAnnonce: (texte: string) => void;
  onFini: () => void;
}) {
  const [indice, setIndice] = useState(() => {
    const i = SCENARIOS.findIndex((s) => !reglages.scenarios?.[s.id]);
    return i < 0 ? SCENARIOS.length : i;
  });
  // Le choix fait sur cette dépêche, le temps d'en montrer l'effet.
  const [choisi, setChoisi] = useState<string | null>(null);

  const scenario = SCENARIOS[indice] ?? null;

  function aller(vers: number) {
    setChoisi(null);
    setIndice(vers);
    const suivant = SCENARIOS[vers];
    onAnnonce(suivant ? `Scénario ${vers + 1} sur ${SCENARIOS.length}. ${suivant.titre}` : "Les scénarios sont terminés.");
  }

  function choisir(option: OptionScenario) {
    if (!scenario) return;
    setChoisi(option.id);
    mandat.choisirScenario(scenario.id, option.id);
    onAnnonce(`Choix enregistré : ${option.libelle}. ${phraseEffets(option.effets)}`);
  }

  return (
    <div>
      <EnteteChapitre chapitre={chapitre} etape={indice + 1} total={SCENARIOS.length} libelleEtape="Scénario" onPasser={onFini} />
      {scenario ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0, transition: RESSORT }}
            exit={{ opacity: 0, y: -12, transition: RESSORT_VIF }}
          >
            <Depeche scenario={scenario} />
            <Options
              scenario={scenario}
              choisi={choisi}
              onChoisir={choisir}
            />
            <div className="mt-4 flex min-h-14 items-center justify-center">
              {choisi ? (
                <SuiteScenario onSuite={() => aller(indice + 1)} dernier={indice === SCENARIOS.length - 1} teintes={chapitre.teintes} />
              ) : null}
            </div>
            <div className="mt-1 flex items-center justify-between gap-4">
              <button type="button" onClick={() => aller(indice - 1)} disabled={indice === 0} className={`-ml-3 ${BOUTON_DISCRET}`}>
                Revenir
              </button>
              {choisi ? null : (
                <button type="button" onClick={() => aller(indice + 1)} className={`-mr-3 ${BOUTON_DISCRET}`}>
                  Passer
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <FinChapitre titre="Vos décisions de crise sont prises." teintes={chapitre.teintes} onSuite={onFini}>
          <button type="button" onClick={() => aller(0)} className={`-ml-3 mt-2 self-start ${BOUTON_DISCRET}`}>
            Revoir les scénarios
          </button>
        </FinChapitre>
      )}
    </div>
  );
}

/** La dépêche : un bandeau « en direct » qui pulse, le lieu et l'heure, puis le titre qui s'écrit. */
function Depeche({ scenario }: { scenario: Scenario }) {
  const reduit = useReducedMotion();
  const titre = useRef<HTMLHeadingElement>(null);
  const poserLeFocus = useEffectEvent(() => titre.current?.focus({ preventScroll: true }));
  useEffect(() => poserLeFocus(), []);
  const mots = scenario.titre.split(" ");

  return (
    <article className={`${CADRE} relative overflow-hidden`}>
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-texte"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      />
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-attenue">
        <span className="inline-flex items-center gap-2 font-medium text-texte">
          <span aria-hidden className="relative flex size-2.5">
            {reduit ? null : <span className="absolute inline-flex size-full animate-ping rounded-full bg-contre opacity-60" />}
            <span className="relative inline-flex size-2.5 rounded-full bg-contre" />
          </span>
          Dépêche fictive
        </span>
        <span className="font-donnee text-xs">
          {scenario.lieu}, {scenario.quand}
        </span>
      </p>
      <h3
        ref={titre}
        tabIndex={-1}
        aria-label={scenario.titre}
        className="mt-4 text-balance font-titre text-[clamp(1.375rem,3vw,1.875rem)] font-semibold leading-[1.18] tracking-[-0.025em] outline-none"
      >
        {/* Le titre s'écrit mot à mot, comme un fil d'agence. */}
        {mots.map((mot, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="inline-block whitespace-pre"
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.3, delay: 0.25 + i * 0.045, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {mot}
            {i < mots.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </h3>
      <p className="mt-4 text-[15px] text-attenue">Vous êtes à l&apos;Élysée. Que décidez-vous ?</p>
    </article>
  );
}

function Options({
  scenario,
  choisi,
  onChoisir,
}: {
  scenario: Scenario;
  choisi: string | null;
  onChoisir: (option: OptionScenario) => void;
}) {
  return (
    <div role="group" aria-label="Votre décision" className="mt-4 grid gap-3 sm:grid-cols-3">
      {scenario.options.map((option, i) => {
        const estChoisi = choisi === option.id;
        const ecarte = choisi !== null && !estChoisi;
        return (
          <motion.button
            key={option.id}
            type="button"
            aria-pressed={estChoisi}
            disabled={choisi !== null}
            onClick={() => onChoisir(option)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: ecarte ? 0.4 : 1, y: 0, scale: estChoisi ? 1.02 : ecarte ? 0.97 : 1 }}
            transition={{ ...RESSORT, delay: choisi ? 0 : 0.6 + i * 0.08 }}
            whileHover={choisi ? undefined : { y: -3 }}
            whileTap={choisi ? undefined : { scale: 0.98 }}
            className={`flex min-h-28 flex-col rounded-2xl border p-5 text-left text-base font-medium leading-snug transition-colors duration-150 disabled:cursor-default ${FOCUS} ${
              estChoisi ? "border-texte bg-texte text-fond" : "border-trait bg-surface hover:border-texte"
            }`}
          >
            <span aria-hidden className={`mb-3 text-sm tabular-nums ${estChoisi ? "text-fond/70" : "text-attenue"}`}>
              {String.fromCharCode(65 + i)}
            </span>
            {option.libelle}
            {estChoisi ? (
              <motion.span
                className="mt-4 block border-t border-fond/25 pt-3 text-sm font-normal text-fond/85"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={RESSORT}
              >
                <Effets effets={option.effets} />
              </motion.span>
            ) : null}
          </motion.button>
        );
      })}
    </div>
  );
}

/** L'effet du choix sur les priorités, en mots et en flèches : jamais par la couleur seule. */
function Effets({ effets }: { effets: Partial<Record<ThemeId, number>> }) {
  const lignes = Object.entries(effets) as [ThemeId, number][];
  return (
    <span className="flex flex-col gap-1">
      {lignes.map(([theme, valeur], i) => (
        <motion.span
          key={theme}
          className="flex items-center justify-between gap-2"
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...RESSORT, delay: 0.15 + i * 0.08 }}
        >
          <span>{libelleTheme(theme)}</span>
          <span className="tabular-nums">
            {valeur > 0 ? "↑ +" : "↓ −"}
            {Math.abs(valeur)}
          </span>
        </motion.span>
      ))}
    </span>
  );
}

function phraseEffets(effets: Partial<Record<ThemeId, number>>) {
  const lignes = Object.entries(effets) as [ThemeId, number][];
  return `Vos priorités bougent : ${lignes
    .map(([t, v]) => `${libelleTheme(t)} ${v > 0 ? "plus" : "moins"} ${Math.abs(v)}`)
    .join(", ")}.`;
}

function SuiteScenario({ onSuite, dernier, teintes }: { onSuite: () => void; dernier: boolean; teintes: Chapitre["teintes"] }) {
  // Les cartes se figent après le choix : le clavier passe directement à la suite.
  const ref = useRef<HTMLDivElement>(null);
  const poserLeFocus = useEffectEvent(() => ref.current?.querySelector("button")?.focus());
  useEffect(() => poserLeFocus(), []);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...RESSORT, delay: 0.35 }}>
      <BoutonIA onClick={onSuite} teintes={teintes}>
        {dernier ? "Terminer" : "Dépêche suivante"}
      </BoutonIA>
    </motion.div>
  );
}
