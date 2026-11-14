"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

import { BoutonIA } from "@/components/bouton-ia";
import { mandat, type Mandat } from "@/lib/mandat";
import { AFFIRMATIONS, CRANS, libelleCran } from "@/lib/questions/accords";
import type { Chapitre } from "@/lib/questions/chapitres";

import { BOUTON_DISCRET, CADRE, EnteteChapitre, FOCUS, FinChapitre, RESSORT, RESSORT_VIF, TITRE_CARTE } from "./chapitre";

/** Couleur de la pastille par cran : rouge (pas du tout) → gris (sans avis) → bleu (tout à fait). Le libellé et le signe disent la même chose. */
const COULEUR_CRAN: Record<number, string> = {
  [-2]: "#e1000f",
  [-1]: "#ec6a73",
  0: "#aab0bd",
  1: "#6a84e6",
  2: "#1d3fd8",
};
const SIGNE_CRAN: Record<number, string> = { [-2]: "−−", [-1]: "−", 0: "=", 1: "+", 2: "++" };

/** Chapitre « D'accord ou pas » : une affirmation à la fois, un curseur à cinq crans. */
export function ChapitreAccords({
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
  const [indice, setIndice] = useState(() => {
    const i = AFFIRMATIONS.findIndex((a) => reglages.accords?.[a.id] === undefined);
    return i < 0 ? AFFIRMATIONS.length : i;
  });
  const [brouillons, setBrouillons] = useState<Record<string, number>>({});
  const [sens, setSens] = useState(1);

  const affirmation = AFFIRMATIONS[indice] ?? null;
  const valeur = affirmation ? (brouillons[affirmation.id] ?? reglages.accords?.[affirmation.id] ?? null) : null;

  function aller(vers: number) {
    setSens(vers >= indice ? 1 : -1);
    setIndice(vers);
    const suivante = AFFIRMATIONS[vers];
    onAnnonce(suivante ? `Affirmation ${vers + 1} sur ${AFFIRMATIONS.length} : ${suivante.texte}` : "Les affirmations sont terminées.");
  }

  function valider() {
    if (!affirmation) return;
    mandat.accorder(affirmation.id, valeur ?? 0);
    aller(indice + 1);
  }

  return (
    <div>
      <EnteteChapitre
        chapitre={chapitre}
        etape={indice + 1}
        total={AFFIRMATIONS.length}
        libelleEtape="Affirmation"
        onPasser={onFini}
      />
      {affirmation ? (
        <>
          <div className="grid overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={sens}>
              <motion.div
                key={affirmation.id}
                custom={sens}
                className={`${CADRE} col-start-1 row-start-1 min-h-[19rem]`}
                variants={{
                  entree: (s: number) => ({ opacity: 0, x: 48 * s }),
                  posee: { opacity: 1, x: 0, transition: RESSORT },
                  sortie: (s: number) => ({ opacity: 0, x: -48 * s, transition: RESSORT_VIF }),
                }}
                initial="entree"
                animate="posee"
                exit="sortie"
              >
                <p aria-hidden className="font-titre text-5xl leading-none text-trait">«</p>
                <p id={`affirmation-${affirmation.id}`} className={`-mt-2 ${TITRE_CARTE}`}>
                  {affirmation.texte}
                </p>
                <div className="mt-auto pt-8">
                  <Curseur
                    valeur={valeur}
                    idEtiquette={`affirmation-${affirmation.id}`}
                    onChange={(v) => setBrouillons((b) => ({ ...b, [affirmation.id]: v }))}
                    onValider={valider}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-6 flex flex-col items-center">
            <BoutonIA onClick={valider} teintes={chapitre.teintes}>
              {valeur === null ? "Valider : sans avis" : `Valider : ${libelleCran(valeur).toLowerCase()}`}
            </BoutonIA>
          </div>
          <div className="mt-2 flex items-center justify-between gap-4">
            <button type="button" onClick={() => aller(indice - 1)} disabled={indice === 0} className={`-ml-3 ${BOUTON_DISCRET}`}>
              Revenir
            </button>
            <button type="button" onClick={() => aller(indice + 1)} className={`-mr-3 ${BOUTON_DISCRET}`}>
              Passer
            </button>
          </div>
        </>
      ) : (
        <FinChapitre titre="Vos avis sont enregistrés." teintes={chapitre.teintes} onSuite={onFini}>
          <p className="mt-3 text-[15px] text-attenue">
            {AFFIRMATIONS.filter((a) => reglages.accords?.[a.id] !== undefined).length} affirmations sur {AFFIRMATIONS.length}.
          </p>
          <button type="button" onClick={() => aller(0)} className={`-ml-3 mt-2 self-start ${BOUTON_DISCRET}`}>
            Revoir mes réponses
          </button>
        </FinChapitre>
      )}
    </div>
  );
}

/**
 * Le curseur à cinq crans. La pastille glisse d'un cran à l'autre, change de taille (plus grosse aux extrêmes)
 * et de couleur ; son signe (−−, −, =, +, ++) et le libellé au-dessus disent la même chose sans la couleur.
 * Clavier : flèches, Début, Fin ; Entrée valide.
 */
function Curseur({
  valeur,
  idEtiquette,
  onChange,
  onValider,
}: {
  valeur: number | null;
  idEtiquette: string;
  onChange: (valeur: number) => void;
  onValider: () => void;
}) {
  const piste = useRef<HTMLDivElement>(null);
  const v = valeur ?? 0;
  const touche = valeur !== null;

  function depuisPointeur(clientX: number) {
    const r = piste.current?.getBoundingClientRect();
    if (!r) return;
    const part = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const cran = Math.round(part * 4) - 2;
    if (cran !== valeur) onChange(cran);
  }

  function surTouche(e: React.KeyboardEvent) {
    const pas: Record<string, number> = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 };
    if (e.key in pas) onChange(Math.max(-2, Math.min(2, v + pas[e.key])));
    else if (e.key === "Home") onChange(-2);
    else if (e.key === "End") onChange(2);
    else if (e.key === "Enter") onValider();
    else return;
    e.preventDefault();
  }

  const echelle = touche ? 0.72 + Math.abs(v) * 0.14 : 0.62;

  return (
    <div>
      <p aria-hidden className="relative h-7 text-center text-lg font-semibold tracking-[-0.01em]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={touche ? v : "vide"}
            className={`inline-block ${touche ? "" : "font-normal text-attenue"}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={RESSORT_VIF}
          >
            {touche ? libelleCran(v) : "Glissez ou choisissez un cran"}
          </motion.span>
        </AnimatePresence>
      </p>

      <div
        ref={piste}
        className="relative mx-5 mt-3 h-14 cursor-pointer touch-pan-y select-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          depuisPointeur(e.clientX);
          // Le clavier suit la souris : la pastille prend le focus.
          (e.currentTarget.querySelector("[role=slider]") as HTMLElement | null)?.focus({ preventScroll: true });
          e.preventDefault();
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1 && e.currentTarget.hasPointerCapture(e.pointerId)) depuisPointeur(e.clientX);
        }}
      >
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-trait" />
        {/* Le trait coloré part du centre vers la pastille. */}
        <motion.span
          aria-hidden
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
          initial={false}
          animate={{
            left: `${Math.min(50, (v + 2) * 25)}%`,
            width: `${Math.abs(v) * 25}%`,
            backgroundColor: COULEUR_CRAN[v],
          }}
          transition={RESSORT}
        />
        {CRANS.map((c) => (
          <span
            key={c.valeur}
            aria-hidden
            className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-trait"
            style={{ left: `${(c.valeur + 2) * 25}%` }}
          />
        ))}
        <motion.div
          role="slider"
          tabIndex={0}
          aria-labelledby={idEtiquette}
          aria-valuemin={-2}
          aria-valuemax={2}
          aria-valuenow={v}
          aria-valuetext={touche ? libelleCran(v) : "Sans avis, pas encore réglé"}
          onKeyDown={surTouche}
          className={`absolute top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${FOCUS}`}
          initial={false}
          animate={{ left: `${(v + 2) * 25}%` }}
          transition={RESSORT}
        >
          <motion.span
            aria-hidden
            className={`flex size-full items-center justify-center rounded-full text-sm font-semibold text-white shadow-[0_2px_10px_rgb(17_19_24/0.18)] ${
              touche ? "" : "border-2 border-dashed border-attenue bg-surface! text-attenue!"
            }`}
            initial={false}
            animate={{ scale: echelle, backgroundColor: COULEUR_CRAN[v] }}
            transition={RESSORT}
          >
            {SIGNE_CRAN[v]}
          </motion.span>
        </motion.div>
      </div>

      <div className="mt-1 flex justify-between text-sm text-attenue">
        <button type="button" onClick={() => onChange(-2)} className={`-ml-1 min-h-11 px-1 ${FOCUS}`} tabIndex={-1}>
          Pas du tout
        </button>
        <button type="button" onClick={() => onChange(2)} className={`-mr-1 min-h-11 px-1 ${FOCUS}`} tabIndex={-1}>
          Tout à fait
        </button>
      </div>
    </div>
  );
}
