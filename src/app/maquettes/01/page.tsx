"use client";

import Link from "next/link";
import { Public_Sans } from "next/font/google";
import { MotionConfig, motion } from "motion/react";

import { Hemicycle } from "@/components/hemicycle";
import { Barre, HEMICYCLE_HUMAIN, hemicycleUni, useEtape } from "../commun";
import { EXEMPLE } from "../contenu";

const police = Public_Sans({ subsets: ["latin"] });

const DUREES = [2800, 3800] as const;
const ETATS = [HEMICYCLE_HUMAIN, hemicycleUni("machine")];
const LEGENDES = [
  "Hémicycle humain : 577 députés, autant de désaccords.",
  "Hémicycle automatisé : 577 sièges, un seul mandat.",
];

const COULEURS = {
  "--pour": "#000091",
  "--contre": "#e1000f",
  "--abstention": "#c4c7d6",
  "--absent": "#ecedf3",
  "--machine": "#000091",
} as React.CSSProperties;

const TITRE = ["Vous ne votez plus pour quelqu’un.", "Vous réglez quelque chose."];

export default function Maquette01() {
  const etape = useEtape(DUREES);

  return (
    <MotionConfig reducedMotion="user">
      <div className={`${police.className} min-h-dvh bg-white text-[#161616]`} style={COULEURS}>
        <header className="mx-auto flex max-w-[1200px] items-center gap-4 px-6 py-6 sm:gap-8 lg:px-10">
          <div className="flex items-center gap-3">
            <span aria-hidden className="flex h-10 w-[18px]">
              <span className="w-1/3 bg-[#000091]" />
              <span className="w-1/3 border-y border-[#dddddd] bg-white" />
              <span className="w-1/3 bg-[#e1000f]" />
            </span>
            <p className="text-[13px] font-bold leading-[1.2]">
              République
              <br />
              française
            </p>
          </div>
          <p className="border-l border-[#dddddd] pl-4 text-lg font-bold sm:pl-8">DemocratIA</p>
          <nav aria-label="Étapes" className="ml-auto hidden gap-8 text-sm text-[#3a3a3a] md:flex">
            {EXEMPLE.etapes.map((e) => (
              <span key={e.nom}>{e.nom}</span>
            ))}
          </nav>
          {/* Sur un téléphone, ce bouton ne tient pas à côté du bloc-marque : celui du titre suffit. */}
          <Link
            href="/mandat"
            className="ml-auto hidden bg-[#000091] px-5 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#1212ff] sm:block md:ml-0"
          >
            {EXEMPLE.action}
          </Link>
        </header>

        <main className="mx-auto grid max-w-[1200px] items-center gap-x-16 gap-y-12 px-6 pb-20 pt-10 lg:grid-cols-[1.05fr_1fr] lg:px-10 lg:pt-20">
          <div>
            <h1 className="text-[clamp(2.3rem,4.6vw,3.9rem)] font-bold leading-[1.06] tracking-[-0.02em]">
              {TITRE.map((ligne, i) => (
                <motion.span
                  key={ligne}
                  className="block"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.14, ease: "easeOut" }}
                >
                  {ligne}
                </motion.span>
              ))}
            </h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="mt-7 max-w-[34rem] text-lg leading-8 text-[#3a3a3a]">{EXEMPLE.chapeau}</p>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2">
                <Link
                  href="/mandat"
                  className="bg-[#000091] px-6 py-3.5 font-medium text-white transition-colors duration-150 hover:bg-[#1212ff]"
                >
                  {EXEMPLE.action}
                </Link>
                <Link href="/seance" className="py-2.5 font-medium text-[#000091] underline underline-offset-4">
                  Assister à une séance
                </Link>
              </div>
            </motion.div>
          </div>

          <motion.figure
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Hemicycle etats={ETATS[etape]} description={LEGENDES[etape]} className="w-full" />
            <figcaption className="mt-6 border-l-4 border-[#000091] pl-4">
              <p className="font-bold">{LEGENDES[etape]}</p>
              <p className="mt-1 flex flex-wrap gap-x-3 text-xs leading-5 text-[#666666]">
                <span>{EXEMPLE.source}</span>
                <span className="border-l border-[#dddddd] pl-3">{EXEMPLE.date}</span>
                <span className="border-l border-[#dddddd] pl-3">{EXEMPLE.licence}</span>
              </p>
            </figcaption>
          </motion.figure>
        </main>

        <section className="border-t border-[#dddddd]">
          <ol className="mx-auto grid max-w-[1200px] gap-8 px-6 pb-28 pt-12 md:grid-cols-3 lg:px-10">
            {EXEMPLE.etapes.map((e, i) => (
              <li key={e.nom} className="flex gap-4">
                <span className="text-2xl font-bold text-[#000091]">{i + 1}</span>
                <div>
                  <h2 className="font-bold">{e.nom}</h2>
                  <p className="mt-1 text-sm leading-6 text-[#3a3a3a]">{e.texte}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <Barre n={1} />
      </div>
    </MotionConfig>
  );
}
