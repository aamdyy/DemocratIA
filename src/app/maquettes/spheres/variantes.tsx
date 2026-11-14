"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";

import type { Teintes } from "@/components/sphere";
import { cn } from "@/lib/utils";

import "./spheres.css";

/** Ce que reçoit chaque proposition : les teintes d'une candidate et le texte lu par les lecteurs d'écran. */
export interface ProprietesSphere {
  teintes: Teintes;
  label: string;
  className?: string;
}

const variables = (t: Teintes) =>
  ({ "--s1": t[0], "--s2": t[1], "--s3": t[2], "--s4": t[3] }) as React.CSSProperties;

const REQUETE_REDUITE = "(prefers-reduced-motion: reduce)";
const abonnerMouvement = (rappel: () => void) => {
  const mq = window.matchMedia(REQUETE_REDUITE);
  mq.addEventListener("change", rappel);
  return () => mq.removeEventListener("change", rappel);
};
/** Vrai si l'utilisateur a demandé moins d'animations. Faux côté serveur. */
function useMouvementReduit() {
  return useSyncExternalStore(
    abonnerMouvement,
    () => window.matchMedia(REQUETE_REDUITE).matches,
    () => false,
  );
}

/* ------------------------------------------------------------------ */
/* 2. Aquarelle vivante                                                 */
/* ------------------------------------------------------------------ */

/**
 * Pigments en lavis qui se superposent (multiply) sur le papier. Un bruit fractal, que l'on fait
 * glisser lentement par feOffset (aller-retour, donc sans saut), déplace les bords : ils ondulent
 * comme de l'eau, et le bord du disque lui-même semble peint à la main.
 */
