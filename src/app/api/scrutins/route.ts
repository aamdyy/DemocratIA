import { connection } from "next/server";

import { listerScrutinsDeTextes } from "@/lib/hemicycle/service";

export async function GET() {
  await connection();
  return Response.json(await listerScrutinsDeTextes());
}
