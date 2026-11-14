"use client";

import Link from "next/link";
import { Public_Sans } from "next/font/google";

import { LIGNES_COMPARATIF } from "./variantes";

const police = Public_Sans({ subsets: ["latin"] });

export default function Schemas() {
  return (
    <div className={`${police.className} min-h-dvh bg-white text-[#111318]`}>
      <main className="mx-auto max-w-[1100px] px-6 py-14 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Propositions de schémas</h1>
        <p className="mt-3 max-w-[62ch] text-lg leading-8 text-[#5f6573]">
          Pour chaque ligne du comparatif, trois animations : la lettre A est l’actuelle, B et C sont nouvelles. Répondez
          par exemple « Mandat B, Programme A, Décisions C, Face à l’Assemblée B ».
        </p>

        <ol className="mt-12">
          {LIGNES_COMPARATIF.map((ligne, i) => (
            <li key={ligne.id} className="border-t border-[#e6e7eb] py-10">
              <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
                <div>
                  <p className="text-sm tabular-nums text-[#6b6f7a]">{String(i + 1).padStart(2, "0")}</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">{ligne.titre}</h2>
                </div>
                <div className="grid grid-cols-1 gap-x-8 text-sm font-medium sm:grid-cols-2">
                  <p className="text-[#5f6573]">Le dernier président humain</p>
                  <p className="hidden text-[#9c1f6b] sm:block">La première présidente IA</p>
                </div>
              </div>

              <ul>
                {ligne.variantes.map((v) => (
                  <li key={v.lettre} className="mt-8 grid gap-6 md:grid-cols-[14rem_1fr]">
                    <div className="flex items-baseline gap-3 md:block">
                      <p className="text-4xl font-semibold tracking-[-0.03em]" aria-label={`${ligne.titre}, variante ${v.lettre}`}>
                        {v.lettre}
                      </p>
                      <p className="text-[15px] leading-6 text-[#5f6573] md:mt-1">
                        {v.nom}
                        {v.lettre === "A" ? " (actuelle)" : null}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                      <figure>
                        <div className="grid h-[130px] place-items-center rounded-2xl border border-[#e6e7eb] px-4">
                          <v.humain />
                        </div>
                        <figcaption className="mt-3 text-[15px] leading-6 text-[#5f6573]">{ligne.humain}</figcaption>
                      </figure>
                      <figure>
                        <div className="grid h-[130px] place-items-center rounded-2xl border border-[#e6e7eb] px-4">
                          <v.ia />
                        </div>
                        <figcaption className="mt-3 text-[15px] font-medium leading-6 text-[#9c1f6b]">{ligne.ia}</figcaption>
                      </figure>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-sm text-[#6b6f7a]">
          <Link href="/maquettes" className="underline underline-offset-4">
            Retour aux maquettes
          </Link>
        </p>
      </main>
    </div>
  );
}
