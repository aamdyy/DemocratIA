import { ViewTransition } from "react";

import "./transitions-candidates.css";

/**
 * Remonté à chaque changement de page sous /candidates : le gabarit de (app) ne se rejoue qu'au changement du premier
 * segment, si bien que la liste et les fiches s'échangeaient sans transition. Mêmes classes que lui (transitions.css) ;
 * la sphère, nommée à part dans la liste et dans la fiche, glisse de l'une à l'autre (transitions-candidates.css).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-entree" exit="page-sortie" default="none">
      {children}
    </ViewTransition>
  );
}
