"use client";

import { useEffect, useEffectEvent, useState } from "react";

import { CANDIDATES, positionCandidate } from "@/lib/candidates";
import { LIBELLE_POSITION, nombre, titreLisible } from "@/lib/format";
import { mandat, type Mandat } from "@/lib/mandat";
import type { Chapitre } from "@/lib/questions/chapitres";
import type { Position, Scrutin } from "@/lib/types";

import { EnteteChapitre } from "./chapitre";
import { DUREE_RETOUR, PileTextes, PileVide, type Geste, type Retour } from "./pile-textes";

type Historique = { id: string; genre: "vote" | "passe" };

/** Chapitre 1 : les vrais textes, à glisser, avec le vrai résultat de l'Assemblée après chaque réponse. */
export function ChapitreTextes({
  chapitre,
  scrutins,
  reglages,
  onAnnonce,
  onFini,
}: {
  chapitre: Chapitre;
  scrutins: Scrutin[];
  reglages: Mandat;
  onAnnonce: (texte: string) => void;
  onFini: () => void;
}) {
  const [geste, setGeste] = useState<Geste>(null);
  const [passes, setPasses] = useState<string[]>([]);
  const [historique, setHistorique] = useState<Historique[]>([]);
  const [retour, setRetour] = useState<Retour | null>(null);

  const restants = scrutins.filter((s) => !reglages.votes[s.id] && !passes.includes(s.id));
  const enCours = restants[0] ?? null;
  const traites = scrutins.length - restants.length;

  function arbitrer(position: Position) {
    if (retour) {
      continuer();
      return;
    }
    if (!enCours) return;
    const comme = CANDIDATES.filter((c) => positionCandidate(c, enCours) === position);
    const { pour, contre } = enCours.decompte;
    setGeste(position);
    setHistorique((h) => [...h, { id: enCours.id, genre: "vote" }]);
    setRetour({ scrutin: enCours, position, comme });
    onAnnonce(
      `Réponse enregistrée : ${LIBELLE_POSITION[position].toLowerCase()}. L'Assemblée a ${
        enCours.resultat === "adopte" ? "adopté" : "rejeté"
      } ce texte : ${nombre(pour)} pour, ${nombre(contre)} contre. ${
        comme.length ? `Comme vous : ${comme.map((c) => c.prenom).join(", ")}.` : "Aucune IA n'a voté comme vous."
      }`,
    );
    mandat.voter(enCours.id, position);
  }

  function continuer() {
    setRetour(null);
    if (restants.length > 0) onAnnonce(`Texte suivant : ${titreLisible(restants[0].titre)}.`);
  }

  // Le retour part seul ; la minuterie repart à zéro à chaque nouveau retour.
  const finDuRetour = useEffectEvent(() => continuer());
  useEffect(() => {
    if (!retour) return;
    const minuterie = setTimeout(() => finDuRetour(), DUREE_RETOUR);
    return () => clearTimeout(minuterie);
  }, [retour]);

  function passer() {
    if (retour) {
      continuer();
      return;
    }
    if (!enCours) return;
    setGeste("passe");
    setHistorique((h) => [...h, { id: enCours.id, genre: "passe" }]);
    setPasses((p) => [...p, enCours.id]);
    onAnnonce(`Texte passé. ${restants[1] ? `Texte suivant : ${titreLisible(restants[1].titre)}.` : "Tous les textes sont parcourus."}`);
  }

  function annuler() {
    const dernier = historique[historique.length - 1];
    if (!dernier) return;
    setGeste(null);
    setRetour(null);
    setHistorique((h) => h.slice(0, -1));
    if (dernier.genre === "vote") mandat.retirerVote(dernier.id);
    else setPasses((p) => p.filter((id) => id !== dernier.id));
    const scrutin = scrutins.find((s) => s.id === dernier.id);
    onAnnonce(scrutin ? `Retour au texte « ${titreLisible(scrutin.titre)} ».` : "Retour au texte précédent.");
  }

  return (
    <div>
      <EnteteChapitre
        chapitre={chapitre}
        etape={traites + (retour || !enCours ? 0 : 1)}
        total={scrutins.length}
        libelleEtape="Texte"
        onPasser={onFini}
      />
      {scrutins.length === 0 ? (
        <PileVide onTerminer={onFini} />
      ) : (
        <PileTextes
          scrutin={enCours}
          retour={retour}
          geste={geste}
          peutAnnuler={historique.length > 0}
          montrerGeste={traites === 0 && historique.length === 0}
          onArbitrer={arbitrer}
          onPasser={passer}
          onAnnuler={annuler}
          onContinuer={continuer}
          onTerminer={onFini}
        />
      )}
    </div>
  );
}
