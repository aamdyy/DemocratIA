"use client";

import { AnimatePresence, Reorder, motion, useDragControls } from "motion/react";
import { useRef, useState } from "react";

import { BoutonIA } from "@/components/bouton-ia";
import { mandat, type Mandat } from "@/lib/mandat";
import type { Chapitre } from "@/lib/questions/chapitres";
import { POINTS_RANG, THEMES_A_CLASSER, classementValide } from "@/lib/questions/classement";
import { libelleTheme, type ThemeId } from "@/lib/themes";

import { BOUTON_DISCRET, EnteteChapitre, FOCUS, RESSORT, RESSORT_VIF } from "./chapitre";

/**
 * Chapitre « Classez » : six thèmes à ordonner par glisser-déposer (motion Reorder).
 * Au clavier : la poignée de chaque ligne se déplace avec les flèches haut et bas.
 */
export function ChapitreClassement({
  chapitre,
  reglages,
  onAnnonce,
  onFini,
}: {
  chapitre: Chapitre;
  reglages: Mandat;
  onAnnonce: (texte: string) => void;
  onFini: () => void;
}) {
  const [ordre, setOrdre] = useState<ThemeId[]>(() =>
    classementValide(reglages.classement) ? [...reglages.classement] : [...THEMES_A_CLASSER],
  );
  const [bouge, setBouge] = useState(classementValide(reglages.classement));
  const liste = useRef<HTMLOListElement>(null);

  function deplacer(theme: ThemeId, sens: -1 | 1) {
    const i = ordre.indexOf(theme);
    const j = i + sens;
    if (j < 0 || j >= ordre.length) return;
    const suivant = [...ordre];
    [suivant[i], suivant[j]] = [suivant[j], suivant[i]];
    setOrdre(suivant);
    setBouge(true);
    onAnnonce(`${libelleTheme(theme)} : rang ${j + 1} sur ${ordre.length}.`);
    // La poignée garde le focus en suivant sa ligne.
    requestAnimationFrame(() =>
      (liste.current?.querySelector(`[data-poignee="${theme}"]`) as HTMLElement | null)?.focus({ preventScroll: true }),
    );
  }

  return (
    <div>
      <EnteteChapitre chapitre={chapitre} etape={1} total={1} libelleEtape="Étape" onPasser={onFini} />
      <p id="consigne-classement" className="mb-4 text-[15px] text-attenue">
        Du plus important, en haut, au moins important. Glissez les lignes, ou utilisez les flèches sur la poignée.
      </p>
      <Reorder.Group
        ref={liste}
        axis="y"
        values={ordre}
        onReorder={(suivant: ThemeId[]) => {
          setOrdre(suivant);
          setBouge(true);
        }}
        className="space-y-2"
        aria-describedby="consigne-classement"
      >
        {ordre.map((theme, rang) => (
          <Ligne key={theme} theme={theme} rang={rang} total={ordre.length} onDeplacer={deplacer} />
        ))}
      </Reorder.Group>

      <div className="mt-8 flex flex-col items-center gap-1">
        <BoutonIA
          teintes={chapitre.teintes}
          onClick={() => {
            mandat.classer(ordre);
            onAnnonce("Classement enregistré.");
            onFini();
          }}
        >
          Valider cet ordre
        </BoutonIA>
        {bouge ? null : <p className="text-sm text-attenue">L&apos;ordre de départ ne compte pas tant que vous ne le validez pas.</p>}
      </div>
    </div>
  );
}

function Ligne({
  theme,
  rang,
  total,
  onDeplacer,
}: {
  theme: ThemeId;
  rang: number;
  total: number;
  onDeplacer: (theme: ThemeId, sens: -1 | 1) => void;
}) {
  const controles = useDragControls();
  const [tenu, setTenu] = useState(false);
  const libelle = libelleTheme(theme);
  const points = POINTS_RANG[rang];

  return (
    <Reorder.Item
      value={theme}
      dragListener={false}
      dragControls={controles}
      onDragStart={() => setTenu(true)}
      onDragEnd={() => setTenu(false)}
      transition={RESSORT}
      whileDrag={{ scale: 1.03, boxShadow: "0 12px 32px rgb(17 19 24 / 0.14)" }}
      className="relative flex items-center gap-3 rounded-2xl border border-trait bg-surface py-1.5 pl-1.5 pr-4"
      style={{ zIndex: tenu ? 10 : 0 }}
    >
      <button
        type="button"
        data-poignee={theme}
        aria-label={`${libelle}, rang ${rang + 1} sur ${total}. Flèches haut et bas pour déplacer.`}
        aria-keyshortcuts="ArrowUp ArrowDown"
        onPointerDown={(e) => {
          e.preventDefault();
          controles.start(e);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") onDeplacer(theme, -1);
          else if (e.key === "ArrowDown") onDeplacer(theme, 1);
          else return;
          e.preventDefault();
        }}
        className={`flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-xl text-attenue hover:bg-relief hover:text-texte active:cursor-grabbing ${FOCUS}`}
      >
        <svg aria-hidden viewBox="0 0 16 16" className="size-5" fill="currentColor">
          {[4, 8, 12].flatMap((y) => [5.5, 10.5].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.25" />))}
        </svg>
      </button>
      <span aria-hidden className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-relief text-sm font-semibold tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={rang}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={RESSORT_VIF}
          >
            {rang + 1}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="min-w-0 flex-1 truncate text-base font-medium">{libelle}</span>
      <span className="shrink-0 text-sm tabular-nums text-attenue" title="Effet sur la priorité du thème">
        {points > 0 ? `+${points}` : `−${Math.abs(points)}`}
      </span>
      <span className="sr-only">points de priorité</span>
      <div className="hidden shrink-0 sm:flex">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          disabled={rang === 0}
          onClick={() => onDeplacer(theme, -1)}
          className={`${BOUTON_DISCRET} no-underline`}
        >
          ↑
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          disabled={rang === total - 1}
          onClick={() => onDeplacer(theme, 1)}
          className={`${BOUTON_DISCRET} -mr-3 no-underline`}
        >
          ↓
        </button>
      </div>
    </Reorder.Item>
  );
}
