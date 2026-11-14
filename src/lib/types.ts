/**
 * Contrat de données de DemocratIA.
 * Toute valeur affichée transporte sa provenance : c'est la règle des organisateurs
 * (« chaque réponse indique la source et la licence à citer »).
 */

export type Position = "pour" | "contre" | "abstention";
export type PositionVote = Position | "non_votant";

/** D'où vient une valeur. La couleur et la police de l'interface en dépendent. */
export type NatureDonnee =
  /** Publiée par une institution, relayée par Hémicycle. */
  | "publiee"
  /** Calculée par un modèle ou par DemocratIA à partir de données publiées. */
  | "calculee"
  /** Rédigée par un modèle de langage : fiction. */
  | "generee"
  /** Donnée d'exemple aux valeurs fictives, affichée faute de clé ou de réseau. */
  | "exemple";

export interface Provenance {
  /** Éditeur de la pièce : « Assemblée nationale », « DemocratIA », nom du modèle… */
  editeur: string;
  /** Adresse de la pièce officielle, quand elle existe. */
  url: string | null;
  licence: string;
  /** Date de la pièce (ISO 8601). */
  date: string | null;
  nature: NatureDonnee;
  /** Intermédiaire qui a fourni la pièce. Absent : Hémicycle. null : lue directement à la source. */
  via?: string | null;
  /** Pour une donnée calculée : ce qui est mesuré, en une phrase. */
  definition?: string;
}

export interface Decompte {
  pour: number;
  contre: number;
  abstention: number;
  non_votants: number;
}

export interface Scrutin {
  id: string;
  numero: string;
  date: string;
  titre: string;
  objet: string | null;
  resultat: "adopte" | "rejete";
  decompte: Decompte;
  legislature: string;
  source: Provenance;
}

export interface PositionGroupe {
  /** Sigle du groupe au jour du scrutin, par exemple « SOC ». */
  sigle: string;
  libelle: string;
  pour: number;
  contre: number;
  abstention: number;
  non_votants: number;
  /** Position majoritaire du groupe, ou null s'il n'en a pas. */
  position: Position | null;
}

export interface VoteNominatif {
  acteurId: string;
  nom: string;
  groupe: string | null;
  position: PositionVote;
}

export interface ResultatScrutin {
  scrutin: Scrutin;
  groupes: PositionGroupe[];
  votes: VoteNominatif[];
}

export interface Depute {
  id: string;
  civilite: string | null;
  prenom: string;
  nom: string;
  profession: string | null;
  /** Sigle du groupe actuel, quand la fiche le donne. */
  groupe: string | null;
  /** Lien vers les déclarations déposées à la HATVP. */
  hatvpUrl: string | null;
  source: Provenance;
}

/** Positions de chaque groupe sur une liste de scrutins, indexées par identifiant de scrutin. */
export type PositionsParScrutin = Record<string, PositionGroupe[]>;

export type OrigineReponse = "api" | "cache" | "exemple";

export interface MetaReponse {
  origine: OrigineReponse;
  /** Quand origine vaut « exemple » : pourquoi les vraies données manquent. */
  raison?: string;
  /** Date de lecture auprès d'Hémicycle (ISO 8601). */
  recuLe: string;
  credits?: { cout: number | null; restant: number | null };
}

export interface Enveloppe<T> {
  data: T;
  meta: MetaReponse;
}

export interface EtatConnexions {
  hemicycle: { cle: "absente" | "test" | "production"; credits: number | null };
  featherless: { cle: boolean; modele: string };
}
