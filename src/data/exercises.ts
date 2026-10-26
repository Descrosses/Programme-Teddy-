/**
 * Catalogue des exercices — POWERBUILDING — MASSE & FORCE (Teddy).
 *
 * `id` est GELÉ : c'est la clé de l'historique. On peut corriger un `name`,
 * une consigne ou une alternative sans rien casser ; changer un `id`
 * déconnecte l'historique de l'exercice.
 *
 * Choix d'exercices : accessibles, stables, faciles à faire progresser —
 * machines guidées, poulies, haltères. Aucun mouvement technique complexe
 * imposé (pas de squat lourd, de tractions lestées, de relevés de jambes
 * suspendus ni d'Ab Wheel).
 *
 * Les abdos sont rangés par NIVEAUX. On ne change pas de niveau selon la
 * semaine, mais selon la maîtrise : haut de la plage, technique propre, deux
 * séances de suite. Les variantes des niveaux 2 et 3 sont au catalogue pour
 * pouvoir remplacer l'exercice depuis la séance (bouton « Remplacer »).
 *
 * Ce fichier ne contient ni séries, ni répétitions, ni charges : elles
 * dépendent de la semaine et vivent dans `baseSessions.ts` / `blockRules.ts`.
 */

import type { ExerciseDef } from './types';

/** Critère de passage de niveau, commun à tous les abdos. */
const PASSAGE_NIVEAU =
  'Passer au niveau suivant : quand tu fais le haut de la plage sur toutes les séries, technique propre, deux séances de suite. Jamais parce qu’une semaine le dit.';

