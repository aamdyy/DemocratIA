"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { MotionConfig } from "motion/react";

import { AvisExemple } from "@/components/avis-exemple";
import { useDeputes, useScrutins } from "@/lib/api";
import { useMandat } from "@/lib/mandat";
import { useClassement } from "@/lib/ma-candidate";
import type { Depute } from "@/lib/types";

import { lignesAudit, nomComplet, syntheseAudit } from "./calcul";
import { FaceAFace } from "./face-a-face";
import { RechercheDepute } from "./recherche-depute";
import { Synthese } from "./synthese";
import { TableauComparaison } from "./tableau-comparaison";
import { useResultats } from "./use-resultats";

const LIEN =
  "inline-flex min-h-11 items-center border border-texte px-5 text-[15px] font-medium text-texte outline-none hover:bg-relief focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";
const BOUTON = `${LIEN} cursor-pointer`;

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
    <div role="status" className="border-t border-trait">
      <span className="sr-only">{libelle}</span>
      {Array.from({ length: lignes }, (_, i) => (
        <div key={i} aria-hidden className="flex items-center gap-6 border-b border-trait py-5">
          <span className="h-4 flex-1 bg-relief motion-safe:animate-pulse" />
          <span className="h-4 w-20 bg-relief motion-safe:animate-pulse" />
          <span className="h-4 w-20 bg-relief motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function Panne({ titre, detail, onReessayer }: { titre: string; detail: string; onReessayer: () => void }) {
  return (
    <div role="alert" className="border border-trait px-5 py-5">
      <p className="font-medium text-texte">{titre}</p>
      <p className="mt-1 text-[15px] leading-6 text-attenue">{detail}</p>
      <button type="button" onClick={onReessayer} className={`${BOUTON} mt-4`}>
        Réessayer
      </button>
    </div>
  );
}

function AucunTexte({ prenom }: { prenom: string | null }) {
  return (
    <div className="border border-trait px-5 py-6">
      <p className="font-medium text-texte">Vous n&apos;avez encore tranché aucun texte.</p>
      <p className="mt-1 max-w-2xl text-[15px] leading-6 text-attenue">
        {prenom
          ? `La comparaison se fait sur les textes de loi que vous avez tranchés. Passez le test : ${prenom} et l'élu de votre choix seront alors comparés texte par texte.`
          : "Passez le test pour découvrir votre IA : l'audit compare un élu à elle, texte par texte."}
      </p>
      <Link href="/test" className={`${LIEN} mt-4`}>
        Passer le test
      </Link>
    </div>
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

  return (
    <MotionConfig reducedMotion="user">
      <AvisExemple meta={metaExemple} />

      <header className="max-w-3xl">
        <p className="text-sm text-attenue">Et votre député humain ? · République française, 2050</p>
        <h1 className="mt-3 font-titre text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.06] tracking-[-0.03em] text-texte">
          Un élu suit son groupe. {candidate ? candidate.prenom : "Votre IA"} suit son programme.
        </h1>
        <p className="mt-5 text-lg leading-8 text-attenue">
          Choisissez un député de l&apos;ancien régime. DemocratIA place ses votes publiés à côté de la position de votre IA
          {candidate ? `, ${candidate.prenom},` : ""} sur les textes que vous avez tranchés. Rien d&apos;autre que des votes : à vous de juger.
        </p>
      </header>

      <section aria-labelledby="audit-recherche" className="mt-12">
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
          onChoisir={setDepute}
        />
      </section>

      {depute && candidate ? (
        <section aria-labelledby="audit-fiche" className="mt-14">
          <h2 id="audit-fiche" className="sr-only">
            {nomComplet(depute)} face à {candidate ? candidate.prenom : "votre IA"}
          </h2>
          <FaceAFace key={depute.id} depute={depute} candidate={candidate} />
        </section>
      ) : null}

      <section aria-labelledby="audit-comparaison" className="mt-14">
        <h2 id="audit-comparaison" className="font-titre text-2xl leading-8 text-texte">
          Comparaison texte par texte
        </h2>
        <p className="mt-1 mb-6 text-[15px] leading-6 text-attenue">
          {pret && textes.length > 0
            ? `${textes.length > 1 ? `${textes.length} textes tranchés` : "1 texte tranché"} dans le test.`
            : "Sur les textes que vous avez tranchés dans le test."}
        </p>

        {!pret ? (
          <Attente lignes={3} libelle="Lecture de votre test et des textes…" />
        ) : scrutins.error ? (
          <Panne
            titre="La liste des textes n'a pas pu être lue."
            detail={(scrutins.error as Error).message}
            onReessayer={() => void scrutins.mutate()}
          />
        ) : !candidate || textes.length === 0 ? (
          <AucunTexte prenom={candidate?.prenom ?? null} />
        ) : !depute ? (
          <p className="border border-dashed border-trait px-5 py-6 text-[15px] leading-6 text-attenue">
            Cherchez un député ci-dessus et choisissez-le : ses votes s&apos;afficheront ici, face à la position de {candidate.prenom}.
          </p>
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

      {depute && candidate && pret && lectures.data && !lectures.error && synthese.textes > 0 ? (
        <section aria-labelledby="audit-synthese" className="mt-14">
          <h2 id="audit-synthese" className="mb-6 font-titre text-2xl leading-8 text-texte">
            Synthèse
          </h2>
          <Synthese synthese={synthese} nomElu={nomComplet(depute)} candidate={candidate} />
        </section>
      ) : null}
    </MotionConfig>
  );
}
