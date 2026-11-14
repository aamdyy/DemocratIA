"use client";

import { AnimatePresence, animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

import { useEtapeVue, useMouvementReduit } from "@/components/accueil/hooks";
import { PositionLibelle } from "@/components/position";
import { SourceBadge } from "@/components/source-badge";
import { Element, Reveal, Serie } from "@/components/accueil/reveal";
import { CASCADE, DOUX, RESSORT } from "@/lib/animation";
import { CANDIDATES } from "@/lib/candidates";
import { LIBELLE_POSITION } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EnTete, SOURCE_EXEMPLE } from "./commun";

const FOND_SCHEMA = "rounded-3xl bg-relief p-6 sm:p-8";
const OMBRE_CARTE = "shadow-[0_10px_34px_rgb(17_19_24/0.08)]";
/** Un ressort sans rebond, un peu plus lent que RESSORT, pour les barres qui se remplissent. */
const RESSORT_BARRE = { type: "spring", visualDuration: 0.8, bounce: 0 } as const;

/** Une étape numérotée : son numéro, son titre, une phrase, et son schéma animé. */
function Etape({
  rang,
  titre,
  phrase,
  children,
}: {
  rang: number;
  titre: string;
  phrase: string;
  children: React.ReactNode;
}) {
  return (
    <li className="grid items-center gap-x-20 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
      {/* Le numéro, le titre, la phrase, puis le schéma : l'étape se lit dans l'ordre où elle apparaît. */}
      <Serie>
        <Element as="p" className="text-[clamp(3.5rem,7vw,5.5rem)] font-semibold leading-none tracking-[-0.05em] tabular-nums">
          <span aria-hidden>{rang}</span>
        </Element>
        <Element>
          <h3 className="mt-5 text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
            <span className="sr-only">Étape {rang} sur 3 : </span>
            {titre}
          </h3>
        </Element>
        <Element as="p" className="mt-4 max-w-[28rem] text-lg leading-8 text-attenue">
          {phrase}
        </Element>
      </Serie>
      <Reveal delai={CASCADE * 3} className={FOND_SCHEMA}>
        {children}
      </Reveal>
    </li>
  );
}

/** Vrai tant que le schéma est à l'écran : sa boucle se met en pause quand on l'a dépassé. */
function useALecran(ref: React.RefObject<HTMLElement | null>) {
  return useInView(ref, { amount: 0.45 });
}

/* ---------- Étape 1 : une pile de cartes de loi, tranchées l'une après l'autre ---------- */

type Reponse = "pour" | "contre" | "abstention";

/** Trois intitulés fictifs : chaque carte reçoit une réponse différente, pour montrer les trois gestes. */
const LOIS: readonly { titre: string; theme: string; reponse: Reponse }[] = [
  { titre: "Plafonner les loyers en zone tendue", theme: "Logement", reponse: "pour" },
  { titre: "Rendre la cantine gratuite à l'école primaire", theme: "Éducation", reponse: "contre" },
  { titre: "Taxer le kérosène des vols intérieurs", theme: "Transports", reponse: "abstention" },
];

/** Pour chaque carte : un temps de lecture, puis le choix (le bouton s'allume, la carte penche), puis elle part. */
const RYTHME_CARTES = [1500, 800, 1500, 800, 1500, 800] as const;

const DEVANT = { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 };
const DERRIERE = { x: 0, y: 18, scale: 0.93, rotate: 0, opacity: 0.55 };
const PENCHE: Record<Reponse, { x?: number; y?: number; rotate?: number }> = {
  pour: { x: 16, rotate: 3 },
  contre: { x: -16, rotate: -3 },
  abstention: { y: 10 },
};
/** Les mêmes gestes que dans le test : à droite pour, à gauche contre, vers le bas abstention. */
const SORTIES: Record<Reponse, { x?: number; y?: number; rotate?: number; opacity: number }> = {
  pour: { x: 240, rotate: 14, opacity: 0 },
  contre: { x: -240, rotate: -14, opacity: 0 },
  abstention: { y: 150, opacity: 0 },
};
const BOUTON_ALLUME: Record<Reponse, string> = {
  pour: "bg-pour text-fond",
  contre: "bg-contre text-fond",
  abstention: "bg-abstention text-texte",
};
const PASTILLE: Record<Reponse, string> = {
  pour: "bg-pour",
  contre: "bg-contre",
  abstention: "bg-abstention",
};

