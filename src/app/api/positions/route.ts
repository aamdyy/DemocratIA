import type { NextRequest } from "next/server";

import { positionsDesGroupes } from "@/lib/hemicycle/service";

/** Positions de chaque groupe sur les scrutins demandés : `?ids=VTANR5L17V1,VTANR5L17V2`. */
export async function GET(requete: NextRequest) {
  const ids = [
    ...new Set(
      (requete.nextUrl.searchParams.get("ids") ?? "")
        .slice(0, 5000)
        .split(",")
        .map((id) => id.trim())
        .filter((id) => /^[A-Za-z0-9_-]{4,40}$/.test(id)),
    ),
  ].slice(0, 100);
  if (ids.length === 0) {
    return Response.json({ erreur: "Indiquez au moins un identifiant de scrutin dans ids." }, { status: 400 });
  }
  return Response.json(await positionsDesGroupes(ids));
}
