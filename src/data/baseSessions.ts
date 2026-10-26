/**
 * Les 4 séances de référence de Teddy, sous leur forme de semaine 1
 * (calibration). Haut / bas, 4 séances, 60 min maximum échauffement compris.
 *
 *   lundi    Haut A
 *   mardi    Bas A
 *   mercredi repos
 *   jeudi    Haut B
 *   vendredi Bas B      ← 72 h après le Bas A
 *   samedi, dimanche repos
 *
 * C'est l'unique trame écrite à la main. Les semaines 2 à 4 s'obtiennent en
 * appliquant `blockRules.ts` à ces quatre trames, jamais en les recopiant.
 *
 * Ordre dans chaque séance : l'explosif d'abord, frais (règle A4), puis le
 * mouvement principal, puis les accessoires, puis le gainage.
 *
 * Aucune charge n'est écrite : Teddy n'a pas de repère fiable. Elles sont
 * toutes autorégulées — trouvées en semaine 1 avec 3 reps en réserve, puis
 * suggérées à partir de ce qu'il a réellement fait.
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

// ---------------------------------------------------------------------------

const LUNDI: SessionBlueprint = {
  day: 0,
  title: 'Haut A — développé couché',
  durationLabel: '≈ 55 min',
  intensity: 'DUR',
  warmup: 'upper',
  readinessTest: false,
  notes: [],
  slots: [
    s('med-ball-chest-pass', 3, reps(5), noLoad(), null, 60),
    s('bench-press', 3, reps(range(6, 8)), barre(), rir(3), 150),
    s('pullup', 3, reps(range(3, 4)), bodyweight(), rir(2), 120),
    s('incline-db-press', 3, reps(range(8, 12)), halteres(20), rir(3), 90),
    s('db-row', 3, reps(range(10, 12), true, 'côté'), halteres1(), rir(3), 75),
    s('lateral-raise', 2, reps(range(12, 15)), halteres(), rirRange(2, 3), 60),
  ],
};

const MARDI: SessionBlueprint = {
  day: 1,
  title: 'Bas A — squat',
  durationLabel: '≈ 55 min',
  intensity: 'DUR',
  warmup: 'lower',
  readinessTest: true,
  notes: [],
  slots: [
    s('box-jump', 3, reps(3), noLoad(), null, 75),
    s('back-squat', 3, reps(range(6, 8)), barre(), rir(3), 180),
    s('leg-press', 3, reps(range(10, 12)), barre(), rir(3), 120),
    s('leg-curl', 3, reps(range(10, 12)), machine(), rirRange(2, 3), 75),
    s('calf-raise', 2, reps(range(12, 15)), machine(), null, 60),
    s('plank', 3, hold(40), noLoad(), null, 45, '30 à 45 s.'),
  ],
};

const JEUDI: SessionBlueprint = {
  day: 3,
  title: 'Haut B — développé militaire',
  durationLabel: '≈ 56 min',
  intensity: 'DUR',
  warmup: 'upper',
  readinessTest: false,
  notes: [],
  slots: [
    s('explosive-push-up', 3, reps(5), bodyweight(), null, 60),
    s('overhead-press', 3, reps(range(6, 8)), barre(), rir(3), 150),
    s('barbell-row', 3, reps(range(8, 10)), barre(), rir(3), 120),
    s('lat-pulldown', 3, reps(range(10, 12)), machine(), rirRange(2, 3), 90),
    s('dips', 3, reps(range(6, 10)), bodyweight(), rir(3), 90),
    s('biceps-curl', 2, reps(range(10, 12)), halteres(), rirRange(2, 3), 0, 'Enchaîne directement avec les extensions triceps.'),
    s('triceps-extension', 2, reps(range(10, 12)), machine(), rirRange(2, 3), 60, '60 s de repos après le duo curl + extensions.'),
  ],
};

const VENDREDI: SessionBlueprint = {
  day: 4,
  title: 'Bas B — split squat',
  durationLabel: '≈ 50 min',
  intensity: 'DUR',
  warmup: 'lower',
  readinessTest: true,
  notes: [],
  slots: [
    s('kb-swing', 3, reps(8), autoreg(undefined, 2, 'cable'), null, 75),
    s('split-squat', 3, reps(range(8, 10), true, 'jambe'), halteres(), rir(3), 90),
    s('leg-extension', 3, reps(range(12, 15)), machine(), rirRange(2, 3), 75),
    s('leg-curl', 3, reps(range(10, 12)), machine(), rirRange(2, 3), 75),
    s('calf-raise', 2, reps(range(12, 15)), machine(), null, 60),
    s('side-plank', 3, hold(30, true), noLoad(), null, 45),
  ],
};

export const BASE_SESSIONS: Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, SessionBlueprint>> = {
  0: LUNDI,
  1: MARDI,
  3: JEUDI,
  4: VENDREDI,
};
