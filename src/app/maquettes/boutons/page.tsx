"use client";

import Link from "next/link";
import { Public_Sans } from "next/font/google";
import { motion } from "motion/react";

import { Sphere } from "@/components/sphere";
import { CANDIDATES } from "@/lib/candidates";

const police = Public_Sans({ subsets: ["latin"] });
const [GAIA, THEMIS, HYGIE] = CANDIDATES;

/** Une proposition : son numéro, son nom, une phrase, puis le bouton principal et un bouton secondaire. */
function Proposition({
  n,
  nom,
  idee,
  children,
}: {
  n: number;
  nom: string;
  idee: string;
  children: React.ReactNode;
}) {
  return (
    <li className="grid gap-6 border-t border-[#e6e7eb] py-10 md:grid-cols-[18rem_1fr] md:items-center">
      <div>
        <p className="text-sm tabular-nums text-[#6b6f7a]">{String(n).padStart(2, "0")}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">{nom}</h2>
        <p className="mt-1 text-[15px] leading-6 text-[#5f6573]">{idee}</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </li>
  );
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#111318]";

export default function Boutons() {
  return (
    <div className={`${police.className} min-h-dvh bg-white text-[#111318]`}>
      <main className="mx-auto max-w-[1100px] px-6 py-14 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Propositions de boutons</h1>
        <p className="mt-3 max-w-[60ch] text-lg leading-8 text-[#5f6573]">
          Survolez et cliquez : chaque bouton a son animation. Le premier est celui du site aujourd’hui.
        </p>

        <ol className="mt-12">
          <Proposition n={1} nom="Pilule noire" idee="L’actuel. Sobre, très lisible.">
            <button className={`h-14 rounded-full bg-[#111318] px-8 font-medium text-white transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] ${FOCUS}`}>
              Trouver mon IA
            </button>
            <button className={`h-14 rounded-full border border-[#d9dbe1] px-8 font-medium transition-colors hover:border-[#111318] ${FOCUS}`}>
              Voir les candidates
            </button>
          </Proposition>

          <Proposition n={2} nom="Pilule et sphère" idee="Une petite sphère vivante dans le bouton, qui grossit au survol.">
            <button className={`group flex h-14 items-center gap-3 rounded-full bg-[#111318] pl-2 pr-7 font-medium text-white ${FOCUS}`}>
              <Sphere teintes={HYGIE.teintes} duree={8} className="size-10 transition-transform duration-500 group-hover:scale-110" />
              Trouver mon IA
            </button>
            <button className={`group flex h-14 items-center gap-3 rounded-full border border-[#d9dbe1] pl-2 pr-7 font-medium ${FOCUS}`}>
              <Sphere teintes={GAIA.teintes} duree={10} className="size-10 transition-transform duration-500 group-hover:scale-110" />
              Voir les candidates
            </button>
          </Proposition>

          <Proposition n={3} nom="Bordure de matière" idee="Le contour est une sphère étirée qui tourne lentement ; l’intérieur reste blanc.">
            <span className="relative inline-flex rounded-full p-[2px]">
              <span
                aria-hidden
                className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-full"
                style={{ background: `conic-gradient(${HYGIE.teintes[1]}, ${GAIA.teintes[1]}, ${THEMIS.teintes[1]}, ${HYGIE.teintes[1]})` }}
              />
              <button className={`relative h-14 rounded-full bg-white px-8 font-medium ${FOCUS}`}>Trouver mon IA</button>
            </span>
          </Proposition>

          <Proposition n={4} nom="Remplissage" idee="Au survol, la couleur de l’IA monte depuis le bas et le texte passe en blanc.">
            <button className={`group relative h-14 overflow-hidden rounded-full border border-[#111318] px-8 font-medium ${FOCUS}`}>
              <span
                aria-hidden
                className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0"
                style={{ background: HYGIE.teintes[1] }}
              />
              <span className="relative transition-colors duration-300 group-hover:text-white">Trouver mon IA</span>
            </button>
          </Proposition>

          <Proposition n={5} nom="Aimanté" idee="Le bouton suit légèrement le pointeur, comme attiré, puis revient en place.">
            <motion.button
              className={`h-14 rounded-full bg-[#111318] px-8 font-medium text-white ${FOCUS}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.translate = `${(e.clientX - r.x - r.width / 2) * 0.15}px ${(e.clientY - r.y - r.height / 2) * 0.25}px`;
              }}
              onPointerLeave={(e) => (e.currentTarget.style.translate = "0 0")}
              style={{ transition: "translate 200ms ease-out" }}
            >
              Trouver mon IA
            </motion.button>
          </Proposition>

          <Proposition n={6} nom="Lien souligné" idee="Le plus discret : du texte, un trait qui se dessine au survol.">
            <Link href="#" className={`group relative py-2 text-lg font-medium ${FOCUS}`}>
              Trouver mon IA
              <span aria-hidden className="absolute inset-x-0 bottom-1 h-px origin-left scale-x-30 bg-[#111318] transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          </Proposition>

          <Proposition n={7} nom="Officiel" idee="Rectangle bleu, coins droits, à la manière des formulaires de l’administration.">
            <button className={`h-14 bg-[#1d3fd8] px-8 font-medium text-white transition-colors hover:bg-[#1530a8] ${FOCUS}`}>
              Trouver mon IA
            </button>
            <button className={`h-14 border border-[#1d3fd8] px-8 font-medium text-[#1d3fd8] transition-colors hover:bg-[#eef1ff] ${FOCUS}`}>
              Voir les candidates
            </button>
          </Proposition>

          <Proposition n={8} nom="Bulle de verre" idee="Le bouton entier est une sphère douce, sans fond noir ; le texte reste sombre.">
            <button
              className={`group relative h-14 overflow-hidden rounded-full px-8 font-medium ${FOCUS}`}
              style={{ background: `radial-gradient(circle at 30% 20%, #fff, ${HYGIE.teintes[0]} 40%, ${HYGIE.teintes[3]})` }}
            >
              <span className="relative transition-transform duration-300 group-hover:scale-105">Trouver mon IA</span>
            </button>
          </Proposition>
        </ol>

        <p className="mt-10 text-sm text-[#6b6f7a]">
          <Link href="/maquettes" className="underline underline-offset-4">
            Retour aux maquettes
          </Link>
        </p>
      </main>
    </div>
  );
}
