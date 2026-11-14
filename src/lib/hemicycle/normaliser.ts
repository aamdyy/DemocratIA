import type {
  Decompte,
  Depute,
  Position,
  PositionGroupe,
  PositionVote,
  PositionsParScrutin,
  Provenance,
  ResultatScrutin,
  Scrutin,
  VoteNominatif,
} from "@/lib/types";

/**
 * Traduit les réponses d'Hémicycle vers le contrat de l'interface.
 * Tout le couplage à la forme exacte de l'API est ici : si un champ change de nom,
 * c'est le seul fichier à retoucher.
 */

type Brut = Record<string, unknown>;

const estObjet = (valeur: unknown): valeur is Brut =>
  valeur !== null && typeof valeur === "object" && !Array.isArray(valeur);

const objet = (valeur: unknown): Brut => (estObjet(valeur) ? valeur : {});

/** Une ressource seule peut arriver enveloppée dans « data », comme les listes. */
const deballer = (valeur: unknown): Brut => {
  const o = objet(valeur);
  return estObjet(o.data) ? o.data : o;
};

const liste = (...candidats: unknown[]): unknown[] => {
  for (const candidat of candidats) if (Array.isArray(candidat)) return candidat;
  return [];
};

const texte = (...candidats: unknown[]): string | null => {
  for (const candidat of candidats) {
    if (typeof candidat === "string" && candidat.trim()) return candidat.trim();
    if (typeof candidat === "number" && Number.isFinite(candidat)) return String(candidat);
  }
  return null;
};

