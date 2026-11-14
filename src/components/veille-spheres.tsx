"use client";

import { useEffect } from "react";

/**
 * Met en veille les sphères qui ne sont pas à l'écran : leurs nuages flous cessent de tourner,
 * ce qui soulage la carte graphique des téléphones (les flous animés sont ce qui coûte le plus).
 * Une sphère reprend exactement là où elle s'était arrêtée quand elle revient dans la vue.
 *
 * Un seul observateur pour tout le site : il suit les sphères qui apparaissent ou disparaissent
 * au fil de la navigation, sans que le composant Sphere ait besoin d'être un composant client.
 */
export function VeilleSpheres() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) entree.target.toggleAttribute("data-veille", !entree.isIntersecting);
      },
      // Un peu de marge : la sphère se réveille juste avant d'entrer à l'écran.
      { rootMargin: "120px 0px" },
    );
    const suivies = new Set<Element>();
    let image = 0;

    const scruter = () => {
      image = 0;
      for (const el of suivies) {
        if (!el.isConnected) {
          observateur.unobserve(el);
          suivies.delete(el);
        }
      }
      for (const el of document.querySelectorAll(".sphere")) {
        if (!suivies.has(el)) {
          suivies.add(el);
          observateur.observe(el);
        }
      }
    };
    // Au plus une recherche par image, quel que soit le nombre de changements dans la page.
    const planifier = () => {
      if (!image) image = requestAnimationFrame(scruter);
    };

    const mutations = new MutationObserver(planifier);
    // On attend que la page soit chargée et que React ait fini de l'hydrater : poser un attribut
    // sur un élément pas encore hydraté ferait diverger le HTML du serveur et celui du client.
    let attente = 0;
    const demarrer = () => {
      attente = window.setTimeout(() => {
        scruter();
        mutations.observe(document.body, { childList: true, subtree: true });
      }, 1200);
    };
    if (document.readyState === "complete") demarrer();
    else window.addEventListener("load", demarrer, { once: true });

    return () => {
      window.removeEventListener("load", demarrer);
      clearTimeout(attente);
      cancelAnimationFrame(image);
      mutations.disconnect();
      observateur.disconnect();
    };
  }, []);

  return null;
}