export function Aquarelle({ teintes, label, className, graine = 3 }: ProprietesSphere & { graine?: number }) {
  const id = `aq${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const reduit = useMouvementReduit();
  const spline = "0.45 0 0.55 1;0.45 0 0.55 1";
  return (
    <div role="img" aria-label={label} className={cn("msph-racine", "msph-aquarelle", className)} style={variables(teintes)}>
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={id} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed={graine} result="bruit" />
          <feOffset in="bruit" dx="0" dy="0" result="flot">
            {!reduit && (
              <>
                <animate attributeName="dx" values="0;42;0" dur="23s" keyTimes="0;0.5;1" calcMode="spline" keySplines={spline} repeatCount="indefinite" />
                <animate attributeName="dy" values="0;-34;0" dur="31s" keyTimes="0;0.5;1" calcMode="spline" keySplines={spline} repeatCount="indefinite" />
              </>
            )}
          </feOffset>
          <feDisplacementMap in="SourceGraphic" in2="flot" scale="15" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="msph-aqLavis" style={{ filter: `url(#${id})` }}>
        <div className={cn("msph-disque", "msph-aqDisque")}>
          <span className="msph-aqPigment" />
          <span className="msph-aqPigment" />
          <span className="msph-aqPigment" />
          <span className="msph-aqPigment" />
          <span className="msph-aqReserve" />
          <span className="msph-aqPapier" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Bille de verre                                                    */
/* ------------------------------------------------------------------ */

function MatiereVerre() {
  return (
    <div className="msph-verreCoeur">
      <div className="msph-verreMatiere">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function Verre({ teintes, label, className }: ProprietesSphere) {
  return (
    <div role="img" aria-label={label} className={cn("msph-racine", "msph-verre", className)} style={variables(teintes)}>
      <span className="msph-verreOmbre" />
      <span className="msph-verreCaustiqueSol" />
      <div className="msph-verreBille">
        <div className={cn("msph-disque", "msph-verreCorps")}>
          <MatiereVerre />
          <div className="msph-verreLentille">
            <div className="msph-verreRenverse">
              <MatiereVerre />
            </div>
          </div>
          <span className={cn("msph-couche", "msph-verreSurface")} />
          <span className="msph-verreArc" />
          <span className="msph-verreSpeculaire" />
          <span className="msph-verrePoint" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Nacre                                                             */
/* ------------------------------------------------------------------ */

/** Le pointeur incline la perle et déplace son reflet ; on écrit des variables CSS, sans rendu React. */
export function Nacre({ teintes, label, className }: ProprietesSphere) {
  const ref = useRef<HTMLDivElement>(null);
  const suivre = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || window.matchMedia(REQUETE_REDUITE).matches) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = ((e.clientY - r.top) / r.height) * 2 - 1;
    el.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
    el.style.setProperty("--dx", `${(x * 30).toFixed(2)}cqw`);
    el.style.setProperty("--dy", `${(y * 30).toFixed(2)}cqw`);
  };
  const relacher = () => {
    const el = ref.current;
    if (!el) return;
    for (const p of ["--rx", "--ry", "--dx", "--dy"]) el.style.removeProperty(p);
  };
  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      className={cn("msph-racine", "msph-nacre", className)}
      style={variables(teintes)}
      onPointerMove={suivre}
      onPointerLeave={relacher}
    >
      <div className={cn("msph-disque", "msph-nacreCorps")}>
        <span className="msph-nacreConique" />
        <span className="msph-nacreIrisation" />
        <span className={cn("msph-couche", "msph-nacreLustre")} />
        <span className="msph-nacreReflet" />
        <span className="msph-grain" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5 et 6. Canvas 2D                                                    */
/* ------------------------------------------------------------------ */

type Rgb = readonly [number, number, number];
interface Pointeur {
  u: number;
  v: number;
  dedans: boolean;
}
type Dessin = (t: number, dt: number) => void;
type Fabrique = (ctx: CanvasRenderingContext2D, couleurs: Rgb[], pointeur: Pointeur) => Dessin;

/** Convertit n'importe quelle couleur CSS opaque en RGB, en laissant le navigateur la lire. */
function versRgb(couleur: string): Rgb {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return [200, 200, 200];
  ctx.fillStyle = couleur;
  const h = String(ctx.fillStyle);
  if (h.startsWith("#")) return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const m = h.match(/\d+(\.\d+)?/g)?.map(Number) ?? [200, 200, 200];
  return [m[0], m[1], m[2]];
}

const lisser = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/**
 * Boucle d'animation d'un canvas : une image par rafraîchissement, en pause hors de l'écran,
 * une seule image fixe si l'utilisateur a demandé moins d'animations.
 */
function useBoucle(
  ref: React.RefObject<HTMLCanvasElement | null>,
  pointeur: React.RefObject<Pointeur>,
  fabrique: Fabrique,
  teintes: Teintes,
  depart: number,
) {
  const reduit = useMouvementReduit();
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dessiner = fabrique(ctx, teintes.map(versRgb), pointeur.current);
    let t = depart;
    dessiner(t, 0);
    if (reduit) return;
    let raf = 0;
    let dernier = 0;
    let visible = false;
    const image = (maintenant: number) => {
      const dt = dernier ? Math.min(0.05, (maintenant - dernier) / 1000) : 0;
      dernier = maintenant;
      t += dt;
      dessiner(t, dt);
      raf = requestAnimationFrame(image);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !visible) {
        visible = true;
        dernier = 0;
        raf = requestAnimationFrame(image);
      } else if (!e.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ref, pointeur, fabrique, teintes, depart, reduit]);
}

function useSphereCanvas(fabrique: Fabrique, teintes: Teintes, depart: number) {
  const toile = useRef<HTMLCanvasElement>(null);
  const pointeur = useRef<Pointeur>({ u: 0.5, v: 0.5, dedans: false });
  useBoucle(toile, pointeur, fabrique, teintes, depart);
  const evenements = {
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      pointeur.current.u = (e.clientX - r.left) / r.width;
      pointeur.current.v = (e.clientY - r.top) / r.height;
      pointeur.current.dedans = true;
    },
    onPointerLeave: () => {
      pointeur.current.dedans = false;
    },
  };
  return { toile, evenements };
}

/* --- 5. Métaballes --- */

const N_META = 120;

const metaballes: Fabrique = (ctx, [fond, c1, c2, c3], p) => {
  const N = N_META;
  const img = ctx.createImageData(N, N);
  const d = img.data;
  // Une goutte de lait : le fond éclairci, pas un blanc pur qui ferait une tache.
  const blanc: Rgb = [(fond[0] + 255 * 2) / 3, (fond[1] + 255 * 2) / 3, (fond[2] + 255 * 2) / 3];
  // Chaque goutte suit deux sinusoïdes de périodes sans rapport simple : le trajet ne se répète pas à l'œil.
  const gouttes = [
    { c: c1, r: 0.25, ax: 0.16, ay: 0.13, wx: 0.23, wy: 0.19, px: 0, py: 1.2, attr: 0.35 },
    { c: c2, r: 0.21, ax: 0.19, ay: 0.17, wx: 0.17, wy: 0.26, px: 2.4, py: 0.3, attr: 0.25 },
    { c: c3, r: 0.23, ax: 0.15, ay: 0.2, wx: 0.29, wy: 0.15, px: 4.1, py: 3.3, attr: 0.3 },
    { c: c1, r: 0.15, ax: 0.24, ay: 0.21, wx: 0.13, wy: 0.31, px: 1.7, py: 5.2, attr: 0.45 },
    { c: blanc, r: 0.13, ax: 0.22, ay: 0.18, wx: 0.34, wy: 0.21, px: 3.3, py: 2.2, attr: 0.5 },
    { c: c2, r: 0.12, ax: 0.25, ay: 0.24, wx: 0.27, wy: 0.37, px: 5.5, py: 4.4, attr: 0.4 },
  ];
  const n = gouttes.length;
  const gx = new Float32Array(n);
  const gy = new Float32Array(n);
  const r2 = new Float32Array(n);
  let k = 0;
  return (t, dt) => {
    k += ((p.dedans ? 1 : 0) - k) * Math.min(1, dt * 2.5);
    for (let i = 0; i < n; i++) {
      const g = gouttes[i];
      let x = 0.5 + g.ax * Math.sin(g.wx * t + g.px) + 0.05 * Math.sin(g.wx * 2.3 * t + g.py);
      let y = 0.5 + g.ay * Math.sin(g.wy * t + g.py) + 0.05 * Math.cos(g.wy * 1.9 * t + g.px);
      const a = k * g.attr;
      x += (p.u - x) * a;
      y += (p.v - y) * a;
      gx[i] = x;
      gy[i] = y;
      r2[i] = g.r * g.r * (1 + k * 0.15);
    }
    let o = 0;
    for (let j = 0; j < N; j++) {
      const v = (j + 0.5) / N;
      for (let i = 0; i < N; i++) {
        const u = (i + 0.5) / N;
        // somme : le champ (la matière est là où il dépasse 1) ; poids : pour mélanger les couleurs,
        // chaque goutte pèse le carré de son champ, ce qui garde des teintes nettes au cœur.
        let somme = 0;
        let poids = 1e-6;
        let r = 0;
        let g = 0;
        let b = 0;
        for (let q = 0; q < n; q++) {
          const dx = u - gx[q];
          const dy = v - gy[q];
          const f = r2[q] / (dx * dx + dy * dy + 1e-4);
          // Plafonné : sans cela, le centre exact de chaque goutte ferait un point dur.
          const fc = f < 2.5 ? f : 2.5;
          const f2 = fc * fc;
          somme += f;
          poids += f2;
          const c = gouttes[q].c;
          r += f2 * c[0];
          g += f2 * c[1];
          b += f2 * c[2];
        }
        // Le bord de la matière : une transition douce autour du seuil 1.
        const a = lisser((somme - 0.7) / 0.7);        const cr = r / poids;
        const cg = g / poids;
        const cb = b / poids;
        d[o] = fond[0] + (cr - fond[0]) * a;
        d[o + 1] = fond[1] + (cg - fond[1]) * a;
        d[o + 2] = fond[2] + (cb - fond[2]) * a;
        d[o + 3] = 255;
        o += 4;
      }
    }
    ctx.putImageData(img, 0, 0);
  };
};

export function Metaballes({ teintes, label, className, depart = 0 }: ProprietesSphere & { depart?: number }) {
  const { toile, evenements } = useSphereCanvas(metaballes, teintes, depart);
  return (
    <div role="img" aria-label={label} className={cn("msph-racine", "msph-canvasRacine", className)} style={variables(teintes)} {...evenements}>
      <div className="msph-disque">
        <canvas ref={toile} width={N_META} height={N_META} className="msph-toile" />
        <span className="msph-volume" />
        <span className="msph-grain" />
      </div>
    </div>
  );
}

/* --- 6. Plasma --- */

const N_PLASMA = 44;

/** Hachage entier d'un point du réseau, vers [0, 1]. */
function hacher(x: number, y: number, z: number) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  h ^= h >>> 16;
  return (h & 0xffff) / 0xffff;
}
const fondu = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const melange = (a: number, b: number, t: number) => a + (b - a) * t;

/** Bruit de valeur en 3D, interpolé en quintique : continu, donc sans à-coup quand z avance. */
function bruit(x: number, y: number, z: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const u = fondu(x - xi);
  const v = fondu(y - yi);
  const w = fondu(z - zi);
  const c = (a: number, b: number, e: number) => hacher(xi + a, yi + b, zi + e);
  return melange(
    melange(melange(c(0, 0, 0), c(1, 0, 0), u), melange(c(0, 1, 0), c(1, 1, 0), u), v),
    melange(melange(c(0, 0, 1), c(1, 0, 1), u), melange(c(0, 1, 1), c(1, 1, 1), u), v),
    w,
  );
}

const plasma: Fabrique = (ctx, [s1, s2, s3, s4], p) => {
  const N = N_PLASMA;
  const img = ctx.createImageData(N, N);
  const d = img.data;
  const rampe: Rgb[] = [s1, s4, s2, s3];
  let z = 0;
  let vitesse = 1;
  let k = 0;
  let premier = true;
  return (t, dt) => {
    if (premier) {
      z = t * 0.09;
      premier = false;
    }
    k += ((p.dedans ? 1 : 0) - k) * Math.min(1, dt * 2);
    vitesse = 1 + k * 2.5;
    z += dt * 0.09 * vitesse;
    let o = 0;
    for (let j = 0; j < N; j++) {
      const v = (j + 0.5) / N;
      for (let i = 0; i < N; i++) {
        const u = (i + 0.5) / N;
        const x = u * 2.4;
        const y = v * 2.4;
        const qx = bruit(x * 0.9 + 1.7, y * 0.9 + 9.2, z);
        const qy = bruit(x * 0.9 + 8.3, y * 0.9 + 2.8, z * 1.1 + 3);
        let wx = x + 1.8 * qx;
        let wy = y + 1.8 * qy;
        if (k > 0.01) {
          // Un remous autour du pointeur.
          const dx = u - p.u;
          const dy = v - p.v;
          const b = k * Math.exp(-(dx * dx + dy * dy) * 10) * 3;
          wx += -dy * b;
          wy += dx * b;
        }
        const n = bruit(wx, wy, z * 0.8) * 0.75 + bruit(wx * 2.1 + 5, wy * 2.1 + 1, z * 1.3) * 0.25;
        const sv = lisser((n - 0.2) / 0.6) * 0.999 * (rampe.length - 1);
        const a = Math.floor(sv);
        const f = sv - a;
        const c0 = rampe[a];
        const c1 = rampe[a + 1];
        d[o] = c0[0] + (c1[0] - c0[0]) * f;
        d[o + 1] = c0[1] + (c1[1] - c0[1]) * f;
        d[o + 2] = c0[2] + (c1[2] - c0[2]) * f;
        d[o + 3] = 255;
        o += 4;
      }
    }
    ctx.putImageData(img, 0, 0);
  };
};

export function Plasma({ teintes, label, className, depart = 0 }: ProprietesSphere & { depart?: number }) {
  const { toile, evenements } = useSphereCanvas(plasma, teintes, depart);
  return (
    <div role="img" aria-label={label} className={cn("msph-racine", "msph-canvasRacine", className)} style={variables(teintes)} {...evenements}>
      <div className="msph-disque" style={{ background: teintes[0] }}>
        <canvas ref={toile} width={N_PLASMA} height={N_PLASMA} className="msph-toileFloue" />
        <span className="msph-volume" />
        <span className="msph-grain" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Planète                                                           */
/* ------------------------------------------------------------------ */

export function Planete({ teintes, label, className }: ProprietesSphere) {
  return (
    <div role="img" aria-label={label} className={cn("msph-racine", "msph-planete", className)} style={variables(teintes)}>
      <span className="msph-planeteAtmo" />
      <div className={cn("msph-disque", "msph-planeteGlobe")}>
        <div className="msph-planeteAxe">
          <div className="msph-planeteSurface" />
          <div className="msph-planeteNuages" />
        </div>
        <span className={cn("msph-couche", "msph-planeteJour")} />
        <span className="msph-planeteNuit" />
        <span className={cn("msph-couche", "msph-planeteRelief")} />
        <span className="msph-grain" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Respiration                                                       */
/* ------------------------------------------------------------------ */

/** Rayon, durée du tour, sens, taille et rythme de scintillement de chaque point de lumière. */
const PARTICULES = [
  { r: 56, d: 22, sens: "normal", t: 2.2, sc: 2.6, phase: 0.05 },
  { r: 62, d: 31, sens: "reverse", t: 1.6, sc: 3.4, phase: 0.3 },
  { r: 53, d: 18, sens: "normal", t: 1.3, sc: 2.1, phase: 0.55 },
  { r: 66, d: 37, sens: "normal", t: 2.6, sc: 4.2, phase: 0.72 },
  { r: 59, d: 26, sens: "reverse", t: 1.9, sc: 3, phase: 0.9 },
  { r: 47, d: 15, sens: "normal", t: 1.4, sc: 2.4, phase: 0.42 },
  { r: 64, d: 29, sens: "reverse", t: 1.2, sc: 3.8, phase: 0.18 },
  { r: 51, d: 21, sens: "reverse", t: 2, sc: 2.8, phase: 0.64 },
] as const;

export function Respiration({ teintes, label, className }: ProprietesSphere) {
  return (
    <div role="img" aria-label={label} className={cn("msph-racine", "msph-souffle", className)} style={variables(teintes)}>
      <div className="msph-souffleHaloSurvol">
        <span className="msph-souffleHalo" />
      </div>
      <div className="msph-souffleCorps">
        <div className={cn("msph-disque", "msph-souffleSphere")}>
          <span className="msph-souffleMatiere" />
          <span className={cn("msph-couche", "msph-souffleLumiere")} />
          <span className="msph-volume" />
          <span className="msph-grain" />
        </div>
      </div>
      <div className="msph-souffleOrbites">
        {PARTICULES.map((p, i) => (
          <span
            key={i}
            className="msph-orbite"
            style={
              {
                "--d": `${p.d}s`,
                "--sens": p.sens,
                "--delai": `${(-p.d * p.phase).toFixed(2)}s`,
                "--angle": `${Math.round(p.phase * 360)}deg`,
              } as React.CSSProperties
            }
          >
            <i
              className="msph-particule"
              style={{ "--r": `${p.r}cqw`, "--t": `${(p.t * 1.7).toFixed(2)}cqw`, "--sc": `${p.sc}s` } as React.CSSProperties}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
