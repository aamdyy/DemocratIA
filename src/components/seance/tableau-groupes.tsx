import { BarreEmpilee } from "@/components/graphiques";
import { PositionLibelle } from "@/components/position";
import { LIBELLE_POSITION, nombre } from "@/lib/format";
import type { Position, PositionGroupe } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLONNES = "md:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)_7.5rem_7.5rem]";
const LIGNE = `grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-4 md:gap-x-6 gap-y-2 border-b border-trait py-3 md:items-center md:gap-y-0 ${COLONNES}`;

/**
 * « Comme l'IA présidente ? » en pastille : le mot (Oui, Non) et une forme (coche pleine, croix cerclée de tirets)
 * portent l'information, la couleur ne la porte jamais seule.
 */
function Accord({ groupe, prenom, position }: { groupe: PositionGroupe; prenom: string; position: Position }) {
  if (!groupe.position) {
    return (
      <span className="text-sm text-attenue">
        <span aria-hidden>—</span>
        <span className="sr-only">Sans comparaison : le groupe n&apos;a pas de position majoritaire.</span>
      </span>
    );
  }
  const oui = groupe.position === position;
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full pl-2 pr-3 text-sm font-medium whitespace-nowrap",
        oui ? "bg-texte text-fond" : "border border-dashed border-attenue text-attenue",
      )}
    >
      <svg aria-hidden viewBox="0 0 12 12" className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {oui ? <path d="M2.5 6.3 5 8.6l4.5-5.2" /> : <path d="M3.2 3.2l5.6 5.6M8.8 3.2 3.2 8.8" />}
      </svg>
      {oui ? "Oui" : "Non"}
      <span className="sr-only">
        {oui ? `, vote comme ${prenom}` : `, ne vote pas comme ${prenom}`} ({LIBELLE_POSITION[position]})
      </span>
    </span>
  );
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
    <>
    {/* Sur petit écran, l'en-tête de colonnes disparaît : une ligne dit ce que veulent dire les pastilles. */}
    <p aria-hidden className="mb-3 text-sm leading-5 text-attenue md:hidden">
      Oui ou Non : le groupe a-t-il voté comme {prenom} ?
    </p>
    <div role="table" aria-label="Votes des groupes de l'Assemblée de 2026 sur ce texte">
      <div role="rowgroup">
        <div
          role="row"
          className={`hidden border-b border-trait pb-2.5 text-xs font-medium tracking-[0.02em] text-attenue uppercase md:grid md:gap-x-6 ${COLONNES}`}
        >
          <div role="columnheader">Groupe</div>
          <div role="columnheader">Votes</div>
          <div role="columnheader">Position</div>
          <div role="columnheader">{`Comme ${prenom} ?`}</div>
        </div>
      </div>
      <div role="rowgroup" className="border-t border-trait md:border-t-0">
        {groupes.map((groupe) => (
          <div key={groupe.sigle} role="row" className={LIGNE}>
            <div role="cell" className="min-w-0">
              <span className="text-[15px] leading-5 font-medium text-texte">{groupe.sigle}</span>
              <span className="block truncate text-[13px] leading-5 text-attenue" title={groupe.libelle}>
                {groupe.libelle}
              </span>
            </div>
            <div role="cell" className="col-span-3 row-start-2 md:col-span-1 md:row-start-auto">
              <BarreEmpilee
                className="h-2"
                segments={[
                  { libelle: "Pour", valeur: groupe.pour, fond: "bg-pour" },
                  { libelle: "Abstention", valeur: groupe.abstention, fond: "bg-abstention" },
                  { libelle: "Contre", valeur: groupe.contre, fond: "bg-contre" },
                ]}
                etiquette={`${groupe.sigle} : ${groupe.pour} pour, ${groupe.abstention} abstentions, ${groupe.contre} contre`}
              />
              <span aria-hidden className="mt-1.5 grid grid-cols-[4.75rem_4.75rem_auto] text-[13px] leading-5 tabular-nums text-attenue">
                <span>
                  <span className="font-medium text-texte">{nombre(groupe.pour)}</span> pour
                </span>
                <span>
                  <span className="font-medium text-texte">{nombre(groupe.abstention)}</span> abst.
                </span>
                <span>
                  <span className="font-medium text-texte">{nombre(groupe.contre)}</span> contre
                </span>
              </span>
            </div>
            <div role="cell" className="col-start-2 row-start-1 self-center text-[15px] leading-6 md:col-start-auto md:row-start-auto">
              {groupe.position ? (
                <PositionLibelle position={groupe.position} />
              ) : (
                <span className="text-attenue">Sans majorité</span>
              )}
            </div>
            <div role="cell" className="col-start-3 row-start-1 self-center md:col-start-auto md:row-start-auto">
              <Accord groupe={groupe} prenom={prenom} position={position} />
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
