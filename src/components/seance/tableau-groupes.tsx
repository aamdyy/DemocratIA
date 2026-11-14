import { BarreEmpilee } from "@/components/graphiques";
import { PositionLibelle } from "@/components/position";
import { LIBELLE_POSITION, nombre } from "@/lib/format";
import type { Position, PositionGroupe } from "@/lib/types";

const COLONNES = "md:grid-cols-[minmax(0,1.6fr)_minmax(0,2fr)_8.5rem_minmax(0,1.2fr)]";
const LIGNE = `grid grid-cols-1 gap-x-6 gap-y-2 border-b border-trait py-4 md:items-center md:gap-y-0 ${COLONNES}`;

/** Dit en toutes lettres si le groupe vote comme l'IA présidente : la couleur ne porte jamais seule cette information. */
function commeLaPresidente(groupe: PositionGroupe, prenom: string, position: Position): string {
  if (!groupe.position) return "Sans comparaison";
  return groupe.position === position ? `Comme ${prenom}` : `Pas comme ${prenom}`;
}

/** Les groupes de 2026 sur un texte : leurs votes en barre empilée, leur position, et leur accord avec l'IA présidente. */
export function TableauGroupes({
  groupes,
  prenom,
  position,
}: {
  groupes: PositionGroupe[];
  prenom: string;
  position: Position;
}) {
  return (
    <div role="table" aria-label="Votes des groupes de l'Assemblée de 2026 sur ce texte">
      <div role="row" className={`hidden border-b border-trait py-3 text-sm text-attenue md:grid md:gap-x-6 ${COLONNES}`}>
        <div role="columnheader">Groupe</div>
        <div role="columnheader">Votes</div>
        <div role="columnheader">Position</div>
        <div role="columnheader">{`Comme ${prenom} ?`}</div>
      </div>
      <div role="rowgroup" className="border-t border-trait md:border-t-0">
        {groupes.map((groupe) => (
          <div key={groupe.sigle} role="row" className={LIGNE}>
            <div role="cell" className="min-w-0">
              <span className="font-medium text-texte">{groupe.sigle}</span>
              <span className="block text-sm leading-5 text-attenue">{groupe.libelle}</span>
            </div>
            <div role="cell">
              <BarreEmpilee
                className="h-2.5"
                segments={[
                  { libelle: "Pour", valeur: groupe.pour, fond: "bg-pour" },
                  { libelle: "Abstention", valeur: groupe.abstention, fond: "bg-abstention" },
                  { libelle: "Contre", valeur: groupe.contre, fond: "bg-contre" },
                ]}
                etiquette={`${groupe.sigle} : ${groupe.pour} pour, ${groupe.abstention} abstentions, ${groupe.contre} contre`}
              />
              <span className="mt-1.5 block text-sm tabular-nums text-attenue">
                {nombre(groupe.pour)} pour · {nombre(groupe.abstention)} abst. · {nombre(groupe.contre)} contre
              </span>
            </div>
            <div role="cell" className="text-[15px] leading-6">
              {groupe.position ? (
                <PositionLibelle position={groupe.position} />
              ) : (
                <span className="text-attenue">Sans majorité</span>
              )}
            </div>
            <div role="cell" className="text-[15px] leading-6 text-texte">
              {commeLaPresidente(groupe, prenom, position)}
              {groupe.position ? <span className="sr-only"> ({LIBELLE_POSITION[position]})</span> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
