"use client";

import Link from "next/link";
import { animate, motion, MotionConfig, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";

import { BoutonIA } from "@/components/bouton-ia";
import { FiltreSphere, Sphere } from "@/components/sphere";
import { CASCADE, DOUX, DUREE, RESSORT_LENT } from "@/lib/animation";
import { candidateParId, type Candidate } from "@/lib/candidates";
import { useClassement } from "@/lib/ma-candidate";
import { affiniteEntiere, enPourcent } from "@/lib/partage";

import { InvitationDiscrete } from "./invitation-discrete";

const LIEN =
  "inline-flex min-h-11 items-center text-[15px] text-attenue underline decoration-trait underline-offset-4 outline-none transition-colors duration-150 hover:text-texte hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-texte";

const SEQUENCE: Variants = {
  cache: {},
  visible: { transition: { staggerChildren: CASCADE * 2, delayChildren: 0.35 } },
};
const ETAPE: Variants = {
  cache: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DUREE.entree, ease: DOUX } },
};

const sansAbonnement = () => () => {};
const useNavigateur = () =>
  useSyncExternalStore(
    sansAbonnement,
    () => true,
    () => false,
  );

/** Le pourcentage monte de 0 à sa valeur ; sans mouvement, il s'affiche d'emblée. */
function Compteur({ valeur }: { valeur: number }) {
  const sansMouvement = useReducedMotion();
  const [affiche, setAffiche] = useState(0);

  useEffect(() => {
    if (sansMouvement) return;
    const lecture = animate(0, valeur, {
      duration: DUREE.scene,
      delay: 0.7,
      ease: DOUX,
      onUpdate: (v) => setAffiche(Math.round(v)),
    });
    return () => lecture.stop();
  }, [valeur, sansMouvement]);

  return (
    <>
      <span aria-hidden className="tabular-nums">
        {enPourcent(sansMouvement ? valeur : affiche)}
      </span>
      <span className="sr-only">{enPourcent(valeur)}</span>
    </>
  );
}

