"use client";

import Link from "next/link";
import { Public_Sans } from "next/font/google";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { Sphere } from "@/components/sphere";
import { CANDIDATES } from "@/lib/candidates";

const police = Public_Sans({ subsets: ["latin"] });

const L1 = "En 2050, on ne vote plus pour un parti.";
const L2 = "On règle une sphère.";
const DOUX = [0.22, 1, 0.36, 1] as const;
const COULEURS = CANDIDATES.map((c) => c.teintes[1]);
const TITRE = "block text-[clamp(1.9rem,3.6vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.04em]";

/** 1. L'actuel : les deux lignes montent en fondu. */
function Fondu() {
  return (
    <>
      <motion.span className={TITRE} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: DOUX }}>
        {L1}
      </motion.span>
      <motion.span className={`${TITRE} text-[#5f6573]`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: DOUX }}>
        {L2}
      </motion.span>
    </>
  );
}

/** 2. Mot à mot, chaque mot sort d'un léger flou. */
function MotAMot() {
  const mots = [...L1.split(" ").map((m) => ({ m, l: 1 })), ...L2.split(" ").map((m) => ({ m, l: 2 }))];
  return (
    <span className={TITRE}>
      {mots.map(({ m, l }, i) => (
        <span key={i}>
          {l === 2 && mots[i - 1]?.l === 1 ? <br /> : null}
          <motion.span
            className={`inline-block ${l === 2 ? "text-[#5f6573]" : ""}`}
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: i * 0.07, ease: DOUX }}
          >
            {m}
          </motion.span>{" "}
        </span>
      ))}
    </span>
  );
}

/** Fait apparaître `texte` lettre à lettre, puis appelle `fini`. */
function useFrappe(texte: string, demarrer: boolean, vitesse = 38) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!demarrer || n >= texte.length) return;
    const t = setTimeout(() => setN((x) => x + 1), vitesse);
    return () => clearTimeout(t);
  }, [n, demarrer, texte, vitesse]);
  return n;
}

/** 3. Machine à écrire : la machine tape la première ligne, puis la seconde. */
function Machine() {
  const n1 = useFrappe(L1, true);
  const n2 = useFrappe(L2, n1 >= L1.length);
  return (
    <>
      <span className={TITRE}>
        {L1.slice(0, n1)}
        {n1 < L1.length ? <span className="animate-pulse">▍</span> : null}
      </span>
      <span className={`${TITRE} text-[#5f6573]`}>
        {L2.slice(0, n2)}
        {n1 >= L1.length ? <span className="animate-pulse">▍</span> : null}
      </span>
    </>
  );
}

/** 4. Le parti est barré, puis la sphère arrive. */
function Barre() {
  const debut = "En 2050, on ne vote plus pour ";
  return (
    <>
      <motion.span className={TITRE} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {debut}
        <span className="relative inline-block">
          <motion.span initial={{ opacity: 1 }} animate={{ opacity: 0.35 }} transition={{ delay: 1.3, duration: 0.4 }}>
            un parti
          </motion.span>
          <motion.span
            aria-hidden
            className="absolute left-0 right-0 top-[55%] h-[0.08em] origin-left bg-[#e1000f]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.5, ease: DOUX }}
          />
        </span>
        .
      </motion.span>
      <motion.span className={`${TITRE} text-[#5f6573]`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 0.7, ease: DOUX }}>
        {L2}
      </motion.span>
    </>
  );
}

/** 5. Rideau : chaque ligne monte depuis derrière un masque. */
function Rideau() {
  return (
    <>
      {[L1, L2].map((l, i) => (
        <span key={l} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={`${TITRE} ${i ? "text-[#5f6573]" : ""}`}
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.9, delay: i * 0.25, ease: DOUX }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </>
  );
}

const SIGNES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&";

/** 6. Décodage : des signes au hasard se figent en lettres, de gauche à droite. */
function Decodage() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), 30);
    return () => clearInterval(id);
  }, []);
  const coder = (texte: string, decalage: number) =>
    texte
      .split("")
      .map((c, i) => (c === " " || i < t - decalage ? c : SIGNES[(i * 7 + t * 3) % SIGNES.length]))
      .join("");
  return (
    <>
      <span className={`${TITRE} tabular-nums`}>{coder(L1, 0)}</span>
      <span className={`${TITRE} text-[#5f6573]`}>{coder(L2, 20)}</span>
    </>
  );
}

