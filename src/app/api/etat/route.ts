import { connection } from "next/server";

import { natureCle } from "@/lib/hemicycle/client";
import { soldeCredits } from "@/lib/hemicycle/service";
import { modeleFeatherless } from "@/lib/featherless";
import type { EtatConnexions } from "@/lib/types";

/** Dit quelles clés sont en place, sans jamais renvoyer leur valeur. */
export async function GET() {
  await connection();
  const cle = natureCle();
  const etat: EtatConnexions = {
    hemicycle: { cle, credits: cle === "absente" ? null : await soldeCredits() },
    featherless: { cle: Boolean(process.env.FEATHERLESS_API_KEY?.trim()), modele: modeleFeatherless() },
  };
  return Response.json(etat);
}
