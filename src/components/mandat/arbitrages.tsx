"use client";

import { AnimatePresence, motion } from "motion/react";

import { PositionLibelle } from "@/components/position";
import { SourceBadge } from "@/components/source-badge";
import { nombre, titreLisible } from "@/lib/format";
import type { Decompte, Position, Scrutin } from "@/lib/types";

const pluriel = (n: number, mot: string) => `${nombre(n)} ${mot}${n > 1 ? "s" : ""}`;

/** Les textes déjà tranchés : la position du citoyen, puis ce que l'Assemblée a réellement décidé. */
export function Arbitrages({
  arbitres,
  votes,
  onModifier,
}: {
  /** Textes arbitrés, le plus récent d'abord. */
  arbitres: Scrutin[];
  votes: Record<string, Position>;
  onModifier: (scrutin: Scrutin) => void;
}) {
  return (
    <section aria-labelledby="titre-arbitrages" className="mt-14">
      <h2 id="titre-arbitrages" className="font-titre text-xl font-medium">
        Vos arbitrages
      </h2>
      {arbitres.length === 0 ? (
        <p className="mt-3 max-w-md text-[15px] leading-6 text-attenue">
          Aucun texte tranché pour l&apos;instant. Dès votre première réponse, vous verrez ici ce que l&apos;Assemblée a
          réellement décidé.
        </p>
      ) : (
        <ol className="mt-4 border-t border-trait">
          <AnimatePresence initial={false}>
            {arbitres.map((scrutin) => (
              <LigneArbitrage
                key={scrutin.id}
                scrutin={scrutin}
                position={votes[scrutin.id]}
                onModifier={onModifier}
              />
            ))}
          </AnimatePresence>
        </ol>
      )}
    </section>
  );
}

function LigneArbitrage({
  scrutin,
  position,
  onModifier,
}: {
  scrutin: Scrutin;
  position: Position;
  onModifier: (scrutin: Scrutin) => void;
}) {
  const titre = titreLisible(scrutin.titre);
  const { pour, contre, abstention } = scrutin.decompte;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="border-b border-trait py-5"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[17px] font-medium leading-6">{titre}</h3>
        <button
          type="button"
          onClick={() => onModifier(scrutin)}
          className="-my-2.5 -mr-3 inline-flex min-h-11 shrink-0 items-center px-3 text-sm text-attenue underline decoration-trait underline-offset-4 transition-colors duration-150 hover:text-texte hover:decoration-current"
        >
          Modifier<span className="sr-only"> votre arbitrage sur : {titre}</span>
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-2 text-[15px] leading-6">
        <dt className="text-attenue">Vous</dt>
        <dd>
          <PositionLibelle position={position} />
        </dd>
        <dt className="text-attenue">L&apos;Assemblée</dt>
        <dd>
          <span className="font-medium">{scrutin.resultat === "adopte" ? "Texte adopté" : "Texte rejeté"}</span>
          <span className="text-attenue">
            {" "}
            : {nombre(pour)} pour, {nombre(contre)} contre, {pluriel(abstention, "abstention")}
          </span>
          <Repartition decompte={scrutin.decompte} />
        </dd>
      </dl>

      <SourceBadge source={scrutin.source} className="mt-3" />
    </motion.li>
  );
}

/** Les suffrages en un trait : bleu pour, rouge contre, gris abstention. Les chiffres sont écrits juste au-dessus. */
function Repartition({ decompte }: { decompte: Decompte }) {
  if (decompte.pour + decompte.contre + decompte.abstention === 0) return null;
  return (
    <span aria-hidden className="mt-2 flex h-1 max-w-xs gap-px">
      <span className="bg-pour" style={{ flexGrow: decompte.pour }} />
      <span className="bg-contre" style={{ flexGrow: decompte.contre }} />
      <span className="bg-abstention" style={{ flexGrow: decompte.abstention }} />
    </span>
  );
}
