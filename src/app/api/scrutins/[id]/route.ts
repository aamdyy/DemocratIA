import { ErreurHemicycle } from "@/lib/hemicycle/client";
import { lireResultat } from "@/lib/hemicycle/service";

export async function GET(_requete: Request, contexte: RouteContext<"/api/scrutins/[id]">) {
  const { id } = await contexte.params;
  if (!/^[A-Za-z0-9_-]{4,40}$/.test(id)) {
    return Response.json({ erreur: "Cet identifiant de scrutin n'est pas valide." }, { status: 400 });
  }
  try {
    const resultat = await lireResultat(id);
    if (!resultat.data) {
      // Une pièce d'exemple inconnue est introuvable ; un vrai scrutin sans réponse est une panne d'Hémicycle.
      const panne = !id.startsWith("EXEMPLE-") && resultat.meta.origine === "exemple";
      return Response.json(
        {
          erreur: panne && resultat.meta.raison ? `Ce scrutin n'est pas disponible. ${resultat.meta.raison}` : "Ce scrutin n'est pas disponible.",
          meta: resultat.meta,
        },
        { status: panne ? 502 : 404 },
      );
    }
    return Response.json(resultat);
  } catch (erreur) {
    if (erreur instanceof ErreurHemicycle) {
      const statut = erreur.statut >= 400 && erreur.statut <= 599 ? erreur.statut : 502;
      return Response.json({ erreur: erreur.statut === 404 ? "Ce scrutin n'existe pas chez Hémicycle." : erreur.message }, { status: statut });
    }
    throw erreur;
  }
}
