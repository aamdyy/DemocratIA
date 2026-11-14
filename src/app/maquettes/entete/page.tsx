"use client";

import Image from "next/image";
import Link from "next/link";
import { Public_Sans } from "next/font/google";
import { motion } from "motion/react";
import { useState } from "react";

import { Sphere } from "@/components/sphere";
import { CANDIDATES } from "@/lib/candidates";

const police = Public_Sans({ subsets: ["latin"] });
const RESSORT = { type: "spring", visualDuration: 0.4, bounce: 0 } as const;

const LIENS = ["Le test", "Les candidates", "Au pouvoir", "Honnêteté"];

function Logo({ hauteur = 20 }: { hauteur?: number }) {
  return <Image src="/logo-democratia.png" alt="DemocratIA" width={2000} height={290} style={{ height: hauteur, width: "auto" }} />;
}

/** Les liens avec un soulignement qui suit le lien survolé ou actif. */
function Liens({ actif, setActif, liens = LIENS, classe = "" }: { actif: number; setActif: (i: number) => void; liens?: string[]; classe?: string }) {
  return (
    <nav className={`flex gap-1 ${classe}`}>
      {liens.map((l, i) => (
        <button key={l} type="button" onClick={() => setActif(i)} className="relative px-3 py-2 text-sm text-[#5f6573] hover:text-[#111318]">
          <span className={i === actif ? "text-[#111318]" : ""}>{l}</span>
          {i === actif ? <motion.span layoutId={`souligne-${classe}`} className="absolute inset-x-3 -bottom-px h-0.5 bg-[#111318]" transition={RESSORT} /> : null}
        </button>
      ))}
    </nav>
  );
}

/** 1. L'actuel, avec Honnêteté : état des données à gauche, logo au centre, liens à droite. */
function Actuel() {
  const [actif, setActif] = useState(0);
  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-[#e6e7eb] px-6 py-3">
      <span className="flex items-center gap-2 text-xs text-[#5f6573]"><span className="size-2 rounded-full bg-[#111318]" />Hémicycle connecté</span>
      <Logo />
      <Liens actif={actif} setActif={setActif} classe="justify-self-end" />
    </header>
  );
}

/** 2. Pilule flottante : un en-tête détaché du haut, arrondi, qui flotte au-dessus de la page. */
function Pilule() {
  const [actif, setActif] = useState(1);
  return (
    <div className="px-6 py-4">
      <header className="mx-auto flex max-w-4xl items-center justify-between rounded-full border border-[#e6e7eb] bg-white/80 py-2 pl-5 pr-2 backdrop-blur">
        <Logo hauteur={18} />
        <div className="flex items-center gap-2">
          <Liens actif={actif} setActif={setActif} classe="pilule" />
          <span className="flex items-center gap-2 rounded-full bg-[#111318] py-1.5 pl-1.5 pr-4 text-sm font-medium text-white">
            <Sphere teintes={CANDIDATES[2].teintes} duree={8} sansEmbleme className="size-7" />
            Trouver mon IA
          </span>
        </div>
      </header>
    </div>
  );
}

/** 3. Avec votre IA : à droite, la sphère de l'IA du citoyen, qui mène à son résultat. */
function AvecIA() {
  const [actif, setActif] = useState(2);
  return (
    <header className="flex items-center justify-between border-b border-[#e6e7eb] px-6 py-3">
      <Logo />
      <Liens actif={actif} setActif={setActif} classe="ia" />
      <span className="flex items-center gap-2 rounded-full border border-[#e6e7eb] py-1 pl-1 pr-3 text-sm">
        <Sphere teintes={CANDIDATES[2].teintes} duree={8} sansEmbleme className="size-7" />
        <span>
          Votre IA : <strong className="font-semibold">Hygie</strong>
        </span>
        <span className="text-xs tabular-nums text-[#5f6573]">84 %</span>
      </span>
    </header>
  );
}

/** 4. République : liseré tricolore en haut, mention « République française, an 2050 », menu officiel. */
function Republique() {
  const [actif, setActif] = useState(0);
  return (
    <header className="border-b border-[#e6e7eb]">
      <div aria-hidden className="flex h-1">
        <span className="flex-1 bg-[#1d3fd8]" />
        <span className="flex-1 bg-[#e6e7eb]" />
        <span className="flex-1 bg-[#e1000f]" />
      </div>
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="border-l border-[#e6e7eb] pl-4 text-xs leading-4 text-[#5f6573]">
            République française
            <br />
            an 2050
          </span>
        </div>
        <Liens actif={actif} setActif={setActif} classe="rep" />
      </div>
    </header>
  );
}

