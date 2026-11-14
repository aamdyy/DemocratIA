"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Sphere, type Teintes } from "@/components/sphere";
import { cn } from "@/lib/utils";

/*
 * L'orbe vocale : la sphère d'une IA candidate dessinée en WebGL, comme une bille remplie de nuages
 * lumineux qui montent et s'enroulent lentement. Au survol (ou quand `actif` est vrai), elle s'éveille :
 * les volutes accélèrent, se creusent et sont attirées vers le pointeur ; avec `actif`, elle pulse en plus
 * comme une voix qui parle.
 *
 * Chaque orbe ouvre un contexte WebGL et les navigateurs en limitent le nombre (environ 16 par page) :
 * à réserver aux grandes sphères. Les petites restent des <Sphere>.
 */

/** Le canevas dépasse la sphère de ce rapport de chaque côté, pour laisser la place à la dilatation. */
const MARGE = 0.16;
/** Résolution maximale du canevas (en pixels physiques par côté), pour les très grands écrans. */
const COTE_MAX = 1400;

const SOMMETS = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

/*
 * D'après le shader de l'orbe de référence : un disque au bord légèrement ondulant, lu comme une
 * demi-sphère, rempli de deux couches de bruit simplexe 3D (Ashima Arts, Stefan Gustavson, licence MIT)
 * qui mêlent la couleur profonde, la couleur claire et du blanc, avec un reflet de Fresnel au bord.
 */
const FRAGMENTS = `
precision highp float;

uniform vec2 uRes;
uniform float uRayon;
uniform float uEchelle;
uniform float uTemps;
uniform float uEveil;
uniform float uVoix;
uniform vec2 uPointeur;
uniform float uProximite;
uniform vec3 uProfond;
uniform vec3 uClair;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  // Repère de l'orbe de référence : un disque de rayon 0,38, ici ajusté à la taille de l'élément.
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / (uRayon * uEchelle) * 0.38;
  float dist = length(uv);
  float t = uTemps;

  // Bord qui ondule très légèrement (davantage quand l'orbe est éveillée ou parle).
  float angle = atan(uv.y, uv.x);
  float ampOnde = 1.0 + 2.0 * uEveil + 1.2 * uVoix;
  float wave = (sin(angle * 3.0 + t * 2.0) * 0.008 + cos(angle * 2.0 - t * 1.5) * 0.008) * ampOnde;
  float radius = 0.38 + wave;
  float alpha = 1.0 - smoothstep(radius - 0.015, radius + 0.005, dist);
  if (alpha <= 0.0) { gl_FragColor = vec4(0.0); return; }

  // Volume : le disque est lu comme une demi-sphère.
  vec2 normUV = uv / radius;
  float z = sqrt(max(0.0, 1.0 - dot(normUV, normUV)));
  vec3 pos = vec3(normUV, z);

  // Le pointeur attire légèrement la matière vers lui.
  vec2 d = uPointeur - normUV;
  float att = exp(-dot(d, d) * 2.0) * uProximite;
  pos.xy += d * att * 0.22 + uPointeur * 0.08 * uProximite;

  // Nuages : deux couches de bruit simplexe qui dérivent dans des sens différents.
  float n1 = snoise(pos * 1.8 + vec3(t * 0.35, -t * 0.25, t * 0.2));
  float n2 = snoise(pos * 3.2 - vec3(t * 0.4, t * 0.3, -t * 0.3));
  float contraste = 1.0 + 0.4 * uEveil + 0.3 * uVoix;
  float cloud = smoothstep(-0.6, 0.8, (n1 * 0.65 + n2 * 0.35) * contraste);

  vec3 blanc = vec3(0.96, 0.99, 1.0);
  vec3 color = mix(uProfond, uClair, cloud);
  color = mix(color, blanc, smoothstep(0.45, 0.95, cloud));
  float fresnel = pow(1.0 - z, 2.5);
  color = mix(color, blanc, fresnel * 0.45);

  // Éveil et voix : l'orbe s'éclaire un peu, surtout près du pointeur.
  color += (vec3(1.0) - color) * (0.05 * uEveil + 0.07 * uVoix + 0.08 * att);

  // Tramage invisible (1/255) pour éviter les paliers dans les dégradés.
  float bruitPixel = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  color += (bruitPixel - 0.5) / 255.0;

  // Alpha prémultiplié : pas de liseré gris sur fond blanc.
  gl_FragColor = vec4(clamp(color, 0.0, 1.0) * alpha, alpha);
}
`;

/* ------------------------------------------------------------------ */
/* Disponibilité de WebGL et préférence de mouvement                    */
/* ------------------------------------------------------------------ */

