import { cn } from "@/lib/utils";
import { dateCourte } from "@/lib/format";
import type { Provenance } from "@/lib/types";

/**
 * Provenance d'une donnée : éditeur, date, licence, sur une ligne discrète sous la valeur.
 * Une donnée publiée porte la marque tricolore ; une donnée calculée ou rédigée par une machine
 * porte la couleur et la police de la machine ; un exemple porte une marque en pointillés.
 */
export function SourceBadge({ source, className }: { source: Provenance; className?: string }) {
  const machine = source.nature === "calculee" || source.nature === "generee";
  const date = dateCourte(source.date);

  const origine =
    source.nature === "publiee"
      ? `Source : ${source.editeur}${source.via === null ? "" : `, via ${source.via ?? "Hémicycle"}`}`
      : source.nature === "calculee"
        ? `Calculé par ${source.editeur}`
        : source.nature === "generee"
          ? `Rédigé par ${source.editeur}`
          : "Exemple aux valeurs fictives";

  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-5 text-attenue",
        machine && "font-donnee text-machine",
        className,
      )}
    >
      <Marque nature={source.nature} />
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-trait underline-offset-4 transition-colors duration-150 hover:decoration-current"
        >
          {origine}
        </a>
      ) : (
        <span>{origine}</span>
      )}
      {date ? (
        <>
          <Separateur />
          <span>{date}</span>
        </>
      ) : null}
      <Separateur />
      <span>{source.licence}</span>
      {source.definition ? <span className="mt-0.5 basis-full font-sans text-attenue">{source.definition}</span> : null}
    </p>
  );
}

/** Un filet fin entre deux mentions ; les lecteurs d'écran entendent une virgule. */
function Separateur() {
  return (
    <>
      <span aria-hidden className="h-3 w-px shrink-0 bg-trait" />
      <span className="sr-only">, </span>
    </>
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
  if (nature === "exemple") return <span aria-hidden className="size-2 shrink-0 rounded-full border border-dashed border-attenue" />;
  return <span aria-hidden className="size-2 shrink-0 bg-machine" />;
}
