/** Les dix maquettes d'accueil, à comparer avant de choisir la direction du produit. */
export const MAQUETTES = [
  { n: 1, nom: "Bloc-marque", sphere: false, idee: "L’identité sobre de l’État. Un hémicycle divisé se rallie d’un seul bleu." },
  { n: 2, nom: "Journal officiel", sphere: false, idee: "Le produit se présente comme un décret : trois articles, un sceau." },
  { n: 3, nom: "Isoloir", sphere: false, idee: "Un seul objet à l’écran : le texte de loi, que l’on glisse pour ou contre." },
  { n: 4, nom: "Prénom", sphere: true, idee: "Une sphère, un prénom, rien d’autre. Olympe siège à votre place." },
  { n: 5, nom: "Trois sphères", sphere: true, idee: "Olympe, Victor, Simone : trois entités politiques défilent, chacune avec sa couleur." },
  { n: 6, nom: "Façonner", sphere: true, idee: "Les curseurs règlent le mandat, et la sphère change de couleurs sous vos doigts." },
  { n: 7, nom: "Face à face", sphere: true, idee: "L’audit : un élu humain d’un côté, la sphère de l’autre, texte par texte." },
  { n: 8, nom: "Hémicycle de sphères", sphere: true, idee: "Les 577 sièges prennent la couleur de la sphère qui monte au centre de l’arc." },
  { n: 9, nom: "Dictée", sphere: true, idee: "La sphère parle : des ondes partent d’elle pendant qu’elle rédige l’amendement." },
  { n: 10, nom: "Constellation", sphere: true, idee: "Une sphère par circonscription, chacune avec son prénom. La vôtre se détache." },
] as const;

export const lienMaquette = (n: number) => `/maquettes/${String(n).padStart(2, "0")}`;

/** Contenus d'exemple communs aux maquettes. L'intitulé du texte est fictif. */
export const EXEMPLE = {
  texte: "Projet de loi relatif à la sobriété énergétique des bâtiments publics",
  source: "Source : Assemblée nationale, via Hémicycle",
  date: "21/10/2026",
  licence: "Licence Ouverte 2.0",
  chapeau:
    "En 2050, les 577 sièges de l’Assemblée sont tenus par une IA législatrice. Votre vote ne désigne plus un député : il la règle.",
  action: "Régler mon Député IA",
  etapes: [
    { nom: "Mandat", texte: "Vous arbitrez de vrais textes de loi. Chaque réponse règle votre Député IA." },
    { nom: "Audit", texte: "Les votes publics d’un député réel sont comparés à votre mandat." },
    { nom: "Séance", texte: "L’hémicycle automatisé vote et rédige son amendement sous vos yeux." },
  ],
} as const;
