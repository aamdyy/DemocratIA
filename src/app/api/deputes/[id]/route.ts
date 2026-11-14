import { lireDepute } from "@/lib/hemicycle/service";

export async function GET(_requete: Request, contexte: RouteContext<"/api/deputes/[id]">) {
  const { id } = await contexte.params;
  if (!/^[A-Za-z0-9_-]{2,40}$/.test(id)) {
    return Response.json({ erreur: "Cet identifiant de fiche n'est pas valide." }, { status: 400 });
  }
  const fiche = await lireDepute(id);
  if (!fiche.data) {
    return Response.json({ erreur: "Cette fiche n'est pas disponible.", meta: fiche.meta }, { status: 404 });
  }
  return Response.json(fiche);
}
