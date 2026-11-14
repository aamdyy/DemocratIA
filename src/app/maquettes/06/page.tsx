"use client";

import Link from "next/link";
import { Epilogue } from "next/font/google";
import { MotionConfig, motion } from "motion/react";
import { useState } from "react";

import { FiltreSphere, Sphere, type Teintes } from "@/components/sphere";
import { Barre, useCompteur } from "../commun";
import { EXEMPLE } from "../contenu";

const police = Epilogue({ subsets: ["latin"] });

/** Chaque priorité a sa couleur : c'est elle qui gagne ou perd du terrain dans la sphère. */
const PRIORITES = [
  { nom: "Écologie et énergie", couleur: "#1f9d77", depart: 82 },
  { nom: "Sécurité et justice", couleur: "#2f5fe0", depart: 34 },
  { nom: "Santé", couleur: "#e0457b", depart: 61 },
] as const;

const TEINTES: Teintes = ["#f4f1ec", PRIORITES[0].couleur, PRIORITES[1].couleur, PRIORITES[2].couleur];

const STYLE_CURSEUR = `
.reglage { appearance: none; width: 100%; height: 44px; margin: 0; background: transparent; cursor: pointer; }
.reglage::-webkit-slider-runnable-track { height: 2px; background: linear-gradient(to right, var(--c) var(--v), #dcdcdc var(--v)); }
.reglage::-webkit-slider-thumb { appearance: none; width: 22px; height: 22px; margin-top: -10px; border-radius: 50%; background: var(--c); border: 4px solid #fff; box-shadow: 0 0 0 1px var(--c); }
.reglage::-moz-range-track { height: 2px; background: #dcdcdc; }
.reglage::-moz-range-progress { height: 2px; background: var(--c); }
.reglage::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--c); border: 4px solid #fff; box-shadow: 0 0 0 1px var(--c); }
.reglage:focus-visible { outline: 2px solid var(--c); outline-offset: 2px; }
`;

export default function Maquette06() {
  // Au chargement, les curseurs glissent d'eux-mêmes vers un mandat d'exemple ; dès qu'on en touche un, on reprend la main.
  const entree = useCompteur(0, 1, 2200);
  const [reglages, setReglages] = useState<(number | null)[]>([null, null, null]);
  const valeurs = PRIORITES.map((p, i) => reglages[i] ?? Math.round(50 + (p.depart - 50) * entree));
  const poids = valeurs.map((v) => 0.35 + (v / 100) * 1.25) as [number, number, number];
  const dominante = PRIORITES[valeurs.indexOf(Math.max(...valeurs))];

  return (
    <MotionConfig reducedMotion="user">
      <div className={`${police.className} min-h-dvh bg-white text-[#121212]`}>
        <style>{STYLE_CURSEUR}</style>
        <FiltreSphere />
        <header className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-6 lg:px-10">
          <p className="text-lg font-semibold tracking-[-0.02em]">DemocratIA</p>
          <p className="text-sm text-[#707070]">République française, an 2050</p>
        </header>

        <main className="mx-auto grid max-w-[1180px] items-center gap-x-20 gap-y-12 px-6 pb-24 pt-6 lg:grid-cols-[1fr_minmax(0,420px)] lg:px-10 lg:pt-14">
          <div>
            <h1 className="text-[clamp(2.6rem,6vw,5rem)] font-medium leading-[0.98] tracking-[-0.045em]">
              Façonnez Olympe.
            </h1>
            <p className="mt-6 max-w-[30rem] text-lg leading-8 text-[#555555]">
              Votre Députée IA n’a pas d’opinions : elle a vos réglages. Déplacez un curseur, sa sphère change de
              couleurs, et son vote avec.
            </p>

            <div className="mt-10 max-w-[30rem] space-y-3">
              {PRIORITES.map((p, i) => (
                <div key={p.nom}>
                  <div className="flex items-baseline justify-between text-[15px]">
                    <label htmlFor={`reglage-${i}`} className="font-medium">
                      {p.nom}
                    </label>
                    <output htmlFor={`reglage-${i}`} className="tabular-nums text-[#707070]">
                      {valeurs[i]} sur 100
                    </output>
                  </div>
                  <input
                    id={`reglage-${i}`}
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
                    style={{ "--c": p.couleur, "--v": `${valeurs[i]}%` } as React.CSSProperties}
                  />
                </div>
              ))}
            </div>

            <Link
              href="/mandat"
              className="mt-8 inline-flex h-14 items-center rounded-full bg-[#121212] px-8 font-medium text-white transition-transform duration-150 hover:scale-[1.03]"
            >
              {EXEMPLE.action}
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Sphere
              teintes={TEINTES}
              poids={poids}
              aquarelle
              duree={13}
              description={`La sphère d’Olympe, dominée par la priorité ${dominante.nom}`}
            />
            {/* La couleur de la priorité est portée par une pastille : le nom reste en texte foncé, lisible sur blanc. */}
            <p
              className="mt-7 flex flex-wrap items-center justify-center gap-x-2 text-center text-[15px] leading-6"
              aria-live="polite"
            >
              <span>
                <span className="font-medium">Olympe</span>
                <span className="text-[#707070]"> met en premier :</span>
              </span>
              <span className="inline-flex items-center gap-2 font-medium">
                <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: dominante.couleur }} />
                {dominante.nom}
              </span>
            </p>
          </motion.div>
        </main>

        <Barre n={6} />
      </div>
    </MotionConfig>
  );
}
