"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSphereCitoyen } from "@/components/accueil/sphere-citoyen";
import { Sphere } from "@/components/sphere";
import { useEtat } from "@/lib/api";
import { nombre } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Les trois vues forment une séquence : on règle le mandat, on audite, puis on siège. */
const ETAPES = [
  { href: "/mandat", rang: 1, libelle: "Mandat" },
  { href: "/audit", rang: 2, libelle: "Audit" },
  { href: "/seance", rang: 3, libelle: "Séance" },
] as const;

export function Entete() {
  const chemin = usePathname();
  // La marque porte la sphère du citoyen : elle prend ses couleurs dès que le mandat est réglé.
  const sphere = useSphereCitoyen();

  return (
    <header className="border-b border-trait bg-fond">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-8 px-4 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link href="/" className="flex min-h-14 items-center gap-2.5">
          <Sphere teintes={sphere.teintes} poids={sphere.poids} duree={12} className="size-6 shrink-0" />
          <span className="flex flex-col leading-tight xl:flex-row xl:items-baseline xl:gap-3">
            <span className="font-titre text-[17px] font-semibold tracking-[-0.01em]">DemocratIA</span>
            <span className="text-xs text-attenue">République française, an 2050</span>
          </span>
        </Link>

        <nav aria-label="Étapes" className="order-last -mb-px w-full lg:order-none lg:w-auto">
          <ol role="list" className="flex lg:gap-1">
            {ETAPES.map((etape) => {
              const active = chemin === etape.href || chemin.startsWith(`${etape.href}/`);
              return (
                <li key={etape.href} className="flex-1 lg:flex-none">
                  <Link
                    href={etape.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center justify-center gap-2 border-b-2 border-transparent px-4 text-sm text-attenue transition-colors duration-150 hover:text-texte lg:min-h-14",
                      active && "border-texte font-medium text-texte",
                    )}
                  >
                    <span className="text-xs tabular-nums">{etape.rang}</span>
                    {etape.libelle}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <EtatDonnees />
      </div>
    </header>
  );
}

/** Dit d'un coup d'œil si la démo tourne sur les vraies données ou sur des exemples. */
function EtatDonnees() {
  const { data: etat, error: erreur } = useEtat();
  const reel = etat ? etat.hemicycle.cle !== "absente" : false;

  return (
    <p role="status" className="ml-auto flex min-h-14 items-center gap-2 text-right text-xs leading-4 text-attenue">
      {etat ? (
        <>
          {/* Point plein : données réelles. Cercle en pointillés : exemples. La forme le dit, pas la couleur. */}
          <span
            aria-hidden
            className={cn("size-2 shrink-0 rounded-full", reel ? "bg-texte" : "border border-dashed border-attenue")}
          />
          {reel ? (
            <span>
              Hémicycle connecté
              {etat.hemicycle.cle === "test" ? <span className="max-sm:hidden"> (clé de test)</span> : null}
              {etat.hemicycle.credits !== null ? (
                <span className="ml-2 border-l border-trait pl-2 tabular-nums">
                  {nombre(etat.hemicycle.credits)} crédits
                </span>
              ) : null}
            </span>
          ) : (
            <span>Données d&apos;exemple</span>
          )}
        </>
      ) : erreur ? (
        "État des données inconnu"
      ) : (
        "Vérification des données…"
      )}
    </p>
  );
}
