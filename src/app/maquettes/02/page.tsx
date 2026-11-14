"use client";

import Link from "next/link";
import { Newsreader } from "next/font/google";
import { MotionConfig, motion } from "motion/react";

import { Barre } from "../commun";
import { EXEMPLE } from "../contenu";

const police = Newsreader({ subsets: ["latin"], style: ["normal", "italic"] });

const ARTICLES = [
  "Le citoyen ne désigne plus de représentant. Il arbitre les textes soumis à l’Assemblée ; ses réponses forment le mandat de son Député IA.",
  "Tout représentant humain peut être audité. Ses votes publics sont comparés, texte par texte, au mandat du citoyen.",
  "L’hémicycle siège sans interruption. Ses 577 sièges votent le mandat, et la machine rédige les amendements.",
];

const ROUGE = "#b3261e";

/** Chaque bloc du décret se pose l'un après l'autre, comme un texte qu'on promulgue. */
function Bloc({ rang, children, className }: { rang: number; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.15 + rang * 0.32, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function Maquette02() {
  return (
    <MotionConfig reducedMotion="user">
      <div className={`${police.className} min-h-dvh bg-white text-[#16130f]`}>
        <header className="mx-auto max-w-[760px] px-6 pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-[15px]">
            <p className="italic">Journal officiel de la République algorithmique</p>
            <p className="tabular-nums text-[#6b655c]">N° 317, 14 novembre 2050</p>
          </div>
          <div aria-hidden className="mt-4 h-[5px] border-y border-[#16130f]" />
        </header>

        <main className="mx-auto max-w-[760px] px-6 pb-28 pt-14">
          <Bloc rang={0}>
            <h1 className="text-[clamp(2rem,4.4vw,2.9rem)] font-medium leading-[1.14] tracking-[-0.012em]">
              Décret n° 2050-577 portant remplacement des députés par un législateur automatique
            </h1>
          </Bloc>
          <Bloc rang={1}>
            <p className="mt-8 text-xl italic leading-8 text-[#4a453d]">
              Le peuple français, vu ses propres votes, vu les données ouvertes de l’Assemblée nationale, décrète :
            </p>
          </Bloc>

          <ol className="mt-10 space-y-7">
            {ARTICLES.map((article, i) => (
              <li key={article}>
                <Bloc rang={i + 2} className="grid gap-x-8 gap-y-1 sm:grid-cols-[7.5rem_1fr]">
                  <h2 className="text-lg font-semibold leading-8">Article {i === 0 ? "1er" : i + 1}</h2>
                  <p className="text-xl leading-8">{article}</p>
                </Bloc>
              </li>
            ))}
          </ol>

          <Bloc rang={5} className="relative mt-14 flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="text-lg italic text-[#4a453d]">Fait à Paris, le 14 novembre 2050.</p>
              <Link
                href="/mandat"
                className="mt-6 inline-block text-2xl font-medium underline decoration-2 underline-offset-[6px]"
                style={{ textDecorationColor: ROUGE }}
              >
                {EXEMPLE.action}
              </Link>
            </div>
            <motion.svg
              viewBox="0 0 200 200"
              className="size-36 shrink-0"
              style={{ color: ROUGE }}
              role="img"
              aria-label="Sceau du législateur automatique"
              initial={{ opacity: 0, scale: 1.7, rotate: -24 }}
              animate={{ opacity: 0.9, scale: 1, rotate: -9 }}
              transition={{ type: "spring", stiffness: 260, damping: 17, delay: 2.4 }}
            >
              <defs>
                <path id="tour-du-sceau" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
              </defs>
              <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" strokeWidth="3" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <text fill="currentColor" fontSize="15.5" letterSpacing="2.2">
                <textPath href="#tour-du-sceau">Législateur automatique de la République, an 2050</textPath>
              </text>
              <text x="100" y="112" textAnchor="middle" fill="currentColor" fontSize="40" fontWeight="600">
                577
              </text>
              <text x="100" y="132" textAnchor="middle" fill="currentColor" fontSize="13" fontStyle="italic">
                sièges
              </text>
            </motion.svg>
          </Bloc>

          <Bloc rang={6}>
            <p className="mt-16 flex flex-wrap gap-x-3 border-t border-[#d9d4ca] pt-4 text-sm italic text-[#6b655c]">
              <span>{EXEMPLE.source}</span>
              <span className="border-l border-[#d9d4ca] pl-3 not-italic tabular-nums">{EXEMPLE.date}</span>
              <span className="border-l border-[#d9d4ca] pl-3">{EXEMPLE.licence}</span>
            </p>
          </Bloc>
        </main>

        <Barre n={2} />
      </div>
    </MotionConfig>
  );
}
