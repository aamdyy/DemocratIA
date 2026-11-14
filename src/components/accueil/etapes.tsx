import Link from "next/link";

import { PRENOM_DEPUTE_IA } from "@/lib/sphere-mandat";
import { cn } from "@/lib/utils";
import { LIEN_TEXTE, TITRE_SECTION } from "./titres";

/** Les trois vues se suivent : on règle le mandat, on audite un élu, puis on entre en séance. */
const ETAPES = [
  {
    rang: 1,
    nom: "Mandat",
    href: "/mandat",
    phrase: `Vous tranchez de vrais textes de loi et vous dites ce qui compte le plus. Chaque réponse règle ${PRENOM_DEPUTE_IA}.`,
    lien: "Régler mon mandat",
  },
  {
    rang: 2,
    nom: "Audit",
    href: "/audit",
    phrase: `Les votes publiés d’un député de 2026 sont placés face à ceux d’${PRENOM_DEPUTE_IA}, texte par texte.`,
    lien: "Auditer un député",
  },
  {
    rang: 3,
    nom: "Séance",
    href: "/seance",
    phrase: `Les 577 sphères votent, et ${PRENOM_DEPUTE_IA} rédige son amendement sous vos yeux.`,
    lien: "Entrer en séance",
  },
] as const;

export function Etapes({ mandatRegle }: { mandatRegle: boolean }) {
  return (
    <section aria-labelledby="titre-etapes" className="mt-24 lg:mt-32">
      <h2 id="titre-etapes" className={TITRE_SECTION}>
        Trois étapes, dans cet ordre.
      </h2>
      <ol role="list" className="mt-10 grid border-t border-trait md:grid-cols-3">
        {ETAPES.map((etape) => (
          <li
            key={etape.href}
            className="flex flex-col border-b border-trait py-7 md:border-b-0 md:border-l md:px-6 md:pb-1 md:first:border-l-0 md:first:pl-0 md:last:pr-0 lg:px-8"
          >
            {/* Même écriture que dans l'en-tête : le rang, puis le nom de l'étape. */}
            <h3 className="flex items-baseline gap-3 text-2xl font-semibold leading-8 tracking-[-0.03em]">
              <span aria-hidden className="tabular-nums text-attenue">
                {etape.rang}
              </span>
              <span>
                <span className="sr-only">Étape {etape.rang} : </span>
                {etape.nom}
              </span>
            </h3>
            <p className="mb-3 mt-3 max-w-[38ch] text-[15px] leading-6 text-attenue">{etape.phrase}</p>
            <Link href={etape.href} className={cn(LIEN_TEXTE, "mt-auto self-start text-[15px] font-medium")}>
              {etape.rang === 1 && mandatRegle ? "Reprendre mon mandat" : etape.lien}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
