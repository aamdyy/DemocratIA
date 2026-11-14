"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useMaSphere } from "@/components/accueil/ma-sphere";
import { Sphere } from "@/components/sphere";
import { useEtat } from "@/lib/api";
import { nombre } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Les trois temps du parcours : passer le test, découvrir les candidates, voir l'IA au pouvoir. */
const LIENS = [
  { href: "/test", libelle: "Le test", aussi: ["/resultat"] },
  { href: "/candidates", libelle: "Les candidates", aussi: [] },
  { href: "/seance", libelle: "Au pouvoir", aussi: [] },
] as const;

const correspond = (chemin: string, href: string) => chemin === href || chemin.startsWith(`${href}/`);

/**
 * L'en-tête : la marque à gauche, le parcours au centre, l'état des données à droite.
 * Sous 1024 px, le parcours passe sur une seconde ligne pleine largeur : rien ne déborde à 390 px.
 */
export function Entete() {
  const chemin = usePathname();
  // La marque prend les couleurs de l'IA du citoyen dès que le test est commencé.
  const { candidate, teintes } = useMaSphere();

  return (
    <header className="border-b border-trait bg-fond">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <Link
          href="/"
          className="col-start-1 row-start-1 flex min-h-14 items-center gap-2.5 justify-self-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte"
        >
          <Sphere teintes={teintes} duree={12} className="size-6 shrink-0" />
          <span className="font-titre text-[17px] font-semibold tracking-[-0.03em]">DemocratIA</span>
          <span className="text-sm text-attenue max-md:hidden">République française, 2050</span>
          {candidate ? <span className="sr-only">Votre IA : {candidate.prenom}</span> : null}
        </Link>

        <nav
          aria-label="Navigation principale"
          className="col-span-2 row-start-2 -mb-px lg:col-span-1 lg:col-start-2 lg:row-start-1"
        >
          <ul role="list" className="flex lg:gap-2">
            {LIENS.map((lien) => {
              const active = correspond(chemin, lien.href) || lien.aussi.some((h) => correspond(chemin, h));
              return (
                <li key={lien.href} className="flex-1 lg:flex-none">
                  <Link
                    href={lien.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center justify-center whitespace-nowrap border-b-2 border-transparent px-3 text-sm text-attenue transition-colors duration-150 hover:text-texte focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-texte sm:px-4 lg:min-h-14",
                      active && "border-texte font-medium text-texte",
                    )}
                  >
                    {lien.libelle}
                  </Link>
                </li>
              );
            })}
          </ul>
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
    <p
      role="status"
      className="col-start-2 row-start-1 flex min-h-14 items-center justify-end gap-2 justify-self-end text-right text-xs leading-4 text-attenue lg:col-start-3"
    >
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
                <span className="tabular-nums max-sm:hidden">, {nombre(etat.hemicycle.credits)} crédits</span>
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
