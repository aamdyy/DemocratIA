import type { NextRequest } from "next/server";

import { chercherDeputes } from "@/lib/hemicycle/service";

/** Recherche de parlementaires par nom de famille ou par son début : `?nom=dup`. */
export async function GET(requete: NextRequest) {
  const nom = (requete.nextUrl.searchParams.get("nom") ?? "").trim().slice(0, 60);
  if (nom.length < 2) {
    return Response.json({ erreur: "Saisissez au moins deux lettres du nom." }, { status: 400 });
  }
  return Response.json(await chercherDeputes(nom));
}
