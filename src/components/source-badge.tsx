import { cn } from "@/lib/utils";
import { dateCourte } from "@/lib/format";
import type { Provenance } from "@/lib/types";

/**
 * Provenance d'une donnée : éditeur, date, licence. Présent sous chaque valeur affichée.
 * Une donnée publiée porte la marque tricolore ; une donnée calculée ou rédigée par une machine
 * porte la couleur et la police de la machine ; un exemple est signalé en pointillés.
 */
export function SourceBadge({ source, className }: { source: Provenance; className?: string }) {
  const machine = source.nature === "calculee" || source.nature === "generee";
  const date = dateCourte(source.date);

  const origine =
    source.nature === "publiee"
      ? `Source : ${source.editeur}, via Hémicycle`
      : source.nature === "calculee"
        ? `Calculé par ${source.editeur}`
        : source.nature === "generee"
          ? `Rédigé par ${source.editeur}`
          : "Exemple aux valeurs fictives";

  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs leading-5 text-attenue",
        machine && "font-donnee text-machine",
        source.nature === "exemple" && "w-fit border border-dashed border-trait px-2 py-0.5",
        className,
      )}
    >
      <Marque nature={source.nature} />
      {source.url ? (
        <a href={source.url} target="_blank" rel="noreferrer" className="underline decoration-trait underline-offset-4 hover:decoration-current">
          {origine}
        </a>
      ) : (
        <span>{origine}</span>
      )}
      {date ? <span className="border-l border-trait pl-2.5">{date}</span> : null}
      <span className="border-l border-trait pl-2.5">{source.licence}</span>
      {source.definition ? <span className="basis-full text-attenue">{source.definition}</span> : null}
    </p>
  );
}

function Marque({ nature }: { nature: Provenance["nature"] }) {
  if (nature === "publiee") {
    return (
      <span aria-hidden className="flex h-3 w-[9px] shrink-0 overflow-hidden rounded-[1px]">
        <span className="w-[3px] bg-pour" />
        <span className="w-[3px] bg-abstention" />
        <span className="w-[3px] bg-contre" />
      </span>
    );
  }
  if (nature === "exemple") return null;
  return <span aria-hidden className="size-2 shrink-0 bg-machine" />;
}
