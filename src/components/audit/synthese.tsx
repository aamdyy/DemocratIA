"use client";

import { motion } from "motion/react";

import { Jauge } from "@/components/graphiques";
import { SourceBadge } from "@/components/source-badge";
import { CASCADE, ENTREE, VUE } from "@/lib/animation";
import { sourceCalcul } from "@/lib/concordance";
import type { Candidate } from "@/lib/candidates";

import { DEFINITION_AUDIT, type SyntheseAudit } from "./calcul";

const textes = (n: number) => (n > 1 ? `${n} textes` : `${n} texte`);

/** Une jauge et son nom : la part des textes où le vote est conforme au vôtre. */
function Colonne({
  nom,
  sousTitre,
  machine = false,
  valeur,
  total,
  couleur,
  rang = 0,
  children,
}: {
  rang?: number;
  nom: string;
  sousTitre: string;
  machine?: boolean;
  valeur: number;
  total: number;
  couleur: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.section
      aria-label={`Synthèse pour ${nom}`}
      className="flex items-center gap-6"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VUE}
      transition={{ ...ENTREE.transition, delay: rang * CASCADE * 3 }}
    >
      <Jauge
        valeur={valeur}
        total={total}
        couleur={couleur}
        etiquette={`${nom} : vote conforme au vôtre sur ${valeur} des ${textes(total)}`}
      />
      <div className="min-w-0">
        <h3 className="font-titre text-xl font-semibold leading-7 tracking-[-0.02em] text-texte">{nom}</h3>
        <p className={machine ? "font-donnee text-sm leading-6 text-machine" : "text-sm leading-6 text-attenue"}>{sousTitre}</p>
        <p className="mt-2 text-[15px] leading-6 text-texte">
          Comme vous : <span className="font-semibold tabular-nums">{valeur} sur {total}</span>
        </p>
        {children}
      </div>
    </motion.section>
  );
}

/** Synthèse en deux jauges : la part de votes conformes aux vôtres, pour l'élu et pour votre IA. */
export function Synthese({ synthese, nomElu, candidate }: { synthese: SyntheseAudit; nomElu: string; candidate: Candidate }) {
  const { textes: n, commeMandat, iaCommeMandat, commeGroupe, comparablesGroupe } = synthese;

  return (
    <div role="status" aria-live="polite">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <Colonne nom={nomElu} sousTitre="Élu humain" valeur={commeMandat} total={n} couleur="var(--texte)">
          {comparablesGroupe > 0 ? (
            <p className="text-[15px] leading-6 text-attenue">
              Comme son groupe : <span className="tabular-nums">{commeGroupe} sur {comparablesGroupe}</span>
            </p>
          ) : null}
        </Colonne>
        <Colonne
          nom={candidate.prenom}
          sousTitre="Votre IA"
          machine
          valeur={iaCommeMandat}
          total={n}
          rang={1}
          couleur={candidate.teintes[1]}
        />
      </div>
      <SourceBadge source={sourceCalcul(DEFINITION_AUDIT)} className="mt-8 max-w-4xl" />
    </div>
  );
}
