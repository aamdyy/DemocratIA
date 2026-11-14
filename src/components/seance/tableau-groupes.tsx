import { PositionLibelle } from "@/components/position";
import { LIBELLE_POSITION, nombre } from "@/lib/format";
import type { Position, PositionGroupe } from "@/lib/types";

const COLONNES = "md:grid-cols-[minmax(0,2.2fr)_4.5rem_4.5rem_4.5rem_8.5rem_minmax(0,1.8fr)]";
const LIGNE = `grid grid-cols-3 gap-x-4 gap-y-2 border-b border-trait py-4 md:items-center md:gap-y-0 ${COLONNES}`;

/** Dit en toutes lettres si le groupe vote comme l'IA présidente : la couleur ne porte jamais seule cette information. */
function commeLaPresidente(groupe: PositionGroupe, prenom: string, position: Position): string {
  if (!groupe.position) return "Pas de position majoritaire : rien à comparer.";
  return groupe.position === position
    ? `Oui, comme ${prenom} (${LIBELLE_POSITION[position]})`
    : `Non : ${prenom} vote ${LIBELLE_POSITION[position].toLowerCase()}`;
}

function Nombre({ libelle, valeur }: { libelle: string; valeur: number }) {
  return (
    <div role="cell" className="md:text-right">
      <span className="block text-xs leading-5 text-attenue md:hidden">{libelle}</span>
      <span className="tabular-nums text-[15px] leading-6 text-texte">{nombre(valeur)}</span>
    </div>
  );
}

/** Les groupes de 2026 sur un texte : leurs votes publiés, leur position, et leur accord avec l'IA présidente. */
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
      <div role="row" className={`hidden border-y border-trait py-3 text-sm text-attenue md:grid md:gap-x-4 ${COLONNES}`}>
        <div role="columnheader">Groupe</div>
        <div role="columnheader" className="text-right">
          Pour
        </div>
        <div role="columnheader" className="text-right">
          Contre
        </div>
        <div role="columnheader" className="text-right">
          Abst.
        </div>
        <div role="columnheader">Position</div>
        <div role="columnheader">{`Comme ${prenom} ?`}</div>
      </div>
      <div role="rowgroup" className="border-t border-trait md:border-t-0">
        {groupes.map((groupe) => (
          <div key={groupe.sigle} role="row" className={LIGNE}>
            <div role="cell" className="col-span-3 min-w-0 md:col-span-1">
              <span className="font-medium text-texte">{groupe.sigle}</span>
              <span className="block text-sm leading-5 text-attenue">{groupe.libelle}</span>
            </div>
            <Nombre libelle="Pour" valeur={groupe.pour} />
            <Nombre libelle="Contre" valeur={groupe.contre} />
            <Nombre libelle="Abstention" valeur={groupe.abstention} />
            <div role="cell" className="col-span-3 text-[15px] leading-6 md:col-span-1">
              {groupe.position ? (
                <PositionLibelle position={groupe.position} />
              ) : (
                <span className="text-attenue">Sans majorité</span>
              )}
            </div>
            <div role="cell" className="col-span-3 text-[15px] leading-6 text-texte md:col-span-1">
              {commeLaPresidente(groupe, prenom, position)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
