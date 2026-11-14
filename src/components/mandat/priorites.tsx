"use client";

import { mandat, prioriteDe, type Mandat } from "@/lib/mandat";
import { COULEUR_THEME } from "@/lib/sphere-mandat";
import { THEMES, type ThemeId } from "@/lib/themes";

/** Curseur natif, redessiné : un trait d'un pixel, une poignée ronde, 44 px de hauteur pour le doigt. */
const STYLE_CURSEUR = `
.reglage-mandat { -webkit-appearance: none; appearance: none; display: block; width: 100%; height: 44px; margin: 0; background: transparent; cursor: pointer; }
.reglage-mandat::-webkit-slider-runnable-track { height: 2px; background: linear-gradient(to right, var(--c) var(--v), var(--trait) var(--v)); }
.reglage-mandat::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; margin-top: -10px; border-radius: 50%; background: var(--c); border: 4px solid var(--fond); box-shadow: 0 0 0 1px var(--c); }
.reglage-mandat::-moz-range-track { height: 2px; background: var(--trait); }
.reglage-mandat::-moz-range-progress { height: 2px; background: var(--c); }
.reglage-mandat::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--c); border: 4px solid var(--fond); box-shadow: 0 0 0 1px var(--c); }
.reglage-mandat:focus-visible { outline: 2px solid var(--republique); outline-offset: 2px; }
`;

/** Un curseur par thème. Les trois thèmes qui colorent la sphère prennent leur couleur, les autres restent à l'encre. */
export function Priorites({ reglages, dominantes }: { reglages: Mandat; dominantes: ThemeId[] }) {
  return (
    <div className="mt-12 border-t border-trait pt-8">
      <style>{STYLE_CURSEUR}</style>
      <h3 className="font-titre text-xl font-medium">Ses priorités</h3>
      <p className="mt-2 max-w-md text-[15px] leading-6 text-attenue">
        De 0 à 100. Plus un thème pèse, plus les textes de ce thème comptent dans l&apos;accord avec les groupes.
      </p>
      <div className="mt-6 grid gap-x-10 gap-y-2 sm:grid-cols-2">
        {THEMES.map((theme) => (
          <Curseur
            key={theme.id}
            theme={theme.id}
            libelle={theme.libelle}
            valeur={prioriteDe(reglages, theme.id)}
            dominante={dominantes.includes(theme.id)}
          />
        ))}
      </div>
    </div>
  );
}

function Curseur({
  theme,
  libelle,
  valeur,
  dominante,
}: {
  theme: ThemeId;
  libelle: string;
  valeur: number;
  /** Vrai quand ce thème fait partie des trois couleurs de la sphère. */
  dominante: boolean;
}) {
  const champ = `priorite-${theme}`;
  const couleur = COULEUR_THEME[theme];

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[15px] leading-6">
        <label htmlFor={champ} className="flex min-w-0 items-center gap-2 font-medium">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-full border"
            style={{ borderColor: couleur, background: dominante ? couleur : "transparent" }}
          />
          <span className="truncate">{libelle}</span>
        </label>
        <output htmlFor={champ} className="shrink-0 text-sm tabular-nums text-attenue">
          {valeur} sur 100
        </output>
      </div>
      <input
        id={champ}
        type="range"
        min={0}
        max={100}
        step={1}
        value={valeur}
        aria-valuetext={`${valeur} sur 100`}
        onChange={(evenement) => mandat.regler(theme, Number(evenement.target.value))}
        className="reglage-mandat"
        style={{ "--c": dominante ? couleur : "var(--texte)", "--v": `${valeur}%` } as React.CSSProperties}
      />
    </div>
  );
}
