import { Sphere } from "@/components/sphere";
import { TEINTES_MARQUE } from "@/app/_og/marque";

export const BOUTON =
  "inline-flex h-12 items-center justify-center rounded-full bg-texte px-7 text-base font-medium text-fond transition-opacity duration-150 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-republique";
export const LIEN =
  "inline-flex min-h-11 items-center px-3 text-sm text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current";

/** Page de message (introuvable, erreur) : une sphère, un titre, une phrase, une ou deux actions. */
export function MessagePage({
  titre,
  texte,
  children,
}: {
  titre: string;
  texte: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center py-12 text-center sm:py-20">
      <Sphere teintes={TEINTES_MARQUE} duree={14} className="size-24" />
      <h1 className="mt-8 text-balance text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
        {titre}
      </h1>
      <p className="mt-4 max-w-[44ch] text-pretty text-base leading-7 text-attenue">{texte}</p>
      <div className="mt-8 flex flex-col items-center gap-2">{children}</div>
    </section>
  );
}
