import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";

import { Embleme } from "@/components/emblemes";
import { SphereVocale } from "@/components/sphere-vocale";
import { CANDIDATES, candidateParId, type Candidate } from "@/lib/candidates";

export const metadata: Metadata = { title: "Emblèmes des IA" };

const police = Public_Sans({ subsets: ["latin"] });

/** Trois orbes seulement : chaque orbe ouvre un contexte WebGL et leur nombre est limité. */
const SUR_ORBE = ["themis", "athena", "demeter"]
  .map((id) => candidateParId(id))
  .filter((c): c is Candidate => c !== null);

function Rangee({ n, titre, idee, children }: { n: number; titre: string; idee: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[#e6e7eb] py-14">
      <p className="text-sm tabular-nums text-[#6b6f7a]">{String(n).padStart(2, "0")}</p>
      <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">{titre}</h2>
      <p className="mt-1 text-[15px] leading-6 text-[#5f6573]">{idee}</p>
      <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-14">{children}</ul>
    </section>
  );
}

function Legende({ c }: { c: Candidate }) {
  return (
    <div className="mt-5">
      <p className="font-semibold tracking-[-0.01em]">{c.prenom}</p>
      <p className="mt-0.5 text-sm leading-5 text-[#5f6573]">{c.doctrine}</p>
    </div>
  );
}

export default function Emblemes() {
  return (
    <div className={`${police.className} min-h-dvh bg-white text-[#111318]`}>
      <main className="mx-auto max-w-[1440px] px-6 py-14 lg:px-12">
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Emblèmes des IA</h1>
        <p className="mt-3 max-w-[64ch] text-lg leading-8 text-[#5f6573]">
          Sept dessins au trait, sur la même grille et avec le même trait, tirés de la mythologie de chaque
          candidate. Survolez-les : un détail s’anime.
        </p>

        <div className="mt-12">
          <Rangee n={1} titre="Noir sur blanc" idee="Le dessin seul, comme un logo.">
            {CANDIDATES.map((c) => (
              <li key={c.id} className="w-40">
                <Embleme id={c.id} className="size-40" />
                <Legende c={c} />
              </li>
            ))}
          </Rangee>

          <Rangee n={2} titre="À la couleur de chaque IA" idee="Le même trait, dans la teinte de la candidate.">
            {CANDIDATES.map((c) => (
              <li key={c.id} className="w-40">
                <Embleme id={c.id} couleur={c.teintes[1]} className="size-40" />
                <Legende c={c} />
              </li>
            ))}
          </Rangee>

          <Rangee n={3} titre="Sur l’orbe" idee="L’orbe vivante et l’emblème en blanc par-dessus : les deux langages réunis.">
            {SUR_ORBE.map((c) => (
              <li key={c.id} className="w-40">
                <div className="relative size-30">
                  <SphereVocale teintes={c.teintes} className="size-30" />
                  <Embleme
                    id={c.id}
                    couleur="#fff"
                    className="pointer-events-none absolute inset-[19%] drop-shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
                  />
                </div>
                <Legende c={c} />
              </li>
            ))}
          </Rangee>
        </div>
      </main>
    </div>
  );
}
