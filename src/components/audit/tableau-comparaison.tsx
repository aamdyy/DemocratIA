"use client";

import { motion } from "motion/react";

import { PositionLibelle } from "@/components/position";
import { SourceBadge } from "@/components/source-badge";
import { dateLongue, titreLisible } from "@/lib/format";
import { PRENOM_DEPUTE_IA } from "@/lib/sphere-mandat";

import type { LigneAudit } from "./calcul";

const CELLULE = "px-3 py-4 align-top text-[15px] leading-6";
const NOTE = "mt-1 block text-sm leading-5 text-attenue";

function CelluleElu({ ligne }: { ligne: LigneAudit }) {
  if (ligne.etat === "attente") return <span className="text-attenue">Lecture en cours…</span>;
  if (ligne.etat === "echec") return <span className="text-attenue">Vote non lu</span>;
  if (ligne.voteElu === null) return <span>N&apos;a pas pris part au vote</span>;
  return (
    <>
      <PositionLibelle position={ligne.voteElu} />
      <span className={NOTE}>
        {ligne.voteElu === ligne.mandat ? "Comme votre mandat" : "Différent de votre mandat"}
      </span>
    </>
  );
}

function CelluleGroupe({ ligne }: { ligne: LigneAudit }) {
  if (ligne.etat === "attente") return <span className="text-attenue">Lecture en cours…</span>;
  if (ligne.etat === "echec") return <span className="text-attenue">Position non lue</span>;
  if (!ligne.sigleGroupe) return <span className="text-attenue">Groupe non renseigné</span>;
  if (!ligne.groupe) return <span className="text-attenue">{ligne.sigleGroupe} : absent de ce scrutin</span>;
  const position = ligne.groupe.position;
  const eluExprime = ligne.voteElu !== null && ligne.voteElu !== "non_votant";
  return (
    <>
      {position ? <PositionLibelle position={position} /> : <span>Pas de position majoritaire</span>}
      <span className={NOTE}>
        {ligne.sigleGroupe}
        {position && eluExprime ? (ligne.voteElu === position ? " · suivi par l'élu" : " · non suivi par l'élu") : ""}
      </span>
    </>
  );
}

function Ligne({ ligne, rang }: { ligne: LigneAudit; rang: number }) {
  return (
    <motion.tr
      className="border-b border-trait"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(rang, 8) * 0.06, ease: "easeOut" }}
    >
      <th scope="row" className={`${CELLULE} pl-0 text-left font-normal`}>
        <span className="block font-medium text-texte">{titreLisible(ligne.scrutin.titre)}</span>
        <span className={NOTE}>
          Scrutin n° {ligne.scrutin.numero} du {dateLongue(ligne.scrutin.date)}
        </span>
        <SourceBadge source={ligne.scrutin.source} className="mt-2" />
        {ligne.etat === "echec" ? (
          <span role="alert" className="mt-2 block text-sm leading-5 text-texte">
            Le détail de ce scrutin n&apos;a pas pu être lu. {ligne.erreur}
          </span>
        ) : null}
      </th>
      <td className={CELLULE}>
        <PositionLibelle position={ligne.mandat} />
      </td>
      <td className={CELLULE}>
        <CelluleElu ligne={ligne} />
      </td>
      <td className={CELLULE}>
        <CelluleGroupe ligne={ligne} />
      </td>
      <td className={`${CELLULE} bg-machine/5 text-machine`}>
        <PositionLibelle position={ligne.mandat} machine />
        <span className="mt-1 block font-donnee text-sm leading-5">Applique votre mandat</span>
      </td>
    </motion.tr>
  );
}

/** Comparaison texte par texte : le mandat, le vote publié de l'élu, la position de son groupe, et Olympe. */
export function TableauComparaison({ lignes, nomElu }: { lignes: LigneAudit[]; nomElu: string }) {
  return (
    <div
      role="region"
      aria-label={`Comparaison texte par texte entre ${nomElu} et ${PRENOM_DEPUTE_IA}`}
      tabIndex={0}
      className="overflow-x-auto outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte"
    >
      <table className="w-full min-w-[52rem] border-collapse text-left">
        <caption className="sr-only">
          Pour chaque texte que vous avez arbitré : votre mandat, le vote publié de {nomElu}, la position majoritaire de son
          groupe ce jour-là, et le vote de {PRENOM_DEPUTE_IA}.
        </caption>
        <thead>
          <tr className="border-b border-trait text-sm text-attenue">
            <th scope="col" className="w-[38%] py-3 pr-3 font-normal">
              Texte
            </th>
            <th scope="col" className="px-3 py-3 font-normal">
              Votre mandat
            </th>
            <th scope="col" className="px-3 py-3 font-medium text-texte">
              {nomElu}
            </th>
            <th scope="col" className="px-3 py-3 font-normal">
              Son groupe
            </th>
            <th scope="col" className="bg-machine/5 px-3 py-3 font-donnee font-normal text-machine">
              {PRENOM_DEPUTE_IA}
            </th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((ligne, rang) => (
            <Ligne key={ligne.scrutin.id} ligne={ligne} rang={rang} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
