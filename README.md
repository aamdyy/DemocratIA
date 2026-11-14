# DemocratIA

**En 2050, on ne vote plus pour un parti. On règle une sphère.**

DemocratIA est une fiction d'anticipation interactive. En 2050, la présidentielle oppose sept intelligences artificielles. Pour trouver la vôtre, vous tranchez de **vrais textes de loi votés à l'Assemblée nationale**, puis le site révèle l'IA candidate qui vous ressemble, la montre au pouvoir, et finit par dire honnêtement ce qu'une telle idée a de dangereux.

Projet réalisé pour le hackathon **IA & Open Data** (Swanbase × Hémicycle × Featherless).

- **Site en ligne** : https://democratia-one.vercel.app
- **Vidéo de présentation** (77 s, voix off anglaise, sous-titres français) : [`video/out/democratia.mp4`](video/out/democratia.mp4)

## Le parcours

| Page | Ce qu'on y fait |
|---|---|
| [Accueil](https://democratia-one.vercel.app) | Le manège des sept IA candidates, le comparatif « Ce qu'un humain promet, une IA le tient. » et le récit en trois temps, en schémas animés. |
| [Le test](https://democratia-one.vercel.app/test) | Sept chapitres : vrais textes de loi à trancher, « D'accord ou pas », budget de 100 milliards, scénarios 2050, dilemmes, classement des priorités, pronostics « Devinez l'Assemblée ». Une course des sept IA réagit à chaque réponse. |
| [Le résultat](https://democratia-one.vercel.app/resultat) | Votre IA, votre affinité, l'écart avec la deuxième, ce sur quoi le calcul repose, et le partage. |
| [Les candidates](https://democratia-one.vercel.app/candidates) | Gaïa, Thémis, Hygie, Plutus, Athéna, Harmonie, Déméter : leur doctrine, leur composition, leurs votes sur les vrais textes. |
| [Au pouvoir](https://democratia-one.vercel.app/seance) | L'hémicycle réel de 2026 bascule à la couleur de votre IA, qui tranche un vrai texte et rédige son amendement en direct. |
| [Audit](https://democratia-one.vercel.app/audit) | Les votes publics d'un député réel comparés, texte par texte, à votre IA. Des faits sourcés, aucun score ni jugement. |
| [Honnêteté](https://democratia-one.vercel.app/honnetete) | Les dangers d'une IA au pouvoir, les limites de ce prototype, notre autocritique, et une note d'espoir. |
| Invitation | Un lien de partage personnalisé (« Son IA, c'est Hygie, à 84 %. Et la vôtre ? ») avec son image d'aperçu générée. |

## Les données et les modèles

- **Hémicycle** ([api.hemicycle.ai](https://hemicycle.ai/docs)) : les scrutins de la 17e législature (votes sur l'ensemble d'un texte, via le jeu `scrutins`), le résultat par groupe et le vote nominatif de chaque député, les fiches des parlementaires. Données de l'Assemblée nationale sous **Licence Ouverte 2.0** ; chaque donnée affichée porte sa source, sa date et sa licence. Les réponses sont gardées en cache pour ne pas repayer les mêmes crédits.
- **Featherless** : rédaction de l'amendement en direct, en flux, par un modèle ouvert (`Qwen/Qwen3.5-9B` par défaut).
- **Vidéo** : montage [Remotion](https://www.remotion.dev), voix off et musique originales générées avec **ElevenLabs**, visuels réalistes générés avec **kie.ai**.

Ce qui est réel : les textes de loi, les décomptes, les votes des groupes et des députés. Ce qui est fictif : les sept IA candidates, leurs règles, les scénarios 2050 et les amendements rédigés par l'IA.

## Comment c'est calculé

- Chaque IA candidate a un poids de 0 à 100 par thème. Elle vote **pour** un texte si son poids sur le thème du texte dépasse 65, **contre** s'il est sous 35, et s'abstient entre les deux.
- Le thème d'un texte est estimé par mots-clés dans son intitulé.
- Votre affinité avec une IA mélange l'accord sur les textes que vous avez tranchés et la proximité entre vos priorités et les siennes. Chaque format du test se traduit en poids par thème (détail dans `src/lib/questions/poids.ts`).

C'est volontairement simple et entièrement public. La page [Honnêteté](https://democratia-one.vercel.app/honnetete) détaille pourquoi ce calcul ne doit pas être pris pour une analyse politique.

## Lancer le projet en local

Prérequis : Node 24 et pnpm.

```bash
pnpm install
cp .env.example .env.local   # puis renseigner HEMICYCLE_API_KEY et, si besoin, FEATHERLESS_API_KEY
pnpm dev                     # http://localhost:3000
```

Sans clé Hémicycle, le site fonctionne sur des **données d'exemple** fictives, signalées comme telles à l'écran. Les clés ne sont lues que côté serveur et ne sont jamais envoyées au navigateur.

La vidéo est un projet séparé dans [`video/`](video) (Remotion). Les clés ElevenLabs et kie.ai sont lues depuis le trousseau macOS au lancement, jamais écrites dans le code :

```bash
cd video && npm install
ELEVENLABS_API_KEY="$(security find-generic-password -a kork -s elevenlabs-api -w)" node scripts/voix.mjs
KIE_API_KEY="$(security find-generic-password -a kork -s kie-api -w)" node scripts/visuels.mjs
npm run render
```

## Pile technique

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Motion, SWR ; police Public Sans ; déploiement sur Vercel.

```
src/app/(app)/        pages du parcours (accueil, test, résultat, candidates, séance, audit, honnêteté, invitation)
src/app/api/          routes serveur : scrutins, positions des groupes, députés, état des connexions, amendement en flux
src/lib/hemicycle/    client Hémicycle (cache disque, reprises, normalisation des réponses, données d'exemple)
src/lib/candidates.ts les sept IA candidates et le calcul d'affinité
src/components/       sphères, emblèmes, hémicycle, graphiques, bouton, en-tête, pied de page
src/app/maquettes/    les maquettes et propositions de design qui ont servi aux choix
video/                la vidéo de présentation (Remotion)
```

## Limites

Prototype de hackathon : le thème des textes est deviné, les candidates sont des caricatures, l'affinité est un calcul simple, et un modèle de langage peut écrire un amendement absurde. Aucun score ni aucune accusation ne vise une personne réelle : l'audit d'un député ne montre que ses votes publics et sourcés. DemocratIA pose une question ; il ne plaide pas pour la réponse.