function SchemaCarte() {
  const racine = useRef<HTMLDivElement>(null);
  const etape = useEtapeVue(RYTHME_CARTES, useALecran(racine), 1);
  const courante = Math.floor(etape / 2);
  const choix = etape % 2 === 1;
  const loi = LOIS[courante];
  const suivante = (courante + 1) % LOIS.length;

  return (
    <div
      ref={racine}
      role="img"
      aria-label="Exemple fictif : une pile de propositions de loi. La première carte glisse à droite quand le bouton Pour s'allume, la suivante glisse à gauche pour Contre, la troisième descend pour Abstention, et une nouvelle carte arrive à chaque fois."
    >
      <p className="text-sm text-attenue">Exemple fictif</p>
      {/* overflow-x-clip : la carte qui part sort du cadre gris sans élargir la page. */}
      <div className="relative mt-4 h-[14.5rem] overflow-x-clip [overflow-clip-margin:2rem]">
        <AnimatePresence initial={false}>
          {[suivante, courante].map((i) => {
            const devant = i === courante;
            const carte = LOIS[i];
            return (
              <motion.div
                key={i}
                className={cn(
                  "absolute inset-x-0 top-0 mx-auto flex h-[12.5rem] w-full max-w-[20rem] flex-col rounded-2xl bg-fond p-6",
                  OMBRE_CARTE,
                )}
                style={{ zIndex: devant ? 2 : 1 }}
                initial={{ ...DERRIERE, y: 34, scale: 0.86, opacity: 0 }}
                animate={devant ? { ...DEVANT, ...(choix ? PENCHE[carte.reponse] : {}) } : DERRIERE}
                exit={SORTIES[carte.reponse]}
                transition={{ ...RESSORT, opacity: { duration: 0.35, ease: DOUX } }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-attenue">Proposition de loi</p>
                  <motion.span
                    className="rounded-full bg-relief px-2.5 py-1 text-xs font-medium"
                    initial={false}
                    animate={{ opacity: devant && choix ? 1 : 0, scale: devant && choix ? 1 : 0.85 }}
                    transition={{ duration: 0.25, ease: DOUX }}
                  >
                    <PositionLibelle position={carte.reponse} />
                  </motion.span>
                </div>
                <p className="mt-4 text-balance text-xl font-semibold leading-tight tracking-[-0.02em]">{carte.titre}</p>
                <p className="mt-auto font-donnee text-sm text-machine">Thème estimé : {carte.theme}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="mx-auto grid max-w-[20rem] grid-cols-3 gap-2">
        {(["contre", "abstention", "pour"] as const).map((position) => {
          const allume = choix && loi.reponse === position;
          return (
            <motion.span
              key={position}
              className={cn(
                "flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors duration-200 ease-out",
                allume ? BOUTON_ALLUME[position] : "bg-fond text-texte",
              )}
              initial={false}
              animate={{ scale: allume ? [1, 0.93, 1] : 1 }}
              transition={{ duration: 0.4, ease: DOUX }}
            >
              <span className={cn("size-2.5 shrink-0 rounded-full", allume ? "bg-current" : PASTILLE[position])} />
              {LIBELLE_POSITION[position]}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Étape 2 : les affinités se remplissent, puis se réordonnent à chaque réponse ---------- */

type Affinites = Record<"hygie" | "athena" | "gaia" | "plutus" | "themis", number>;

/** Quatre réponses d'exemple : à chacune, les affinités bougent et le classement se refait. Valeurs fictives. */
const REPONSES: readonly { reponse: Reponse; valeurs: Affinites }[] = [
  { reponse: "pour", valeurs: { athena: 58, hygie: 46, gaia: 40, plutus: 31, themis: 22 } },
  { reponse: "contre", valeurs: { hygie: 63, athena: 57, gaia: 49, plutus: 30, themis: 24 } },
  { reponse: "pour", valeurs: { hygie: 71, gaia: 64, athena: 55, plutus: 35, themis: 29 } },
  { reponse: "abstention", valeurs: { hygie: 84, athena: 67, gaia: 55, plutus: 38, themis: 26 } },
];
/** Une réponse toutes les 1,7 s, une pause sur le résultat, puis les barres se vident et tout recommence. */
const RYTHME_AFFINITES = [1700, 1700, 1700, 2600, 700] as const;
const ZERO: Affinites = { hygie: 0, athena: 0, gaia: 0, plutus: 0, themis: 0 };

/** Un pourcentage qui glisse d'une valeur à l'autre. Décoratif : la valeur est dite dans l'étiquette du schéma. */
function Pourcentage({ valeur }: { valeur: number }) {
  const courant = useMotionValue(valeur);
  const texte = useTransform(courant, (v) => `${Math.round(v)} %`);
  const reduit = useMouvementReduit();
  useEffect(() => {
    if (reduit) {
      courant.set(valeur);
      return;
    }
    const lecture = animate(courant, valeur, { duration: 0.8, ease: DOUX });
    return () => lecture.stop();
  }, [valeur, courant, reduit]);
  return <motion.span className="text-right text-[15px] tabular-nums text-attenue">{texte}</motion.span>;
}

function SchemaAffinites() {
  const racine = useRef<HTMLDivElement>(null);
  const etape = useEtapeVue(RYTHME_AFFINITES, useALecran(racine), 3);
  const lumiere = useId();
  const vide = etape >= REPONSES.length;
  const enCours = REPONSES[Math.min(etape, REPONSES.length - 1)];
  const valeurs = vide ? ZERO : enCours.valeurs;
  // Pendant que les barres se vident, l'ordre ne bouge pas : on garde celui de la dernière réponse.
  const ordre = (Object.keys(ZERO) as (keyof Affinites)[]).sort((a, b) => enCours.valeurs[b] - enCours.valeurs[a]);

  return (
    <div
      ref={racine}
      role="img"
      aria-label="Exemple fictif : à chaque nouvelle réponse, les barres d'affinité des candidates se remplissent puis se réordonnent ; Hygie finit en tête avec 84 %, devant Athéna, Gaïa, Plutus et Thémis."
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-attenue">Exemple fictif</p>
        <div className="relative h-7 min-w-[9.5rem] overflow-hidden text-right">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={vide ? "vide" : etape}
              className="absolute right-0 top-0 inline-flex h-7 items-center gap-2 whitespace-nowrap rounded-full bg-fond px-3 text-xs font-medium"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: vide ? 0 : 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.35, ease: DOUX }}
            >
              <span className="text-attenue">Réponse {Math.min(etape, REPONSES.length - 1) + 1}</span>
              <PositionLibelle position={enCours.reponse} />
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <ul className="mt-5 space-y-1">
        {ordre.map((id, rang) => {
          const c = CANDIDATES.find((x) => x.id === id);
          if (!c) return null;
          const premier = rang === 0 && !vide;
          const valeur = valeurs[id];
          return (
            <motion.li key={id} layout="position" transition={RESSORT} className="relative rounded-xl px-3 py-2.5">
              {premier ? (
                <motion.span
                  layoutId={lumiere}
                  aria-hidden
                  className={cn("absolute inset-0 rounded-xl bg-fond", OMBRE_CARTE)}
                  transition={RESSORT}
                />
              ) : null}
              <span className="relative grid grid-cols-[4.75rem_minmax(0,1fr)_3rem] items-center gap-x-3">
                <span className={cn("flex items-center gap-2 text-[15px] transition-[font-weight] duration-300", premier ? "font-semibold" : "font-medium")}>
                  <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: c.teintes[1] }} />
                  {c.prenom}
                </span>
                <span className="block h-2.5 overflow-hidden rounded-full bg-trait/70">
                  <motion.span
                    className="block h-full w-full origin-left rounded-full"
                    style={{ background: c.teintes[1] }}
                    initial={{ scaleX: 0, opacity: 0.5 }}
                    animate={{ scaleX: valeur / 100, opacity: premier ? 1 : 0.5 }}
                    transition={{ ...RESSORT_BARRE, opacity: { duration: 0.4, ease: DOUX } }}
                  />
                </span>
                <Pourcentage valeur={valeur} />
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- Étape 3 : un amendement s'écrit, puis on le dépose ---------- */

const AMENDEMENT =
  "Article 2. Dans les zones tendues, le loyer d'un logement ne peut pas augmenter de plus de 3 % par an.";

type Redaction = { n: number; phase: "frappe" | "depose" | "efface" };

/**
 * La boucle de l'amendement : il s'écrit lettre à lettre, le tampon « Déposé » s'imprime, une pause,
 * puis la feuille s'efface et tout recommence. Sans animation, le texte et le tampon sont là d'emblée.
 */
function useRedaction(longueur: number, actif: boolean): Redaction {
  const reduit = useMouvementReduit();
  const [etat, setEtat] = useState<Redaction>({ n: 0, phase: "frappe" });
  useEffect(() => {
    if (!actif || reduit) return;
    let delai: number;
    let suivant: Redaction;
    if (etat.phase === "frappe") {
      if (etat.n < longueur) {
        delai = etat.n === 0 ? 500 : 30;
        suivant = { n: etat.n + 1, phase: "frappe" };
      } else {
        delai = 350;
        suivant = { n: longueur, phase: "depose" };
      }
    } else if (etat.phase === "depose") {
      delai = 2400;
      suivant = { n: longueur, phase: "efface" };
    } else {
      delai = 450;
      suivant = { n: 0, phase: "frappe" };
    }
    const minuterie = setTimeout(() => setEtat(suivant), delai);
    return () => clearTimeout(minuterie);
  }, [etat, actif, reduit, longueur]);
  return reduit ? { n: longueur, phase: "depose" } : etat;
}

function SchemaAmendement() {
  const racine = useRef<HTMLDivElement>(null);
  const { n, phase } = useRedaction(AMENDEMENT.length, useALecran(racine));
  const depose = phase === "depose";
  return (
    <div
      ref={racine}
      role="img"
      aria-label={`Exemple fictif : Hygie rédige un amendement, qui s'écrit lettre à lettre, puis un tampon « Déposé » s'imprime sur la feuille. Texte de l'amendement : ${AMENDEMENT}`}
    >
      <p className="text-sm text-attenue">Exemple fictif</p>
      <motion.div
        className={cn("relative mt-4 rounded-2xl bg-fond p-6 pb-16", OMBRE_CARTE)}
        initial={false}
        animate={{ scale: depose ? [1, 0.985, 1] : 1 }}
        transition={{ duration: 0.3, ease: DOUX }}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Amendement rédigé par Hygie</p>
          <p className="font-donnee text-xs text-attenue">n° 1</p>
        </div>
        <p className="mt-1 text-sm text-attenue">Sur : Plafonner les loyers en zone tendue</p>
        <div className="mt-4 h-px bg-trait" />
        <motion.p
          className="relative mt-4 font-donnee text-[15px] leading-7 text-machine"
          initial={false}
          animate={{ opacity: phase === "efface" ? 0 : 1 }}
          transition={{ duration: 0.4, ease: DOUX }}
        >
          <span className="invisible">{AMENDEMENT}</span>
          <span className="absolute inset-0">
            {AMENDEMENT.slice(0, n)}
            {depose ? null : (
              <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[3px] bg-machine motion-safe:animate-pulse" />
            )}
          </span>
        </motion.p>
        <AnimatePresence>
          {depose ? (
            <motion.span
              key="tampon"
              className="absolute bottom-5 right-6 rounded-lg border-2 border-machine px-3 py-1 text-sm font-semibold uppercase tracking-[0.14em] text-machine"
              initial={{ opacity: 0, scale: 1.7, rotate: -16 }}
              animate={{ opacity: 1, scale: 1, rotate: -7 }}
              exit={{ opacity: 0, transition: { duration: 0.35, ease: DOUX } }}
              transition={{ type: "spring", visualDuration: 0.28, bounce: 0 }}
            >
              Déposé
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/** Variante 1 : trois étapes, parce que c'est une vraie séquence. */
export function Recit() {
  return (
    <section aria-labelledby="titre-recit" className="mx-auto max-w-[1120px]">
      <EnTete id="titre-recit" titre="Trois temps pour trouver votre IA." phrase="Quelques minutes suffisent, sur de vrais textes de loi." />
      <ol className="mt-20 list-none space-y-24 sm:space-y-32" role="list">
        <Etape rang={1} titre="Tranchez de vrais textes" phrase="Pour, contre ou abstention : une carte, un texte, une réponse.">
          <SchemaCarte />
        </Etape>
        <Etape rang={2} titre="Découvrez votre IA" phrase="Chaque réponse rapproche l'une des sept candidates de vous.">
          <SchemaAffinites />
        </Etape>
        <Etape rang={3} titre="Elle gouverne" phrase="Elle tranche à votre place et rédige ses amendements en direct.">
          <SchemaAmendement />
        </Etape>
      </ol>
      <SourceBadge source={SOURCE_EXEMPLE} className="mt-16" />
    </section>
  );
}
