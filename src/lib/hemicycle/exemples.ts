import type { Depute, PositionGroupe, Position, Provenance, ResultatScrutin, Scrutin, VoteNominatif } from "@/lib/types";

/**
 * Données d'exemple aux valeurs fictives, servies tant que la clé Hémicycle manque.
 * Rien ici ne décrit un scrutin, un groupe ou un député réel : les intitulés, les groupes
 * (A à F) et les noms sont inventés, et chaque objet porte la nature « exemple ».
 */

const source: Provenance = {
  editeur: "Donnée d'exemple",
  url: null,
  licence: "Sans licence : valeurs fictives",
  date: null,
  nature: "exemple",
};

const GROUPES = [
  { sigle: "GR-A", libelle: "Groupe d'exemple A", sieges: 126 },
  { sigle: "GR-B", libelle: "Groupe d'exemple B", sieges: 98 },
  { sigle: "GR-C", libelle: "Groupe d'exemple C", sieges: 72 },
  { sigle: "GR-D", libelle: "Groupe d'exemple D", sieges: 143 },
  { sigle: "GR-E", libelle: "Groupe d'exemple E", sieges: 91 },
  { sigle: "GR-F", libelle: "Groupe d'exemple F", sieges: 47 },
] as const;

type Tendance = readonly [Position, Position, Position, Position, Position, Position];

const TEXTES: { titre: string; date: string; tendance: Tendance }[] = [
  {
    titre: "l'ensemble du projet de loi relatif à la sobriété énergétique des bâtiments publics",
    date: "2026-10-21",
    tendance: ["pour", "pour", "pour", "contre", "abstention", "contre"],
  },
  {
    titre: "l'ensemble de la proposition de loi visant à plafonner les loyers dans les zones tendues",
    date: "2026-10-14",
    tendance: ["pour", "pour", "abstention", "contre", "contre", "contre"],
  },
  {
    titre: "l'ensemble du projet de loi d'orientation pour la sécurité intérieure",
    date: "2026-10-07",
    tendance: ["contre", "abstention", "pour", "pour", "pour", "pour"],
  },
  {
    titre: "l'ensemble de la proposition de loi relative à la semaine de quatre jours dans la fonction publique",
    date: "2026-09-30",
    tendance: ["pour", "pour", "contre", "contre", "abstention", "contre"],
  },
  {
    titre: "l'ensemble du projet de loi relatif à l'accès aux soins dans les territoires ruraux",
    date: "2026-09-23",
    tendance: ["pour", "pour", "pour", "pour", "abstention", "pour"],
  },
  {
    titre: "l'ensemble de la proposition de loi visant à encadrer l'usage de l'intelligence artificielle par l'administration",
    date: "2026-09-16",
    tendance: ["pour", "abstention", "pour", "contre", "contre", "abstention"],
  },
  {
    titre: "l'ensemble du projet de loi de programmation agricole",
    date: "2026-09-09",
    tendance: ["contre", "contre", "abstention", "pour", "pour", "pour"],
  },
  {
    titre: "l'ensemble de la proposition de loi relative à la taxation des superprofits",
    date: "2026-07-08",
    tendance: ["pour", "pour", "pour", "contre", "contre", "abstention"],
  },
  {
    titre: "l'ensemble du projet de loi relatif à l'égalité des chances à l'école primaire",
    date: "2026-07-01",
    tendance: ["pour", "pour", "pour", "abstention", "pour", "abstention"],
  },
  {
    titre: "l'ensemble de la proposition de loi visant à instaurer un référendum d'initiative citoyenne",
    date: "2026-06-24",
    tendance: ["pour", "contre", "abstention", "pour", "contre", "pour"],
  },
  {
    titre: "l'ensemble du projet de loi relatif à la réduction de la dette publique",
    date: "2026-06-17",
    tendance: ["contre", "contre", "abstention", "pour", "pour", "pour"],
  },
  {
    titre: "l'ensemble de la proposition de loi relative au droit à la déconnexion des salariés",
    date: "2026-06-10",
    tendance: ["pour", "pour", "pour", "abstention", "abstention", "contre"],
  },
  {
    titre: "l'ensemble du projet de loi relatif à la prévention en santé mentale des jeunes",
    date: "2026-06-03",
    tendance: ["pour", "pour", "pour", "pour", "abstention", "abstention"],
  },
  {
    titre: "l'ensemble de la proposition de loi visant à développer les énergies renouvelables",
    date: "2026-05-27",
    tendance: ["pour", "pour", "abstention", "contre", "pour", "contre"],
  },
  {
    titre: "l'ensemble du projet de loi relatif à la lutte contre le narcotrafic",
    date: "2026-05-20",
    tendance: ["abstention", "pour", "pour", "pour", "pour", "pour"],
  },
  {
    titre: "l'ensemble du projet de loi pour la rénovation de l'habitat dégradé",
    date: "2026-05-13",
    tendance: ["pour", "pour", "pour", "abstention", "contre", "abstention"],
  },
  {
    titre: "l'ensemble de la proposition de loi relative à l'alimentation durable dans les cantines",
    date: "2026-05-06",
    tendance: ["pour", "abstention", "pour", "contre", "pour", "contre"],
  },
  {
    titre: "l'ensemble du projet de loi relatif à la protection des données personnelles en ligne",
    date: "2026-04-29",
    tendance: ["pour", "contre", "abstention", "abstention", "pour", "pour"],
  },
  {
    titre: "l'ensemble de la proposition de loi visant à revaloriser la rémunération des enseignants",
    date: "2026-04-22",
    tendance: ["pour", "pour", "pour", "contre", "abstention", "contre"],
  },
  {
    titre: "l'ensemble du projet de loi organique relatif à la réforme des collectivités territoriales",
    date: "2026-04-15",
    tendance: ["abstention", "pour", "contre", "pour", "pour", "contre"],
  },
];

