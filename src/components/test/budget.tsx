"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { DOUX, DUREE } from "@/lib/animation";
import { useEffect, useState } from "react";

import { BoutonIA } from "@/components/bouton-ia";
import { Sphere, type Teintes } from "@/components/sphere";
import { mandat, type Mandat } from "@/lib/mandat";
import { MAX_POSTE, POSTES, TOTAL_BUDGET, fixerPoste, repartitionEgale, type Repartition } from "@/lib/questions/budget";
import type { Chapitre } from "@/lib/questions/chapitres";
import { COULEUR_THEME } from "@/lib/sphere-mandat";

import { BOUTON_DISCRET, CADRE, EnteteChapitre, FOCUS, RESSORT } from "./chapitre";

/** Six gris, du plus foncé au plus clair : l'anneau reste sobre, la sphère au centre porte la couleur. */
const GRIS = ["#111318", "#3b404b", "#5f6573", "#8a909c", "#b3b8c2", "#d6d9df"];

/** Chapitre « Le budget de la République » : six curseurs liés, un anneau qui se redessine, la sphère au centre. */
export function ChapitreBudget({
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
  const [repartition, setRepartition] = useState<Repartition>(() => reglages.budget ?? repartitionEgale());
  const [actif, setActif] = useState<string | null>(null);

  function regler(id: string, valeur: number) {
    const suivante = fixerPoste(repartition, id, valeur);
    setRepartition(suivante);
    mandat.budgeter(suivante);
    const poste = POSTES.find((p) => p.id === id);
    onAnnonce(`${poste?.libelle} : ${suivante[id]} milliards. Les autres postes s'ajustent, le total reste ${TOTAL_BUDGET}.`);
  }

  function egaliser() {
    const egale = repartitionEgale();
    setRepartition(egale);
    mandat.budgeter(egale);
    onAnnonce("Répartition égale : environ 17 milliards par poste.");
  }

  // La sphère prend la couleur des trois postes les mieux dotés, et grossit avec eux.
  const tete = [...POSTES].sort((a, b) => (repartition[b.id] ?? 0) - (repartition[a.id] ?? 0)).slice(0, 3);
  const teintes: Teintes = ["#f4f1ec", COULEUR_THEME[tete[0].theme], COULEUR_THEME[tete[1].theme], COULEUR_THEME[tete[2].theme]];
  const poids = tete.map((p) => 0.5 + ((repartition[p.id] ?? 0) / MAX_POSTE) * 1.1) as [number, number, number];

  const segments = POSTES.map((p, i) => ({
    ...p,
    part: repartition[p.id] ?? 0,
    debut: POSTES.slice(0, i).reduce((s, q) => s + (repartition[q.id] ?? 0), 0),
    gris: GRIS[i],
  }));

  return (
    <div>
      <EnteteChapitre chapitre={chapitre} etape={1} total={1} libelleEtape="Étape" onPasser={onFini} />
      <div className={`${CADRE} gap-8 md:flex-row md:items-center`}>
        <figure className="flex shrink-0 flex-col items-center">
          <div className="relative size-52 sm:size-60">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--relief)" strokeWidth="10" />
              {segments.map((s) => (
                <motion.circle
                  key={s.id}
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  pathLength={100}
                  stroke={s.gris}
                  initial={false}
                  animate={{
                    strokeDasharray: `${Math.max(0, s.part - 0.6)} ${100 - Math.max(0, s.part - 0.6)}`,
                    strokeDashoffset: -s.debut,
                    strokeWidth: actif === s.id ? 14 : 10,
                  }}
                  transition={RESSORT}
                />
              ))}
            </svg>
            <div className="absolute inset-[22%]">
              <Sphere teintes={teintes} poids={poids} duree={9} className="size-full" />
            </div>
          </div>
          <figcaption className="mt-3 text-center text-sm text-attenue">
            Total : <span className="font-semibold tabular-nums text-texte">{TOTAL_BUDGET} milliards</span>
          </figcaption>
        </figure>

        <ul className="min-w-0 flex-1 space-y-1" aria-label="Répartition des 100 milliards">
          {segments.map((s) => (
            <li key={s.id}>
              <label htmlFor={`poste-${s.id}`} className="flex items-center justify-between gap-3 text-[15px]">
                <span className="flex min-w-0 items-center gap-2">
                  <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: s.gris }} />
                  <span className="truncate">{s.libelle}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums">
                  <Montant valeur={s.part} /> Md€
                </span>
              </label>
              <input
                id={`poste-${s.id}`}
                type="range"
                min={0}
                max={MAX_POSTE}
                step={1}
                value={s.part}
                aria-valuetext={`${s.part} milliards sur ${TOTAL_BUDGET}`}
                onChange={(e) => regler(s.id, Number(e.target.value))}
                onFocus={() => setActif(s.id)}
                onBlur={() => setActif(null)}
                onPointerEnter={() => setActif(s.id)}
                onPointerLeave={() => setActif(null)}
                className={`block h-11 w-full cursor-pointer accent-texte ${FOCUS}`}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col items-center gap-1">
        <BoutonIA
          teintes={chapitre.teintes}
          onClick={() => {
            mandat.budgeter(repartition);
            onFini();
          }}
        >
          Voter ce budget
        </BoutonIA>
        <button type="button" onClick={egaliser} className={BOUTON_DISCRET}>
          Répartir à parts égales
        </button>
      </div>
    </div>
  );
}

/** Le montant défile jusqu'à sa nouvelle valeur. */
function Montant({ valeur }: { valeur: number }) {
  const reduit = useReducedMotion();
  const courant = useMotionValue(valeur);
  const arrondi = useTransform(courant, (v) => Math.round(v));
  useEffect(() => {
    const lecture = animate(courant, valeur, { duration: reduit ? 0 : DUREE.etat, ease: DOUX });
    return () => lecture.stop();
  }, [courant, valeur, reduit]);
  return <motion.span>{arrondi}</motion.span>;
}
