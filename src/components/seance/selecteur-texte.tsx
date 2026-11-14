"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { natureTexte, titreCourt, titreEssentiel } from "@/components/candidates/titre";
import { PositionLibelle } from "@/components/position";
import { CASCADE, DOUX, DUREE, RESSORT } from "@/lib/animation";
import { COULEUR_THEME } from "@/lib/sphere-mandat";
import { libelleTheme, themeDe } from "@/lib/themes";
import type { Position, Scrutin } from "@/lib/types";
import { cn } from "@/lib/utils";

const DATE = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const dateDe = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : DATE.format(d);
};

/** Sans accents ni majuscules : « securite » trouve « Sécurité ». */
const normaliser = (texte: string) =>
  texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";

/** Le thème estimé du texte, en pastille : un point de la couleur du thème et son nom. */
function Theme({ titre }: { titre: string }) {
  const theme = themeDe(titre);
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: COULEUR_THEME[theme] }} />
      {libelleTheme(theme)}
    </span>
  );
}

/** « Adopté » ou « Rejeté » : le résultat réel de 2026, en mot et en forme, jamais en couleur seule. */
function Resultat({ resultat }: { resultat: Scrutin["resultat"] }) {
  const adopte = resultat === "adopte";
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-[13px] font-medium whitespace-nowrap",
        adopte ? "bg-texte text-fond" : "border border-dashed border-attenue text-attenue",
      )}
    >
      {adopte ? "Adopté" : "Rejeté"}
    </span>
  );
}

/** La ligne d'informations d'un texte : thème, date, résultat. */
function Meta({ scrutin }: { scrutin: Scrutin }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-5 text-attenue">
      <Theme titre={scrutin.titre} />
      <span aria-hidden className="h-3 w-px bg-trait" />
      <span className="whitespace-nowrap">{dateDe(scrutin.date)}</span>
      <Resultat resultat={scrutin.resultat} />
    </span>
  );
}

/**
 * Le choix du texte examiné : un bouton qui montre le texte choisi, et un panneau qui liste les textes en lignes aérées,
 * ceux que le citoyen a tranchés en tête. Au clavier : flèches pour parcourir, Entrée pour choisir, Échap pour fermer.
 * Le champ de recherche porte le rôle combobox ; la liste porte le rôle listbox.
 */
