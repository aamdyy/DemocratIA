import { amorcer, fluxAmendement, fluxExemple, modeleFeatherless, type DemandeAmendement } from "@/lib/featherless";

const POSITIONS = new Set(["pour", "contre", "abstention"]);

/** Retire les caractères de contrôle : le titre part dans la consigne envoyée au modèle. */
const propre = (valeur: string, longueur: number) =>
  valeur
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .trim()
    .slice(0, longueur);

function lireDemande(corps: unknown): DemandeAmendement | null {
  if (!corps || typeof corps !== "object" || Array.isArray(corps)) return null;
  const c = corps as Record<string, unknown>;
  if (typeof c.titre !== "string" || !propre(c.titre, 400) || typeof c.position !== "string" || !POSITIONS.has(c.position)) {
    return null;
  }
  const priorites = Array.isArray(c.priorites) ? c.priorites : [];
  return {
    titre: propre(c.titre, 400),
    date: typeof c.date === "string" ? propre(c.date, 40) : "",
    position: c.position as DemandeAmendement["position"],
    priorites: priorites
      .slice(0, 12)
      .map((p) => (p && typeof p === "object" ? (p as Record<string, unknown>) : {}))
      .filter((p) => typeof p.theme === "string" && propre(p.theme, 60) && typeof p.poids === "number" && Number.isFinite(p.poids))
      .map((p) => ({
        theme: propre(p.theme as string, 60),
        poids: Math.max(0, Math.min(100, Math.round(p.poids as number))),
      })),
  };
}

function raisonDuRepli(code: string): string {
  if (code === "cle-absente") return "Clé Featherless absente : renseignez FEATHERLESS_API_KEY dans .env.local.";
  if (code === "featherless-429") return "Featherless est saturé (limite de concurrence atteinte) : réessayez dans un instant.";
  if (code === "featherless-401" || code === "featherless-403") return "Featherless a refusé la clé : vérifiez FEATHERLESS_API_KEY.";
  if (code === "featherless-delai") return "Featherless met trop de temps à répondre : réessayez dans un instant.";
  if (code === "featherless-vide") return "Le modèle n'a rien rédigé : réessayez dans un instant.";
  if (/^featherless-\d{3}$/.test(code)) return `Featherless n'a pas répondu (erreur ${code.slice(12)}).`;
  return "Featherless est injoignable : vérifiez le réseau.";
}

/** Rédige l'amendement en flux de texte brut. L'en-tête X-Democratia-Origine dit qui l'a écrit. */
export async function POST(requete: Request) {
  const demande = lireDemande(await requete.json().catch(() => null));
  if (!demande) {
    return Response.json({ erreur: "Indiquez le titre du texte et la position du mandat." }, { status: 400 });
  }

  const entetes = (origine: string, raison?: string) => ({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Democratia-Origine": origine,
    "X-Democratia-Modele": origine === "featherless" ? encodeURIComponent(modeleFeatherless()) : "aucun",
    ...(raison ? { "X-Democratia-Raison": encodeURIComponent(raison) } : {}),
  });

  try {
    const flux = await amorcer(await fluxAmendement(demande, requete.signal));
    if (!flux) throw new Error("featherless-vide");
    return new Response(flux, { headers: entetes("featherless") });
  } catch (erreur) {
    // Le lecteur est parti : inutile de lui écrire un exemple.
    if (requete.signal.aborted) return new Response(null, { status: 499 });
    const code = erreur instanceof Error ? erreur.message : "";
    return new Response(fluxExemple(demande, requete.signal), { headers: entetes("exemple", raisonDuRepli(code)) });
  }
}
