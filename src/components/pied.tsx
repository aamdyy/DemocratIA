import Link from "next/link";

const LIEN =
  "inline-flex min-h-11 items-center underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";

export function Pied() {
  return (
    <footer>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-x-12 gap-y-1 px-4 py-8 text-xs leading-5 text-attenue sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
        <p className="max-w-2xl">
          DemocratIA est une fiction d&apos;anticipation. Les scrutins, les votes et les fiches des parlementaires sont
          réels et viennent d&apos;Hémicycle, sous la licence de leur éditeur. Les IA candidates, leurs prénoms et leurs
          programmes sont fictifs : ils n&apos;engagent aucune institution, aucun parti ni aucun élu.
        </p>
        <nav aria-label="Liens complémentaires" className="shrink-0 md:-mt-3">
          <Link href="/audit" className={LIEN}>
            Comparer à un député humain
          </Link>
        </nav>
      </div>
    </footer>
  );
}
