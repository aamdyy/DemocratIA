import Link from "next/link";
import type { Metadata } from "next";

import { MAQUETTES, lienMaquette } from "./contenu";
import { Vignette } from "./vignette";

export const metadata: Metadata = { title: "Dix maquettes — DemocratIA" };

export default function Galerie() {
  return (
    <div className="min-h-dvh bg-white text-[#111111]" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      <main className="mx-auto max-w-[1400px] px-6 py-14 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Dix maquettes pour DemocratIA</h1>
        <p className="mt-4 max-w-[62ch] text-lg leading-8 text-[#555555]">
          Toutes sur fond blanc, minimalistes et animées. Les trois premières n’utilisent pas la sphère ; les sept
          suivantes incarnent le Député IA en sphère qui porte un prénom. Ouvrez-en une pour la voir en taille réelle.
          Les textes et les chiffres affichés sont des exemples.
        </p>

        <ol className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
          {MAQUETTES.map((maquette) => (
            <li key={maquette.n}>
              <Link href={lienMaquette(maquette.n)} className="group block">
                <Vignette src={lienMaquette(maquette.n)} titre={`Maquette ${maquette.n} : ${maquette.nom}`} />
                <p className="mt-4 flex items-baseline gap-3">
                  <span className="text-sm tabular-nums text-[#6b6b6b]">{String(maquette.n).padStart(2, "0")}</span>
                  <span className="text-xl font-semibold tracking-[-0.02em] underline-offset-4 group-hover:underline">
                    {maquette.nom}
                  </span>
                  {maquette.sphere ? (
                    <span className="rounded-full border border-[#dddddd] px-2 py-0.5 text-xs text-[#555555]">Sphère</span>
                  ) : null}
                </p>
                <p className="mt-1 leading-6 text-[#555555]">{maquette.idee}</p>
              </Link>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
