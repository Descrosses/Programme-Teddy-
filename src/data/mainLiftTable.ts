/**
 * Tableau de charges semaine par semaine — VIDE pour Tedhi, et c'est voulu.
 *
 * Le programme d'origine écrivait ses charges en kilos à partir de maxima
 * testés. Tedhi n'a ni maximum testé ni repère fiable : écrire une charge
 * précise sans donnée serait l'inventer. Toutes ses charges sont donc
 * autorégulées (voir `baseSessions.ts`) et aucune trame ne renvoie ici.
 *
 * Le fichier reste parce que le moteur sait lire un tableau ; il n'y trouve
 * simplement rien.
 */

import type { MainLiftId, MainLiftTable, WeekPrescription } from './types';

export const MAIN_LIFT_TABLE: MainLiftTable = {
  'back-squat': [],
  'bench-press': [],
  deadlift: [],
  'weighted-pullup': [],
  'push-press': [],
  'front-squat': [],
  'speed-squat': [],
  rdl: [],
};

/** Toujours `null` : aucun mouvement de Tedhi n'est piloté par un tableau. */
export function prescriptionFor(lift: MainLiftId, week: number): WeekPrescription | null {
  return MAIN_LIFT_TABLE[lift][week - 1] ?? null;
}
