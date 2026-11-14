"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import { SourceBadge } from "@/components/source-badge";
import { DEFINITION_CONCORDANCE, sourceCalcul, type Concordance } from "@/lib/concordance";
import { pourcent } from "@/lib/format";
import type { Provenance } from "@/lib/types";

const HAUTEUR_LIGNE = 38;

/** De quels groupes le mandat du citoyen est le plus proche : un calcul de DemocratIA, en couleur machine. */
export function AccordGroupes({
  concordance,
  nombreArbitres,
  etatPositions,
  sourcePositions,
}: {
  /** Groupes triés du plus proche au plus éloigné. */
  concordance: Concordance[];
  nombreArbitres: number;
  etatPositions: "chargement" | "erreur" | "pret";
  /** Provenance publiée des positions des groupes, ou null tant qu'aucun texte n'est arbitré. */
  sourcePositions: Provenance | null;
}) {
  return (
    <div className="mt-12 border-t border-trait pt-8">
      <h3 className="font-titre text-xl font-medium">Accord avec les groupes</h3>
      {nombreArbitres === 0 ? (
        <p className="mt-3 max-w-md text-[15px] leading-6 text-attenue">
          Tranchez un premier texte : vous verrez aussitôt de quels groupes de l&apos;Assemblée votre mandat est le plus
          proche, et duquel il s&apos;éloigne le plus.
        </p>
      ) : etatPositions === "chargement" ? (
        <p role="status" className="mt-3 text-[15px] leading-6 text-attenue">
          Lecture des positions des groupes…
        </p>
      ) : etatPositions === "erreur" || concordance.length === 0 ? (
        <p role="status" className="mt-3 max-w-md text-[15px] leading-6 text-attenue">
          Les positions des groupes ne sont pas disponibles pour les textes que vous avez tranchés. Vos arbitrages sont
          bien enregistrés : l&apos;accord s&apos;affichera dès que ces positions pourront être lues.
        </p>
      ) : (
        <Graphique concordance={concordance} nombreArbitres={nombreArbitres} sourcePositions={sourcePositions} />
      )}
    </div>
  );
}

function Graphique({
  concordance,
  nombreArbitres,
  sourcePositions,
}: {
  concordance: Concordance[];
  nombreArbitres: number;
  sourcePositions: Provenance | null;
}) {
  const proche = concordance[0];
  const largeurSigles = Math.max(...concordance.map((groupe) => groupe.sigle.length)) * 9 + 14;

  return (
    <>
      <p className="mt-2 font-donnee text-xs leading-5 text-machine">
        Sur {nombreArbitres > 1 ? `vos ${nombreArbitres} arbitrages` : "votre premier arbitrage"}, du groupe le plus
        proche au plus éloigné.
      </p>

      <div
        role="img"
        aria-label={`Graphique : accord de votre mandat avec ${concordance.length} groupes. Le plus proche est ${proche.libelle}, à ${pourcent(proche.accord)}. Le détail suit dans un tableau.`}
        className="mt-3"
      >
        <BarChart
          responsive
          accessibilityLayer={false}
          layout="vertical"
          data={concordance}
          width="100%"
          height={concordance.length * HAUTEUR_LIGNE + 8}
          margin={{ top: 4, right: 58, bottom: 4, left: 0 }}
        >
          <XAxis type="number" domain={[0, 1]} hide />
          <YAxis
            type="category"
            dataKey="sigle"
            width={largeurSigles}
            interval={0}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--texte)", fontSize: 14 }}
          />
          <Bar dataKey="accord" fill="var(--machine)" barSize={10} minPointSize={2} background={{ fill: "var(--relief)" }}>
            <LabelList
              dataKey="accord"
              position="right"
              offset={10}
              formatter={(valeur) => pourcent(Number(valeur))}
              fill="var(--machine)"
              fontSize={13}
              className="font-donnee"
            />
          </Bar>
        </BarChart>
      </div>

      {/* Les mêmes chiffres en tableau, pour qui ne voit pas le graphique. */}
      <table className="sr-only">
        <caption>Accord de votre mandat avec chaque groupe, du plus proche au plus éloigné</caption>
        <thead>
          <tr>
            <th scope="col">Groupe</th>
            <th scope="col">Accord</th>
            <th scope="col">Textes comparés</th>
          </tr>
        </thead>
        <tbody>
          {concordance.map((groupe) => (
            <tr key={groupe.sigle}>
              <th scope="row">
                {groupe.sigle}
                {groupe.libelle !== groupe.sigle ? ` (${groupe.libelle})` : ""}
              </th>
              <td>{pourcent(groupe.accord)}</td>
              <td>{groupe.textes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <SourceBadge source={sourceCalcul(DEFINITION_CONCORDANCE)} className="mt-4" />
      {sourcePositions ? (
        <div className="mt-3 border-t border-trait pt-3">
          <p className="text-xs leading-5 text-attenue">Positions majoritaires des groupes sur ces textes :</p>
          <SourceBadge source={sourcePositions} className="mt-1" />
        </div>
      ) : null}
    </>
  );
}
