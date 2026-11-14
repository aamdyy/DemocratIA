import { cn } from "@/lib/utils";
import { LIBELLE_POSITION } from "@/lib/format";
import type { PositionVote } from "@/lib/types";

const PASTILLE: Record<PositionVote, string> = {
  pour: "bg-pour",
  contre: "bg-contre",
  abstention: "bg-abstention",
  non_votant: "border border-attenue",
};

/** Une position de vote : une pastille de couleur et toujours son libellé, jamais la couleur seule. */
export function PositionLibelle({
  position,
  machine = false,
  className,
}: {
  position: PositionVote;
  /** Vrai quand la position est celle du Député IA : la pastille prend la couleur de la machine. */
  machine?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 whitespace-nowrap", machine && "font-donnee", className)}>
      <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", machine ? "bg-machine" : PASTILLE[position])} />
      {LIBELLE_POSITION[position]}
    </span>
  );
}