/** 5. Progression : le parcours en étapes numérotées, comme une séquence, Honnêteté à part. */
function Progression() {
  const [actif, setActif] = useState(1);
  const etapes = ["Le test", "Les candidates", "Au pouvoir"];
  return (
    <header className="flex items-center justify-between border-b border-[#e6e7eb] px-6 py-3">
      <Logo />
      <ol className="flex items-center gap-2">
        {etapes.map((e, i) => (
          <li key={e} className="flex items-center gap-2">
            <button type="button" onClick={() => setActif(i)} className="flex items-center gap-2 rounded-full px-2 py-1 text-sm">
              <motion.span
                className="flex size-6 items-center justify-center rounded-full text-xs tabular-nums"
                animate={{ backgroundColor: i <= actif ? "#111318" : "#f3f4f6", color: i <= actif ? "#ffffff" : "#5f6573" }}
                transition={{ duration: 0.3 }}
              >
                {i + 1}
              </motion.span>
              <span className={i === actif ? "text-[#111318]" : "text-[#5f6573]"}>{e}</span>
            </button>
            {i < etapes.length - 1 ? <span aria-hidden className="h-px w-8 bg-[#e6e7eb]" /> : null}
          </li>
        ))}
      </ol>
      <span className="text-sm text-[#5f6573] underline decoration-[#d9dbe1] underline-offset-4">Honnêteté</span>
    </header>
  );
}

/** 6. Minimal : seulement le logo et un bouton menu ; le menu plein écran s'ouvre avec les sphères. */
function Minimal() {
  const [ouvert, setOuvert] = useState(false);
  return (
    <div className="relative">
      <header className="flex items-center justify-between border-b border-[#e6e7eb] px-6 py-3">
        <Logo />
        <button type="button" onClick={() => setOuvert((o) => !o)} className="flex items-center gap-2 rounded-full border border-[#e6e7eb] px-4 py-2 text-sm">
          {ouvert ? "Fermer" : "Menu"}
          <span aria-hidden className="flex gap-0.5">
            {CANDIDATES.slice(0, 3).map((c) => (
              <span key={c.id} className="size-1.5 rounded-full" style={{ background: c.teintes[1] }} />
            ))}
          </span>
        </button>
      </header>
      <motion.div
        initial={false}
        animate={{ height: ouvert ? "auto" : 0, opacity: ouvert ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden bg-white"
      >
        <ul className="grid gap-2 px-6 py-6 sm:grid-cols-4">
          {LIENS.map((l, i) => (
            <li key={l}>
              <span className="flex items-center gap-3 text-2xl font-semibold tracking-[-0.03em]">
                <Sphere teintes={CANDIDATES[i].teintes} duree={10} sansEmbleme className="size-8" />
                {l}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

const PROPOSITIONS = [
  { nom: "Actuel + Honnêteté", idee: "La structure d'aujourd'hui, avec le lien Honnêteté ajouté. Cliquez les liens : le soulignement glisse.", C: Actuel },
  { nom: "Pilule flottante", idee: "Un en-tête arrondi détaché du haut, avec le bouton du test toujours à portée.", C: Pilule },
  { nom: "Avec votre IA", idee: "La sphère et le pourcentage de votre IA restent visibles partout, et mènent à votre résultat.", C: AvecIA },
  { nom: "République", idee: "Liseré tricolore et mention officielle, en écho au pied de page.", C: Republique },
  { nom: "Progression", idee: "Le parcours en trois étapes numérotées qui se remplissent ; Honnêteté à part.", C: Progression },
  { nom: "Minimal", idee: "Le logo et un bouton Menu ; le menu s'ouvre en grand avec une sphère par lien.", C: Minimal },
];

export default function PropositionsEntete() {
  return (
    <div className={`${police.className} min-h-dvh bg-white text-[#111318]`}>
      <main className="mx-auto max-w-[1180px] px-6 py-14 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Propositions d&apos;en-tête</h1>
        <p className="mt-3 text-lg text-[#5f6573]">Six en-têtes, tous avec le lien Honnêteté. Cliquez dedans pour voir leurs animations, puis répondez par le numéro.</p>
        <ol className="mt-12 space-y-14">
          {PROPOSITIONS.map(({ nom, idee, C }, i) => (
            <li key={nom}>
              <p className="text-sm tabular-nums text-[#6b6f7a]">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">{nom}</h2>
              <p className="mt-1 text-[15px] text-[#5f6573]">{idee}</p>
              <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e7eb]">
                <C />
                <div className="h-24 bg-[#fafafa]" aria-hidden />
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-12 text-sm">
          <Link href="/maquettes" className="underline underline-offset-4">Retour aux maquettes</Link>
        </p>
      </main>
    </div>
  );
}
