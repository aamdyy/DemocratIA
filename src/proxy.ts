import { NextResponse, type NextRequest } from "next/server";

/**
 * Les liens d'invitation vers une candidate qui n'existe pas répondent 404 dès la requête.
 * La page appelle aussi notFound(), mais elle est diffusée en flux (Cache Components) : le statut
 * 200 serait déjà parti. Le proxy ne doit pas dépendre du code de rendu, d'où la liste recopiée
 * ici : à tenir alignée sur les identifiants de src/lib/candidates.ts.
 */
const IDS = new Set(["gaia", "themis", "hygie", "plutus", "athena", "harmonie", "demeter"]);

/**
 * Limite de débit des routes qui dépensent des crédits (Hémicycle, Featherless) : au plus LIMITE
 * requêtes par minute et par adresse IP, comptées en mémoire de l'instance. C'est un garde-fou contre
 * les scripts qui videraient les crédits, pas une protection absolue (une règle de pare-feu Vercel
 * fait mieux en complément).
 */
const LIMITE = { "/api/amendement": 6, "/api/deputes": 30, "/api/scrutins": 60, "/api/positions": 30 } as const;
const FENETRE = 60_000;
const compteurs = new Map<string, { debut: number; nombre: number }>();

function limiteDepassee(request: NextRequest): number | null {
  const chemin = request.nextUrl.pathname;
  const route = (Object.keys(LIMITE) as (keyof typeof LIMITE)[]).find((r) => chemin === r || chemin.startsWith(`${r}/`));
  if (!route) return null;
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "inconnue";
  const cle = `${route}|${ip}`;
  const maintenant = Date.now();
  const compteur = compteurs.get(cle);
  if (!compteur || maintenant - compteur.debut > FENETRE) {
    compteurs.set(cle, { debut: maintenant, nombre: 1 });
    if (compteurs.size > 5000) compteurs.clear();
    return null;
  }
  compteur.nombre += 1;
  return compteur.nombre > LIMITE[route] ? Math.ceil((FENETRE - (maintenant - compteur.debut)) / 1000) : null;
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const attente = limiteDepassee(request);
    if (attente !== null) {
      return NextResponse.json(
        { erreur: "Trop de requêtes : réessayez dans un instant." },
        { status: 429, headers: { "Retry-After": String(attente) } },
      );
    }
    return NextResponse.next();
  }
  const id = decodeURIComponent(request.nextUrl.pathname.split("/")[2] ?? "");
  if (IDS.has(id)) return NextResponse.next();
  // Une adresse qui n'existe pas : Next.js y sert la page introuvable, avec le statut 404.
  return NextResponse.rewrite(new URL("/invitation/introuvable/_", request.url));
}

export const config = {
  matcher: ["/invitation/:id", "/invitation/:id/image", "/api/amendement", "/api/deputes/:path*", "/api/scrutins/:path*", "/api/positions"],
};