/** 7. Les couleurs des sept IA traversent « On règle une sphère. ». */
function Degrade() {
  const fond = `linear-gradient(90deg, #5f6573 0%, #5f6573 30%, ${COULEURS.join(", ")}, #5f6573 75%, #5f6573 100%)`;
  return (
    <>
      <motion.span className={TITRE} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: DOUX }}>
        {L1}
      </motion.span>
      <motion.span
        className={`${TITRE} bg-clip-text text-transparent`}
        style={{ backgroundImage: fond, backgroundSize: "300% 100%" }}
        initial={{ opacity: 0, backgroundPositionX: "100%" }}
        animate={{ opacity: 1, backgroundPositionX: ["100%", "0%"] }}
        transition={{ opacity: { duration: 0.5, delay: 0.3 }, backgroundPositionX: { duration: 3.5, delay: 0.6, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" } }}
      >
        {L2}
      </motion.span>
    </>
  );
}

/** 8. Zoom : la phrase arrive de très près, floue, et se pose. */
function Zoom() {
  return (
    <>
      <motion.span className={TITRE} initial={{ opacity: 0, scale: 1.6, filter: "blur(18px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 1.1, ease: DOUX }}>
        {L1}
      </motion.span>
      <motion.span className={`${TITRE} text-[#5f6573]`} initial={{ opacity: 0, scale: 1.6, filter: "blur(18px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 1.1, delay: 0.35, ease: DOUX }}>
        {L2}
      </motion.span>
    </>
  );
}

/** 9. Le point final de la seconde ligne devient une sphère qui grossit et respire. */
function PointSphere() {
  return (
    <>
      <motion.span className={TITRE} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: DOUX }}>
        {L1}
      </motion.span>
      <motion.span className={`${TITRE} text-[#5f6573]`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25, ease: DOUX }}>
        On règle une sphère
        <motion.span
          className="ml-[0.08em] inline-block align-baseline"
          initial={{ scale: 0.25 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", visualDuration: 0.8, bounce: 0.15 }}
        >
          <Sphere teintes={CANDIDATES[2].teintes} duree={8} className="inline-block size-[0.7em] align-[-0.05em]" />
        </motion.span>
      </motion.span>
    </>
  );
}

const PROPOSITIONS = [
  { nom: "Fondu", idee: "L'actuel : les deux lignes montent en douceur.", C: Fondu },
  { nom: "Mot à mot", idee: "Chaque mot sort d'un léger flou, l'un après l'autre.", C: MotAMot },
  { nom: "Machine à écrire", idee: "La machine tape la phrase, puis sa réponse.", C: Machine },
  { nom: "Le parti barré", idee: "« un parti » est barré en rouge, puis la sphère arrive.", C: Barre },
  { nom: "Rideau", idee: "Chaque ligne monte de derrière un masque, très éditorial.", C: Rideau },
  { nom: "Décodage", idee: "Des signes au hasard se figent en lettres : la machine déchiffre.", C: Decodage },
  { nom: "Couleurs des IA", idee: "Les couleurs des sept candidates traversent la seconde ligne, en boucle.", C: Degrade },
  { nom: "Zoom", idee: "La phrase arrive de très près, floue, et se pose.", C: Zoom },
  { nom: "Le point devient sphère", idee: "Le point final se change en petite sphère vivante.", C: PointSphere },
];

export default function Titre() {
  const [rejeu, setRejeu] = useState(0);
  const reduit = useReducedMotion();
  return (
    <div className={`${police.className} min-h-dvh bg-white text-[#111318]`}>
      <main className="mx-auto max-w-[1180px] px-6 py-14 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.03em]">Animations du titre</h1>
            <p className="mt-3 text-lg text-[#5f6573]">Neuf façons de faire entrer la phrase d&apos;accueil. Répondez par le numéro.</p>
          </div>
          <button
            type="button"
            onClick={() => setRejeu((r) => r + 1)}
            className="h-12 rounded-full bg-[#111318] px-6 font-medium text-white transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-3"
          >
            Rejouer tout
          </button>
        </div>
        {reduit ? <p className="mt-6 text-sm text-[#5f6573]">Les animations sont réduites sur cet appareil : vous voyez l&apos;état final.</p> : null}
        <ol className="mt-12">
          {PROPOSITIONS.map(({ nom, idee, C }, i) => (
            <li key={nom} className="border-t border-[#e6e7eb] py-12">
              <p className="text-sm tabular-nums text-[#6b6f7a]">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">{nom}</h2>
              <p className="mt-1 text-[15px] text-[#5f6573]">{idee}</p>
              <div className="mt-8 min-h-[7.5rem] text-center" aria-hidden>
                <C key={rejeu} />
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm">
          <Link href="/maquettes" className="underline underline-offset-4">
            Retour aux maquettes
          </Link>
        </p>
      </main>
    </div>
  );
}
