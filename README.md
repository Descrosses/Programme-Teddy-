# Programme Teddy — 4 semaines

Application web installable (PWA) pour suivre le programme de musculation de
Teddy décrit dans [`programme-teddy-4-semaines.md`](programme-teddy-4-semaines.md).

Même application que le programme 12 semaines de Guillaume, adaptée : thème
rouge et noir, 4 séances par semaine (haut / bas) sur 4 semaines, combine
sans test de maximum (semaine 1 et semaine 4), charges en reps en réserve et
toutes autorégulées, onglet Nutrition limité aux principes généraux.

Fonctionne à 100 % hors ligne après la première ouverture. Toutes les données
restent sur l'appareil : pas de compte, pas de serveur. La base locale porte
son propre nom (`programme-teddy`) : installer cette appli sur le même
téléphone que le programme 12 semaines ne mélange rien.

## Le principe

Le fichier `.md` est la **source de vérité**. Le code ne le réinterprète pas :

- `src/data/` transcrit le programme, et rien d'autre — aucune logique.
- `src/engine/` contient les fonctions pures qui décident (séance du jour,
  progression, feu tricolore). Aucun React.
- `src/db/` stocke ce qui a réellement été fait.
- `src/screens/` et `src/components/` affichent.

`src/data/teddy.test.ts` vérifie à chaque déploiement les règles bloquantes de
la méthode : 16 séances, aucune au-delà de 60 min, explosif en ouverture,
aucune charge inventée, aucun test de maximum, progression J1/J2. Si l'une
tombe, le déploiement échoue.

## Développement

```bash
npm install
npm run dev        # serveur local
npm test
npm run typecheck
npm run build      # génère dist/ avec le service worker
```

Régénérer les icônes après un changement de couleur :

```bash
node scripts/generate-icons.mjs
```

## Déploiement

Un push sur `main` déclenche [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) :
tests, vérification des types, build, publication sur GitHub Pages. Le `base`
de Vite est déduit du nom du dépôt, donc renommer le dépôt ne casse rien.

## Polices

Barlow Condensed (500 et 700) est embarqué dans `src/assets/fonts/`, jamais
chargé depuis internet : sans réseau dans la salle, la mise en page ne doit pas
changer. Licence SIL Open Font License 1.1, voir `src/assets/fonts/OFL.txt`.

## Limite connue — chrono et verrouillage d'écran

iOS suspend le JavaScript d'une page en arrière-plan et n'offre aucune API de
notification programmée dans le futur. Une alerte sonore à l'instant exact où
le repos se termine, écran verrouillé, n'est donc pas réalisable depuis une
application web sur iPhone.

Deux parades sont en place :

1. **Screen Wake Lock** — l'écran est maintenu allumé pendant le repos. La
   barre de chrono affiche « écran allumé » ou « écran non tenu » pour que ce
   soit vérifiable d'un coup d'œil, en salle.
2. **Horodatage de fin** — le chrono ne décompte pas, il compare à une heure de
   fin stockée. Même si l'appli est tuée puis relancée, le temps affiché au
   retour est juste.
