import { Entete } from "@/components/entete";
import { Pied } from "@/components/pied";

import { Mouvement } from "./mouvement";
import "./transitions.css";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Mouvement>
      {/* overflow-x-clip : une animation qui déborde un instant ne fait jamais apparaître de défilement horizontal. */}
      <div className="flex min-h-dvh flex-col overflow-x-clip">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-md focus:bg-texte focus:px-4 focus:text-sm focus:font-medium focus:text-fond"
        >
          Aller au contenu
        </a>
        <Entete />
        {/* tabIndex -1 : le lien d'évitement y pose le focus, sans qu'il entre dans l'ordre de tabulation. */}
        <main
          id="contenu"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 outline-none sm:px-6 lg:px-8 lg:py-12"
        >
          {children}
        </main>
        <Pied />
      </div>
    </Mouvement>
  );
}
