"use client";

import { mandat, prioriteDe, type Mandat } from "@/lib/mandat";
import { COULEUR_THEME } from "@/lib/sphere-mandat";
import { THEMES, type ThemeId } from "@/lib/themes";

/** Curseur natif, redessiné : un trait de 2 pixels, une poignée ronde, 44 px de hauteur pour le doigt. */
const STYLE_CURSEUR = `
.reglage-priorite { -webkit-appearance: none; appearance: none; display: block; width: 100%; height: 44px; margin: 0; background: transparent; cursor: pointer; }
.reglage-priorite::-webkit-slider-runnable-track { height: 2px; background: linear-gradient(to right, var(--c) var(--v), var(--trait) var(--v)); }
.reglage-priorite::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; margin-top: -10px; border-radius: 50%; background: var(--c); border: 4px solid var(--fond); outline: 1px solid var(--c); }
.reglage-priorite::-moz-range-track { height: 2px; background: var(--trait); }
.reglage-priorite::-moz-range-progress { height: 2px; background: var(--c); }
.reglage-priorite::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--c); border: 4px solid var(--fond); outline: 1px solid var(--c); }
.reglage-priorite:focus-visible { outline: 2px solid var(--republique); outline-offset: 2px; }
.reglage-priorite:focus-visible::-webkit-slider-thumb { outline: 2px solid var(--republique); outline-offset: 2px; }
.reglage-priorite:focus-visible::-moz-range-thumb { outline: 2px solid var(--republique); outline-offset: 2px; }
`;

/** Un curseur par thème. Un thème que vous avez déplacé prend sa couleur : c'est elle qui colore la sphère. */
export function Priorites({ reglages }: { reglages: Mandat }) {
  return (
    <div>
      <style>{STYLE_CURSEUR}</style>
      <div className="grid gap-x-12 gap-y-3 sm:grid-cols-2">
        {THEMES.map((theme) => (
          <Curseur
            key={theme.id}
            theme={theme.id}
            libelle={theme.libelle}
            valeur={prioriteDe(reglages, theme.id)}
            touche={reglages.priorites[theme.id] !== undefined}
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
  touche,
}: {
  theme: ThemeId;
  libelle: string;
  valeur: number;
  /** Vrai quand le citoyen a déjà déplacé ce curseur. */
  touche: boolean;
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
            style={{ borderColor: couleur, background: touche ? couleur : "transparent" }}
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
        className="reglage-priorite"
        style={{ "--c": touche ? couleur : "var(--texte)", "--v": `${valeur}%` } as React.CSSProperties}
      />
    </div>
  );
}
