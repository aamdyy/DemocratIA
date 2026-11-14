"use client";

import Link from "next/link";
import Image from "next/image";
import { Public_Sans } from "next/font/google";
import { motion } from "motion/react";

import { Sphere } from "@/components/sphere";
import { CANDIDATES } from "@/lib/candidates";

const police = Public_Sans({ subsets: ["latin"] });
const DOUX = [0.22, 1, 0.36, 1] as const;
const LIEN = "underline decoration-[#d9dbe1] underline-offset-4 transition-colors hover:decoration-current";
const PARCOURS = [
  { href: "/test", libelle: "Le test" },
  { href: "/candidates", libelle: "Les candidates" },
  { href: "/seance", libelle: "Au pouvoir" },
  { href: "/audit", libelle: "Auditer un député" },
];
const AVERTISSEMENT = "Fiction d'anticipation. Les IA candidates sont fictives ; les scrutins et les parlementaires sont réels.";

function Logo({ hauteur = 22 }: { hauteur?: number }) {
  return <Image src="/logo-democratia.png" alt="DemocratIA" width={2000} height={290} style={{ height: hauteur, width: "auto" }} />;
}

/** 1. Sobre : une ligne, l'avertissement à gauche, les liens à droite (l'actuel, resserré). */
function Sobre() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e6e7eb] px-8 py-6 text-xs text-[#5f6573]">
      <p>{AVERTISSEMENT}</p>
      <nav className="flex gap-6">
        <Link href="/audit" className={LIEN}>Auditer un député</Link>
        <Link href="/maquettes" className={LIEN}>Maquettes</Link>
      </nav>
    </footer>
  );
}

