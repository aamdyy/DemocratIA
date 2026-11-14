import { ViewTransition } from "react";

import { CASCADE } from "@/lib/animation";
import { CANDIDATES } from "@/lib/candidates";

/**
 * Entre deux pages : les couleurs des sept IA ondulent, le temps que la suivante arrive.
 * Invisible pendant les 200 premières millisecondes, pour ne jamais clignoter sur une navigation rapide.
 */
export default function Chargement() {
  return (
    <ViewTransition exit="page-sortie" default="none">
      <div role="status" className="chargement flex min-h-[60vh] flex-col items-center justify-center gap-5">
        <div aria-hidden className="flex items-center gap-2">
          {CANDIDATES.map((c, i) => (
            <span
              key={c.id}
              className="chargement-point size-2.5 rounded-full"
              style={{ background: c.teintes[1], animationDelay: `${i * CASCADE}s` }}
            />
          ))}
        </div>
        <p className="text-sm text-attenue">Chargement…</p>
      </div>
    </ViewTransition>
  );
}