let webglTeste: boolean | null = null;
/** Vrai si le navigateur sait ouvrir un contexte WebGL. Testé une seule fois par page. */
function webglDisponible(): boolean {
  if (webglTeste !== null) return webglTeste;
  try {
    const essai = document.createElement("canvas");
    const gl = essai.getContext("webgl");
    webglTeste = gl !== null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglTeste = false;
  }
  return webglTeste;
}
const sansAbonnement = () => () => {};

const REQUETE_REDUITE = "(prefers-reduced-motion: reduce)";
const abonnerMouvement = (rappel: () => void) => {
  const mq = window.matchMedia(REQUETE_REDUITE);
  mq.addEventListener("change", rappel);
  return () => mq.removeEventListener("change", rappel);
};

/* ------------------------------------------------------------------ */
/* Couleurs                                                             */
/* ------------------------------------------------------------------ */

/** Convertit n'importe quelle couleur CSS (hexadécimal, hsl…) en RGB de 0 à 1, par un canevas 2D. */
function enRgb(couleurs: readonly string[]): number[][] {
  const ctx = document.createElement("canvas").getContext("2d");
  return couleurs.map((c) => {
    if (!ctx) return [0.8, 0.8, 0.8];
    ctx.fillStyle = "#000";
    ctx.fillStyle = c;
    const v = String(ctx.fillStyle);
    if (v.startsWith("#")) {
      const n = parseInt(v.slice(1, 7), 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }
    const m = v.match(/[\d.]+/g);
    return m ? [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255] : [0.8, 0.8, 0.8];
  });
}

/**
 * Les deux couleurs de l'orbe, à partir d'une clé « t1|t2|t3|t4 » (teintes de la candidate) ou
 * « =profond|clair » (couleurs imposées telles quelles).
 * Profond : la teinte sombre, un peu éclaircie vers la teinte pleine pour rester lumineuse comme le bleu
 * de référence ; clair : entre la teinte pleine et la teinte claire.
 */
function couleursOrbe(cle: string): [number[], number[]] {
  if (cle.startsWith("=")) {
    const [profond, clair] = enRgb(cle.slice(1).split("|"));
    return [profond, clair];
  }
  const c = enRgb(cle.split("|"));
  return [c[2].map((v, i) => v + (c[1][i] - v) * 0.4), c[1].map((v, i) => (v + c[3][i]) / 2)];
}

/** Une voix : des syllabes rapides et irrégulières, groupées en phrases séparées de courtes pauses. */
function voix(s: number): number {
  const syllabes = Math.abs(Math.sin(s * 4.6 + Math.sin(s * 1.7) * 1.8)) ** 1.4;
  const accent = 0.6 + 0.4 * Math.sin(s * 2.9 + 1.1);
  const phrase = Math.min(1, Math.max(0, (Math.sin(s * 0.85) + 0.55 * Math.sin(s * 2.1) + 0.45) * 1.6));
  return syllabes * accent * phrase;
}

/* ------------------------------------------------------------------ */
/* Le composant                                                         */
/* ------------------------------------------------------------------ */

export function SphereVocale({
  teintes,
  className,
  description,
  actif = false,
  couleurs,
}: {
  teintes: Teintes;
  className?: string;
  /** Texte lu par les lecteurs d'écran. Sans lui, la sphère est décorative. */
  description?: string;
  /** L'IA parle : la sphère reste éveillée et pulse comme une voix. */
  actif?: boolean;
  /** Couleurs imposées (profonde et claire), à la place de celles tirées des teintes. */
  couleurs?: { profond: string; clair: string };
}) {
  const webgl = useSyncExternalStore(sansAbonnement, webglDisponible, () => true);
  const reduit = useSyncExternalStore(
    abonnerMouvement,
    () => window.matchMedia(REQUETE_REDUITE).matches,
    () => false,
  );

  // Vrai si le contexte WebGL n'a pas pu être créé ou recréé : on revient alors à l'ancienne sphère.
  const [echec, setEchec] = useState(false);
  const racine = useRef<HTMLDivElement>(null);
  const attente = useRef<HTMLDivElement>(null);
  const actifRef = useRef(actif);
  const couleursRef = useRef<[number[], number[]] | null>(null);
  const redessiner = useRef<() => void>(() => {});
  const cleTeintes = couleurs ? `=${couleurs.profond}|${couleurs.clair}` : teintes.join("|");

  useEffect(() => {
    actifRef.current = actif;
    redessiner.current();
  }, [actif]);

  useEffect(() => {
    couleursRef.current = couleursOrbe(cleTeintes);
    redessiner.current();
  }, [cleTeintes]);

  useEffect(() => {
    const el = racine.current;
    const apercu = attente.current;
    if (!webgl || echec || !el) return;

    // Le canevas est créé ici, à chaque montage : un contexte libéré par loseContext ne se rouvre pas
    // sur le même canevas (le double montage du mode strict en recevrait un, déjà perdu).
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "pointer-events-none absolute transition-opacity duration-300";
    Object.assign(canvas.style, {
      left: `${-MARGE * 100}%`,
      top: `${-MARGE * 100}%`,
      width: `${(1 + 2 * MARGE) * 100}%`,
      height: `${(1 + 2 * MARGE) * 100}%`,
      opacity: "0",
    });
    el.appendChild(canvas);

    let gl = null as WebGLRenderingContext | null;
    let programme: WebGLProgram | null = null;
    let u: Record<string, WebGLUniformLocation | null> = {};
    let raf = 0;
    let dernier = 0;
    let premierRendu = false;
    let visible = true;
    let ongletVisible = document.visibilityState === "visible";
    let perdu = false;

    // L'état animé : chaque orbe part d'une phase différente pour ne pas ressembler à sa voisine.
    const e = {
      phase: Math.random() * 60,
      horloge: 0,
      eveil: 0,
      voix: 0,
      echelle: 1,
      vitesseEchelle: 0,
      pointeur: [0, 0.2],
      cible: [0, 0.2],
      proximite: 0,
      survol: false,
    };

    const compiler = (type: number, source: string) => {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn("SphereVocale :", gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const initialiser = (): boolean => {
      gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: true, alpha: true, powerPreference: "low-power" });
      if (!gl || gl.isContextLost()) return false;
      const vs = compiler(gl.VERTEX_SHADER, SOMMETS);
      const fs = compiler(gl.FRAGMENT_SHADER, FRAGMENTS);
      if (!vs || !fs) return false;
      programme = gl.createProgram();
      if (!programme) return false;
      gl.attachShader(programme, vs);
      gl.attachShader(programme, fs);
      gl.linkProgram(programme);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(programme, gl.LINK_STATUS)) return false;
      gl.useProgram(programme);
      const tampon = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, tampon);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const pos = gl.getAttribLocation(programme, "aPos");
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
      u = {};
      for (const nom of ["uRes", "uRayon", "uEchelle", "uTemps", "uEveil", "uVoix", "uPointeur", "uProximite", "uProfond", "uClair"]) {
        u[nom] = gl.getUniformLocation(programme, nom);
      }
      return true;
    };

    const dimensionner = () => {
      const cote = el.clientWidth;
      // Toujours deux fois la taille affichée, comme l'orbe de référence.
      const dpr = 2;
      const px = Math.max(2, Math.min(COTE_MAX, Math.round(cote * (1 + 2 * MARGE) * dpr)));
      if (canvas.width !== px || canvas.height !== px) {
        canvas.width = px;
        canvas.height = px;
      }
    };

    const dessiner = () => {
      if (!gl || !programme || perdu) return;
      dimensionner();
      const [profond, clair] = couleursRef.current ?? couleursOrbe(cleTeintes);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform1f(u.uRayon, canvas.width / (2 * (1 + 2 * MARGE)));
      gl.uniform1f(u.uEchelle, e.echelle);
      gl.uniform1f(u.uTemps, e.phase);
      gl.uniform1f(u.uEveil, e.eveil);
      gl.uniform1f(u.uVoix, e.voix);
      gl.uniform2f(u.uPointeur, e.pointeur[0], e.pointeur[1]);
      gl.uniform1f(u.uProximite, e.proximite);
      gl.uniform3fv(u.uProfond, profond);
      gl.uniform3fv(u.uClair, clair);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!premierRendu) {
        premierRendu = true;
        canvas.style.opacity = "1";
        if (apercu) apercu.style.opacity = "0";
      }
    };

    const avancer = (dt: number) => {
      const parle = actifRef.current;
      const cibleEveil = e.survol || parle ? 1 : 0;
      // Retour en douceur : environ 600 ms pour rejoindre la cible.
      e.eveil += (cibleEveil - e.eveil) * (1 - Math.exp(-dt / 0.19));
      e.horloge += dt;
      const cibleVoix = parle ? voix(e.horloge) : 0;
      e.voix += (cibleVoix - e.voix) * (1 - Math.exp(-dt / 0.07));
      // Vitesse des volutes : ×2,8 une fois éveillée.
      e.phase += dt * (1 + 1.8 * e.eveil + 0.6 * e.voix);
      // Dilatation : ressort critique, donc sans rebond.
      const cibleEchelle = 1 + 0.04 * e.eveil + 0.035 * e.voix;
      const w = 16;
      const pas = Math.ceil(dt / (1 / 120));
      const h = dt / pas;
      for (let i = 0; i < pas; i++) {
        e.vitesseEchelle += (w * w * (cibleEchelle - e.echelle) - 2 * w * e.vitesseEchelle) * h;
        e.echelle += e.vitesseEchelle * h;
      }
      const suivi = 1 - Math.exp(-dt / 0.12);
      e.pointeur[0] += (e.cible[0] - e.pointeur[0]) * suivi;
      e.pointeur[1] += (e.cible[1] - e.pointeur[1]) * suivi;
      e.proximite += ((e.survol ? 1 : 0) - e.proximite) * (1 - Math.exp(-dt / 0.2));
    };

    const image = (maintenant: number) => {
      raf = 0;
      const dt = dernier ? Math.min(0.05, (maintenant - dernier) / 1000) : 1 / 60;
      dernier = maintenant;
      avancer(dt);
      dessiner();
      planifier();
    };

    function planifier() {
      if (raf || reduit || perdu || !visible || !ongletVisible) return;
      raf = requestAnimationFrame(image);
    }
    const suspendre = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      dernier = 0;
    };

    if (!initialiser()) {
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      gl = null;
      canvas.remove();
      // Hors du corps de l'effet : on revient à l'ancienne sphère au rendu suivant.
      queueMicrotask(() => setEchec(true));
      return;
    }

    // En mouvement réduit, une seule image fixe, redessinée seulement quand quelque chose change.
    redessiner.current = () => {
      if (reduit) dessiner();
    };
    dessiner();
    planifier();

    const observateurTaille = new ResizeObserver(() => {
      if (reduit || !raf) dessiner();
    });
    observateurTaille.observe(el);

    const observateurVue = new IntersectionObserver(([entree]) => {
      visible = entree?.isIntersecting ?? true;
      if (visible) planifier();
      else suspendre();
    });
    observateurVue.observe(el);

    const changementOnglet = () => {
      ongletVisible = document.visibilityState === "visible";
      if (ongletVisible) planifier();
      else suspendre();
    };
    document.addEventListener("visibilitychange", changementOnglet);

    const placer = (ev: PointerEvent) => {
      const b = el.getBoundingClientRect();
      const rayon = b.width / 2 || 1;
      const x = (ev.clientX - (b.left + rayon)) / rayon;
      const y = -(ev.clientY - (b.top + b.height / 2)) / rayon;
      e.cible = [Math.max(-1.2, Math.min(1.2, x)), Math.max(-1.2, Math.min(1.2, y))];
    };
    const entrer = (ev: PointerEvent) => {
      e.survol = true;
      placer(ev);
      planifier();
    };
    const sortir = () => {
      e.survol = false;
    };
    el.addEventListener("pointerenter", entrer);
    el.addEventListener("pointermove", placer);
    el.addEventListener("pointerleave", sortir);

    const contextePerdu = (ev: Event) => {
      ev.preventDefault();
      perdu = true;
      suspendre();
    };
    const contexteRetrouve = () => {
      perdu = false;
      premierRendu = false;
      if (initialiser()) {
        dessiner();
        planifier();
      } else {
        setEchec(true);
      }
    };
    canvas.addEventListener("webglcontextlost", contextePerdu);
    canvas.addEventListener("webglcontextrestored", contexteRetrouve);

    return () => {
      suspendre();
      perdu = true;
      redessiner.current = () => {};
      observateurTaille.disconnect();
      observateurVue.disconnect();
      document.removeEventListener("visibilitychange", changementOnglet);
      el.removeEventListener("pointerenter", entrer);
      el.removeEventListener("pointermove", placer);
      el.removeEventListener("pointerleave", sortir);
      canvas.removeEventListener("webglcontextlost", contextePerdu);
      canvas.removeEventListener("webglcontextrestored", contexteRetrouve);
      if (gl) {
        if (programme) gl.deleteProgram(programme);
        // Libère tout de suite le contexte : le navigateur n'en garde qu'un nombre limité.
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
      gl = null;
      programme = null;
      canvas.remove();
      if (apercu) apercu.style.opacity = "1";
    };
    // Les teintes et `actif` sont lues par référence : seul un changement de support ou de préférence relance tout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webgl, reduit, echec]);

  if (!webgl || echec) {
    return <Sphere teintes={teintes} description={description} className={className} />;
  }

  return (
    <div
      ref={racine}
      role={description ? "img" : undefined}
      aria-label={description}
      aria-hidden={description ? undefined : true}
      className={cn("relative aspect-square rounded-full", className)}
    >
      {/* Aperçu en dégradé, le temps que la première image soit dessinée (et si WebGL échoue). */}
      <div
        ref={attente}
        aria-hidden
        className="absolute inset-0 rounded-full transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 50% 22%, #fff 0%, ${teintes[0]} 26%, ${teintes[3]} 52%, ${teintes[1]} 78%, ${teintes[2]} 100%)`,
        }}
      />
      {/* Le canevas WebGL est ajouté ici par l'effet. */}
    </div>
  );
}
