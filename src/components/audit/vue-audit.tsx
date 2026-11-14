"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { BoutonIA } from "@/components/bouton-ia";
import { AvisExemple } from "@/components/avis-exemple";
import { titreCourt } from "@/components/candidates/titre";
import { PositionLibelle } from "@/components/position";
import { useDeputes, useScrutins } from "@/lib/api";
import { CASCADE, DOUX, DUREE, ENTREE } from "@/lib/animation";
import { positionCandidate, type Candidate } from "@/lib/candidates";
import { useMandat } from "@/lib/mandat";
import { useClassement } from "@/lib/ma-candidate";
import type { Depute, Position, Scrutin } from "@/lib/types";

import { lignesAudit, nomComplet, syntheseAudit } from "./calcul";
import { FaceAFace } from "./face-a-face";
import { RechercheDepute } from "./recherche-depute";
import { Synthese } from "./synthese";
import { TableauComparaison } from "./tableau-comparaison";
import { useResultats } from "./use-resultats";

const H2 = "font-titre text-2xl font-semibold leading-8 tracking-[-0.03em] text-texte";

/** Rend la valeur avec un retard : la recherche part quand la frappe s'arrête. */
function useDiffere(valeur: string, delai: number) {
  const [differee, setDifferee] = useState(valeur);
  useEffect(() => {
    const minuterie = setTimeout(() => setDifferee(valeur), delai);
    return () => clearTimeout(minuterie);
  }, [valeur, delai]);
  return differee;
}

const sansAbonnement = () => () => {};
/** Faux pendant le rendu serveur : le test vit dans le navigateur, on ne conclut rien avant de l'avoir lu. */
const useNavigateur = () =>
  useSyncExternalStore(
    sansAbonnement,
    () => true,
    () => false,
  );

function Attente({ lignes, libelle }: { lignes: number; libelle: string }) {
  return (
    <div role="status" className="space-y-3">
      <span className="sr-only">{libelle}</span>
      {Array.from({ length: lignes }, (_, i) => (
        <div key={i} aria-hidden className="flex items-center gap-6 rounded-md bg-relief px-5 py-6 motion-safe:animate-pulse">
          <span className="h-3 flex-1 rounded-full bg-trait" />
          <span className="h-3 w-20 rounded-full bg-trait" />
          <span className="h-3 w-20 rounded-full bg-trait" />
        </div>
      ))}
    </div>
  );
}

function Panne({ titre, detail, onReessayer }: { titre: string; detail: string; onReessayer: () => void }) {
  return (
    <div role="alert" className="rounded-md bg-relief px-5 py-5">
      <p className="font-medium text-texte">{titre}</p>
      <p className="mt-1 text-[15px] leading-6 text-attenue">{detail}</p>
      <BoutonIA variante="contour" onClick={onReessayer} className="mt-4">
        Réessayer
      </BoutonIA>
    </div>
  );
}

/** Sans test, pas d'audit : on montre ce que l'audit fera, et le chemin pour y arriver. */
function AucunTexte() {
  return (
    <motion.div
      {...ENTREE}
      className="flex flex-col items-center gap-8 rounded-lg bg-relief px-6 py-10 text-center sm:px-10 md:flex-row md:text-left"
    >
      <div aria-hidden className="flex shrink-0 items-center gap-4">
        <motion.span
          className="size-20 rounded-full border border-trait bg-fond"
          initial={{ x: -12, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ ...ENTREE.transition, delay: 0.15 }}
        />
        <span className="font-donnee text-[13px] tracking-[0.04em] text-attenue uppercase">face à</span>
        <motion.span
          className="size-20 rounded-full border border-dashed border-attenue"
          initial={{ x: 12, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ ...ENTREE.transition, delay: 0.25 }}
        />
      </div>
      <div className="min-w-0">
        <p className="font-titre text-xl font-semibold leading-7 tracking-[-0.02em] text-texte">
          L&apos;audit part de vos propres choix.
        </p>
        <p className="mt-2 max-w-xl text-[15px] leading-6 text-attenue">
          Tranchez quelques vrais textes dans le test : vous verrez ensuite, texte par texte, comment un député a voté et
          ce qu&apos;aurait fait votre IA.
        </p>
        <BoutonIA href="/test" className="mt-5">
          Passer le test
        </BoutonIA>
      </div>
    </motion.div>
  );
}

