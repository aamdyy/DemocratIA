"use client";

import Link from "next/link";
import { DM_Mono, DM_Sans } from "next/font/google";
import { MotionConfig, motion } from "motion/react";

import { SPHERES, Sphere } from "@/components/sphere";
import { Barre, useEtape } from "../commun";
import { EXEMPLE } from "../contenu";

const police = DM_Sans({ subsets: ["latin"] });
const chiffres = DM_Mono({ subsets: ["latin"], weight: ["400", "500"] });

/** Exemple : le mandat du citoyen, et le vote public d'un élu, sur cinq textes. */
const TEXTES = [
  { titre: "Sobriété énergétique des bâtiments publics", mandat: "Pour", elu: "Pour" },
  { titre: "Plafonnement des loyers en zone tendue", mandat: "Pour", elu: "Contre" },
  { titre: "Orientation pour la sécurité intérieure", mandat: "Contre", elu: "Pour" },
  { titre: "Semaine de quatre jours", mandat: "Pour", elu: "Abstention" },
  { titre: "Accès aux soins en zone rurale", mandat: "Pour", elu: "Pour" },
] as const;

// Une ligne se révèle à chaque étape ; la dernière étape laisse le tableau complet à l'écran.
const DUREES = [700, 850, 850, 850, 850, 4200] as const;

// Les trois colonnes du face-à-face. Sur un téléphone, les deux colonnes de votes se resserrent
// pour laisser au titre du texte la place de se lire.
const COLONNES =
  "grid grid-cols-[minmax(0,1fr)_4.75rem_4.75rem] gap-x-3 sm:grid-cols-[minmax(0,1fr)_11rem_11rem] sm:gap-x-8";

export default function Maquette07() {
  const visibles = useEtape(DUREES);
  const accordsElu = TEXTES.slice(0, visibles).filter((t) => t.elu === t.mandat).length;

  return (
    <MotionConfig reducedMotion="user">
      <div className={`${police.className} min-h-dvh bg-white text-[#12141a]`}>
        <header className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-6 lg:px-10">
          <p className="text-lg font-semibold tracking-[-0.02em]">DemocratIA</p>
          <Link href="/audit" className="rounded-full bg-[#12141a] px-5 py-3 text-sm font-medium text-white">
            Auditer mon député
          </Link>
        </header>

        <main className="mx-auto max-w-[1120px] px-6 pb-28 pt-6 lg:px-10 lg:pt-12">
          <h1 className="max-w-[17ch] text-[clamp(2.2rem,4.6vw,3.7rem)] font-medium leading-[1.05] tracking-[-0.035em]">
            Un élu suit son groupe. Olympe suit votre mandat.
          </h1>

          <div className={`mt-14 items-end ${COLONNES}`}>
            <p className="pb-2 text-sm text-[#6c7280]">Votre mandat, comparé texte par texte</p>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="size-[4.5rem] rounded-full border border-[#d9dce3] bg-[#f1f2f5] sm:size-28" aria-hidden />
              <p className="text-sm font-medium">Élu humain</p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <Sphere teintes={SPHERES.olympe.teintes} className="size-[4.5rem] sm:size-28" />
              <p className="text-sm font-medium">Olympe</p>
            </div>
          </div>

          <ol className="mt-6 border-t border-[#e3e5ea]">
            {TEXTES.map((t, i) => {
              const accord = t.elu === t.mandat;
              return (
                <motion.li
                  key={t.titre}
                  className={`items-center border-b border-[#e3e5ea] py-4 ${COLONNES}`}
                  initial={false}
                  animate={{ opacity: i < visibles ? 1 : 0.18 }}
                  transition={{ duration: 0.35 }}
                >
                  <p className="leading-6">
                    {t.titre}
                    <span className="block text-sm text-[#6c7280]">Vous : {t.mandat.toLowerCase()}</span>
                  </p>
                  <p className={`text-center text-[15px] ${accord ? "" : "text-[#6c7280] line-through decoration-[#c2296f] decoration-2"}`}>
                    {i < visibles ? t.elu : ""}
                  </p>
                  <p className="text-center text-[15px] font-medium">{i < visibles ? t.mandat : ""}</p>
                </motion.li>
              );
            })}
          </ol>

          {/* Pas d'annonce vocale ici : la démonstration tourne en boucle et couperait la parole au lecteur d'écran. */}
          <div className={`${chiffres.className} items-baseline pt-6 ${COLONNES}`}>
            <p className={`${police.className} text-sm text-[#6c7280]`}>Votes conformes à votre mandat</p>
            <p className="text-center text-2xl text-[#6c7280] sm:text-3xl">
              {accordsElu}
              <span className="text-sm sm:text-base"> sur {visibles}</span>
            </p>
            <p className="text-center text-2xl text-[#c2296f] sm:text-3xl">
              {visibles}
              <span className="text-sm sm:text-base"> sur {visibles}</span>
            </p>
          </div>

          <p className="mt-12 flex flex-wrap gap-x-3 text-xs leading-5 text-[#6c7280]">
            <span>{EXEMPLE.source}</span>
            <span className="border-l border-[#e3e5ea] pl-3 tabular-nums">{EXEMPLE.date}</span>
            <span className="border-l border-[#e3e5ea] pl-3">{EXEMPLE.licence}</span>
          </p>
        </main>

        <Barre n={7} />
      </div>
    </MotionConfig>
  );
}
