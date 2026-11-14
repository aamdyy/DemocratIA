import { Entete } from "@/components/entete";
import { Pied } from "@/components/pied";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:px-3 focus:py-2"
      >
        Aller au contenu
      </a>
      <Entete />
      <main id="contenu" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {children}
      </main>
      <Pied />
    </div>
  );
}
