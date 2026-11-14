"use client";

import Link from "next/link";
import { Bricolage_Grotesque } from "next/font/google";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useState } from "react";

import { Barre } from "../commun";
import { EXEMPLE } from "../contenu";

const police = Bricolage_Grotesque({ subsets: ["latin"] });

const TEXTES = [
  EXEMPLE.texte,
  "Proposition de loi visant à plafonner les loyers dans les zones tendues",
  "Projet de loi d’orientation pour la sécurité intérieure",
  "Proposition de loi relative à la semaine de quatre jours",
];

const GESTES = [
  { nom: "Pour", couleur: "#2747f5", sortie: { x: 380, y: 0, rotate: 9 } },
  { nom: "Contre", couleur: "#e5484d", sortie: { x: -380, y: 0, rotate: -9 } },
  { nom: "Abstention", couleur: "#8a909c", sortie: { x: 0, y: 260, rotate: 0 } },
] as const;

const CARTE = {
  entree: { opacity: 0, scale: 0.94, y: 28, x: 0, rotate: 0 },
  posee: { opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 },
  sortie: (geste: number) => ({ opacity: 0, ...GESTES[geste].sortie }),
};

export default function Maquette03() {
  // Nombre de textes déjà arbitrés par la démonstration : la carte en cours est la suivante.
  const [tour, setTour] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const minuterie = setInterval(() => setTour((t) => t + 1), 2600);
    return () => clearInterval(minuterie);
  }, []);

  const total = (rang: number) => Math.floor((tour + (2 - rang)) / 3);

  return (
    <MotionConfig reducedMotion="user">
      <div className={`${police.className} min-h-dvh overflow-x-clip bg-white text-[#14151a]`}>
        <header className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-7 lg:px-10">
          <p className="text-xl font-semibold tracking-[-0.01em]">DemocratIA</p>
          <p className="text-sm text-[#6a6f7b]">République française, an 2050</p>
        </header>

        <main className="mx-auto grid max-w-[1160px] items-center gap-x-20 gap-y-14 px-6 pb-24 pt-8 lg:grid-cols-[1fr_minmax(0,460px)] lg:px-10 lg:pt-16">
          <div>
            <h1 className="text-[clamp(2.5rem,5.4vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
              Un texte, trois réponses. À chaque geste, votre Député IA se règle.
            </h1>
            <p className="mt-7 max-w-[32rem] text-lg leading-8 text-[#4b505c]">{EXEMPLE.chapeau}</p>
            <Link
              href="/mandat"
              className="mt-9 inline-flex h-14 items-center rounded-full bg-[#14151a] px-8 text-lg font-medium text-white transition-transform duration-150 hover:scale-[1.03]"
            >
              {EXEMPLE.action}
            </Link>
          </div>

          <div>
            <p className="mb-4 text-sm tabular-nums text-[#6a6f7b]">Texte {(tour % 12) + 1} sur 12</p>
            <div className="relative h-[300px]">
              <AnimatePresence custom={(tour + 2) % 3} initial={false}>
                <motion.article
                  key={tour}
                  variants={CARTE}
                  initial="entree"
                  animate="posee"
                  exit="sortie"
                  transition={{ duration: 0.5, ease: [0.3, 0.7, 0.2, 1] }}
                  className="absolute inset-0 flex flex-col justify-between rounded-[22px] border border-[#e3e5ea] bg-white p-8"
                >
                  <h2 className="text-[1.7rem] font-medium leading-[1.2] tracking-[-0.02em]">
                    {TEXTES[tour % TEXTES.length]}
                  </h2>
                  <p className="flex flex-wrap gap-x-3 text-xs leading-5 text-[#6a6f7b]">
                    <span>{EXEMPLE.source}</span>
                    <span className="border-l border-[#e3e5ea] pl-3 tabular-nums">{EXEMPLE.date}</span>
                    <span className="border-l border-[#e3e5ea] pl-3">{EXEMPLE.licence}</span>
                  </p>
                </motion.article>
              </AnimatePresence>
            </div>

            <ul className="mt-6 grid grid-cols-3 gap-3">
              {[1, 2, 0].map((rang) => {
                const geste = GESTES[rang];
                const actif = tour % 3 === rang;
                return (
                  <li key={geste.nom}>
                    <motion.div
                      animate={{ scale: actif ? 1.04 : 1 }}
                      className="flex h-14 items-center justify-center gap-2 rounded-full border text-[15px] font-medium"
                      // Le nom reste en texte foncé : le rouge et le gris ne sont pas assez lisibles sur blanc.
                      // La réponse en cours se reconnaît à son contour coloré, plus épais.
                      style={{
                        borderColor: actif ? geste.couleur : "#e3e5ea",
                        boxShadow: actif ? `inset 0 0 0 1px ${geste.couleur}` : "none",
                      }}
                    >
                      <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: geste.couleur }} />
                      {geste.nom}
                    </motion.div>
                    <p className="mt-2 text-center text-sm tabular-nums text-[#6a6f7b]">{total(rang)}</p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-center text-sm text-[#6a6f7b]">
              Ceci est une démonstration. Dans votre mandat, vous glissez la carte ou vous utilisez les flèches du
              clavier.
            </p>
          </div>
        </main>

        <Barre n={3} />
      </div>
    </MotionConfig>
  );
}
