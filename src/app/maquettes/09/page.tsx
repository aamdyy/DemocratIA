"use client";

import Link from "next/link";
import { Schibsted_Grotesk } from "next/font/google";
import { MotionConfig, motion } from "motion/react";
import { useEffect, useState } from "react";

import { FiltreSphere, SPHERES, Sphere } from "@/components/sphere";
import { Barre } from "../commun";
import { EXEMPLE } from "../contenu";

const police = Schibsted_Grotesk({ subsets: ["latin"] });

const AMENDEMENT = `Amendement n° IA-0317

Article 3
Après l’alinéa 4, insérer l’alinéa suivant : « Tout bâtiment public de plus de mille mètres carrés publie chaque année sa consommation d’énergie. »

Exposé sommaire
Le mandat place l’écologie à 82 sur 100. Le présent amendement rend la sobriété vérifiable par chaque citoyen.`;

const TEINTE = SPHERES.olympe.teintes[1];

/** Fait apparaître le texte lettre à lettre, marque une pause à la fin, puis recommence. */
function useDictee(texte: string): number {
  const [lettres, setLettres] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLettres(texte.length);
      return;
    }
    const fini = lettres >= texte.length;
    const minuterie = setTimeout(() => setLettres(fini ? 0 : lettres + 2), fini ? 4500 : 26);
    return () => clearTimeout(minuterie);
  }, [lettres, texte]);
  return lettres;
}

export default function Maquette09() {
  const lettres = useDictee(AMENDEMENT);
  const enCours = lettres < AMENDEMENT.length;

  return (
    <MotionConfig reducedMotion="user">
      <div className={`${police.className} min-h-dvh bg-white text-[#101216]`}>
        <FiltreSphere />
        <header className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-6 lg:px-10">
          <p className="text-lg font-semibold tracking-[-0.02em]">DemocratIA</p>
          <Link href="/seance" className="rounded-full bg-[#101216] px-5 py-3 text-sm font-medium text-white">
            Entrer en séance
          </Link>
        </header>

        <main className="mx-auto max-w-[1160px] px-6 pb-28 pt-6 lg:px-10 lg:pt-12">
          <h1 className="max-w-[19ch] text-[clamp(2.1rem,4.4vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.035em]">
            Olympe écrit la loi pendant que vous lisez cette phrase.
          </h1>

          <div className="mt-14 grid items-start gap-x-20 gap-y-14 lg:grid-cols-[300px_1fr]">
            <div className="relative mx-auto size-[240px] lg:mx-0 lg:mt-4 lg:size-[300px]">
              {/* Des ondes partent de la sphère tant qu'elle dicte. */}
              {enCours
                ? [0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      aria-hidden
                      className="absolute inset-[18%] rounded-full border"
                      style={{ borderColor: TEINTE }}
                      animate={{ scale: [1, 1.75], opacity: [0.5, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
                    />
                  ))
                : null}
              <motion.div
                className="absolute inset-[18%]"
                animate={{ scale: enCours ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 1.2, repeat: enCours ? Infinity : 0, ease: "easeInOut" }}
              >
                <Sphere teintes={SPHERES.olympe.teintes} aquarelle duree={9} description="La sphère d’Olympe" />
              </motion.div>
            </div>

            <div>
              <p className="flex items-center gap-2.5 text-[15px] font-medium" role="status">
                <span aria-hidden className="size-2 rounded-full" style={{ background: enCours ? TEINTE : "#9aa0ab" }} />
                {enCours ? "Olympe rédige son amendement" : "Amendement déposé, en 0,8 seconde"}
              </p>
              <p className="mt-2 text-[15px] text-[#666c79]">Sur le texte : {EXEMPLE.texte}</p>

              <div
                className={`mt-7 min-h-[19rem] whitespace-pre-wrap border-l-2 pl-6 text-lg leading-8 ${enCours ? "curseur-machine" : ""}`}
                style={{ borderColor: TEINTE }}
                aria-busy={enCours}
              >
                {AMENDEMENT.slice(0, lettres)}
              </div>

              <p className="mt-6 text-xs leading-5 text-[#666c79]">
                Texte rédigé par un modèle de langage, via Featherless. Fiction : il n’engage aucune institution.
              </p>
              <p className="mt-1 flex flex-wrap gap-x-3 text-xs leading-5 text-[#666c79]">
                <span>{EXEMPLE.source}</span>
                <span className="border-l border-[#e3e5ea] pl-3 tabular-nums">{EXEMPLE.date}</span>
                <span className="border-l border-[#e3e5ea] pl-3">{EXEMPLE.licence}</span>
              </p>
            </div>
          </div>
        </main>

        <Barre n={9} />
      </div>
    </MotionConfig>
  );
}
