"use client";

import { motion } from "motion/react";

import { Element, Reveal, Serie, TITRE_SECTION } from "@/components/accueil/reveal";
import { BoutonIA } from "@/components/bouton-ia";
import { Sphere } from "@/components/sphere";
import { DOUX, DUREE } from "@/lib/animation";
import { CANDIDATES } from "@/lib/candidates";

/** Un point de la page : un titre court, puis une ou deux phrases qui disent les choses sans détour. */
interface Point {
  titre: string;
  texte: string;
}

const DANGERS: Point[] = [
  {
    titre: "Celui qui écrit la règle gouverne",
    texte:
      "Une IA « neutre » n'existe pas. Ses priorités, ses seuils, ses mots-clés ont été choisis par quelqu'un. Confier le pouvoir à une machine, c'est le confier, en silence, à ceux qui la règlent.",
  },
  {
    titre: "La fin du compromis",
    texte:
      "Un parlement négocie, amende, recule, trouve un terrain d'entente. Une règle appliquée à la lettre ne cède jamais : elle tranche. La démocratie n'est pas qu'une addition de préférences.",
  },
  {
    titre: "Personne à qui demander des comptes",
    texte:
      "Un élu peut être interpellé, battu, poursuivi. Une IA qui se trompe n'a ni visage ni mandat à perdre. La responsabilité se dilue entre les citoyens qui l'ont réglée et les ingénieurs qui l'ont construite.",
  },
  {
    titre: "Ceux qui ne passent pas le test",
    texte:
      "Il faut un écran, du temps et l'habitude des interfaces pour régler une sphère. Les plus éloignés du numérique, souvent les plus fragiles, perdraient leur voix sans même le savoir.",
  },
  {
    titre: "Une cible parfaite",
    texte:
      "Un seul système qui décide pour tous est une seule porte à forcer : piratage, manipulation des réglages, campagnes pour orienter les réponses. Plus le pouvoir est centralisé, plus il attire.",
  },
];

const LIMITES: Point[] = [
  {
    titre: "Le thème d'un texte est deviné",
    texte:
      "Nous classons chaque loi par mots-clés dans son intitulé. « Projet de loi de finances » devient « Budget » ; un texte qui touche trois sujets n'en garde qu'un. C'est une estimation, pas une analyse.",
  },
  {
    titre: "Les candidates sont des caricatures",
    texte:
      "Sept profils, dix thèmes, une règle à trois seuils : pour, contre, abstention. Une vraie position politique est faite de nuances, de contextes et de contradictions qu'aucune règle de ce prototype ne capture.",
  },
  {
    titre: "Votre affinité est un calcul simple",
    texte:
      "Un pourcentage qui mélange vos votes et vos priorités. Il dépend des questions posées, de leur ordre et des poids que nous avons fixés. Deux points d'écart ne veulent rien dire.",
  },
  {
    titre: "Les données sont vraies, le reste est une fiction",
    texte:
      "Les scrutins, les décomptes et les votes des groupes viennent de l'Assemblée nationale, via Hémicycle. Les scénarios 2050, les candidates et les amendements rédigés par l'IA sont inventés.",
  },
  {
    titre: "Un modèle de langage peut se tromper",
    texte:
      "L'amendement est rédigé en direct par un modèle open source. Il peut inventer un article, mal citer un texte ou écrire une absurdité avec aplomb. Il n'a aucune valeur juridique.",
  },
];

const AUTOCRITIQUE: Point[] = [
  {
    titre: "Nous avons rendu une dystopie séduisante",
    texte:
      "Des sphères qui ondulent, des animations douces, un bouton « Trouver mon IA ». Nous avons utilisé tous les codes d'un produit agréable pour habiller l'idée de remplacer des élus. C'est précisément ce qu'il faut regarder avec méfiance.",
  },
  {
    titre: "Notre comparatif est injuste",
    texte:
      "« Ce qu'un humain promet, une IA le tient » oppose les défauts réels d'une fonction humaine aux promesses d'une machine qui n'existe pas. Une IA tient sa règle, oui ; mais une règle n'a jamais tenu un pays.",
  },
  {
    titre: "Nous avons simplifié la politique en test",
    texte:
      "Glisser une carte à droite ou à gauche, c'est confortable. Voter une loi, c'est lire, débattre, peser des conséquences. Le format même du test flatte l'idée que tout se règle en deux minutes.",
  },
  {
    titre: "Nous nous sommes fixé des limites",
    texte:
      "Pas de score de « corruption », pas d'accusation sur une personne réelle, uniquement des votes publics et sourcés. L'audit d'un député montre des faits, pas un jugement : à vous de conclure.",
  },
];

