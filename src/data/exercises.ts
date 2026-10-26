/**
 * Catalogue des exercices du programme de Teddy.
 *
 * `id` est GELÉ : c'est la clé de l'historique. On peut corriger un `name`,
 * une consigne ou une alternative sans rien casser ; changer un `id`
 * déconnecte l'historique de l'exercice.
 *
 * Tous les mouvements chargés sont des mouvements que Teddy déclare maîtriser
 * (questionnaire, question 11). Une seule nouveauté technique : le lancer de
 * médecine-ball, qui ne demande presque aucun apprentissage.
 *
 * Ce fichier ne contient ni séries, ni répétitions, ni charges : elles
 * dépendent de la semaine et vivent dans `baseSessions.ts` / `blockRules.ts`.
 */

import type { ExerciseDef } from './types';

/** Rappel ajouté à chaque mouvement explosif. */
const REGLE_EXPLOSIF =
  'Chaque répétition est une tentative de vitesse. Tu arrêtes la série dès que la vitesse ou la ' +
  'hauteur baisse, ou que la réception devient lourde — même s’il reste des répétitions écrites. ' +
  'On n’ajoute jamais de volume sur ces exercices.';

function def(e: ExerciseDef): ExerciseDef {
  return e.explosive ? { ...e, cues: [...(e.cues ?? []), REGLE_EXPLOSIF] } : e;
}