/** Une adresse n'est gardée que si elle est en http(s) : elle finit dans un lien cliquable. */
const lien = (...candidats: unknown[]): string | null => {
  for (const candidat of candidats) {
    if (typeof candidat === "string" && /^https?:\/\//i.test(candidat.trim())) return candidat.trim();
  }
  return null;
};

const entier = (...candidats: unknown[]): number => {
  for (const candidat of candidats) {
    // Une liste de votants vaut son effectif.
    if (Array.isArray(candidat)) return candidat.length;
    if (typeof candidat === "string" && !candidat.trim()) continue;
    const n = typeof candidat === "string" ? Number(candidat) : candidat;
    if (typeof n === "number" && Number.isFinite(n)) return n;
  }
  return 0;
};

const sansAccent = (valeur: string) =>
  valeur
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function normaliserPosition(valeur: unknown): PositionVote | null {
  const brut = texte(valeur);
  if (!brut) return null;
  const v = sansAccent(brut).replace(/[\s_-]+/g, "");
  if (v.startsWith("pour")) return "pour";
  if (v.startsWith("contre")) return "contre";
  if (v.startsWith("abst")) return "abstention";
  if (v.startsWith("non")) return "non_votant";
  return null;
}

const positionExprimee = (valeur: unknown): Position | null => {
  const position = normaliserPosition(valeur);
  return position === "non_votant" ? null : position;
};

export function normaliserProvenance(source: unknown, date: string | null): Provenance {
  const s = objet(source);
  return {
    editeur: texte(s.editeur, s.publisher, typeof source === "string" ? source : null) ?? "Assemblée nationale",
    url: lien(s.url, s.lien),
    licence: texte(s.licence, s.license) ?? "Licence Ouverte 2.0",
    date: texte(s.date, s.mis_a_jour, s.maj) ?? date,
    nature: "publiee",
  };
}

function normaliserDecompte(valeur: unknown): Decompte {
  const d = objet(valeur);
  return {
    pour: entier(d.pour),
    contre: entier(d.contre),
    abstention: entier(d.abstention, d.abstentions),
    non_votants: entier(d.non_votants, d.non_votant, d.nonVotants),
  };
}

function sortDuScrutin(valeur: unknown, decompte: Decompte): Scrutin["resultat"] {
  const sort = sansAccent(texte(valeur, objet(valeur).code, objet(valeur).libelle) ?? "");
  if (/rejet|pas adopt|non adopt/.test(sort)) return "rejete";
  if (sort.includes("adopt")) return "adopte";
  // Sort non communiqué : on le lit dans le décompte publié plutôt que d'écrire « rejeté » par défaut.
  return decompte.pour > decompte.contre ? "adopte" : "rejete";
}

export function normaliserScrutin(valeur: unknown): Scrutin {
  const s = objet(valeur);
  const date = texte(s.date, s.date_scrutin);
  const decompte = normaliserDecompte(s.decompte ?? s);
  return {
    id: texte(s.id, s.uid, s.scrutin_ref, s.ref) ?? "",
    numero: texte(s.numero) ?? "",
    date: date ?? "",
    titre: texte(s.titre, s.intitule, s.objet) ?? "Scrutin sans intitulé",
    objet: texte(s.objet),
    resultat: sortDuScrutin(s.resultat ?? s.sort, decompte),
    decompte,
    legislature: texte(s.legislature) ?? "",
    source: normaliserProvenance(s.source, date),
  };
}

function normaliserGroupe(valeur: unknown): PositionGroupe {
  const g = objet(valeur);
  const organe = objet(g.groupe ?? g.organe);
  // Les effectifs sont à plat, sous « decompte » ou sous « votes » selon le point d'accès.
  const decompte = normaliserDecompte(g.decompte ?? (estObjet(g.votes) ? g.votes : g));
  const sigle =
    texte(g.sigle, organe.sigle, organe.libelle_abrege, typeof g.groupe === "string" ? g.groupe : null, g.groupe_sigle) ??
    "?";
  return {
    sigle,
    libelle: texte(g.libelle, organe.libelle, g.nom) ?? sigle,
    ...decompte,
    position: positionExprimee(g.position_majoritaire ?? g.position),
  };
}

function normaliserVote(valeur: unknown): VoteNominatif | null {
  const v = objet(valeur);
  const acteur = objet(v.acteur ?? v.depute);
  const groupe = objet(v.groupe);
  const position = normaliserPosition(v.position ?? v.vote);
  if (!position) return null;
  const nomComplet =
    texte(v.nom_complet, acteur.nom_complet) ??
    [texte(v.prenom, acteur.prenom), texte(v.nom, acteur.nom)].filter(Boolean).join(" ");
  return {
    acteurId:
      texte(v.acteur_id, v.acteur_ref, acteur.id, typeof v.acteur === "string" ? v.acteur : null, v.depute_id) ?? "",
    nom: nomComplet || "Nom non communiqué",
    groupe: texte(v.groupe_sigle, groupe.sigle, typeof v.groupe === "string" ? v.groupe : null),
    position,
  };
}

export function normaliserResultat(valeur: unknown): ResultatScrutin {
  const r = deballer(valeur);
  const groupesBruts = liste(r.groupes, r.positions, r.par_groupe);
  // Hémicycle donne le groupe d'un vote par son code d'organe (« PO845401 ») : on le traduit en sigle (« RN »)
  // grâce à la liste des groupes du même scrutin, pour placer chaque député dans son quartier de l'hémicycle.
  const sigleParCode = new Map<string, string>();
  for (const brut of groupesBruts) {
    const g = objet(brut);
    const code = texte(typeof g.groupe === "string" ? g.groupe : null, g.organe_ref, g.ref);
    const sigle = texte(g.sigle);
    if (code && sigle) sigleParCode.set(code, sigle);
  }
  return {
    scrutin: normaliserScrutin(r.scrutin ?? r),
    groupes: groupesBruts.map(normaliserGroupe),
    votes: liste(r.votes, r.deputes, r.nominatif)
      .map(normaliserVote)
      .filter((v): v is VoteNominatif => v !== null)
      .map((v) => (v.groupe && sigleParCode.has(v.groupe) ? { ...v, groupe: sigleParCode.get(v.groupe)! } : v)),
  };
}

export function normaliserPositionsGroupes(valeur: unknown): PositionsParScrutin {
  const r = deballer(valeur);
  const positions: PositionsParScrutin = {};
  for (const ligne of liste(r.scrutins, r.resultats, r.lignes, r.data, valeur)) {
    const l = objet(ligne);
    const id = texte(l.id, l.scrutin_id, l.scrutin, l.scrutin_ref, objet(l.scrutin).id);
    if (!id) continue;
    const groupes = liste(l.groupes, l.positions, l.par_groupe);
    if (groupes.length > 0) {
      positions[id] = groupes.map(normaliserGroupe);
    } else if (l.groupe !== undefined || l.sigle !== undefined) {
      // Forme à plat : une ligne par scrutin et par groupe.
      (positions[id] ??= []).push(normaliserGroupe(l));
    }
  }
  return positions;
}

export function normaliserDepute(valeur: unknown): Depute {
  const a = deballer(valeur);
  const groupe = objet(a.groupe);
  const hatvp = objet(a.hatvp);
  return {
    id: texte(a.id, a.uid) ?? "",
    civilite: texte(a.civilite),
    prenom: texte(a.prenom) ?? "",
    nom: texte(a.nom) ?? "",
    profession: texte(a.profession),
    groupe: texte(a.groupe_sigle, groupe.sigle, typeof a.groupe === "string" ? a.groupe : null),
    hatvpUrl: lien(hatvp.url, a.hatvp, a.hatvp_url),
    source: normaliserProvenance(a.source, null),
  };
}

export const donnees = (valeur: unknown): unknown[] => liste(objet(valeur).data, objet(valeur).lignes, valeur);
