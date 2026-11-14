import type { ThemeId } from "@/lib/themes";

/**
 * « Scénarios 2050 » : quatre crises fictives, situées dans la France de 2050. Aucune ne décrit un fait réel.
 * Chaque réponse applique des ajustements de priorité, affichés au citoyen après son choix.
 */
export interface OptionScenario {
  id: string;
  libelle: string;
  effets: Partial<Record<ThemeId, number>>;
}

export interface Scenario {
  id: string;
  /** Date et heure de la dépêche, fictives. */
  quand: string;
  lieu: string;
  titre: string;
  options: OptionScenario[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "canicule",
    quand: "12 juillet 2050, 6 h 40",
    lieu: "Lyon",
    titre: "Canicule record : 48 °C annoncés, le réseau électrique au bord de la rupture.",
    options: [
      { id: "renover", libelle: "Rationner l'énergie et rénover tous les bâtiments publics", effets: { ecologie: 10, logement: 4, travail: -4 } },
      { id: "proteger", libelle: "Protéger d'abord les plus fragiles : soins et aides d'urgence", effets: { sante: 10, budget: -6 } },
      { id: "activite", libelle: "Maintenir l'activité en décalant les horaires de travail", effets: { travail: 10, ecologie: -6 } },
    ],
  },
  {
    id: "usine",
    quand: "3 mars 2050, 9 h 15",
    lieu: "Ardennes",
    titre: "Une usine de batteries ferme : 1 200 emplois menacés dans la vallée.",
    options: [
      { id: "capital", libelle: "L'État entre au capital pour sauver les emplois", effets: { travail: 10, budget: -8 } },
      { id: "reconvertir", libelle: "Reconvertir le site et former les salariés aux métiers verts", effets: { ecologie: 6, education: 6 } },
      { id: "marche", libelle: "Baisser les charges des entreprises et laisser faire le marché", effets: { budget: 10, travail: -4 } },
    ],
  },
  {
    id: "cyber",
    quand: "21 novembre 2050, 22 h 05",
    lieu: "Paris",
    titre: "Cyberattaque : les services publics en ligne sont à l'arrêt depuis trois jours.",
    options: [
      { id: "defense", libelle: "Bâtir une cyberdéfense publique, quel qu'en soit le coût", effets: { numerique: 8, securite: 6, budget: -4 } },
      { id: "guichets", libelle: "Rouvrir des guichets humains dans chaque commune", effets: { institutions: 6, agriculture: 4, numerique: -6 } },
      { id: "sanctions", libelle: "Durcir les sanctions et surveiller davantage les réseaux", effets: { securite: 10, numerique: -4 } },
    ],
  },
  {
    id: "medecins",
    quand: "8 septembre 2050, 7 h 30",
    lieu: "Creuse",
    titre: "Pénurie de médecins : un tiers des communes rurales n'a plus de généraliste.",
    options: [
      { id: "installer", libelle: "Obliger les jeunes médecins à s'installer là où ils manquent", effets: { sante: 8, institutions: 4 } },
      { id: "former", libelle: "Former deux fois plus de soignants dès la rentrée", effets: { education: 8, sante: 6, budget: -6 } },
      { id: "teleconsultation", libelle: "Généraliser la téléconsultation assistée par IA", effets: { numerique: 10, sante: 4 } },
    ],
  },
];
