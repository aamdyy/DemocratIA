import { cn } from "@/lib/utils";

/**
 * Logo DemocratIA : « Democrat » en Public Sans, puis le monogramme « IA » dessiné à la main.
 * Le I est un fût droit, le A un chevron sans barre : à la place de la barre, un point,
 * la sphère, qui prend la couleur passée en `point` (par défaut celle de la machine).
 * Tout est en em : le logo suit la taille de police du parent.
 */
export function Logo({
  className,
  point = "var(--machine)",
  titre = false,
}: {
  className?: string;
  point?: string;
  /** Vrai quand le logo sert de titre de page : le texte est lu en entier par les lecteurs d'écran. */
  titre?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-baseline font-semibold leading-none tracking-[-0.04em]", className)}>
      <span aria-hidden={titre ? undefined : true}>Democrat</span>
      <svg
        viewBox="0 0 100 100"
        aria-hidden
        className="ml-[0.06em] h-[0.72em] w-[0.72em] shrink-0 self-baseline overflow-visible"
        style={{ marginBottom: "-0.005em" }}
      >
        <rect x="0" y="0" width="14" height="100" fill="currentColor" />
        <path d="M34 100 L60 0 L86 100" fill="none" stroke="currentColor" strokeWidth="14" strokeLinejoin="miter" />
        <circle cx="60" cy="68" r="8" fill={point} />
      </svg>
      <span className="sr-only">{titre ? "IA" : "DemocratIA"}</span>
    </span>
  );
}