/** 2. Colonnes : le logo et une phrase, puis le parcours, les données et les mentions, comme un site institutionnel. */
function Colonnes() {
  return (
    <footer className="border-t border-[#e6e7eb] px-8 pb-8 pt-12 text-sm">
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs leading-6 text-[#5f6573]">En 2050, la France élit une IA. Vous réglez laquelle.</p>
        </div>
        <div>
          <p className="font-semibold">Le parcours</p>
          <ul className="mt-3 space-y-2 text-[#5f6573]">
            {PARCOURS.map((l) => (
              <li key={l.href}><Link href={l.href} className={LIEN}>{l.libelle}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold">Les données</p>
          <ul className="mt-3 space-y-2 text-[#5f6573]">
            <li>Scrutins de l&apos;Assemblée nationale</li>
            <li>Via Hémicycle</li>
            <li>Licence Ouverte 2.0</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Le projet</p>
          <ul className="mt-3 space-y-2 text-[#5f6573]">
            <li>Hackathon IA &amp; Open Data</li>
            <li><Link href="/maquettes" className={LIEN}>Maquettes</Link></li>
          </ul>
        </div>
      </div>
      <p className="mt-12 border-t border-[#e6e7eb] pt-6 text-xs text-[#5f6573]">{AVERTISSEMENT}</p>
    </footer>
  );
}

/** 3. Les sept sphères : une rangée des candidates en guise de signature, qui s'éveillent au survol. */
function Spheres() {
  return (
    <footer className="border-t border-[#e6e7eb] px-8 pb-8 pt-12 text-center">
      <div className="flex justify-center gap-3">
        {CANDIDATES.map((c, i) => (
          <Link key={c.id} href={`/candidates/${c.id}`} aria-label={`Voir ${c.prenom}`} className="group">
            <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", visualDuration: 0.4, bounce: 0 }}>
              <Sphere teintes={c.teintes} duree={10 + i * 2} className="size-10" />
            </motion.div>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex justify-center"><Logo hauteur={18} /></div>
      <nav className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#5f6573]">
        {PARCOURS.map((l) => (
          <Link key={l.href} href={l.href} className={LIEN}>{l.libelle}</Link>
        ))}
      </nav>
      <p className="mt-8 text-xs text-[#5f6573]">{AVERTISSEMENT}</p>
    </footer>
  );
}

/** 4. Grand logo : le logo en très grand, coupé par le bas de la page, comme une signature d'affiche. */
function GrandLogo() {
  return (
    <footer className="overflow-hidden border-t border-[#e6e7eb] px-8 pt-10 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-6 text-[#5f6573]">
        <p className="max-w-sm text-xs leading-5">{AVERTISSEMENT}</p>
        <nav className="flex flex-wrap gap-6">
          {PARCOURS.map((l) => (
            <Link key={l.href} href={l.href} className={LIEN}>{l.libelle}</Link>
          ))}
        </nav>
      </div>
      <motion.div
        className="mt-10 translate-y-[18%]"
        initial={{ y: "40%", opacity: 0 }}
        whileInView={{ y: "18%", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: DOUX }}
      >
        <Image src="/logo-democratia.png" alt="DemocratIA" width={2000} height={290} className="h-auto w-full" />
      </motion.div>
    </footer>
  );
}

/** 5. Appel final : une dernière invitation au test, puis les mentions, sur fond très légèrement teinté. */
function Appel() {
  return (
    <footer className="bg-[#f5f6f8] px-8 pb-8 pt-14 text-center">
      <p className="text-3xl font-semibold tracking-[-0.03em]">Et vous, quelle IA réglez-vous ?</p>
      <Link
        href="/test"
        className="mt-6 inline-flex h-12 items-center gap-3 rounded-full bg-[#111318] pl-2 pr-6 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
      >
        <Sphere teintes={CANDIDATES[0].teintes} duree={8} className="size-8" />
        Trouver mon IA
      </Link>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[#e3e5ea] pt-6 text-xs text-[#5f6573]">
        <Logo hauteur={16} />
        <p>{AVERTISSEMENT}</p>
      </div>
    </footer>
  );
}

/** 6. Bandeau officiel : un liseré tricolore fin, les mentions façon République, et la source des données. */
function Officiel() {
  return (
    <footer className="text-sm">
      <div aria-hidden className="flex h-1">
        <span className="flex-1 bg-[#1d3fd8]" />
        <span className="flex-1 bg-[#e6e7eb]" />
        <span className="flex-1 bg-[#e1000f]" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-6 px-8 py-8">
        <div className="flex items-center gap-4">
          <Logo hauteur={18} />
          <span className="border-l border-[#e6e7eb] pl-4 text-xs leading-5 text-[#5f6573]">
            République française
            <br />
            an 2050
          </span>
        </div>
        <p className="max-w-md text-xs leading-5 text-[#5f6573]">
          Données : Assemblée nationale, via Hémicycle, Licence Ouverte 2.0. {AVERTISSEMENT}
        </p>
      </div>
    </footer>
  );
}

const PROPOSITIONS = [
  { nom: "Sobre", idee: "Une seule ligne, rien de plus. L'actuel, resserré.", C: Sobre },
  { nom: "Colonnes", idee: "Logo, parcours, données, projet : complet, très institutionnel.", C: Colonnes },
  { nom: "Les sept sphères", idee: "Les candidates en signature ; chacune mène à sa fiche.", C: Spheres },
  { nom: "Grand logo", idee: "Le logo en très grand, coupé par le bas, comme une affiche.", C: GrandLogo },
  { nom: "Appel final", idee: "Une dernière invitation au test avant les mentions.", C: Appel },
  { nom: "Bandeau officiel", idee: "Liseré tricolore et mentions façon République, avec la source des données.", C: Officiel },
];

export default function PropositionsPied() {
  return (
    <div className={`${police.className} min-h-dvh bg-white text-[#111318]`}>
      <main className="mx-auto max-w-[1180px] px-6 py-14 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Propositions de pied de page</h1>
        <p className="mt-3 text-lg text-[#5f6573]">Six pieds de page, présentés comme en bas du site. Répondez par le numéro.</p>
        <ol className="mt-12 space-y-16">
          {PROPOSITIONS.map(({ nom, idee, C }, i) => (
            <li key={nom}>
              <p className="text-sm tabular-nums text-[#6b6f7a]">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">{nom}</h2>
              <p className="mt-1 text-[15px] text-[#5f6573]">{idee}</p>
              <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e7eb]">
                <div className="h-16 bg-white" aria-hidden />
                <C />
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-12 text-sm">
          <Link href="/maquettes" className={LIEN}>Retour aux maquettes</Link>
        </p>
      </main>
    </div>
  );
}
