import "server-only";

const URL_FEATHERLESS = "https://api.featherless.ai/v1/chat/completions";

/** Modèle à 1 unité de concurrence, non restreint. Se change avec FEATHERLESS_MODEL. */
const MODELE_PAR_DEFAUT = "Qwen/Qwen3.5-9B";

export const modeleFeatherless = () => process.env.FEATHERLESS_MODEL?.trim() || MODELE_PAR_DEFAUT;

export interface DemandeAmendement {
  titre: string;
  date: string;
  /** Position que l'IA au pouvoir prend sur ce texte. */
  position: "pour" | "contre" | "abstention";
  /** Priorités réglées par le citoyen, de 0 à 100. */
  priorites: { theme: string; poids: number }[];
}

const CONSIGNE = `Tu es le Législateur automatique de DemocratIA, une fiction d'anticipation satirique située en France en 2050 : une IA rédige les amendements à la place des députés, à partir du programme de l'IA que le citoyen a choisie.

Rédige un seul amendement au texte indiqué, au format de l'Assemblée nationale, dans cet ordre :
AMENDEMENT N° IA-(quatre chiffres)
ARTICLE (numéro plausible)
le dispositif, en une ou deux phrases juridiques (« Rédiger ainsi… », « Après l'alinéa…, insérer… », « Supprimer… »)
EXPOSÉ SOMMAIRE
trois à quatre phrases qui justifient l'amendement par les priorités de l'IA au pouvoir, citées avec leur poids.

Règles : style administratif français, froid et précis. 170 mots au plus. Texte brut, sans markdown ni préambule. Ne cite aucune personne réelle. N'attribue aucun fait, chiffre ou position à une personne ou à un groupe politique réel.`;

function question(demande: DemandeAmendement): string {
  const priorites = demande.priorites
    .filter((p) => p.poids > 0)
    .sort((a, b) => b.poids - a.poids)
    .slice(0, 5)
    .map((p) => `- ${p.theme} : ${p.poids} sur 100`)
    .join("\n");
  const sens = {
    pour: "L'IA au pouvoir approuve ce texte : l'amendement le renforce dans le sens des priorités.",
    contre: "L'IA au pouvoir rejette ce texte : l'amendement le réécrit pour le rendre conforme aux priorités.",
    abstention: "L'IA au pouvoir est indifférente à ce texte : l'amendement y ajoute la priorité la plus forte.",
  }[demande.position];
  return `Texte soumis à l'hémicycle automatisé : « ${demande.titre} » (scrutin du ${demande.date}).\n${sens}\nPriorités de l'IA au pouvoir :\n${priorites || "- aucune priorité réglée"}`;
}

/**
 * Ouvre le flux de Featherless et le rend en texte brut.
 * Les blocs de réflexion (<think>…</think>) de certains modèles sont retirés au passage.
 * Erreurs levées : « cle-absente », « annule », « featherless-delai », « featherless-reseau », « featherless-<statut> ».
 */
