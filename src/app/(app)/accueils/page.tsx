import type { Metadata } from "next";
import Link from "next/link";

import { VARIANTES } from "./_composants/variantes";

export const metadata: Metadata = {
  title: "Les quatre accueils",
  robots: { index: false, follow: false },
};

export default function PageAccueils() {
  return (
    <div className="mx-auto max-w-[760px] py-8 sm:py-16">
      <h1 className="text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.04em]">Les quatre accueils.</h1>
      <p className="mt-6 text-lg leading-8 text-attenue">Quatre maquettes cliquables, chacune avec son premier écran.</p>
      <ol className="mt-14 list-none space-y-4" role="list">
        {VARIANTES.map((v) => (
          <li key={v.n}>
            <Link
              href={`/accueils/${v.n}`}
              className="group -mx-5 block rounded-2xl px-5 py-5 transition-colors duration-150 hover:bg-relief focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-texte"
            >
              <span className="text-2xl font-semibold tracking-[-0.03em]">
                {v.n}. {v.titre}
              </span>
              <span className="mt-2 block text-[15px] leading-6 text-attenue">{v.phrase}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
