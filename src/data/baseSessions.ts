/**
 * POWERBUILDING — MASSE & FORCE : les 4 séances de référence, sous leur
 * forme de semaine 1 (calibration). 60 min maximum, échauffement compris.
 *
 *   lundi    Pectoraux, triceps, abdos
 *   mardi    Dos, biceps, abdos          (ou mercredi)
 *   mercredi repos
 *   jeudi    Jambes, abdos               (ou vendredi)
 *   vendredi repos
 *   samedi   Épaules, bras, rappels pectoraux / dos, abdos
 *   dimanche repos
 *
 * C'est l'unique trame écrite à la main. Les autres semaines s'obtiennent en
 * appliquant `blockRules.ts` à ces quatre trames, jamais en les recopiant.
 *
 * Ordre dans chaque séance : le mouvement principal (A) d'abord, frais, puis
 * les secondaires, puis l'isolation, puis les abdos.
 *
 * Repos : longs sur les polyarticulaires, courts sur l'isolation. Les
 * semaines de congestion (S9-S11, pas encore activées) ne raccourciront que
 * ceux de l'isolation.
 *
 * Aucune charge n'est écrite : Teddy n'a pas de repère fiable. Elles sont
 * autorégulées — trouvées en semaine 1 avec 3 reps en réserve, puis suggérées
 * par la double progression à partir de ce qu'il a réellement fait.
 */

import {
  autoreg,
  bodyweight,
  hold,
  noLoad,
  reps,
  rir,
  rirRange,
  type LoadSpec,
  type RPETarget,
  type SessionBlueprint,
  type Slot,
  type Work,
} from './types';

const s = (
  exId: string,
  sets: number,
  work: Work,
  load: LoadSpec,
  targetRPE: RPETarget | null,
  restSec: number,
  note?: string,
): Slot => ({ exId, sets, work, load, targetRPE, restSec, ...(note ? { note } : {}) });

const range = (min: number, max: number) => ({ min, max });

/** Charges autorégulées, par forme. Aucune valeur de départ inventée. */
const barre = () => autoreg(undefined, 2.5, 'barbell');
const halteres = (seed?: number) => autoreg(seed, 2, 'dbPair');
const halteres1 = () => autoreg(undefined, 2, 'dbSingle');
const machine = () => autoreg(undefined, 1, 'cable');

/** Mouvements principaux : 2-3 en réserve, 3 en semaine 1. */
const PRINCIPAL = rir(3);
/** Secondaires et isolation : 2 en réserve. */
const SECONDAIRE = rirRange(2, 3);

// ---------------------------------------------------------------------------

/**
 * Lundi — séance écrite par Guillaume (feuille du 26/10/2026), identique de
 * la semaine 1 à la semaine 4. Semaine 1 : 3 séries au militaire et aux
 * latérales (au lieu de 4) pour tenir le temps ; la 4e série devient
 * optionnelle à partir de la semaine 2 (voir `blockRules.ts`).
 */
const LUNDI: SessionBlueprint = {
  day: 0,
  title: 'Épaules, triceps, biceps',
  durationLabel: '≈ 60 min',
  intensity: 'DUR',
  warmup: 'upper',
  readinessTest: false,
  notes: [],
  slots: [
    s('reverse-pec-deck', 3, reps(range(8, 10)), machine(), null, 45, 'Les 3 séries sont différentes : ouvre les consignes. 3 min de repos avant l’exercice suivant.'),
    s('smith-military-press', 3, reps(6), barre(), rirRange(1, 2), 150, 'Puis aussitôt 10 à 12 reps à environ 60 % de la charge : saisis-les sous la partie lourde.'),
    s('lateral-raise', 3, reps(10), halteres(), rir(2), 90, 'Puis aussitôt le max de reps à environ 60 % de la charge : saisis-les sous les 10 reps.'),
    s('front-raise', 3, reps(15, true, 'côté'), halteres1(), null, 60, 'Contraction maximale en haut.'),
    s('bench-rear-delt-fly', 3, reps(12), halteres(), null, 60, 'Contraction maximale en fin de mouvement.'),
    s('skull-crusher', 4, reps(12), barre(), null, 0, 'Superset : enchaîne directement avec le curl barre EZ. Descente en 3 s.'),
    s('ez-curl', 4, reps(12), barre(), null, 90, '1 min 30 de repos après le duo. Descente en 3 s.'),
    s('suitcase-hold', 3, hold(30, true), halteres1(), null, 30, 'Contraction maximale du flanc opposé.'),
  ],
};

const MARDI: SessionBlueprint = {
  day: 1,
  title: 'Dos, biceps, abdos',
  durationLabel: '≈ 55 min',
  intensity: 'DUR',
  warmup: 'upper',
  readinessTest: false,
  notes: ['Peut se faire le mercredi à la place du mardi.'],
  slots: [
    s('lat-pulldown', 3, reps(range(8, 12)), machine(), PRINCIPAL, 150),
    s('machine-row', 3, reps(range(8, 12)), machine(), SECONDAIRE, 120),
    s('db-row', 2, reps(range(10, 12), true, 'côté'), halteres1(), rir(2), 90),
    s('face-pull', 2, reps(range(12, 15)), machine(), rir(2), 75),
    s('db-curl', 3, reps(range(10, 12)), halteres(), rir(2), 75),
    s('reverse-crunch', 2, reps(range(10, 12)), noLoad(), null, 45),
  ],
};

const JEUDI: SessionBlueprint = {
  day: 3,
  title: 'Jambes, abdos',
  durationLabel: '≈ 55 min',
  intensity: 'DUR',
  warmup: 'lower',
  readinessTest: false,
  notes: ['Peut se faire le vendredi à la place du jeudi.'],
  slots: [
    s('leg-press', 3, reps(range(8, 12)), barre(), PRINCIPAL, 150),
    s('leg-curl', 3, reps(range(10, 12)), machine(), rir(2), 90),
    s('leg-extension', 3, reps(range(12, 15)), machine(), rir(2), 75),
    s('split-squat', 2, reps(10, true, 'jambe'), halteres(), SECONDAIRE, 90),
    s('calf-raise', 3, reps(range(12, 15)), machine(), rir(2), 60),
    s('crunch', 2, reps(range(12, 15)), noLoad(), null, 45),
  ],
};

const SAMEDI: SessionBlueprint = {
  day: 5,
  title: 'Épaules, bras, rappels, abdos',
  durationLabel: '≈ 55 min',
  intensity: 'MODÉRÉ',
  warmup: 'upper',
  readinessTest: false,
  notes: ['Peut se faire le vendredi si les jambes sont faites le jeudi.'],
  slots: [
    s('machine-shoulder-press', 3, reps(range(8, 12)), machine(), PRINCIPAL, 150),
    s('lateral-raise', 3, reps(range(12, 15)), halteres(), rir(2), 60),
    s('incline-machine-press', 2, reps(range(10, 12)), machine(), rir(3), 90),
    s('cable-row', 2, reps(range(10, 12)), machine(), rir(3), 90),
    s('cable-curl', 2, reps(range(10, 12)), machine(), rir(2), 0, 'Enchaîne directement avec l’extension triceps.'),
    s('overhead-triceps-extension', 2, reps(range(10, 12)), machine(), rir(2), 75, '75 s de repos après le duo curl + extension.'),
    s('plank', 2, hold(40), bodyweight(), null, 45, '30 à 45 s.'),
  ],
};

export const BASE_SESSIONS: Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, SessionBlueprint>> = {
  0: LUNDI,
  1: MARDI,
  3: JEUDI,
  5: SAMEDI,
};
