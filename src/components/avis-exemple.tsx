import type { MetaReponse } from "@/lib/types";

/** Prévient que la vue tourne sur des données d'exemple, et dit comment obtenir les vraies. */
export function AvisExemple({ meta }: { meta: MetaReponse | undefined }) {
  if (meta?.origine !== "exemple") return null;
  return (
    <p role="status" className="mb-10 rounded-md bg-relief px-4 py-3 text-sm leading-6 text-attenue">
      <strong className="font-medium text-texte">Cette vue affiche des données d&apos;exemple, aux valeurs fictives.</strong>{" "}
      {meta.raison}
    </p>
  );
}
