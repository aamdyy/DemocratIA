"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

import { DOUX, DUREE } from "@/lib/animation";

const LIEN =
  "inline-flex min-h-11 items-center underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";

const LIENS = [
  { href: "/test", libelle: "Le test" },
  { href: "/candidates", libelle: "Les candidates" },
  { href: "/seance", libelle: "Au pouvoir" },
  { href: "/audit", libelle: "Auditer un député" },
  { href: "/honnetete", libelle: "Honnêteté" },
];

/**
 * Pied de page retenu (proposition 4 de /maquettes/pied, avec le liseré tricolore de la 6) :
 * un liseré bleu, blanc, rouge, les mentions et les liens, puis le logo en très grand,
 * coupé par le bas de la page comme une signature d'affiche.
 */
export function Pied() {
  return (
    <footer className="mt-16 overflow-hidden">
      <motion.div
        aria-hidden
        className="flex h-1 origin-left"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: DUREE.scene, ease: DOUX }}
      >
        <span className="flex-1 bg-pour" />
        <span className="flex-1 bg-trait" />
        <span className="flex-1 bg-contre" />
      </motion.div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 text-sm text-attenue md:flex-row md:items-start md:justify-between">
          <p className="max-w-sm text-xs leading-5">
            Fiction d&apos;anticipation. Les IA candidates sont fictives ; les scrutins et les parlementaires sont réels.
            Données : Assemblée nationale, via Hémicycle, Licence Ouverte 2.0.
          </p>
          <nav aria-label="Liens du pied de page" className="flex flex-wrap gap-x-6 md:-mt-3 md:justify-end">
            {LIENS.map((l) => (
              <Link key={l.href} href={l.href} className={LIEN}>
                {l.libelle}
              </Link>
            ))}
          </nav>
        </div>

        <motion.div
          className="mt-10"
          initial={{ y: "45%", opacity: 0 }}
          whileInView={{ y: "18%", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: DUREE.scene, ease: DOUX }}
        >
          <Image src="/logo-democratia.png" alt="DemocratIA" width={2000} height={290} className="h-auto w-full" />
        </motion.div>
      </div>
    </footer>
  );
}
