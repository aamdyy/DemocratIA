import Link from "next/link";
import { Public_Sans } from "next/font/google";

import { Sphere, type Teintes } from "@/components/sphere";
import { SphereVocale } from "@/components/sphere-vocale";
import { candidateParId, type Candidate } from "@/lib/candidates";

import { Aquarelle, Metaballes, Nacre, Planete, Plasma, Respiration, Verre } from "./variantes";

const police = Public_Sans({ subsets: ["latin"] });

/** Les trois candidates montrées pour chaque proposition, avec la forme élidée de « de ». */
const MONTREES = [
  { id: "gaia", de: "de Gaïa" },
  { id: "hygie", de: "d’Hygie" },
  { id: "themis", de: "de Thémis" },
]
  .map(({ id, de }) => ({ candidate: candidateParId(id), de }))
  .filter((m): m is { candidate: Candidate; de: string } => m.candidate !== null);

const TAILLE = "w-[min(280px,78vw)]";

/** Le bleu exact de l'orbe de référence : profond (0,05 ; 0,38 ; 0,88) et clair (0,28 ; 0,68 ; 0,98). */
const BLEU_REFERENCE = { profond: "rgb(12.75 96.9 224.4)", clair: "rgb(71.4 173.4 249.9)" };
/** Teintes du même bleu, pour l'aperçu affiché avant la première image. */
const TEINTES_REFERENCE: Teintes = ["#e6f3fe", "#47adfa", "#0d61e0", "#47adfa"];

type Rendu = (c: Candidate, label: string, rang: number) => React.ReactNode;

interface Proposition {
  /** Numéro affiché, quand il diffère du rang dans la liste. */
  numero?: number;
  /** Légende d'une sphère, quand ce n'est pas le prénom de la candidate. */
  legende?: (prenom: string, rang: number) => string;
  nom: string;
  idee: string;
  survol: string;
  cout: "léger" | "moyen" | "lourd";
  pourquoi: string;
  rendu: Rendu;
}

const PROPOSITIONS: Proposition[] = [
  {
    numero: 9,
    nom: "Orbe vocale",
    idee: "L’orbe d’un assistant vocal : une bille au bord qui ondule à peine, remplie de nuages blancs et lumineux qui dérivent dans les couleurs de la candidate, avec un reflet clair sur le pourtour. La première est dans le bleu exact de l’orbe de référence, pour comparer.",
    survol: "elle s’éveille : les nuages accélèrent et se contrastent, le bord ondule davantage, la matière est attirée vers le pointeur et la sphère se dilate un peu.",
    cout: "moyen",
    pourquoi: "un shader WebGL par sphère, mis en pause hors de l’écran ; les navigateurs limitent le nombre de contextes, donc réservé aux grandes sphères.",
    legende: (prenom, rang) => (rang === 0 ? "Bleu de référence" : prenom),
    rendu: (c, label, rang) =>
      rang === 0 ? (
        <SphereVocale
          teintes={TEINTES_REFERENCE}
          couleurs={BLEU_REFERENCE}
          description="Orbe dans le bleu de référence"
          className={TAILLE}
        />
      ) : (
        <SphereVocale teintes={c.teintes} description={label} className={TAILLE} />
      ),
  },
  {
    nom: "L’actuelle",
    idee: "Trois nuages flous et un voile blanc tournent lentement dans un disque, sous un reflet et un grain.",
    survol: "les nuages gonflent et les couleurs s’intensifient.",
    cout: "léger",
    pourquoi: "quatre calques flous déplacés par transform, que le navigateur compose sans recalcul.",
    rendu: (c, label) => <Sphere teintes={c.teintes} description={label} className={TAILLE} />,
  },
  {
    nom: "Aquarelle vivante",
    idee: "Des lavis de pigment qui se superposent sur du papier ; leurs bords ondulent comme de l’eau et gardent le liseré plus foncé de la couleur qui sèche.",
    survol: "les pigments s’étalent et mangent le blanc du papier.",
    cout: "lourd",
    pourquoi: "le filtre de déplacement est recalculé à chaque image ; une seule grande sphère à la fois sur téléphone.",
    rendu: (c, label, rang) => <Aquarelle teintes={c.teintes} label={label} graine={3 + rang * 4} className={TAILLE} />,
  },
  {
    nom: "Bille de verre",
    idee: "Une sphère translucide où la matière colorée flotte ; sur les bords, on la voit agrandie et renversée comme à travers une vraie lentille, avec un reflet net et une ombre au sol teintée par la lumière.",
    survol: "la bille se soulève et son ombre s’éloigne.",
    cout: "léger",
    pourquoi: "des dégradés fixes et deux petits calques flous qui bougent par transform.",
    rendu: (c, label) => <Verre teintes={c.teintes} label={label} className={TAILLE} />,
  },
  {
    nom: "Nacre",
    idee: "Un dégradé conique des teintes de la candidate tourne lentement sous une irisation de perle qui tourne à contresens.",
    survol: "la perle s’incline vers le pointeur et son reflet le suit.",
    cout: "léger",
    pourquoi: "deux dégradés qui tournent par transform ; le pointeur ne fait qu’écrire des variables CSS.",
    rendu: (c, label) => <Nacre teintes={c.teintes} label={label} className={TAILLE} />,
  },
  {
    nom: "Métaballes",
    idee: "Des gouttes de couleur qui se rapprochent, fusionnent en mêlant leurs teintes puis se séparent, calculées en Canvas 2D.",
    survol: "les gouttes sont attirées par le pointeur.",
    cout: "moyen",
    pourquoi: "environ 14 000 pixels calculés en JavaScript par image et par sphère, mis en pause hors de l’écran.",
    rendu: (c, label, rang) => <Metaballes teintes={c.teintes} label={label} depart={rang * 17} className={TAILLE} />,
  },
  {
    nom: "Plasma",
    idee: "Un champ de bruit coloré, déformé par lui-même, qui ondule très lentement comme une fumée dense.",
    survol: "le courant accélère et tourbillonne autour du pointeur.",
    cout: "moyen",
    pourquoi: "peu de calcul (une grille de 44 × 44 agrandie), mais un flou recalculé à chaque image.",
    rendu: (c, label, rang) => <Plasma teintes={c.teintes} label={label} depart={rang * 23} className={TAILLE} />,
  },
  {
    nom: "Planète",
    idee: "La matière tourne comme une surface autour d’un axe incliné, éclairée de côté, avec un passage doux du jour à la nuit.",
    survol: "le jour gagne sur la nuit et l’atmosphère s’éclaire.",
    cout: "léger",
    pourquoi: "une texture qui glisse par transform sous des dégradés fixes.",
    rendu: (c, label) => <Planete teintes={c.teintes} label={label} className={TAILLE} />,
  },
  {
    nom: "Respiration",
    idee: "La sphère gonfle et s’éclaire lentement, un halo très léger respire autour d’elle et des points de lumière orbitent.",
    survol: "elle inspire profondément et les lumières se resserrent autour d’elle.",
    cout: "léger",
    pourquoi: "seulement scale et opacity, plus huit points qui tournent.",
    rendu: (c, label) => <Respiration teintes={c.teintes} label={label} className={TAILLE} />,
  },
];