/** Répartition fictive mais stable : 80 % du groupe suit sa tendance, le reste se disperse. */
function repartir(sieges: number, tendance: Position, graine: number): Record<Position | "non_votants", number> {
  const absents = Math.round(sieges * (0.08 + (graine % 5) * 0.02));
  const presents = sieges - absents;
  const dissidents = Math.round(presents * (0.04 + (graine % 3) * 0.03));
  const decompte = { pour: 0, contre: 0, abstention: 0, non_votants: absents };
  decompte[tendance] = presents - dissidents;
  const autre: Position = tendance === "abstention" ? "pour" : "abstention";
  decompte[autre] += dissidents;
  return decompte;
}

function groupesDuTexte(indice: number): PositionGroupe[] {
  return GROUPES.map((groupe, g) => ({
    sigle: groupe.sigle,
    libelle: groupe.libelle,
    ...repartir(groupe.sieges, TEXTES[indice].tendance[g], indice * 7 + g * 3),
    position: TEXTES[indice].tendance[g],
  }));
}

function scrutinExemple(indice: number): Scrutin {
  const groupes = groupesDuTexte(indice);
  const decompte = groupes.reduce(
    (total, g) => ({
      pour: total.pour + g.pour,
      contre: total.contre + g.contre,
      abstention: total.abstention + g.abstention,
      non_votants: total.non_votants + g.non_votants,
    }),
    { pour: 0, contre: 0, abstention: 0, non_votants: 0 },
  );
  return {
    id: `EXEMPLE-${String(indice + 1).padStart(4, "0")}`,
    numero: String(9000 + indice),
    date: TEXTES[indice].date,
    titre: TEXTES[indice].titre,
    objet: null,
    resultat: decompte.pour > decompte.contre ? "adopte" : "rejete",
    decompte,
    legislature: "17",
    source: { ...source, date: TEXTES[indice].date },
  };
}

export const SCRUTINS_EXEMPLE: Scrutin[] = TEXTES.map((_, indice) => scrutinExemple(indice));

export const DEPUTES_EXEMPLE: Depute[] = GROUPES.flatMap((groupe, g) =>
  [1, 2].map((n) => ({
    id: `EXEMPLE-PA-${g}${n}`,
    civilite: null,
    prenom: "Parlementaire",
    nom: `d'exemple ${groupe.sigle.slice(-1)}${n}`,
    profession: "Profession fictive",
    groupe: groupe.sigle,
    hatvpUrl: null,
    source,
  })),
);

export function resultatExemple(id: string): ResultatScrutin | null {
  const indice = SCRUTINS_EXEMPLE.findIndex((s) => s.id === id);
  if (indice < 0) return null;
  const groupes = groupesDuTexte(indice);
  const votes: VoteNominatif[] = [];
  groupes.forEach((groupe, g) => {
    const tranches: [VoteNominatif["position"], number][] = [
      ["pour", groupe.pour],
      ["contre", groupe.contre],
      ["abstention", groupe.abstention],
      ["non_votant", groupe.non_votants],
    ];
    let rang = 0;
    for (const [position, effectif] of tranches) {
      for (let i = 0; i < effectif; i++) {
        rang++;
        // Les deux premiers sièges de chaque groupe portent les députés d'exemple de la vue 2.
        const fiche = rang <= 2 ? DEPUTES_EXEMPLE[g * 2 + rang - 1] : null;
        votes.push({
          acteurId: fiche?.id ?? `EXEMPLE-PA-${g}-${rang}`,
          nom: fiche ? `${fiche.prenom} ${fiche.nom}` : `Siège d'exemple ${groupe.sigle}-${rang}`,
          groupe: groupe.sigle,
          position,
        });
      }
    }
  });
  return { scrutin: SCRUTINS_EXEMPLE[indice], groupes, votes };
}

export const positionsExemple = (ids: string[]) =>
  Object.fromEntries(
    ids
      .map((id) => [id, SCRUTINS_EXEMPLE.findIndex((s) => s.id === id)] as const)
      .filter(([, indice]) => indice >= 0)
      .map(([id, indice]) => [id, groupesDuTexte(indice)]),
  );
