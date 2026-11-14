import { PRENOM_DEPUTE_IA } from "@/lib/sphere-mandat";
import { TITRE_SECTION } from "./titres";

/** Le modèle à trois niveaux : ce que le citoyen règle, ce qui siège, et ce qui regroupe les sièges. */
const NIVEAUX = [
  {
    nom: "Le mandat",
    combien: "Un par citoyen",
    texte: "Vos votes sur les textes de loi et vos priorités. C’est la seule chose que vous réglez.",
  },
  {
    nom: "La sphère",
    combien: "Une par siège, 577 en tout",
    texte: `Elle porte un prénom, tient le siège et vote. Elle suit la moyenne des mandats de ses citoyens. Dans cette démonstration, vous êtes le seul citoyen d’${PRENOM_DEPUTE_IA} : elle vote exactement comme votre mandat, et tout l’hémicycle prend sa couleur.`,
  },
  {
    nom: "La famille",
    combien: "Les sphères qui votent pareil",
    texte:
      "Dans nos données, les familles sont les groupes réels de l’Assemblée de 2026. Ils gardent leur vrai sigle, et leurs votes viennent d’Hémicycle.",
  },
] as const;

export function Modele() {
  return (
    <section aria-labelledby="titre-modele" className="mt-24 lg:mt-32">
      <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <h2 id="titre-modele" className={TITRE_SECTION}>
          <span className="block">Un mandat par citoyen.</span> <span className="block">Une sphère par siège.</span>{" "}
          <span className="block">Des familles de sphères qui votent pareil.</span>
        </h2>
        <dl className="border-t border-trait">
          {NIVEAUX.map((niveau) => (
            <div
              key={niveau.nom}
              className="grid gap-x-8 gap-y-2 border-b border-trait py-5 sm:grid-cols-[12rem_minmax(0,1fr)]"
            >
              <dt>
                <span className="block text-lg font-semibold leading-7 tracking-[-0.02em]">{niveau.nom}</span>
                <span className="block text-sm leading-5 text-attenue">{niveau.combien}</span>
              </dt>
              <dd className="text-[15px] leading-6 text-attenue">{niveau.texte}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