/**
 * Avant le choix d'un député : la comparaison est déjà dressée avec vos votes et ceux de votre IA ; la colonne du
 * député attend, en pointillés. On voit ce qui va se révéler.
 */
function ApercuComparaison({ textes, votes, candidate }: { textes: Scrutin[]; votes: Record<string, Position>; candidate: Candidate }) {
  return (
    <motion.div {...ENTREE}>
      <ul role="list" className="border-t border-trait">
        {textes.map((scrutin, i) => (
          <motion.li
            key={scrutin.id}
            className="grid grid-cols-1 gap-x-6 gap-y-2 border-b border-trait py-4 sm:grid-cols-[minmax(0,1fr)_7rem_9rem_7.5rem] sm:items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...ENTREE.transition, delay: i * CASCADE }}
          >
            <span className="text-[15px] leading-6 font-medium text-texte">{titreCourt(scrutin.titre)}</span>
            <span className="text-[15px] leading-6">
              <span className="sr-only">Votre vote : </span>
              <PositionLibelle position={votes[scrutin.id]} />
            </span>
            <span className="inline-flex h-8 w-fit items-center rounded-full border border-dashed border-attenue px-3 text-sm text-attenue">
              Député : ?
            </span>
            <span className="text-[15px] leading-6 text-machine">
              <span className="sr-only">{candidate.prenom} : </span>
              <PositionLibelle position={positionCandidate(candidate, scrutin)} machine />
            </span>
          </motion.li>
        ))}
      </ul>
      <p className="mt-4 text-sm leading-6 text-attenue">
        Vous, le député, {candidate.prenom} : choisissez un nom plus haut pour révéler la colonne du milieu.
      </p>
    </motion.div>
  );
}