export function SelecteurTexte({
  textes,
  choisi,
  votes,
  onChoisir,
}: {
  textes: Scrutin[];
  choisi: Scrutin;
  /** Les positions du citoyen, par identifiant de scrutin. */
  votes: Record<string, Position>;
  onChoisir: (id: string) => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [actif, setActif] = useState(0);
  const cadre = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  const champ = useRef<HTMLInputElement>(null);
  const liste = useRef<HTMLDivElement>(null);
  const id = useId();
  const idListe = `${id}-liste`;
  const idOption = (i: number) => `${id}-option-${i}`;

  const { tranches, autres, a_plat } = useMemo(() => {
    const filtre = normaliser(recherche.trim());
    const garde = (s: Scrutin) =>
      !filtre || normaliser(`${s.titre} ${libelleTheme(themeDe(s.titre))} ${dateDe(s.date)}`).includes(filtre);
    const tranches = textes.filter((s) => votes[s.id] && garde(s));
    const autres = textes.filter((s) => !votes[s.id] && garde(s));
    return { tranches, autres, a_plat: [...tranches, ...autres] };
  }, [textes, votes, recherche]);

  const ouvrir = () => {
    setRecherche("");
    const tous = [...textes.filter((s) => votes[s.id]), ...textes.filter((s) => !votes[s.id])];
    setActif(Math.max(0, tous.findIndex((s) => s.id === choisi.id)));
    setOuvert(true);
  };
  const fermer = (rendreLeFocus = true) => {
    setOuvert(false);
    if (rendreLeFocus) bouton.current?.focus();
  };
  const choisir = (s: Scrutin) => {
    onChoisir(s.id);
    fermer();
  };

  // Le focus va dans le champ de recherche à l'ouverture ; sur un petit écran, le panneau entier remonte en vue.
  useEffect(() => {
    if (!ouvert) return;
    champ.current?.focus({ preventScroll: true });
    const minuterie = window.setTimeout(() => {
      const panneau = cadre.current?.querySelector("[role=dialog]");
      if (panneau && panneau.getBoundingClientRect().bottom > window.innerHeight) {
        const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        panneau.scrollIntoView({ block: "end", behavior: reduit ? "auto" : "smooth" });
      }
    }, DUREE.etat * 1000);
    return () => window.clearTimeout(minuterie);
  }, [ouvert]);

  // Un clic hors du panneau le ferme, sans voler le focus de ce qui a été cliqué.
  useEffect(() => {
    if (!ouvert) return;
    const dehors = (evenement: PointerEvent) => {
      if (!cadre.current?.contains(evenement.target as Node)) setOuvert(false);
    };
    document.addEventListener("pointerdown", dehors);
    return () => document.removeEventListener("pointerdown", dehors);
  }, [ouvert]);

  // L'option active reste visible quand on la déplace au clavier.
  useEffect(() => {
    if (!ouvert) return;
    liste.current?.querySelector(`#${CSS.escape(idOption(actif))}`)?.scrollIntoView({ block: "nearest" });
    // idOption ne dépend que de l'identifiant stable du composant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actif, ouvert]);

  const auClavier = (evenement: React.KeyboardEvent) => {
    const dernier = a_plat.length - 1;
    if (evenement.key === "ArrowDown") {
      evenement.preventDefault();
      setActif((i) => Math.min(dernier, i + 1));
    } else if (evenement.key === "ArrowUp") {
      evenement.preventDefault();
      setActif((i) => Math.max(0, i - 1));
    } else if (evenement.key === "Home" && !recherche) {
      evenement.preventDefault();
      setActif(0);
    } else if (evenement.key === "End" && !recherche) {
      evenement.preventDefault();
      setActif(dernier);
    } else if (evenement.key === "Enter") {
      evenement.preventDefault();
      if (a_plat[actif]) choisir(a_plat[actif]);
    } else if (evenement.key === "Escape") {
      evenement.preventDefault();
      fermer();
    } else if (evenement.key === "Tab") {
      fermer(false);
    }
  };

  const option = (scrutin: Scrutin, rang: number) => {
    const estActif = rang === actif;
    const estChoisi = scrutin.id === choisi.id;
    const nature = natureTexte(scrutin.titre);
    return (
      <motion.div
        key={scrutin.id}
        id={idOption(rang)}
        role="option"
        aria-selected={estChoisi}
        title={titreCourt(scrutin.titre)}
        onPointerMove={() => setActif(rang)}
        onClick={() => choisir(scrutin)}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUREE.etat, ease: DOUX, delay: Math.min(rang, 8) * CASCADE * 0.6 }}
        className={cn(
          "relative flex min-h-11 cursor-pointer gap-3 rounded-lg px-3 py-3 transition-colors duration-150",
          estActif ? "bg-relief" : "bg-transparent",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
            estChoisi ? "border-texte bg-texte text-fond" : "border-trait",
          )}
        >
          {estChoisi ? (
            <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 6.3 5 8.6l4.5-5.2" />
            </svg>
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-[15px] leading-6 font-medium text-texte">{titreEssentiel(scrutin.titre)}</span>
          {nature && titreEssentiel(scrutin.titre) !== titreCourt(scrutin.titre) ? (
            <span className="block truncate text-[13px] leading-5 text-attenue">{nature}</span>
          ) : null}
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Meta scrutin={scrutin} />
            {votes[scrutin.id] ? (
              <span className="inline-flex items-center gap-1.5 text-[13px] leading-5 text-attenue">
                Vous : <PositionLibelle position={votes[scrutin.id]} className="font-medium text-texte" />
              </span>
            ) : null}
          </span>
        </span>
      </motion.div>
    );
  };

  const titreGroupe = "px-3 pt-3 pb-1 text-xs font-medium tracking-[0.04em] text-attenue uppercase";

  return (
    <div ref={cadre} className="relative min-w-0 flex-1">
      <p id={`${id}-libelle`} className="text-sm leading-5 text-attenue">
        Texte examiné
      </p>
      <button
        ref={bouton}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={ouvert}
        aria-labelledby={`${id}-libelle ${id}-valeur`}
        onClick={() => (ouvert ? fermer() : ouvrir())}
        onKeyDown={(evenement) => {
          if (!ouvert && (evenement.key === "ArrowDown" || evenement.key === "ArrowUp")) {
            evenement.preventDefault();
            ouvrir();
          }
        }}
        className={cn(
          "group mt-2 flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-trait bg-fond px-4 py-2.5 text-left transition-[border-color,box-shadow] duration-150 hover:border-attenue",
          ouvert && "border-texte",
          FOCUS,
        )}
      >
        <span id={`${id}-valeur`} className="min-w-0 flex-1">
          <span className="block truncate text-[15px] leading-6 font-medium text-texte">{titreEssentiel(choisi.titre)}</span>
          <span className="mt-0.5 block">
            <Meta scrutin={choisi} />
          </span>
        </span>
        <motion.svg
          aria-hidden
          viewBox="0 0 12 12"
          className="size-3.5 shrink-0 text-attenue"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: ouvert ? 180 : 0 }}
          transition={RESSORT}
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {ouvert ? (
          <motion.div
            role="dialog"
            aria-label="Choisir le texte examiné"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: DUREE.micro, ease: DOUX } }}
            transition={RESSORT}
            className="absolute top-full left-0 z-30 mt-2 flex max-h-[min(30rem,70dvh)] w-full origin-top flex-col overflow-hidden rounded-2xl border border-trait bg-fond shadow-[0_12px_40px_-12px_rgb(17_19_24/0.22)] md:w-[min(40rem,calc(100vw-3rem))]"
          >
            <div className="border-b border-trait p-2">
              <label htmlFor={`${id}-recherche`} className="sr-only">
                Chercher un texte
              </label>
              <input
                ref={champ}
                id={`${id}-recherche`}
                type="search"
                role="combobox"
                aria-expanded="true"
                aria-controls={idListe}
                aria-autocomplete="list"
                aria-activedescendant={a_plat[actif] ? idOption(actif) : undefined}
                autoComplete="off"
                spellCheck={false}
                placeholder="Chercher un texte, un thème…"
                value={recherche}
                onChange={(evenement) => {
                  setRecherche(evenement.target.value);
                  setActif(0);
                }}
                onKeyDown={auClavier}
                className="h-11 w-full rounded-lg bg-relief px-3 text-[15px] text-texte placeholder:text-attenue outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-texte"
              />
            </div>
            <div ref={liste} id={idListe} role="listbox" aria-label="Textes de 2026" className="overflow-y-auto overscroll-contain p-1.5">
              {tranches.length > 0 ? (
                <div role="group" aria-labelledby={`${id}-tranches`}>
                  <p id={`${id}-tranches`} role="presentation" className={titreGroupe}>
                    Tranchés par vous
                  </p>
                  {tranches.map((s, i) => option(s, i))}
                </div>
              ) : null}
              {autres.length > 0 ? (
                <div role="group" aria-labelledby={`${id}-autres`}>
                  <p id={`${id}-autres`} role="presentation" className={titreGroupe}>
                    {tranches.length > 0 || textes.some((s) => votes[s.id]) ? "Autres textes de 2026" : "Textes de 2026"}
                  </p>
                  {autres.map((s, i) => option(s, tranches.length + i))}
                </div>
              ) : null}
              {a_plat.length === 0 ? (
                <p className="px-3 py-6 text-center text-[15px] leading-6 text-attenue">Aucun texte ne correspond.</p>
              ) : null}
            </div>
            <p aria-live="polite" className="sr-only">
              {`${a_plat.length} ${a_plat.length > 1 ? "textes" : "texte"}`}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
