"use client";

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { DOUX, DUREE } from "@/lib/animation";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { BoutonIA } from "@/components/bouton-ia";
import { dateLongue, nombre, titreLisible } from "@/lib/format";
import { mandat, type Mandat } from "@/lib/mandat";
import type { Chapitre } from "@/lib/questions/chapitres";
import type { Scrutin } from "@/lib/types";

import { BOUTON_DISCRET, CADRE, EnteteChapitre, FOCUS, FinChapitre, RESSORT, SORTIE, TITRE_CARTE } from "./chapitre";

type Pari = "adopte" | "rejete";
const LIBELLE: Record<Pari, string> = { adopte: "Adopté", rejete: "Rejeté" };

/**
 * Chapitre bonus « Devinez l'Assemblée » : le citoyen parie, puis le vrai résultat se révèle dans un hémicycle.
 * Les paris ne pèsent pas sur le classement des IA.
 */
export function ChapitrePronostics({
  chapitre,
  scrutins,
  reglages,
  onAnnonce,
  onFini,
}: {
  chapitre: Chapitre;
  scrutins: Scrutin[];
  reglages: Mandat;
  onAnnonce: (texte: string) => void;
  onFini: () => void;
}) {
  const [indice, setIndice] = useState(() => {
    const i = scrutins.findIndex((s) => !reglages.pronostics?.[s.id]);
    return i < 0 ? scrutins.length : i;
  });
  const [revele, setRevele] = useState(false);

  const scrutin = scrutins[indice] ?? null;
  const pari = scrutin ? (reglages.pronostics?.[scrutin.id] ?? null) : null;
  const faits = scrutins.filter((s) => reglages.pronostics?.[s.id]);
  const justes = faits.filter((s) => reglages.pronostics?.[s.id] === s.resultat).length;

  function parier(choix: Pari) {
    if (!scrutin || revele) return;
    mandat.pronostiquer(scrutin.id, choix);
    setRevele(true);
    const bon = choix === scrutin.resultat;
    const { pour, contre } = scrutin.decompte;
    onAnnonce(
      `${bon ? "Bien vu" : "Raté"} : l'Assemblée a ${scrutin.resultat === "adopte" ? "adopté" : "rejeté"} ce texte, ${nombre(pour)} pour, ${nombre(contre)} contre.`,
    );
  }

  function suivant() {
    setRevele(false);
    setIndice(indice + 1);
    const s = scrutins[indice + 1];
    onAnnonce(s ? `Texte suivant : ${titreLisible(s.titre)}.` : "Fin des pronostics.");
  }

  return (
    <div>
      <EnteteChapitre chapitre={chapitre} etape={indice + 1} total={scrutins.length} libelleEtape="Texte" onPasser={onFini} />
      {scrutin ? (
        <>
          <p className="mb-3 text-sm text-attenue" aria-live="polite">
            Score : <span className="font-semibold tabular-nums text-texte">{justes}</span> sur {faits.length}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={scrutin.id}
              className={`${CADRE} relative min-h-[20rem] overflow-hidden`}
              initial={{ opacity: 0, y: 16, rotateX: -8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, transition: RESSORT }}
              exit={{ opacity: 0, y: -12, transition: SORTIE }}
            >
              <p className="text-sm text-attenue">
                {scrutin.numero ? `Scrutin n° ${scrutin.numero}, ` : "Scrutin "}du {dateLongue(scrutin.date)}
              </p>
              <h3 className={`mt-3 ${TITRE_CARTE}`}>{titreLisible(scrutin.titre)}</h3>
              {revele && pari ? (
                <Revelation scrutin={scrutin} pari={pari} />
              ) : (
                <div className="mt-auto pt-8">
                  <p className="mb-3 text-[15px] text-attenue">Selon vous, l&apos;Assemblée l&apos;a…</p>
                  <div role="group" aria-label="Votre pronostic" className="grid grid-cols-2 gap-3">
                    {(["adopte", "rejete"] as const).map((choix) => (
                      <motion.button
                        key={choix}
                        type="button"
                        onClick={() => parier(choix)}
                        whileTap={{ scale: 0.97 }}
                        className={`flex min-h-14 items-center justify-center gap-2 rounded-full border border-texte bg-surface px-4 text-base font-medium transition-colors duration-150 hover:bg-texte hover:text-fond ${FOCUS}`}
                      >
                        <span aria-hidden>{choix === "adopte" ? "✓" : "✕"}</span>
                        {LIBELLE[choix]}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.article>
          </AnimatePresence>
          <div className="mt-4 flex min-h-14 items-center justify-center">
            {revele ? <Suite onSuite={suivant} dernier={indice === scrutins.length - 1} teintes={chapitre.teintes} /> : null}
          </div>
          {revele ? null : (
            <div className="mt-1 flex justify-end">
              <button type="button" onClick={suivant} className={`-mr-3 ${BOUTON_DISCRET}`}>
                Passer
              </button>
            </div>
          )}
        </>
      ) : (
        <FinChapitre
          titre={faits.length ? `${justes} pronostic${justes > 1 ? "s" : ""} juste${justes > 1 ? "s" : ""} sur ${faits.length}` : "Aucun pronostic cette fois."}
          suite="Voir la fin du test"
          teintes={chapitre.teintes}
          onSuite={onFini}
        >
          {faits.length ? (
            <ol className="mt-5 flex flex-wrap gap-2" aria-label="Vos pronostics">
              {faits.map((s, i) => {
                const bon = reglages.pronostics?.[s.id] === s.resultat;
                return (
                  <motion.li
                    key={s.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ ...RESSORT, delay: 0.1 + i * 0.08 }}
                    className={`flex size-11 items-center justify-center rounded-full text-base font-semibold ${
                      bon ? "bg-texte text-fond" : "border border-trait text-attenue"
                    }`}
                  >
                    <span aria-hidden>{bon ? "✓" : "✕"}</span>
                    <span className="sr-only">
                      {titreLisible(s.titre)} : {bon ? "juste" : "raté"}
                    </span>
                  </motion.li>
                );
              })}
            </ol>
          ) : null}
          <p className="mt-4 text-[15px] text-attenue">Ce score est un jeu : il ne change pas votre IA.</p>
        </FinChapitre>
      )}
    </div>
  );
}

/** La révélation : l'hémicycle se remplit, les voix se comptent, puis le tampon tombe. */
function Revelation({ scrutin, pari }: { scrutin: Scrutin; pari: Pari }) {
  const { pour, contre, abstention } = scrutin.decompte;
  const total = Math.max(1, pour + contre + abstention);
  const bon = pari === scrutin.resultat;
  const segments = [
    { cle: "pour", valeur: pour, couleur: "var(--pour)" },
    { cle: "abstention", valeur: abstention, couleur: "var(--abstention)" },
    { cle: "contre", valeur: contre, couleur: "var(--contre)" },
  ];
  const parts = segments.map((s) => (s.valeur / total) * 100);

  return (
    <div className="mt-6 grid items-end gap-6 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div>
        <div className="relative mx-auto w-full max-w-xs">
          <svg viewBox="0 0 100 54" className="w-full" aria-hidden>
            <path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke="var(--relief)" strokeWidth="10" />
            {segments.map((s, i) => {
              const part = parts[i];
              const debut = parts.slice(0, i).reduce((a, b) => a + b, 0);
              return (
                <motion.path
                  key={s.cle}
                  d="M 8 50 A 42 42 0 0 1 92 50"
                  fill="none"
                  stroke={s.couleur}
                  strokeWidth="10"
                  pathLength={100}
                  initial={{ strokeDasharray: `0 100`, strokeDashoffset: -debut }}
                  animate={{ strokeDasharray: `${part} ${100 - part}`, strokeDashoffset: -debut }}
                  transition={{ duration: DUREE.entree, delay: 0.1 + i * 0.35, ease: DOUX }}
                />
              );
            })}
          </svg>
        </div>
        <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm tabular-nums text-attenue">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-pour" />
            Pour <Compte valeur={pour} delai={0.1} />
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-abstention" />
            Abstention <Compte valeur={abstention} delai={0.45} />
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-contre" />
            Contre <Compte valeur={contre} delai={0.8} />
          </span>
        </p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <motion.p
          className="rounded-xl border-[3px] border-texte px-4 py-1.5 font-titre text-2xl font-bold tracking-[-0.01em]"
          initial={{ opacity: 0, scale: 1.8, rotate: -14 }}
          animate={{ opacity: 1, scale: 1, rotate: -6 }}
          transition={{ ...RESSORT, delay: 1.35 }}
        >
          {LIBELLE[scrutin.resultat]}
        </motion.p>
        <motion.p
          className="text-[15px] font-medium"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...RESSORT, delay: 1.7 }}
        >
          <span aria-hidden>{bon ? "✓ " : "✕ "}</span>
          {bon ? "Bien vu" : `Raté : votre pari était « ${LIBELLE[pari].toLowerCase()} »`}
        </motion.p>
      </div>
    </div>
  );
}

function Compte({ valeur, delai }: { valeur: number; delai: number }) {
  const reduit = useReducedMotion();
  const courant = useMotionValue(reduit ? valeur : 0);
  const arrondi = useTransform(courant, (v) => nombre(Math.round(v)));
  useEffect(() => {
    if (reduit) return;
    const lecture = animate(courant, valeur, { duration: DUREE.entree, delay: delai, ease: DOUX });
    return () => lecture.stop();
  }, [courant, valeur, delai, reduit]);
  return <motion.span className="font-medium text-texte">{arrondi}</motion.span>;
}

function Suite({ onSuite, dernier, teintes }: { onSuite: () => void; dernier: boolean; teintes: Chapitre["teintes"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const poserLeFocus = useEffectEvent(() => ref.current?.querySelector("button")?.focus());
  useEffect(() => poserLeFocus(), []);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...RESSORT, delay: 1.2 }}>
      <BoutonIA onClick={onSuite} teintes={teintes}>
        {dernier ? "Mon score" : "Texte suivant"}
      </BoutonIA>
    </motion.div>
  );
}
