import { CADRE_HEMICYCLE, placerSieges } from "@/lib/sieges";

export type EtatSiege = "pour" | "contre" | "abstention" | "non_votant" | "machine";

// La géométrie ne dépend de rien : on la calcule une fois pour toute l'application.
const SIEGES = placerSieges();

export const NOMBRE_SIEGES = SIEGES.length;

/**
 * Les 577 sièges de l'Assemblée. `etats` donne l'état de chaque siège, de la gauche vers la droite ;
 * un siège sans état reste éteint. `description` résume le dessin pour les lecteurs d'écran.
 */
export function Hemicycle({
  etats,
  description,
  className,
}: {
  etats: (EtatSiege | undefined)[];
  description: string;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${CADRE_HEMICYCLE.largeur} ${CADRE_HEMICYCLE.hauteur}`}
      role="img"
      aria-label={description}
      className={className}
    >
      {SIEGES.map((siege, rang) => (
        <circle
          key={rang}
          className="siege"
          data-etat={etats[rang] ?? "non_votant"}
          style={{ "--rang": rang } as React.CSSProperties}
          cx={siege.x}
          cy={siege.y}
          r={CADRE_HEMICYCLE.rayonSiege}
        />
      ))}
    </svg>
  );
}