const PASTILLE: Record<Proposition["cout"], string> = {
  léger: "bg-[#e8f5ee] text-[#17633f]",
  moyen: "bg-[#fdf1dc] text-[#7a4c05]",
  lourd: "bg-[#fbe5e5] text-[#8f1f1f]",
};

export default function Spheres() {
  return (
    <div className={`${police.className} min-h-dvh bg-white text-[#111318]`}>
      <main className="mx-auto max-w-[1100px] px-6 py-16 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.03em]">Propositions pour les sphères</h1>
        <p className="mt-3 max-w-[62ch] text-lg leading-8 text-[#5f6573]">
          Neuf rendus possibles, chacun avec les teintes de Gaïa, d’Hygie et de Thémis. Survolez une sphère pour voir sa
          réaction. La neuvième, l’orbe vocale, est présentée en tête ; la première est la sphère du site aujourd’hui.
        </p>

        <ol className="mt-14">
          {PROPOSITIONS.map((p, i) => {
            // L'orbe vocale (9) est en tête : les suivantes gardent leur numéro d'origine.
            const numero = p.numero ?? i;
            return (
            <li key={p.nom} className="border-t border-[#e6e7eb] pt-12 pb-20">
              <div className="grid gap-x-10 gap-y-3 md:grid-cols-[5rem_1fr]">
                <p className="text-5xl font-semibold tabular-nums tracking-[-0.04em] text-[#c4c7cf]">{numero}</p>
                <div className="max-w-[68ch]">
                  <h2 className="text-2xl font-semibold tracking-[-0.02em]">{p.nom}</h2>
                  <p className="mt-2 text-[16px] leading-7 text-[#3d424d]">{p.idee}</p>
                  <p className="mt-1 text-[15px] leading-6 text-[#5f6573]">Au survol : {p.survol}</p>
                  <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-[14px] leading-6 text-[#5f6573]">
                    <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-medium ${PASTILLE[p.cout]}`}>
                      Coût {p.cout}
                    </span>
                    <span>{p.pourquoi.charAt(0).toUpperCase() + p.pourquoi.slice(1)}</span>
                  </p>
                </div>
              </div>

              <div className="mt-14 flex flex-wrap justify-center gap-x-12 gap-y-16 md:justify-between">
                {MONTREES.map(({ candidate, de }, rang) => (
                  <figure key={candidate.id} className="flex flex-col items-center">
                    {p.rendu(candidate, `Sphère ${de}, proposition ${numero} : ${p.nom.toLowerCase()}`, rang)}
                    <figcaption className="mt-8 text-[15px] font-medium text-[#3d424d]">{p.legende ? p.legende(candidate.prenom, rang) : candidate.prenom}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </li>
            );
          })}
        </ol>

        <p className="mt-4 text-sm text-[#6b6f7a]">
          <Link href="/maquettes" className="underline underline-offset-4">
            Retour aux maquettes
          </Link>
        </p>
      </main>
    </div>
  );
}
