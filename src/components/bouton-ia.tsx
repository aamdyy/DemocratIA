"use client";

import Link from "next/link";
import { useRef } from "react";

import { useMaSphere } from "@/components/accueil/ma-sphere";
import { Sphere, type Teintes } from "@/components/sphere";
import { cn } from "@/lib/utils";

/**
 * Le bouton du site, retenu par l'équipe (propositions 2 et 5 de /maquettes/boutons) :
 * une pilule avec une petite sphère vivante qui grossit au survol, et qui suit légèrement le pointeur.
 * La sphère prend les couleurs de l'IA du citoyen dès que le test est commencé.
 * `variante="contour"` donne la version secondaire, blanche et cerclée.
 */
export function BoutonIA({
  href,
  onClick,
  children,
  variante = "plein",
  teintes,
  desactive = false,
  className,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variante?: "plein" | "contour";
  teintes?: Teintes;
  desactive?: boolean;
  className?: string;
}) {
  const { teintes: miennes } = useMaSphere();
  const ref = useRef<HTMLElement>(null);

  // L'effet aimanté : seulement avec une souris, et coupé si l'utilisateur réduit les animations.
  const suivre = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || desactive) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.translate = `${(e.clientX - r.x - r.width / 2) * 0.15}px ${(e.clientY - r.y - r.height / 2) * 0.25}px`;
  };
  const relacher = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.translate = "0 0";
  };

  const classes = cn(
    "group inline-flex h-14 items-center gap-3 rounded-full pl-2 pr-7 text-base font-medium transition-[translate,scale,background-color,border-color] duration-200 ease-out active:scale-[0.97]",
    "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-texte",
    variante === "plein" ? "bg-texte text-fond" : "border border-trait bg-fond text-texte hover:border-texte",
    desactive && "pointer-events-none opacity-60",
    className,
  );
  const contenu = (
    <>
      <Sphere
        teintes={teintes ?? miennes}
        duree={8}
        className="size-10 shrink-0 transition-transform duration-500 ease-out group-hover:scale-110"
      />
      <span>{children}</span>
    </>
  );
  const evenements = { onPointerMove: suivre, onPointerLeave: relacher };

  if (href && !desactive) {
    return (
      <Link href={href} ref={ref as React.Ref<HTMLAnchorElement>} className={classes} onClick={onClick} {...evenements}>
        {contenu}
      </Link>
    );
  }
  return (
    <button
      type="button"
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      onClick={onClick}
      disabled={desactive}
      aria-disabled={desactive || undefined}
      {...evenements}
    >
      {contenu}
    </button>
  );
}