/** La grande sphère, qui s'ouvre avec un halo de sa couleur. */
function GrandeSphere({ candidate, description }: { candidate: Candidate; description: string }) {
  return (
    <motion.div
      className="relative w-[min(240px,56vw)] shrink-0 lg:w-[min(320px,30vw)]"
      initial={{ opacity: 0, scale: 0.55, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={RESSORT_LENT}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-[18%] rounded-full blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${candidate.teintes[1]}, transparent)` }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: DUREE.scene, delay: 0.25, ease: DOUX }}
      />
      <Sphere aquarelle teintes={candidate.teintes} description={description} className="relative" />
    </motion.div>
  );
}

/**
 * /invitation/[id] : quelqu'un a partagé son IA. Le visiteur la découvre, puis passe le test.
 * S'il l'a déjà passé, la page compare son IA à celle de la personne qui l'a invité.
 */
export function VueInvitation({ candidateId, affinite }: { candidateId: string; affinite: number | null }) {
  const navigateur = useNavigateur();
  const { classement, regle, chargement } = useClassement();
  const sienne = candidateParId(candidateId);
  if (!sienne) return null;

  // Le test vit dans le navigateur : au rendu serveur, et tant qu'il n'est pas passé, on invite.
  if (navigateur && regle) {
    if (chargement) return <InvitationEnAttente />;
    return <Comparaison sienne={sienne} affinite={affinite} classement={classement} />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <FiltreSphere />
      <section
        aria-labelledby="titre-invitation"
        className="mx-auto flex max-w-4xl flex-col items-center py-4 text-center lg:flex-row lg:gap-20 lg:py-10 lg:text-left"
      >
        <GrandeSphere candidate={sienne} description={`La sphère de ${sienne.prenom}, IA candidate`} />

        <motion.div
          className="mt-10 flex min-w-0 flex-col items-center lg:mt-0 lg:items-start"
          variants={SEQUENCE}
          initial="cache"
          animate="visible"
        >
          <motion.p variants={ETAPE} className="text-lg text-attenue">
            On vous a invité.
          </motion.p>
          <motion.h1
            id="titre-invitation"
            variants={ETAPE}
            className="mt-2 text-balance font-titre text-[clamp(2.25rem,6vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.035em]"
          >
            Son IA, c&apos;est {sienne.prenom}
            {affinite === null ? (
              "."
            ) : (
              <>
                , à <Compteur valeur={affinite} />.
              </>
            )}
          </motion.h1>
          <motion.p variants={ETAPE} className="mt-5 max-w-md text-balance text-xl leading-8 tracking-[-0.01em]">
            {`«\u00a0${sienne.doctrine}\u00a0»`}
          </motion.p>
          <motion.p
            variants={ETAPE}
            className="mt-8 font-titre text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-tight tracking-[-0.03em]"
          >
            Et la vôtre ?
          </motion.p>
          <motion.div variants={ETAPE} className="mt-6 flex flex-col items-center gap-2 lg:items-start">
            <BoutonIA href="/test">Passer le test</BoutonIA>
            <Link href="/candidates" className={LIEN}>
              Voir les sept candidates
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  );
}

/** Le visiteur a déjà passé le test : son IA face à celle de la personne qui l'a invité, sans rien inventer. */
function Comparaison({
  sienne,
  affinite,
  classement,
}: {
  sienne: Candidate;
  affinite: number | null;
  classement: ReturnType<typeof useClassement>["classement"];
}) {
  const tete = classement[0];
  const mienne = tete.candidate;
  const meme = mienne.id === sienne.id;
  const moiAvecSienne = classement.find((a) => a.candidate.id === sienne.id);

  const colonnes = [
    { cle: "elle", libelle: "Son IA", candidate: sienne, pourcent: affinite },
    { cle: "vous", libelle: "Votre IA", candidate: mienne, pourcent: affiniteEntiere(tete.score) },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby="titre-comparaison" className="mx-auto flex max-w-3xl flex-col items-center py-4 text-center lg:py-10">
        <motion.p
          className="text-lg text-attenue"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUREE.entree, ease: DOUX }}
        >
          Vous et la personne qui vous a invité
        </motion.p>
        <motion.h1
          id="titre-comparaison"
          className="mt-2 text-balance font-titre text-[clamp(2.25rem,6vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.035em]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUREE.entree, delay: 0.1, ease: DOUX }}
        >
          {meme ? "Vous avez la même IA." : `${sienne.prenom} pour elle, ${mienne.prenom} pour vous.`}
        </motion.h1>

        <ul role="list" className="mt-12 grid w-full grid-cols-2 gap-4 sm:gap-10">
          {colonnes.map((c, i) => (
            <motion.li
              key={c.cle}
              className="flex flex-col items-center"
              initial={{ opacity: 0, x: i === 0 ? -24 : 24, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ ...RESSORT_LENT, delay: 0.25 + i * CASCADE * 2 }}
            >
              <Sphere
                teintes={c.candidate.teintes}
                duree={12 + i * 3}
                description={`${c.libelle} : ${c.candidate.prenom}`}
                className="w-[min(36vw,180px)]"
              />
              <p className="mt-5 font-donnee text-[13px] uppercase leading-5 tracking-[0.04em] text-attenue">{c.libelle}</p>
              <p className="mt-1 font-titre text-[clamp(1.75rem,4.5vw,2.5rem)] font-semibold leading-tight tracking-[-0.03em]">
                {c.candidate.prenom}
              </p>
              {c.pourcent !== null ? (
                <p className="text-[15px] leading-6 tabular-nums">{enPourcent(c.pourcent)} d&apos;affinité</p>
              ) : null}
              <p className="mt-2 max-w-[16rem] text-balance text-sm leading-6 text-attenue">{c.candidate.doctrine}</p>
            </motion.li>
          ))}
        </ul>

        {!meme && moiAvecSienne ? (
          <motion.p
            className="mt-8 text-[15px] leading-6 text-attenue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUREE.entree, delay: 0.7, ease: DOUX }}
          >
            Votre affinité avec {sienne.prenom} : {enPourcent(affiniteEntiere(moiAvecSienne.score))}.
          </motion.p>
        ) : null}

        <motion.div
          className="mt-10 flex flex-col items-center gap-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUREE.entree, delay: 0.8, ease: DOUX }}
        >
          <BoutonIA href="/resultat" teintes={mienne.teintes}>
            Voir mon résultat
          </BoutonIA>
          <div className="mt-1 flex flex-wrap justify-center gap-x-4">
            <Link href="/candidates" className={LIEN}>
              Voir les sept candidates
            </Link>
            <InvitationDiscrete />
          </div>
        </motion.div>
      </section>
    </MotionConfig>
  );
}

/** Le temps de lire le test du visiteur : la place de la sphère, en gris. */
export function InvitationEnAttente() {
  return (
    <div role="status" className="mx-auto flex max-w-4xl flex-col items-center py-4 lg:flex-row lg:gap-20 lg:py-10">
      <span className="sr-only">Lecture de l&apos;invitation…</span>
      <div aria-hidden className="aspect-square w-[min(240px,56vw)] rounded-full bg-relief motion-safe:animate-pulse lg:w-[min(320px,30vw)]" />
      <div aria-hidden className="mt-10 flex flex-col items-center gap-4 lg:mt-0 lg:items-start">
        <div className="h-5 w-36 rounded-full bg-relief" />
        <div className="h-12 w-72 rounded-full bg-relief" />
        <div className="h-5 w-56 rounded-full bg-relief" />
      </div>
    </div>
  );
}