const LIST: ExerciseDef[] = [
  // ------------------------------------------------------------ HAUT A --
  def({
    id: 'med-ball-chest-pass',
    name: 'Lancer médecine-ball poitrine',
    fn: 'push',
    role: 'power',
    explosive: true,
    intent: 'Ballon léger contre un mur, lancé le plus vite possible depuis la poitrine.',
    cues: [
      'Pieds à largeur d’épaules, à 1-2 m du mur. Rattrape le ballon, repars, une répétition à la fois.',
      'Seule nouveauté technique du programme : si le geste ne te parle pas, remplace par des pompes explosives.',
    ],
  }),
  def({
    id: 'bench-press',
    name: 'Développé couché',
    fn: 'push',
    role: 'main',
    measure: 'kg',
    intent: 'Barre contrôlée jusqu’à la poitrine, poussée franche, fesses sur le banc.',
    cues: [
      'Semaine 1 : monte par paliers jusqu’à la charge qui fait 8 reps en gardant 3 en réserve. Note-la, c’est ta référence.',
      'Omoplates serrées, pieds ancrés au sol. Une rep « moche » compte comme une rep ratée.',
    ],
  }),
  def({
    id: 'pullup',
    name: 'Tractions',
    fn: 'pull',
    role: 'accessory',
    intent: 'Départ bras tendus, menton au-dessus de la barre, sans élan.',
    altBasicFit: 'Si 3 reps propres sont impossibles : tirage vertical 3 × 8.',
    cues: ['Garde environ 2 reps en réserve : on construit, on ne teste pas.'],
  }),
  def({
    id: 'incline-db-press',
    name: 'Développé incliné haltères',
    fn: 'push',
    role: 'accessory',
    measure: 'kg',
    intent: 'Banc à 30-45°, descente contrôlée, haltères qui se rapprochent en haut.',
    cues: [
      'Semaine 1 : départ entre 20 et 22,5 kg par haltère, puis ajuste pour garder 3 en réserve.',
    ],
  }),
  def({
    id: 'db-row',
    name: 'Rowing haltère',
    fn: 'pull',
    role: 'accessory',
    measure: 'kg',
    intent: 'Un genou et une main sur le banc, coude tiré vers la hanche, dos plat.',
  }),
  def({
    id: 'lateral-raise',
    name: 'Élévations latérales',
    fn: 'push',
    role: 'accessory',
    measure: 'kg',
    intent: 'Montée jusqu’à l’horizontale, coudes légèrement fléchis, sans élan.',
  }),

  // ------------------------------------------------------------- BAS A --
  def({
    id: 'box-jump',
    name: 'Box jump',
    fn: 'jump',
    role: 'power',
    explosive: true,
    measure: 'cm',
    intent: 'Box de hauteur modérée, réception souple et silencieuse, redescente en marchant.',
    cues: [
      'Choisis une hauteur où tu atterris sans rentrer les genoux. Note-la : c’est la même à la semaine 4.',
      'Ne saute jamais en arrière pour redescendre.',
    ],
  }),
  def({
    id: 'back-squat',
    name: 'Squat barre',
    fn: 'squat',
    role: 'main',
    measure: 'kg',
    intent: 'Descente contrôlée, remontée franche, genoux dans l’axe des pieds.',
    cues: [
      'Semaine 1 : monte par paliers jusqu’à la charge qui fait 8 reps en gardant 3 en réserve. Note-la, c’est ta référence.',
      'Profondeur que tu tiens dos neutre. On ne la sacrifie pas pour ajouter des kilos.',
    ],
  }),
  def({
    id: 'leg-press',
    name: 'Presse à cuisses',
    fn: 'squat',
    role: 'accessory',
    measure: 'kg',
    intent: 'Bas du dos collé au dossier, amplitude complète sans décoller le bassin.',
  }),
  def({
    id: 'leg-curl',
    name: 'Leg curl machine',
    fn: 'hinge',
    role: 'accessory',
    measure: 'kg',
    intent: 'Montée franche, descente lente, bassin collé au support.',
  }),
  def({
    id: 'calf-raise',
    name: 'Mollets machine',
    fn: 'squat',
    role: 'accessory',
    measure: 'kg',
    intent: 'Amplitude complète, une seconde en haut, descente jusqu’à l’étirement.',
  }),
  def({
    id: 'plank',
    name: 'Planche',
    fn: 'core',
    role: 'core',
    intent: 'Corps aligné, fessiers et abdos serrés, aucune cambrure.',
    cues: ['Entre 30 et 45 s. Tu arrêtes quand le bassin s’affaisse.'],
  }),

  // ------------------------------------------------------------ HAUT B --
  def({
    id: 'explosive-push-up',
    name: 'Pompes explosives',
    fn: 'push',
    role: 'power',
    explosive: true,
    intent: 'Poussée la plus rapide possible : les mains décollent, sans claquement.',
  }),
  def({
    id: 'overhead-press',
    name: 'Développé militaire',
    fn: 'push',
    role: 'main',
    measure: 'kg',
    intent: 'Debout, fessiers serrés, barre qui passe près du visage, sans cambrer.',
    cues: ['Barre ou haltères : garde le même choix les 4 semaines pour pouvoir comparer.'],
  }),
  def({
    id: 'barbell-row',
    name: 'Rowing barre',
    fn: 'pull',
    role: 'accessory',
    measure: 'kg',
    intent: 'Buste penché, dos plat, barre tirée vers le nombril.',
  }),
  def({
    id: 'lat-pulldown',
    name: 'Tirage vertical',
    fn: 'pull',
    role: 'accessory',
    measure: 'kg',
    intent: 'Barre tirée vers le haut de la poitrine, buste légèrement en arrière, sans balancer.',
  }),
  def({
    id: 'dips',
    name: 'Dips',
    fn: 'push',
    role: 'accessory',
    intent: 'Descente contrôlée jusqu’à environ 90° au coude, épaules basses.',
    cues: ['Si l’épaule tire en bas du mouvement, réduis l’amplitude.'],
  }),
  def({
    id: 'biceps-curl',
    name: 'Curl biceps',
    fn: 'pull',
    role: 'accessory',
    measure: 'kg',
    intent: 'Coudes fixes, sans élan. Enchaîne avec les extensions triceps.',
  }),
  def({
    id: 'triceps-extension',
    name: 'Extensions triceps',
    fn: 'push',
    role: 'accessory',
    measure: 'kg',
    intent: 'Coudes fixes. Repos 60 s seulement après le duo curl + extensions.',
  }),

  // ------------------------------------------------------------- BAS B --
  def({
    id: 'kb-swing',
    name: 'Kettlebell swing',
    fn: 'hinge',
    role: 'power',
    explosive: true,
    measure: 'kg',
    intent: 'Le mouvement vient des hanches, pas d’un squat. Bras relâchés, kettlebell à hauteur de poitrine.',
  }),
  def({
    id: 'split-squat',
    name: 'Split squat haltères',
    fn: 'squat',
    role: 'main',
    measure: 'kg',
    intent: 'Buste droit, genou arrière qui frôle le sol, poussée dans le talon avant.',
  }),
  def({
    id: 'leg-extension',
    name: 'Leg extension',
    fn: 'squat',
    role: 'accessory',
    measure: 'kg',
    intent: 'Une seconde en haut, descente lente.',
  }),
  def({
    id: 'side-plank',
    name: 'Planche latérale',
    fn: 'core',
    role: 'core',
    intent: 'Corps aligné, hanche haute, sans rouler vers l’avant.',
  }),

  // ------------------------------------------------- COMBINE (S1 et S4) --
  def({
    id: 'test-bodyweight',
    name: 'Poids de corps',
    fn: 'test',
    role: 'test',
    measure: 'kg',
    intent: 'Moyenne de 3 matins, à jeun, à la maison. Jamais en salle.',
  }),
  def({
    id: 'test-broad-jump',
    name: 'Broad jump',
    fn: 'test',
    role: 'test',
    measure: 'cm',
    intent: '3 sauts en longueur pieds joints, 1 min de repos entre chaque, on garde le meilleur.',
    cues: [
      'Mesure du bout des pieds au départ jusqu’au talon le plus en arrière à l’arrivée.',
      'Le meilleur saut de la semaine 1 devient ta référence de readiness pour les semaines 2 à 4.',
    ],
  }),
  def({
    id: 'test-box-jump',
    name: 'Box jump — hauteur',
    fn: 'test',
    role: 'test',
    measure: 'cm',
    intent: 'Hauteur de box réellement utilisée sur une réception propre.',
  }),
  def({
    id: 'test-strict-pullup-max',
    name: 'Tractions max',
    fn: 'test',
    role: 'test',
    measure: 'reps',
    intent: '1 série au poids du corps, reps propres uniquement : bras tendus en bas, menton au-dessus en haut.',
    cues: [
      'Fait en fin de séance du lundi, à la semaine 1 et à la semaine 4 : même moment, donc comparable.',
    ],
  }),
  def({
    id: 'test-squat-8',
    name: 'Squat — charge pour 8 reps',
    fn: 'test',
    role: 'test',
    measure: 'kg',
    intent: 'Charge de ta 1re série de travail : 8 reps en gardant 3 en réserve. Pas un maximum.',
  }),
  def({
    id: 'test-bench-8',
    name: 'Développé couché — charge pour 8 reps',
    fn: 'test',
    role: 'test',
    measure: 'kg',
    intent: 'Charge de ta 1re série de travail : 8 reps en gardant 3 en réserve. Pas un maximum.',
  }),
  def({
    id: 'test-ohp-8',
    name: 'Développé militaire — charge pour 8 reps',
    fn: 'test',
    role: 'test',
    measure: 'kg',
    intent: 'Charge de ta 1re série de travail : 8 reps en gardant 3 en réserve. Pas un maximum.',
  }),
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
