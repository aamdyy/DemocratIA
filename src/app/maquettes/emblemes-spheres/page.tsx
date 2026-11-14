"use client";

import { Public_Sans } from "next/font/google";

import { Embleme } from "@/components/emblemes";
import { EmblemeVariante, LEGENDES_A, VARIANTES, type Lettre } from "@/components/emblemes-variantes";
import { Sphere } from "@/components/sphere";
import { CANDIDATES, type Candidate } from "@/lib/candidates";

const police = Public_Sans({ subsets: ["latin"] });

const NOIR = "#111318";

/*
 * Lisibilité du noir sur les zones sombres de la matière : un voile blanc très doux éclaircit le cœur
 * de la sphère, et un halo blanc à peine visible détache le trait.
 */
const VOILE = "radial-gradient(circle at 50% 50%, rgb(255 255 255 / 0.42) 0%, rgb(255 255 255 / 0.18) 38%, transparent 64%)";
const HALO = "drop-shadow(0 0 1px rgb(255 255 255 / 0.75)) drop-shadow(0 0 5px rgb(255 255 255 / 0.4))";

function Proposition({ c, lettre }: { c: Candidate; lettre: "A" | Lettre }) {
  const legende = lettre === "A" ? LEGENDES_A[c.id] : VARIANTES[c.id][lettre].legende;
  return (
    <li className="flex w-[220px] flex-col items-center">
      <Sphere
        teintes={c.teintes}
        description={`Emblème de ${c.prenom}, proposition ${lettre} : ${legende}`}
        className="w-[220px]"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: VOILE }} />
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="pointer-events-auto w-1/2" style={{ filter: HALO }}>
            {lettre === "A" ? (
              <Embleme id={c.id} couleur={NOIR} className="w-full" />
            ) : (
              <EmblemeVariante id={c.id} lettre={lettre} couleur={NOIR} className="w-full" />
            )}
          </div>
        </div>
      </Sphere>
      <p className="mt-5 text-[15px] leading-6">
        <span className="font-semibold">{lettre}</span>, {legende}
      </p>
    </li>
  );
}

export default function EmblemesSpheres() {
  return (
    <div className={`${police.className} min-h-dvh bg-white text-[#111318]`}>
      <main className="mx-auto max-w-[1200px] px-6 py-16 lg:px-12">
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Emblèmes sur les sphères</h1>
        <p className="mt-3 max-w-[64ch] text-lg leading-8 text-[#5f6573]">
          Trois emblèmes noirs pour chaque IA, posés sur sa sphère : A est le dessin actuel, B et C sont deux
          nouvelles pistes. Répondez par exemple « Thémis B, Athéna A ».
        </p>

        <div className="mt-14">
          {CANDIDATES.map((c) => (
            <section
              key={c.id}
              aria-labelledby={`titre-${c.id}`}
              className="grid gap-8 border-t border-[#e6e7eb] py-14 lg:grid-cols-[13rem_1fr]"
            >
              <div>
                <h2 id={`titre-${c.id}`} className="text-xl font-semibold tracking-[-0.02em]">
                  {c.prenom}
                </h2>
                <p className="mt-1 text-[15px] leading-6 text-[#5f6573]">{c.doctrine}</p>
              </div>
              <ul className="flex flex-wrap gap-x-12 gap-y-10">
                {(["A", "B", "C"] as const).map((lettre) => (
                  <Proposition key={lettre} c={c} lettre={lettre} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
