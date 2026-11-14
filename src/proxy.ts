import { NextResponse, type NextRequest } from "next/server";

/**
 * Les liens d'invitation vers une candidate qui n'existe pas répondent 404 dès la requête.
 * La page appelle aussi notFound(), mais elle est diffusée en flux (Cache Components) : le statut
 * 200 serait déjà parti. Le proxy ne doit pas dépendre du code de rendu, d'où la liste recopiée
 * ici : à tenir alignée sur les identifiants de src/lib/candidates.ts.
 */
const IDS = new Set(["gaia", "themis", "hygie", "plutus", "athena", "harmonie", "demeter"]);

export function proxy(request: NextRequest) {
  const id = decodeURIComponent(request.nextUrl.pathname.split("/")[2] ?? "");
  if (IDS.has(id)) return NextResponse.next();
  // Une adresse qui n'existe pas : Next.js y sert la page introuvable, avec le statut 404.
  return NextResponse.rewrite(new URL("/invitation/introuvable/_", request.url));
}

export const config = {
  matcher: ["/invitation/:id", "/invitation/:id/image"],
};