/** L'audit d'un représentant humain face à l'IA du citoyen, sur les textes qu'il a tranchés. */
export function VueAudit() {
  const navigateur = useNavigateur();
  const mandat = useMandat();
  const scrutins = useScrutins();
  const { classement, regle } = useClassement();
  const candidate = regle ? (classement[0]?.candidate ?? null) : null;

  const [saisie, setSaisie] = useState("");
  const nom = useDiffere(saisie, 300);
  const deputes = useDeputes(nom);
  const [depute, setDepute] = useState<Depute | null>(null);

  const textes = (scrutins.data?.data ?? []).filter((scrutin) => mandat.votes[scrutin.id]);
  // Le détail des scrutins n'est lu qu'une fois un député choisi : pas de lecture inutile.
  const lectures = useResultats(depute ? textes.map((scrutin) => scrutin.id) : []);

  const lignes = depute && candidate ? lignesAudit(textes, mandat.votes, depute, candidate, lectures.data) : [];
  const synthese = syntheseAudit(lignes);

  const metaExemple = [
    scrutins.data?.meta,
    nom.trim().length >= 2 ? deputes.data?.meta : undefined,
    ...Object.values(lectures.data?.resultats ?? {}).map((enveloppe) => enveloppe.meta),
  ].find((meta) => meta?.origine === "exemple");

  const rechercheAJour = saisie.trim() === nom.trim();
  const pret = navigateur && !scrutins.isLoading;

  const sansTest = pret && !scrutins.error && (!candidate || textes.length === 0);
  const groupeDuJour = lignes.find((ligne) => ligne.sigleGroupe)?.sigleGroupe ?? null;

  // Une fois le député choisi, la page descend doucement jusqu'au face-à-face s'il est hors de l'écran.
  const reduit = useReducedMotion();
  const fiche = useRef<HTMLElement>(null);
  const choisir = (suivant: Depute) => {
    setDepute(suivant);
    window.setTimeout(() => {
      const zone = fiche.current?.getBoundingClientRect();
      if (zone && zone.top > window.innerHeight * 0.7) {
        fiche.current?.scrollIntoView({ behavior: reduit ? "auto" : "smooth", block: "start" });
      }
    }, 60);
  };

  return (
    <>
      <AvisExemple meta={metaExemple} />

      <motion.header {...ENTREE} className="max-w-3xl">
        <h1 className="font-titre text-[clamp(2.25rem,4.5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-texte">
          Un élu suit son groupe. {candidate ? candidate.prenom : "Votre IA"} suit son programme.
        </h1>
        <p className="mt-5 text-lg leading-8 text-attenue">
          Choisissez un député : ses votes publiés, texte par texte, face à vos choix et à votre IA.
        </p>
      </motion.header>

      {!pret ? (
        <div className="mt-14">
          <Attente lignes={3} libelle="Lecture de votre test et des textes…" />
        </div>
      ) : scrutins.error ? (
        <div className="mt-14">
          <Panne
            titre="La liste des textes n'a pas pu être lue."
            detail={(scrutins.error as Error).message}
            onReessayer={() => void scrutins.mutate()}
          />
        </div>
      ) : sansTest || !candidate ? (
        <section aria-label="Commencer par le test" className="mt-14">
          <AucunTexte />
        </section>
      ) : (
        <>
          <motion.section
            aria-labelledby="audit-recherche"
            className="mt-12"
            initial={ENTREE.initial}
            animate={ENTREE.animate}
            transition={{ ...ENTREE.transition, delay: CASCADE * 2 }}
          >
            <h2 id="audit-recherche" className="sr-only">
              Choisir un député
            </h2>
            <RechercheDepute
              saisie={saisie}
              onSaisie={setSaisie}
              enAttente={!rechercheAJour || deputes.isLoading || deputes.isValidating}
              erreur={deputes.error ? (deputes.error as Error).message : null}
              resultats={rechercheAJour ? (deputes.data?.data ?? null) : null}
              choisiId={depute?.id ?? null}
              onChoisir={choisir}
            />
          </motion.section>

          <section ref={fiche} aria-labelledby="audit-fiche" className="scroll-mt-24">
            <h2 id="audit-fiche" className="sr-only">
              {depute ? `${nomComplet(depute)} face à ${candidate.prenom}` : "Le député choisi"}
            </h2>
            <AnimatePresence mode="wait">
              {depute ? (
                <motion.div
                  key={depute.id}
                  className="mt-14"
                  exit={{ opacity: 0, transition: { duration: DUREE.micro, ease: DOUX } }}
                >
                  <FaceAFace depute={depute} candidate={candidate} groupeDuJour={groupeDuJour} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>

          <section aria-labelledby="audit-comparaison" className="mt-16">
            <h2 id="audit-comparaison" className={`mb-8 ${H2}`}>
              {`Comparaison sur ${textes.length > 1 ? `${textes.length} textes` : "1 texte"}`}
            </h2>

            {!depute ? (
              <ApercuComparaison textes={textes} votes={mandat.votes} candidate={candidate} />
            ) : lectures.error ? (
              <Panne
                titre="Le détail des scrutins n'a pas pu être lu."
                detail={lectures.error.message}
                onReessayer={() => void lectures.mutate()}
              />
            ) : !lectures.data ? (
              <Attente lignes={Math.min(textes.length, 6)} libelle="Lecture des votes, scrutin par scrutin…" />
            ) : (
              <TableauComparaison key={depute.id} lignes={lignes} nomElu={nomComplet(depute)} candidate={candidate} />
            )}
          </section>

          {depute && lectures.data && !lectures.error && synthese.textes > 0 ? (
            <section aria-labelledby="audit-synthese" className="mt-20">
              <h2 id="audit-synthese" className={`mb-8 ${H2}`}>
                Synthèse
              </h2>
              <Synthese key={depute.id} synthese={synthese} nomElu={nomComplet(depute)} candidate={candidate} />
            </section>
          ) : null}
        </>
      )}
    </>
  );
}
