import type { Metadata } from "next";
import { DM_Mono, DM_Sans } from "next/font/google";

import "./globals.css";

// DM Sans pour l'interface et les titres, DM Mono pour ce que la machine calcule ou rédige.
// Les variables sont posées sur <html> : les jetons de globals.css, déclarés sur :root, doivent les voir.
const dmSans = DM_Sans({ variable: "--police-dm-sans", subsets: ["latin"] });
const dmMono = DM_Mono({ variable: "--police-dm-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "DemocratIA — République française, an 2050",
  description:
    "Fiction d'anticipation : en 2050, les citoyens ne votent plus pour un député, ils règlent une IA législatrice. Données parlementaires réelles, sourcées par Hémicycle.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${dmMono.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
