import type { NextRequest } from "next/server";

import { imageInvitation } from "@/app/_og/invitation";
import { candidateParId } from "@/lib/candidates";
import { lireAffinite } from "@/lib/partage";

/**
 * L'image de partage d'un lien d'invitation. La convention opengraph-image ne voit pas l'adresse
 * (?a=84) : l'image est donc servie par cette route, et la page la déclare dans generateMetadata.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/invitation/[id]/image">) {
  const { id } = await ctx.params;
  const candidate = candidateParId(id);
  if (!candidate) return new Response("Candidate introuvable", { status: 404 });
  // Comme sur la page : une seule valeur ?a= est lue ; répétée, elle est ignorée.
  const valeurs = request.nextUrl.searchParams.getAll("a");
  return imageInvitation(candidate, lireAffinite(valeurs.length === 1 ? valeurs[0] : null));
}