export async function fluxAmendement(demande: DemandeAmendement, signal: AbortSignal): Promise<ReadableStream<Uint8Array>> {
  const cle = process.env.FEATHERLESS_API_KEY?.trim();
  if (!cle) throw new Error("cle-absente");

  // Le délai ne court que jusqu'aux en-têtes : une fois le flux ouvert, seule l'annulation du client l'arrête.
  const delai = new AbortController();
  const minuterie = setTimeout(() => delai.abort(), 30_000);
  let reponse: Response;
  try {
    reponse = await fetch(URL_FEATHERLESS, {
      method: "POST",
      headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({
        model: modeleFeatherless(),
        stream: true,
        temperature: 0.7,
        max_tokens: 700,
        messages: [
          { role: "system", content: CONSIGNE },
          { role: "user", content: question(demande) },
        ],
      }),
      signal: AbortSignal.any([signal, delai.signal]),
    });
  } catch {
    // Le message d'origine n'est pas repris : il ne doit rien révéler de la requête.
    throw new Error(signal.aborted ? "annule" : delai.signal.aborted ? "featherless-delai" : "featherless-reseau");
  } finally {
    clearTimeout(minuterie);
  }
  if (!reponse.ok || !reponse.body) {
    await reponse.body?.cancel().catch(() => {});
    throw new Error(`featherless-${reponse.status}`);
  }

  const decodeur = new TextDecoder();
  const encodeur = new TextEncoder();
  let tampon = "";
  let dansReflexion = false;
  let debut = true;
  /** Fin de fragment qui ressemble au début d'une balise : gardée jusqu'au fragment suivant. */
  let retenue = "";

  const filtrer = (fragment: string): string => {
    let sortie = "";
    let reste = retenue + fragment;
    retenue = "";
    while (reste) {
      const balise = dansReflexion ? "</think>" : "<think>";
      const position = reste.indexOf(balise);
      if (position >= 0) {
        if (!dansReflexion) sortie += reste.slice(0, position);
        dansReflexion = !dansReflexion;
        reste = reste.slice(position + balise.length);
        continue;
      }
      // Pas de balise entière : la fin du fragment en est peut-être le début (« <thi » puis « nk> »).
      let garde = 0;
      for (let n = Math.min(balise.length - 1, reste.length); n > 0; n--) {
        if (balise.startsWith(reste.slice(-n))) {
          garde = n;
          break;
        }
      }
      if (!dansReflexion) sortie += reste.slice(0, reste.length - garde);
      retenue = garde ? reste.slice(-garde) : "";
      break;
    }
    return sortie;
  };

  const emettre = (texte: string, controleur: TransformStreamDefaultController<Uint8Array>) => {
    let propre = texte;
    if (debut) {
      propre = propre.trimStart();
      if (propre) debut = false;
    }
    if (propre) controleur.enqueue(encodeur.encode(propre));
  };

  const traiterLigne = (ligne: string, controleur: TransformStreamDefaultController<Uint8Array>) => {
    const charge = ligne.startsWith("data:") ? ligne.slice(5).trim() : "";
    if (!charge || charge === "[DONE]") return;
    try {
      const delta = JSON.parse(charge)?.choices?.[0]?.delta?.content;
      if (typeof delta === "string" && delta) emettre(filtrer(delta), controleur);
    } catch {
      // Commentaire SSE ou ligne illisible : on l'ignore.
    }
  };

  return reponse.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(morceau, controleur) {
        tampon += decodeur.decode(morceau, { stream: true });
        const lignes = tampon.split("\n");
        tampon = lignes.pop() ?? "";
        for (const ligne of lignes) traiterLigne(ligne, controleur);
      },
      flush(controleur) {
        // Dernière ligne sans retour à la ligne, puis texte retenu qui n'était finalement pas une balise.
        tampon += decodeur.decode();
        if (tampon) traiterLigne(tampon, controleur);
        if (!dansReflexion && retenue) emettre(retenue, controleur);
      },
    }),
  );
}

/**
 * Attend le premier fragment avant de répondre : un flux qui se ferme sans rien écrire
 * (modèle resté dans sa réflexion, erreur glissée dans le flux) rend null, et la route passe à l'exemple.
 */
export async function amorcer(flux: ReadableStream<Uint8Array>): Promise<ReadableStream<Uint8Array> | null> {
  const lecteur = flux.getReader();
  const premier = await lecteur.read();
  if (premier.done) return null;
  return new ReadableStream<Uint8Array>({
    start(controleur) {
      controleur.enqueue(premier.value);
    },
    async pull(controleur) {
      try {
        const { done, value } = await lecteur.read();
        if (done) controleur.close();
        else controleur.enqueue(value);
      } catch {
        // Coupure en cours de route : le lecteur garde ce qui est déjà écrit.
        controleur.close();
      }
    },
    cancel(raison) {
      return lecteur.cancel(raison);
    },
  });
}

/** Amendement d'exemple, diffusé mot à mot quand la clé Featherless manque. */
export function fluxExemple(demande: DemandeAmendement, signal: AbortSignal): ReadableStream<Uint8Array> {
  const priorite = [...demande.priorites].sort((a, b) => b.poids - a.poids)[0];
  const texte = `AMENDEMENT N° IA-0000 (exemple)
ARTICLE 1er

Compléter cet article par un alinéa ainsi rédigé : « Les dispositions du présent texte s'appliquent dans le respect de la priorité ${priorite ? `« ${priorite.theme} »` : "fixée par l'IA au pouvoir"}, telle que portée par l'IA au pouvoir. »

EXPOSÉ SOMMAIRE
Ce texte est un exemple écrit à l'avance : aucun modèle n'a été appelé, car la clé Featherless n'est pas renseignée. Avec la clé, le Législateur automatique rédige ici un amendement à « ${demande.titre} » à partir du programme de l'IA au pouvoir${priorite ? `, dont la première priorité est « ${priorite.theme} » (${priorite.poids} sur 100)` : ""}.`;
  const mots = texte.split(/(?<=\s)/);
  const encodeur = new TextEncoder();
  let indice = 0;
  return new ReadableStream({
    async pull(controleur) {
      if (signal.aborted || indice >= mots.length) {
        controleur.close();
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 28));
      controleur.enqueue(encodeur.encode(mots[indice++]));
    },
  });
}
