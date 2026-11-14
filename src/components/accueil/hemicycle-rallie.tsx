"use client";

import { useState } from "react";

import { HEMICYCLE_HUMAIN, hemicycleUni, useEtape } from "@/app/maquettes/commun";
import { Hemicycle } from "@/components/hemicycle";
import { SourceBadge } from "@/components/source-badge";
import { Sphere, type Teintes } from "@/components/sphere";
import { PRENOM_DEPUTE_IA } from "@/lib/sphere-mandat";
import type { Provenance } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMouvementReduit } from "./mouvement";
import { LIEN_TEXTE, TITRE_SECTION } from "./titres";

const DUREES = [3200, 4600] as const;
/** En pause, l'étape en cours reste affichée : la prochaine bascule est repoussée de plusieurs semaines. */
const EN_PAUSE = [2_000_000_000, 2_000_000_000] as const;

const ETATS = [HEMICYCLE_HUMAIN, hemicycleUni("machine")];
/** Les deux états du dessin. Les deux lignes restent à l'écran : seule la marque passe de l'une à l'autre. */
const LEGENDES = [
  { annee: "2026", texte: "577 élus, des positions dispersées." },
  { annee: "2050", texte: `577 sièges à la couleur d’${PRENOM_DEPUTE_IA}.` },
] as const;
const DESCRIPTION = `Les 577 sièges de l’Assemblée. Le dessin alterne entre deux états : en 2026, des élus aux positions dispersées ; en 2050, tous les sièges à la couleur d’${PRENOM_DEPUTE_IA}.`;

/** Ce dessin n'est pas un scrutin : la répartition des sièges est imaginaire, et on le dit. */
const ILLUSTRATION: Provenance = {
  editeur: "DemocratIA",
  url: null,
  licence: "Illustration : aucun vote réel n’est représenté",
  date: null,
  nature: "exemple",
};

/**
 * Les élus sont en nuances de gris, pour ne pas faire passer un dessin pour des votes publiés :
 * seule la sphère apporte la couleur.
 */
const GRIS = {
  "--pour": "#262930",
  "--contre": "#9aa0ab",
  "--abstention": "#cdd1d9",
  "--absent": "#eceef2",
  "--pas-siege": "2.6ms",
};

export function HemicycleRallie({ teintes, poids }: { teintes: Teintes; poids?: readonly [number, number, number] }) {
  const [enPause, setEnPause] = useState(false);
  const etape = useEtape(enPause ? EN_PAUSE : DUREES);
  // Sans animation, le dessin reste sur l'hémicycle de 2050 : le bouton de pause n'a plus d'objet.
  const immobile = useMouvementReduit();

  return (
    <section aria-labelledby="titre-hemicycle" className="mt-24 lg:mt-32">
      <div className="grid items-end gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <h2 id="titre-hemicycle" className={TITRE_SECTION}>
          <span className="block text-attenue">577 sièges.</span> <span className="block">Une seule couleur : la vôtre.</span>
        </h2>
        {/*
          Pas d'annonce vocale : une boucle qui parle toutes les quatre secondes couvrirait le reste de
          la page. Les deux légendes sont toujours lisibles, et le dessin porte sa propre description.
        */}
        <ol role="list" className="border-t border-trait text-[15px] leading-6">
          {LEGENDES.map((legende, i) => (
            <li
              key={legende.annee}
              className={cn(
                "flex items-baseline gap-4 border-b border-trait py-2.5 transition-colors duration-300",
                i === etape ? "text-texte" : "text-attenue",
              )}
            >
              <span className="w-10 shrink-0 font-semibold tabular-nums">{legende.annee}</span>
              <span className="flex-1">{legende.texte}</span>
              {/* Rond plein : l'état dessiné en ce moment. La forme le dit, pas seulement la couleur. */}
              <span
                aria-hidden
                className={cn(
                  "size-2 shrink-0 self-center rounded-full border",
                  i === etape ? "border-texte bg-texte" : "border-attenue",
                )}
              />
            </li>
          ))}
        </ol>
      </div>

      <div
        className="relative mx-auto mt-10 max-w-4xl overflow-hidden border-b border-trait [container-type:inline-size]"
        style={{ ...GRIS, "--machine": teintes[1] } as React.CSSProperties}
      >
        <Hemicycle etats={ETATS[etape]} description={DESCRIPTION} className="block w-full" />
        {/* La sphère se tient au creux de l'arc, comme un soleil sur l'horizon. */}
        <div className="absolute left-1/2 w-[25cqw] -translate-x-1/2" style={{ bottom: "-12.5cqw" }}>
          <Sphere teintes={teintes} poids={poids} duree={12} />
        </div>
        {/* Le prénom tient entre la sphère et le premier rang, et ne descend jamais sous 11 px. */}
        <p
          aria-hidden
          className="absolute bottom-[13.4cqw] left-1/2 -translate-x-1/2 text-[length:max(1.5cqw,0.6875rem)] font-semibold leading-none"
        >
          {PRENOM_DEPUTE_IA}
        </p>
      </div>

      <div className="mx-auto mt-3 flex max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <SourceBadge source={ILLUSTRATION} />
        {immobile ? null : (
          <button
            type="button"
            onClick={() => setEnPause((valeur) => !valeur)}
            className={cn(LIEN_TEXTE, "cursor-pointer text-sm text-attenue hover:text-texte")}
          >
            {enPause ? "Relancer l’animation" : "Mettre l’animation en pause"}
          </button>
        )}
      </div>
    </section>
  );
}
