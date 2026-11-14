"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";

import { useCompteur } from "@/app/maquettes/commun";
import { Sphere, type Teintes } from "@/components/sphere";
import { CANDIDATES, type Candidate } from "@/lib/candidates";
import type { ThemeId } from "@/lib/themes";
import { Reveal, TITRE_SECTION } from "./reveal";

/** Chaque thème a sa couleur : c'est elle qui gagne ou perd du terrain dans la sphère. */
const THEMES_REGLES = [
  { id: "ecologie", nom: "Écologie et énergie", couleur: "#1f9d77", depart: 82 },
  { id: "securite", nom: "Sécurité et justice", couleur: "#2f5fe0", depart: 34 },
  { id: "sante", nom: "Santé", couleur: "#e0457b", depart: 61 },
] as const satisfies readonly { id: ThemeId; nom: string; couleur: string; depart: number }[];

const TEINTES: Teintes = ["#f4f1ec", THEMES_REGLES[0].couleur, THEMES_REGLES[1].couleur, THEMES_REGLES[2].couleur];

const STYLE_CURSEUR = `
.reglage { appearance: none; width: 100%; height: 44px; margin: 0; background: transparent; cursor: pointer; }
.reglage::-webkit-slider-runnable-track { height: 2px; background: linear-gradient(to right, var(--c) var(--v), #dcdcdc var(--v)); }
.reglage::-webkit-slider-thumb { appearance: none; width: 22px; height: 22px; margin-top: -10px; border-radius: 50%; background: var(--c); border: 4px solid #fff; box-shadow: 0 0 0 1px var(--c); }
.reglage::-moz-range-track { height: 2px; background: #dcdcdc; }
.reglage::-moz-range-progress { height: 2px; background: var(--c); }
.reglage::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--c); border: 4px solid #fff; box-shadow: 0 0 0 1px var(--c); }
.reglage:focus-visible { outline: 2px solid var(--c); outline-offset: 2px; }
`;

/** La candidate dont les poids sur ces trois thèmes sont les plus proches des réglages. */
function plusProche(valeurs: number[]): Candidate {
  const ecart = (c: Candidate) =>
    THEMES_REGLES.reduce((somme, t, i) => somme + Math.abs(c.poids[t.id] - valeurs[i]), 0);
  return CANDIDATES.reduce((meilleure, c) => (ecart(c) < ecart(meilleure) ? c : meilleure));
}

/** « Vous la façonnez. » : les curseurs règlent les couleurs de la sphère, et la candidate la plus proche suit. */
export function Faconner() {
  const racine = useRef<HTMLElement>(null);
  const vu = useInView(racine, { once: true, amount: 0.35 });
  // Quand la section arrive à l'écran, les curseurs glissent d'eux-mêmes vers un mandat d'exemple ; dès qu'on en touche un, on reprend la main.
  const entree = useCompteur(0, vu ? 1 : 0, 2200, vu);
  const [reglages, setReglages] = useState<(number | null)[]>([null, null, null]);
  const valeurs = THEMES_REGLES.map((t, i) => reglages[i] ?? Math.round(50 + (t.depart - 50) * entree));
  const poids = valeurs.map((v) => 0.35 + (v / 100) * 1.25) as [number, number, number];
  const dominante = THEMES_REGLES[valeurs.indexOf(Math.max(...valeurs))];
  const proche = plusProche(valeurs);

  return (
    <section ref={racine} aria-labelledby="titre-faconner" className="mx-auto max-w-[1120px]">
      <style>{STYLE_CURSEUR}</style>
      <div className="grid items-center gap-x-20 gap-y-12 lg:grid-cols-[1fr_minmax(0,420px)]">
        <Reveal>
          <h2 id="titre-faconner" className={TITRE_SECTION}>
            Vous la façonnez.
          </h2>
          <p className="mt-6 max-w-[30rem] text-lg leading-8 text-attenue">
            Déplacez un curseur : la sphère change de couleurs, et sa candidate avec.
          </p>

          <div className="mt-10 max-w-[30rem] space-y-3">
            {THEMES_REGLES.map((t, i) => (
              <div key={t.id}>
                <div className="flex items-baseline justify-between text-[15px]">
                  <label htmlFor={`reglage-${t.id}`} className="font-medium">
                    {t.nom}
                  </label>
                  <output htmlFor={`reglage-${t.id}`} className="tabular-nums text-attenue">
                    {valeurs[i]} sur 100
                  </output>
                </div>
                <input
                  id={`reglage-${t.id}`}
                  type="range"
                  min={0}
                  max={100}
                  value={valeurs[i]}
                  onChange={(evenement) =>
                    setReglages((precedents) =>
                      precedents.map((v, j) => (j === i ? Number(evenement.target.value) : (v ?? valeurs[j]))),
                    )
                  }
                  className="reglage"
                  style={{ "--c": t.couleur, "--v": `${valeurs[i]}%` } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </Reveal>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Sphere
            teintes={TEINTES}
            poids={poids}
            aquarelle
            duree={13}
            description={`Votre sphère, dominée par le thème ${dominante.nom}`}
          />
          {/* La couleur est portée par une pastille : le nom reste en texte foncé, lisible sur blanc. */}
          <p
            className="mt-7 flex flex-wrap items-center justify-center gap-x-2 text-center text-[15px] leading-6"
            aria-live="polite"
          >
            <span className="text-attenue">Avec ces réglages :</span>
            <span className="inline-flex items-center gap-2 font-semibold">
              <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: proche.teintes[1] }} />
              {proche.prenom}
            </span>
          </p>
          <p className="text-center text-sm leading-6 text-attenue">{proche.doctrine}</p>
        </motion.div>
      </div>
    </section>
  );
}