/** Une colonne numérotée : la numérotation ne sert que de repère de lecture, les points ne sont pas une séquence. */
function Bloc({ id, titre, chapo, points, teinte }: { id: string; titre: string; chapo: string; points: Point[]; teinte: string }) {
  return (
    <section aria-labelledby={id} className="grid gap-x-16 gap-y-10 border-t border-trait pt-14 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <Reveal>
        <span aria-hidden className="mb-6 block h-1 w-12 rounded-full" style={{ background: teinte }} />
        <h2 id={id} className="text-3xl font-semibold tracking-[-0.03em]">
          {titre}
        </h2>
        <p className="mt-4 text-[17px] leading-7 text-attenue">{chapo}</p>
      </Reveal>
      <Serie as="ul" className="space-y-10">
        {points.map((p) => (
          <Element as="li" key={p.titre} className="max-w-[62ch]">
            <h3 className="text-xl font-semibold tracking-[-0.02em]">{p.titre}</h3>
            <p className="mt-2 text-[17px] leading-7 text-attenue">{p.texte}</p>
          </Element>
        ))}
      </Serie>
    </section>
  );
}

/** Les sept sphères qui se rassemblent : l'image de l'espoir, plusieurs voix plutôt qu'une. */
function Rassemblement() {
  return (
    <div aria-hidden className="flex justify-center gap-3">
      {CANDIDATES.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 24, scale: 0.6 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: DUREE.scene, delay: 0.1 + Math.abs(i - 3) * 0.12, ease: DOUX }}
        >
          <Sphere teintes={c.teintes} duree={10 + i * 2} className="size-10 sm:size-14" />
        </motion.div>
      ))}
    </div>
  );
}

export function VueHonnetete() {
  return (
    <div className="mx-auto max-w-6xl space-y-24 pb-16 sm:space-y-32">
      <header className="pt-6 text-center sm:pt-12">
        <motion.h1
          className={TITRE_SECTION}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUREE.scene, ease: DOUX }}
        >
          Soyons honnêtes.
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-2xl text-balance text-xl leading-8 text-attenue"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUREE.entree, delay: 0.25, ease: DOUX }}
        >
          DemocratIA imagine une France qui confie sa présidence à une IA. Ce n&apos;est pas un souhait : c&apos;est une
          question. Voici ce que nos propres pages ne disent pas.
        </motion.p>
      </header>

      <Bloc
        id="dangers"
        titre="Les dangers"
        chapo="Ce qui pourrait mal tourner si cette fiction devenait réelle."
        points={DANGERS}
        teinte="var(--contre)"
      />
      <Bloc
        id="limites"
        titre="Les limites de ce prototype"
        chapo="Ce que DemocratIA fait mal, ou pas du tout, aujourd'hui."
        points={LIMITES}
        teinte="var(--abstention)"
      />
      <Bloc
        id="autocritique"
        titre="Notre autocritique"
        chapo="Ce que nous nous reprochons, en tant qu'équipe."
        points={AUTOCRITIQUE}
        teinte="var(--texte)"
      />

      <section aria-labelledby="espoir" className="border-t border-trait pt-20 text-center">
        <Rassemblement />
        <Reveal delai={0.3}>
          <h2 id="espoir" className={`${TITRE_SECTION} mt-12`}>
            Et pourtant.
          </h2>
          <div className="mx-auto mt-8 max-w-2xl space-y-5 text-balance text-xl leading-8 text-attenue">
            <p>
              Tout ce que vous avez vu ici repose sur des données publiques : chaque scrutin, chaque décompte, chaque
              vote de groupe est ouvert, lisible et vérifiable par n&apos;importe qui.
            </p>
            <p>
              C&apos;est cela qui nous rend optimistes. Pas une machine qui déciderait à notre place, mais des outils qui
              aident chacun à comprendre ce que font ses élus, à comparer, à demander des comptes.
            </p>
            <p className="font-semibold text-texte">
              La meilleure sphère, finalement, c&apos;est celle qu&apos;on ne remplace pas : la vôtre, quand vous allez
              voter.
            </p>
          </div>
        </Reveal>
        <Reveal delai={0.45} className="mt-12 flex flex-wrap justify-center gap-4">
          <BoutonIA href="/test">Passer le test quand même</BoutonIA>
          <BoutonIA href="/audit" variante="contour">
            Auditer un député réel
          </BoutonIA>
        </Reveal>
      </section>
    </div>
  );
}
