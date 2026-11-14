import Link from "next/link";

export function Pied() {
  return (
    <footer className="border-t border-trait">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-x-12 px-4 py-6 text-xs leading-5 text-attenue sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
        <p className="max-w-2xl">
          DemocratIA est une fiction d&apos;anticipation. Les scrutins, les votes et les fiches des parlementaires sont
          réels et viennent d&apos;Hémicycle, sous la licence de leur éditeur. Tout ce qu&apos;une machine calcule ou
          rédige est signalé comme tel et n&apos;engage aucune institution ni aucun élu.
        </p>
        <Link
          href="/maquettes"
          className="inline-flex min-h-11 shrink-0 items-center self-start underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current md:-mt-3"
        >
          Voir les maquettes
        </Link>
      </div>
    </footer>
  );
}
