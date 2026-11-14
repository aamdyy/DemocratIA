import type { MetadataRoute } from "next";

import { URL_SITE } from "@/app/_og/site";

/** Tout est public, sauf les routes de données et les maquettes de travail. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/maquettes"] },
    sitemap: `${URL_SITE}/sitemap.xml`,
  };
}