const LIST: ExerciseDef[] = [
  // ------------------------- LUNDI — épaules, triceps, biceps (Guillaume) --
  {
    id: 'reverse-pec-deck',
    name: 'Oiseau à la machine (reverse pec deck)',
    fn: 'pull',
    role: 'accessory',
    measure: 'kg',
    intent: 'Les 3 séries sont différentes : lis la consigne de chacune avant de commencer.',
    secondPart: { label: 'Après 5 s de pause : max de reps jusqu’à l’échec', withLoad: false, onSets: [0, 2] },
    cues: [
      'Série 1 — 8 à 10 reps : une répétition = une demi-amplitude puis une amplitude complète. Cherche la contraction maximale, pas d’ego lifting. Ensuite 5 s de pause, puis le maximum de reps jusqu’à l’échec.',
      'Série 2 — contraction maintenue : 5 reps, puis tiens 5 s bras ouverts. Enchaîne ce bloc 3 fois de suite.',
      'Série 3 — tempo : 8 à 10 reps, ouverture explosive, retour en 3 s. Ensuite 5 s de pause, puis le maximum de reps.',
      'Repos : 45 s entre les séries, 3 min avant le développé militaire.',
    ],
  },
  {
    id: 'smith-military-press',
    name: 'Développé militaire à la Smith machine',
    fn: 'push',
    role: 'main',
    measure: 'kg',
    intent: 'Chaque série en deux temps, sans repos entre les deux : 6 reps lourdes, puis 10 à 12 reps à environ 60 % de la charge.',
    secondPart: { label: 'Puis aussitôt 10 à 12 reps à ≈ 60 %', withLoad: true },
    cues: [
      'Lourd = une charge qui t’en permettrait 7 à 8 au maximum : 1 à 2 reps en réserve.',
      'Exemple : 6 reps à 50 kg, puis aussitôt 12 reps à 30 kg.',
      'Saisis les deux parties : la partie lourde en haut, la partie à ≈ 60 % juste en dessous (reps et charge).',
    ],
  },
  {
    id: 'front-raise',
    name: 'Élévations frontales',
    fn: 'push',
    role: 'accessory',
    measure: 'kg',
    intent: 'Un bras à la fois, montée jusqu’à hauteur d’épaule, contraction maximale 1 s en haut.',
  },
  {
    id: 'bench-rear-delt-fly',
    name: 'Oiseau sur banc, haltères',
    fn: 'pull',
    role: 'accessory',
    measure: 'kg',
    intent: 'Poitrine sur un banc incliné, bras qui s’ouvrent, contraction maximale en haut, omoplates serrées.',
  },
  {
    id: 'skull-crusher',
    name: 'Barre au front',
    fn: 'push',
    role: 'accessory',
    measure: 'kg',
    intent: 'Superset avec le curl barre EZ. Coudes fixes, descente en 3 s vers le front, seuls les avant-bras bougent.',
  },
  {
    id: 'ez-curl',
    name: 'Curl biceps barre EZ',
    fn: 'pull',
    role: 'accessory',
    measure: 'kg',
    intent: 'Enchaîné juste après la barre au front. Coudes fixes, descente en 3 s.',
  },
  {
    id: 'suitcase-hold',
    name: 'Gainage debout, une haltère',
    fn: 'core',
    role: 'core',
    measure: 'kg',
    intent: 'Debout, une haltère lourde dans UNE seule main. Reste parfaitement droit : le flanc opposé travaille pour t’empêcher de pencher. Contraction maximale.',
  },

  // ----------------------------------------- LUNDI — pectoraux, triceps --
  {
    id: 'bench-press',
    name: 'Développé couché',
    fn: 'push',
    role: 'main',
    measure: 'kg',
    intent: 'Barre ou machine guidée. Descente contrôlée, poussée franche, fesses sur le banc.',
    altBasicFit: 'Machine convergente ou développé couché guidé : même progression, même plage.',
    cues: [
      'Semaine 1 : monte par paliers jusqu’à la charge qui fait 10 reps en gardant 3 en réserve. Note-la, c’est ta référence.',
      'Omoplates serrées, pieds ancrés. Garde le même choix (barre ou machine) pendant tout le cycle.',
    ],
  },
  {
    id: 'incline-db-press',
    name: 'Développé incliné haltères',
    fn: 'push',
    role: 'accessory',
    measure: 'kg',
    intent: 'Banc à 30°, descente contrôlée, haltères qui se rapprochent en haut.',
    cues: ['Semaine 1 : départ autour de 20 kg par haltère, puis ajuste pour garder la réserve prévue.'],
  },
  {
    id: 'pec-deck',
    name: 'Pec deck ou écarté poulie',
    fn: 'push',
    role: 'accessory',
    measure: 'kg',
    intent: 'Bras légèrement fléchis, on serre la poitrine en fin de mouvement, retour lent.',
  },
  {
    id: 'dips',
    name: 'Dips (assistés ou machine)',
    fn: 'push',
    role: 'accessory',
    measure: 'kg',
    intent: 'Descente jusqu’à environ 90° au coude, épaules basses.',
    altBasicFit: 'Machine à dips assistée : la charge saisie est l’assistance, moins elle est lourde, plus c’est dur.',
    cues: ['Si l’épaule tire en bas du mouvement, réduis l’amplitude.'],
  },
  {
    id: 'triceps-pushdown',
    name: 'Extension triceps poulie',
    fn: 'push',
    role: 'accessory',
    measure: 'kg',
    intent: 'Coudes collés au corps, extension complète, retour contrôlé.',
  },

  // ------------------------------------------- MARDI — dos, biceps --
  {
    id: 'lat-pulldown',
    name: 'Tirage vertical',
    fn: 'pull',
    role: 'main',
    measure: 'kg',
    intent: 'Barre tirée vers le haut de la poitrine, buste légèrement en arrière, sans balancer.',
    cues: [
      'Semaine 1 : trouve la charge qui fait 10 reps en gardant 3 en réserve. Note-la, c’est ta référence.',
    ],
  },
  {
    id: 'machine-row',
    name: 'Rowing machine, poitrine en appui',
    fn: 'pull',
    role: 'accessory',
    measure: 'kg',
    intent: 'Poitrine collée au support, coudes tirés vers l’arrière, omoplates serrées en fin de mouvement.',
  },
  {
    id: 'db-row',
    name: 'Rowing haltère',
    fn: 'pull',
    role: 'accessory',
    measure: 'kg',
    intent: 'Un genou et une main sur le banc, coude tiré vers la hanche, dos plat.',
  },
  {
    id: 'face-pull',
    name: 'Face pull',
    fn: 'pull',
    role: 'accessory',
    measure: 'kg',
    intent: 'Corde à hauteur du visage, mains qui écartent la corde, coudes hauts.',
  },
  {
    id: 'db-curl',
    name: 'Curl haltères',
    fn: 'pull',
    role: 'accessory',
    measure: 'kg',
    intent: 'Coudes fixes, sans élan, descente contrôlée.',
  },

  // ------------------------------------------------- JEUDI — jambes --
  {
    id: 'leg-press',
    name: 'Presse à cuisses',
    fn: 'squat',
    role: 'main',
    measure: 'kg',
    intent: 'Bas du dos collé au dossier, amplitude complète sans décoller le bassin.',
    altBasicFit: 'Squat guidé (Smith machine) : même plage de reps.',
    cues: [
      'Semaine 1 : trouve la charge qui fait 10 reps en gardant 3 en réserve. Note-la, c’est ta référence.',
    ],
  },
  {
    id: 'leg-curl',
    name: 'Leg curl',
    fn: 'hinge',
    role: 'accessory',
    measure: 'kg',
    intent: 'Montée franche, descente lente, bassin collé au support.',
    cues: [
      'Ischio-jambiers : 4e série possible à partir de la semaine 2, seulement si tu as bien récupéré de la séance jambes précédente (plus de courbatures après 48 h).',
    ],
  },
  {
    id: 'leg-extension',
    name: 'Leg extension',
    fn: 'squat',
    role: 'accessory',
    measure: 'kg',
    intent: 'Une seconde en haut, descente lente.',
  },
  {
    id: 'split-squat',
    name: 'Split squat haltères',
    fn: 'squat',
    role: 'accessory',
    measure: 'kg',
    intent: 'Buste droit, genou arrière qui frôle le sol, poussée dans le talon avant.',
  },
  {
    id: 'calf-raise',
    name: 'Mollets machine',
    fn: 'squat',
    role: 'accessory',
    measure: 'kg',
    intent: 'Amplitude complète, une seconde en haut, descente jusqu’à l’étirement.',
  },

  // ------------------------------- SAMEDI — épaules, bras, rappels --
  {
    id: 'machine-shoulder-press',
    name: 'Développé épaules machine',
    fn: 'push',
    role: 'main',
    measure: 'kg',
    intent: 'Dos collé au dossier, poussée verticale, sans cambrer.',
    cues: [
      'Semaine 1 : trouve la charge qui fait 10 reps en gardant 3 en réserve. Note-la, c’est ta référence.',
    ],
  },
  {
    id: 'lateral-raise',
    name: 'Élévations latérales',
    fn: 'push',
    role: 'accessory',
    measure: 'kg',
    intent: 'Chaque série en deux temps : 10 reps à RPE 8 (2 en réserve), puis aussitôt le maximum de reps à environ 60 % de la charge.',
    secondPart: { label: 'Puis aussitôt le max de reps à ≈ 60 %', withLoad: true },
    cues: [
      'Coudes légèrement fléchis, montée jusqu’à l’horizontale, sans élan.',
      'Saisis les deux parties : les 10 premières reps en haut, la partie à ≈ 60 % juste en dessous (reps et charge).',
    ],
  },
  {
    id: 'incline-machine-press',
    name: 'Rappel pectoraux — développé incliné machine',
    fn: 'push',
    role: 'accessory',
    measure: 'kg',
    intent: 'Rappel léger de la semaine : on reste loin de l’échec.',
  },
  {
    id: 'cable-row',
    name: 'Rappel dos — tirage horizontal poulie',
    fn: 'pull',
    role: 'accessory',
    measure: 'kg',
    intent: 'Buste fixe, coudes tirés le long du corps, omoplates serrées en fin de mouvement.',
  },
  {
    id: 'cable-curl',
    name: 'Curl poulie',
    fn: 'pull',
    role: 'accessory',
    measure: 'kg',
    intent: 'Enchaîne directement avec l’extension triceps au-dessus de la tête.',
  },
  {
    id: 'overhead-triceps-extension',
    name: 'Extension triceps au-dessus de la tête',
    fn: 'push',
    role: 'accessory',
    measure: 'kg',
    intent: 'À la poulie ou avec un haltère, coudes serrés. Repos seulement après le duo curl + extension.',
  },

  // ------------------------------------------------ ABDOS — niveau 1 --
  {
    id: 'dead-bug',
    name: 'Dead bug — niveau 1',
    fn: 'core',
    role: 'core',
    intent: 'Bas du dos plaqué au sol, bras et jambe opposés qui s’allongent lentement.',
    cues: [PASSAGE_NIVEAU, 'Niveau 2 : crunch poulie. Niveau 3 : relevé de genoux suspendu.'],
  },
  {
    id: 'reverse-crunch',
    name: 'Reverse crunch — niveau 1',
    fn: 'core',
    role: 'core',
    intent: 'Allongé, genoux pliés, on enroule le bassin vers la poitrine, sans élan.',
    cues: [PASSAGE_NIVEAU, 'Niveau 2 : reverse crunch sur banc incliné. Niveau 3 : relevé de genoux suspendu.'],
  },
  {
    id: 'crunch',
    name: 'Crunch au sol — niveau 1',
    fn: 'core',
    role: 'core',
    intent: 'On enroule le haut du dos, le bas du dos reste au sol, nuque relâchée.',
    cues: [PASSAGE_NIVEAU, 'Niveau 2 : crunch poulie.'],
  },
  {
    id: 'plank',
    name: 'Planche — niveau 1',
    fn: 'core',
    role: 'core',
    intent: 'Corps aligné, fessiers et abdos serrés, aucune cambrure.',
    cues: [PASSAGE_NIVEAU, 'Niveau 2 : planche latérale.'],
  },

  // ------------------------------------ ABDOS — niveaux 2 et 3 --
  // Au catalogue, jamais prescrits d'office : on les choisit avec « Remplacer ».
  {
    id: 'cable-crunch',
    name: 'Crunch poulie — niveau 2',
    fn: 'core',
    role: 'core',
    measure: 'kg',
    intent: 'À genoux face à la poulie haute, on enroule le buste, les hanches ne bougent pas.',
  },
  {
    id: 'incline-reverse-crunch',
    name: 'Reverse crunch banc incliné — niveau 2',
    fn: 'core',
    role: 'core',
    intent: 'Tête en haut du banc, on enroule le bassin, descente lente.',
  },
  {
    id: 'side-plank',
    name: 'Planche latérale — niveau 2',
    fn: 'core',
    role: 'core',
    intent: 'Corps aligné, hanche haute, sans rouler vers l’avant.',
  },
  {
    id: 'hanging-knee-raise',
    name: 'Relevé de genoux suspendu — niveau 3',
    fn: 'core',
    role: 'core',
    intent: 'Seulement si le niveau 2 est maîtrisé. Genoux vers la poitrine en enroulant le bassin, sans balancer.',
  },

  // ------------------------------------- MESURES (début et fin de cycle) --
  {
    id: 'test-bodyweight',
    name: 'Poids de corps',
    fn: 'test',
    role: 'test',
    measure: 'kg',
    intent: 'Moyenne de 3 matins, à jeun, à la maison. Jamais en salle.',
  },
  {
    id: 'test-arm-cm',
    name: 'Tour de bras',
    fn: 'test',
    role: 'test',
    measure: 'cm',
    intent: 'Bras droit, contracté, au point le plus large. Même mètre ruban, même moment de la journée.',
  },
];

export const EXERCISES: Record<string, ExerciseDef> = Object.fromEntries(
  LIST.map((e) => [e.id, e]),
);

export const EXERCISE_IDS = LIST.map((e) => e.id);

/** Lève si l'id n'existe pas : une faute de frappe dans une trame se voit tout de suite. */
export function exercise(id: string): ExerciseDef {
  const e = EXERCISES[id];
  if (!e) throw new Error(`Exercice inconnu : « ${id} »`);
  return e;
}
