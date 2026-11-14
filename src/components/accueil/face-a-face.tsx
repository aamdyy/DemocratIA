"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

import { Sphere } from "@/components/sphere";
import { SourceBadge } from "@/components/source-badge";
import { CANDIDATES, positionCandidate, type Candidate } from "@/lib/candidates";
import type { Position, Provenance } from "@/lib/types";
import { useEtapeVue } from "./hooks";
import { Reveal, TITRE_SECTION } from "./reveal";

const IA: Candidate = CANDIDATES.find((c) => c.id === "maelle") ?? CANDIDATES[0];

/** Exemple fictif : le vote d'un élu humain face à celui de l'IA, sur cinq textes imaginaires. */
const TEXTES: { titre: string; elu: Position }[] = [
  { titre: "Accès aux soins en zone rurale", elu: "pour" },
  { titre: "Plafonnement des loyers en zone tendue", elu: "contre" },
  { titre: "Semaine de quatre jours", elu: "abstention" },
  { titre: "Réduction de la dette de l’État", elu: "pour" },
  { titre: "Moyens de l’école primaire", elu: "pour" },
];

// La position de l'IA se déduit de son programme, par la règle publique de positionCandidate.
const LIGNES = TEXTES.map((t) => ({ ...t, ia: positionCandidate(IA, t) }));

const LIBELLE: Record<Position, string> = { pour: "Pour", contre: "Contre", abstention: "Abstention" };

const SOURCE: Provenance = {
  editeur: "DemocratIA",
  url: null,
  licence: "Intitulés et votes fictifs",
  date: null,
  nature: "exemple",
};

// Une ligne se révèle à chaque étape ; la dernière étape laisse le tableau complet à l'écran.
const DUREES = [700, 850, 850, 850, 850, 4200] as const;

// Les trois colonnes du face-à-face. Sur un téléphone, les deux colonnes de votes se resserrent
// pour laisser au titre du texte la place de se lire.
const COLONNES =
  "grid grid-cols-[minmax(0,1fr)_4.75rem_4.75rem] gap-x-3 sm:grid-cols-[minmax(0,1fr)_11rem_11rem] sm:gap-x-8";

/** « Elle vote ce qu'elle a promis. » : un élu humain face à l'IA, texte par texte, avec un compteur. */
export function FaceAFace() {
  const racine = useRef<HTMLElement>(null);
  const visible = useInView(racine, { amount: 0.4 });
  const etape = useEtapeVue(DUREES, visible);
  const visibles = Math.min(etape, LIGNES.length);
  const accordsElu = LIGNES.slice(0, visibles).filter((t) => t.elu === t.ia).length;

  return (
    <section ref={racine} aria-labelledby="titre-face" className="mx-auto max-w-[1120px]">
      <Reveal>
        <h2 id="titre-face" className={TITRE_SECTION}>
          Elle vote ce qu&apos;elle a promis.
        </h2>
        <p className="mt-6 max-w-[34rem] text-lg leading-8 text-attenue">
          Un élu suit son groupe. {IA.prenom} suit son programme, et chaque vote se vérifie.
        </p>
      </Reveal>

      <div className="mt-14">
        <div className={`items-end ${COLONNES}`}>
          <p className="pb-2 text-sm text-attenue">Exemple fictif, texte par texte</p>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="size-[4.5rem] rounded-full border border-trait bg-relief sm:size-28" aria-hidden />
            <p className="text-sm font-medium">Élu humain</p>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <Sphere teintes={IA.teintes} className="size-[4.5rem] sm:size-28" />
            <p className="text-sm font-medium">{IA.prenom}</p>
          </div>
        </div>

        <ol className="mt-6 border-t border-trait">
          {LIGNES.map((t, i) => {
            const accord = t.elu === t.ia;
            return (
              <motion.li
                key={t.titre}
                className={`items-center border-b border-trait py-4 ${COLONNES}`}
                initial={false}
                animate={{ opacity: i < visibles ? 1 : 0.18 }}
                transition={{ duration: 0.35 }}
              >
                <p className="leading-6">
                  {t.titre}
                  <span className="block text-sm text-attenue">Son programme : {LIBELLE[t.ia].toLowerCase()}</span>
                </p>
                <p
                  className={`text-center text-[15px] ${accord ? "" : "text-attenue line-through decoration-machine decoration-2"}`}
                >
                  {i < visibles ? LIBELLE[t.elu] : ""}
                </p>
                <p className="text-center text-[15px] font-medium">{i < visibles ? LIBELLE[t.ia] : ""}</p>
              </motion.li>
            );
          })}
        </ol>

        {/* Pas d'annonce vocale ici : la démonstration tourne en boucle et couperait la parole au lecteur d'écran. */}
        <div className={`items-baseline pt-6 font-donnee ${COLONNES}`}>
          <p className="font-sans text-sm text-attenue">Votes conformes à son programme</p>
          <p className="text-center text-2xl text-attenue sm:text-3xl">
            {accordsElu}
            <span className="text-sm sm:text-base"> sur {visibles}</span>
          </p>
          <p className="text-center text-2xl text-machine sm:text-3xl">
            {visibles}
            <span className="text-sm sm:text-base"> sur {visibles}</span>
          </p>
        </div>
      </div>

      <SourceBadge source={SOURCE} className="mt-12" />
    </section>
  );
}
