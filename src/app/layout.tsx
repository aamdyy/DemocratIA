import type { Metadata, Viewport } from "next";
import { DM_Mono, Public_Sans } from "next/font/google";

import { VeilleSpheres } from "@/components/veille-spheres";

import { URL_SITE } from "./_og/site";
import "./globals.css";

// Public Sans (police libre, sobre et administrative) pour l'interface et les titres, DM Mono pour ce que la machine calcule ou rédige.
// Les variables sont posées sur <html> : les jetons de globals.css, déclarés sur :root, doivent les voir.
const publicSans = Public_Sans({ variable: "--police-public-sans", subsets: ["latin"] });
const dmMono = DM_Mono({ variable: "--police-dm-mono", subsets: ["latin"], weight: ["400", "500"] });

const NOM = "DemocratIA";
const DESCRIPTION =
  "Fiction d'anticipation : en 2050, la présidentielle oppose des IA. Tranchez de vrais textes de loi et trouvez l'IA candidate qui vous ressemble.";

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: { default: `${NOM}, la France élit une IA en 2050`, template: `%s — ${NOM}` },
  description: DESCRIPTION,
  applicationName: NOM,
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: NOM,
    title: { default: `${NOM}, la France élit une IA en 2050`, template: `%s — ${NOM}` },
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
};

// Données structurées : le site, rien de plus. Aucune organisation ni personne réelle n'y figure.
const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: NOM,
  url: URL_SITE,
  inLanguage: "fr-FR",
  description: DESCRIPTION,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${publicSans.variable} ${dmMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <VeilleSpheres />
        <script
          type="application/ld+json"
          // Le « < » est échappé pour qu'aucune valeur ne puisse refermer la balise.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
