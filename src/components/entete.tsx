"use client";

import { AnimatePresence, motion } from "motion/react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";

import { useMaSphere } from "@/components/accueil/ma-sphere";
import { Hemicycle, NOMBRE_SIEGES, type EtatSiege } from "@/components/hemicycle";
import { Logo } from "@/components/logo";
import { Sphere } from "@/components/sphere";
import { DOUX, DUREE, RESSORT } from "@/lib/animation";
import { useEtat } from "@/lib/api";
import { CANDIDATES } from "@/lib/candidates";
import { cn } from "@/lib/utils";

const SIEGES_MACHINE: EtatSiege[] = Array.from({ length: NOMBRE_SIEGES }, () => "machine");

/** Aperçu du test : une carte de loi inclinée et ses trois réponses. */
function ApercuTest() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="w-40 -rotate-3 rounded-md border border-trait bg-fond px-3 py-2.5 text-left">
        <p className="text-[10px] text-attenue">Projet de loi</p>
        <p className="mt-0.5 text-[12px] font-medium leading-4">Sobriété énergétique des bâtiments publics</p>
      </div>
      <div className="flex gap-1.5" aria-hidden>
        {["bg-contre", "bg-abstention", "bg-pour"].map((c) => (
          <span key={c} className="flex h-5 w-12 items-center justify-center rounded-full border border-trait bg-fond">
            <span className={cn("size-1.5 rounded-full", c)} />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Aperçu des candidates : les sept sphères. */
function ApercuCandidates() {
  return (
    <div className="flex h-full items-center justify-center gap-1.5">
      {CANDIDATES.map((c, i) => (
        <Sphere key={c.id} teintes={c.teintes} duree={10 + i * 2} className={i === 3 ? "size-10" : "size-7"} />
      ))}
    </div>
  );
}

/** Aperçu du pouvoir : l'hémicycle entier à la couleur de l'IA. */
function ApercuPouvoir({ couleur }: { couleur: string }) {
  return (
    <div className="flex h-full items-end justify-center px-3 pt-3 pb-2" style={{ "--machine": couleur } as React.CSSProperties}>
      <Hemicycle etats={SIEGES_MACHINE} description="" className="h-full w-auto" />
    </div>
  );
}

/** Aperçu de la page Honnêteté : les trois parties en barres, puis l'espoir. */
function ApercuHonnetete() {
  const parties = [
    { libelle: "Les dangers", couleur: "bg-contre", largeur: "w-28" },
    { libelle: "Les limites", couleur: "bg-abstention", largeur: "w-24" },
    { libelle: "Notre autocritique", couleur: "bg-texte", largeur: "w-20" },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 px-6">
      {parties.map((p) => (
        <div key={p.libelle} className="flex items-center gap-3">
          <span className={cn("h-1.5 rounded-full", p.couleur, p.largeur)} />
          <span className="text-[11px] text-attenue">{p.libelle}</span>
        </div>
      ))}
      <p className="mt-1 text-[12px] font-semibold">Et pourtant.</p>
    </div>
  );
}

/** Les trois temps du parcours et la page Honnêteté, avec l'aperçu affiché au survol. */
const LIENS = [
  { href: "/test", libelle: "Le test", aussi: ["/resultat"], phrase: "Tranchez de vrais textes de loi, découvrez l'IA faite pour vous." },
  { href: "/candidates", libelle: "Les candidates", aussi: [], phrase: "Sept IA, sept doctrines, aucun parti." },
  { href: "/seance", libelle: "Au pouvoir", aussi: [], phrase: "Votre IA tranche un vrai texte et rédige son amendement." },
  { href: "/honnetete", libelle: "Honnêteté", aussi: [], phrase: "Les dangers, les limites et notre autocritique, sans détour." },
] as const;

const correspond = (chemin: string, href: string) => chemin === href || chemin.startsWith(`${href}/`);

/** La courbe DOUX, pour les transitions CSS de l'en-tête. */
const COURBE = `cubic-bezier(${DOUX.join(", ")})`;

/**
 * Le trait sous le lien de la page en cours. Un seul trait pour tout l'en-tête (`layoutId`) :
 * il glisse d'un lien à l'autre à chaque navigation, et s'efface en revenant à l'accueil.
 */
function Soulignement() {
  return (
    <motion.span
      layoutId="entete-soulignement"
      aria-hidden
      className="absolute inset-x-1.5 -bottom-px h-0.5 rounded-full bg-texte min-[400px]:inset-x-3 sm:inset-x-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ ...RESSORT, opacity: { duration: DUREE.etat, ease: DOUX } }}
    />
  );
}

/**
 * Tant que la page demandée n'est pas prête, un trait fin la parcourt sous le lien cliqué.
 * Toujours présent, il ne fait que changer d'opacité : aucun décalage de mise en page.
 */
function Attente() {
  const { pending } = useLinkStatus();
  return (
    <span aria-hidden className="pointer-events-none absolute inset-x-1.5 -bottom-px h-0.5 overflow-hidden min-[400px]:inset-x-3 sm:inset-x-4">
      <motion.span
        className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-attenue"
        initial={false}
        animate={pending ? { opacity: 1, x: ["-100%", "300%"] } : { opacity: 0 }}
        transition={
          pending
            ? { opacity: { duration: DUREE.micro }, x: { duration: DUREE.scene, ease: DOUX, repeat: Infinity } }
            : { duration: DUREE.etat }
        }
      />
    </span>
  );
}

/**
 * L'en-tête retenu (proposition 4 « République » de /maquettes/entete), souligné d'un liseré tricolore :
 * la marque et la mention « République française, an 2050 » à gauche, le parcours à droite.
 * Au survol (ou au focus clavier) d'un lien, une petite présentation illustrée apparaît dessous.
 * Sous 1024 px, le parcours passe sur une seconde ligne pleine largeur, sans aperçu.
 */
export function Entete() {
  const chemin = usePathname();
  // La marque prend les couleurs de l'IA du citoyen dès que le test est commencé.
  const { candidate, teintes } = useMaSphere();

  return (
    // Nommé pour les transitions de page : l'en-tête reste immobile pendant que le contenu change (transitions.css).
    <header className="relative z-40 bg-fond" style={{ viewTransitionName: "entete" }}>
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="col-start-1 row-start-1 flex min-h-14 items-center gap-4 justify-self-start transition-opacity duration-150 ease-out hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte active:opacity-50"
        >
          <Logo titre className="text-[22px]" />
          <span className="border-l border-trait pl-4 text-xs leading-4 text-attenue max-sm:hidden">
            République française
            <br />
            an 2050
          </span>
          {candidate ? <span className="sr-only">Votre IA : {candidate.prenom}</span> : null}
        </Link>

        <EtatDonnees />

        <nav
          aria-label="Navigation principale"
          className="col-span-2 row-start-2 -mb-px lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:justify-self-end"
        >
          <ul role="list" className="flex lg:gap-1">
            {LIENS.map((lien) => {
              const active = correspond(chemin, lien.href) || lien.aussi.some((h) => correspond(chemin, h));
              return (
                <li key={lien.href} className="group relative flex-auto lg:flex-none">
                  <Link
                    href={lien.href}
                    aria-current={active ? "page" : undefined}
                    aria-describedby={`apercu-${lien.href.slice(1)}`}
                    className={cn(
                      "relative flex min-h-11 items-center justify-center whitespace-nowrap px-1.5 text-[13px] text-attenue min-[400px]:px-3 sm:text-sm transition-colors duration-150 ease-out hover:text-texte focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-texte active:text-texte sm:px-4 lg:min-h-14",
                      active && "text-texte",
                    )}
                  >
                    {/* Le texte ne s'épaissit pas à l'activation (cela décalerait les liens) : seul le trait le dit. */}
                    <span className="transition-transform duration-150 ease-out group-active:scale-[0.97]">{lien.libelle}</span>
                    <Attente />
                    <AnimatePresence initial={false}>{active ? <Soulignement key="soulignement" /> : null}</AnimatePresence>
                  </Link>

                  {/* La présentation : invisible au repos, elle glisse en place au survol ou au focus. */}
                  <div
                    id={`apercu-${lien.href.slice(1)}`}
                    role="tooltip"
                    style={{ transitionTimingFunction: COURBE }}
                    className="pointer-events-none invisible absolute right-0 top-full z-50 hidden w-72 origin-top-right -translate-y-1 scale-[0.97] pt-2 opacity-0 transition-[opacity,translate,scale,visibility] duration-300 group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-hover:delay-75 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100 motion-reduce:transition-none lg:block"
                  >
                    <div className="overflow-hidden rounded-xl border border-trait bg-fond shadow-[0_12px_32px_rgb(17_19_24/0.08)]">
                      <div className="h-32 bg-relief">
                        {lien.href === "/test" ? (
                          <ApercuTest />
                        ) : lien.href === "/candidates" ? (
                          <ApercuCandidates />
                        ) : lien.href === "/honnetete" ? (
                          <ApercuHonnetete />
                        ) : (
                          <ApercuPouvoir couleur={teintes[1]} />
                        )}
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-sm font-semibold tracking-[-0.01em]">{lien.libelle}</p>
                        <p className="mt-1 text-[13px] leading-5 text-attenue">{lien.phrase}</p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      {/* Le liseré tricolore souligne l'en-tête, à la place d'un simple filet. */}
      <div aria-hidden className="flex h-1">
        <span className="flex-1 bg-pour" />
        <span className="flex-1 bg-trait" />
        <span className="flex-1 bg-contre" />
      </div>
    </header>
  );
}

/** Dit d'un coup d'œil si la démo tourne sur les vraies données ou sur des exemples. */
function EtatDonnees() {
  const { data: etat, error: erreur } = useEtat();
  const reel = etat ? etat.hemicycle.cle !== "absente" : false;

  return (
    <p
      role="status"
      className="col-start-2 row-start-1 flex min-h-14 items-center gap-2 justify-self-end text-xs leading-4 text-attenue lg:hidden"
    >
      {/* L'état arrive après le premier affichage : il apparaît en fondu au lieu de surgir. */}
      <AnimatePresence mode="wait" initial={false}>
        {etat ? (
          <motion.span
            key={reel ? "reel" : "exemple"}
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUREE.etat, ease: DOUX }}
          >
            {/* Point plein : données réelles. Cercle en pointillés : exemples. La forme le dit, pas la couleur. */}
            <span
              aria-hidden
              className={cn("size-2 shrink-0 rounded-full", reel ? "bg-texte" : "border border-dashed border-attenue")}
            />
            {reel ? "Hémicycle connecté" : "Données d'exemple"}
          </motion.span>
        ) : erreur ? (
          <motion.span
            key="inconnu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUREE.etat, ease: DOUX }}
          >
            Données inconnues
          </motion.span>
        ) : null}
      </AnimatePresence>
    </p>
  );
}
