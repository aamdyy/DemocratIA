import type { MetadataRoute } from "next";

import { CANDIDATES } from "@/lib/candidates";
import { URL_SITE } from "@/app/_og/site";

const PAGES = ["", "/test", "/resultat", "/candidates", "/seance", "/audit"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...PAGES, ...CANDIDATES.map((c) => `/candidates/${c.id}`)].map((chemin) => ({ url: `${URL_SITE}${chemin}` }));
}
