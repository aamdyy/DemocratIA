/** Adresse publique du site : sert aux adresses absolues des images de partage, du plan du site et des robots. */
export const URL_SITE = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

/**
 * L'image de partage de la marque (src/app/opengraph-image.tsx). Une page qui déclare son propre
 * `openGraph` perd l'image héritée : elle la redonne avec cette constante.
 */
export const IMAGE_PARTAGE = [
  { url: "/opengraph-image", width: 1200, height: 630, alt: "DemocratIA : en 2050, la France élit une IA" },
];
