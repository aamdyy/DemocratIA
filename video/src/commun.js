// Identité et réglages partagés par toutes les scènes : couleurs du site, polices, courbes, candidates.
import { Easing, interpolate } from "remotion";
import { loadFont as chargerPublicSans } from "@remotion/google-fonts/PublicSans";
import { loadFont as chargerDMMono } from "@remotion/google-fonts/DMMono";

export const FPS = 30;
export const DUREE = 80 * FPS;

export const { fontFamily: SANS } = chargerPublicSans("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
});
export const { fontFamily: MONO } = chargerDMMono("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] });

// Jetons de src/app/globals.css du site.
export const C = {
  fond: "#ffffff",
  relief: "#f5f6f8",
  trait: "#e3e5ea",
  texte: "#111318",
  attenue: "#5f6573",
  bleu: "#1d3fd8",
  rouge: "#e1000f",
  gris: "#aab0bd",
  absent: "#e9ebf0",
  machine: "#9c1f6b",
};

// Les sept IA candidates (src/lib/candidates.ts du site).
export const CANDIDATES = [
  { id: "gaia", prenom: "Gaïa", doctrine: "Le climat d'abord, toujours.", teintes: ["#e3f4ec", "#1f9d77", "#0f6b52", "#8fd6b9"] },
  { id: "themis", prenom: "Thémis", doctrine: "L'ordre et la sécurité.", teintes: ["#e1e9fb", "#2f5fe0", "#1b3a8f", "#9db9f2"] },
  { id: "hygie", prenom: "Hygie", doctrine: "Soigner, loger, protéger.", teintes: ["#fbe3ec", "#e0457b", "#9c1f4f", "#f5a3c2"] },
  { id: "plutus", prenom: "Plutus", doctrine: "Des comptes à l'équilibre.", teintes: ["#fdf0d8", "#c98a12", "#8a5a05", "#f2c66b"] },
  { id: "athena", prenom: "Athéna", doctrine: "Le savoir et les libertés numériques.", teintes: ["#dff3f7", "#0f9bb5", "#0a5f73", "#8bd5e4"] },
  { id: "harmonie", prenom: "Harmonie", doctrine: "Le compromis d'abord.", teintes: ["#ece8fb", "#7a5cd6", "#4a3596", "#c2b3f2"] },
  { id: "demeter", prenom: "Déméter", doctrine: "La France des territoires.", teintes: ["#f8e6dc", "#c2562f", "#7f3216", "#eba586"] },
];
export const GAGNANTE = CANDIDATES.find((c) => c.id === "athena");

// Courbes : sortie expo douce, sans rebond.
export const DOUX = Easing.bezier(0.16, 1, 0.3, 1);
export const EGAL = Easing.bezier(0.65, 0, 0.35, 1);

/** Interpolation bornée en secondes : t est le temps courant, [a, b] l'intervalle, [de, vers] les valeurs. */
export const entre = (t, a, b, de = 0, vers = 1, easing = DOUX) =>
  interpolate(t, [a, b], [de, vers], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** Apparition puis disparition : 0 avant a, 1 entre a+d et b-d, 0 après b. */
export const fenetre = (t, a, b, d = 0.5) =>
  Math.min(entre(t, a, a + d), 1 - entre(t, b - d, b, 0, 1, EGAL));
