// Format de la composition : paysage 16:9 (par défaut) ou téléphone 9:16. Les scènes lisent ce contexte pour se
// recomposer en vertical (typographie plus grande, éléments empilés, marges de sécurité haut et bas).
import { createContext, useContext } from "react";

export const Format = createContext({ vertical: false });
export const useVertical = () => useContext(Format).vertical;

/** Zone utile en vertical : rien d'important au-dessus de HAUT ni sous BAS (interfaces des applications). */
export const VERTICAL = { largeur: 1080, hauteur: 1920, haut: 330, bas: 1420, sousTitres: 1430 };
