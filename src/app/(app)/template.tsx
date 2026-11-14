import { ViewTransition } from "react";

/**
 * Remonté à chaque changement de page : l'ancienne page s'efface, la nouvelle monte en douceur
 * (classes `page-sortie` et `page-entree` de transitions.css). L'en-tête, nommé à part, reste immobile.
 * `default="none"` : aucune animation pour les mises à jour qui ne sont pas des changements de page.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-entree" exit="page-sortie" default="none">
      {children}
    </ViewTransition>
  );
}
