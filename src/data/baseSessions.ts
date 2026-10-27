/**
 * POWERBUILDING — MASSE & FORCE : les 4 séances de référence, sous leur
 * forme de semaine 1 (calibration). 60 min maximum, échauffement compris.
 *
 *   lundi    Épaules, triceps, biceps   (Guillaume)
 *   mardi    Dos                         (Guillaume)
 *   mercredi repos
 *   jeudi    Pecs, biceps                (Guillaume)
 *   vendredi repos
 *   samedi   Jambes, triceps             (Guillaume)
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
 * Aucune charge n'est écrite : Tedhi gère ses charges lui-même.
 */

import {
  autoreg,
  bodyweight,
  hold,
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
    { ...s('skull-crusher', 4, reps(12), barre(), null, 0, 'Descente en 3 s sur les deux mouvements, coudes fixes.'), superset: 'bras-lundi' },
    { ...s('ez-curl', 4, reps(12), barre(), null, 90), superset: 'bras-lundi' },
    s('suitcase-hold', 3, hold(30, true), halteres1(), null, 30, 'Contraction maximale du flanc opposé.'),
  ],
};

/**
 * Mardi — séance dos écrite par Guillaume (26/10/2026), identique de la
 * semaine 1 à la semaine 4.
 */
const MARDI: SessionBlueprint = {
  day: 1,
  title: 'Dos',
  durationLabel: '≈ 60 min',
  intensity: 'DUR',
  warmup: 'upper',
  readinessTest: false,
  notes: [],
  slots: [
    s('supinated-lat-pulldown', 3, reps(8), machine(), null, 120, 'Contraction 1 s, relâchement 2 s. 3 min de repos avant l’exercice suivant.'),
    s('single-arm-pulldown', 3, reps(range(10, 12), true, 'côté'), machine(), null, 90, 'Les deux côtés faits : dernière contraction 5 s. 3 min de repos avant le superset.'),
    { ...s('close-grip-cable-row', 3, reps(10), machine(), null, 0, 'Contraction 2 s, relâchement 3 s. Pull over juste après, sans repos.'), superset: 'dos-mardi' },
    { ...s('cable-pullover', 3, reps(10), machine(), null, 120, 'Contrôlé à 100 %, cherche l’étirement.'), superset: 'dos-mardi' },
    s('db-row-elbow-out', 3, reps(10, true, 'côté'), halteres1(), null, 90, 'Pic de contraction 1 s. 2 min de repos avant les shrugs.'),
    s('db-shrug', 4, reps(15), halteres(), null, 60, 'Pic de contraction 1 s, descente 2 s.'),
    s('ab-wheel', 4, reps(8), bodyweight(), null, 60),
  ],
};

/**
 * Jeudi — séance pecs, biceps écrite par Guillaume (27/10/2026), identique de
 * la semaine 1 à la semaine 4. Développé incliné et développé couché : 3 séries
 * en semaine 1, la 4e devient optionnelle à partir de la semaine 2.
 */
const JEUDI: SessionBlueprint = {
  day: 3,
  title: 'Pecs, biceps',
  durationLabel: '≈ 60 min',
  intensity: 'DUR',
  warmup: 'upper',
  readinessTest: false,
  notes: [],
  slots: [
    s('cable-fly-low-high', 3, reps(range(8, 10)), machine(), null, 45, 'Les 3 séries sont différentes : ouvre les consignes. 3 min de repos avant l’exercice suivant.'),
    s('smith-incline-press', 3, reps(6), barre(), rirRange(1, 2), 150, 'Puis aussitôt 10 à 12 reps à environ 60 % de la charge : saisis-les sous la partie lourde.'),
    s('db-bench-press', 3, reps(10), halteres(), null, 90, 'Contraction maximale en haut.'),
    { ...s('db-fly', 3, reps(12), halteres(), null, 0, 'Descente en 3 s sur les deux mouvements, contrôle total. Pull over juste après, sans repos.'), superset: 'pecs-jeudi' },
    { ...s('db-pullover', 3, reps(12), halteres1(), null, 90, 'Cherche la sensation d’étirement.'), superset: 'pecs-jeudi' },
    s('db-curl', 3, reps(10, true, 'bras'), halteres(), null, 90, 'Une rep bras gauche, une rep bras droit. Amplitude maximale, descente en 2 s, pic de contraction.'),
    s('machine-curl', 3, reps(range(8, 10)), machine(), null, 90, 'Les 3 séries sont différentes : ouvre les consignes. 3 min de repos avant l’exercice suivant.'),
    s('roman-side-bench', 3, reps(8, true, 'côté'), halteres1(), null, 60),
  ],
};

/**
 * Samedi — séance jambes, triceps écrite par Guillaume (27/10/2026). Même
 * séance chaque semaine, sauf l'alternance unilatéral / bilatéral du leg
 * extension et du leg curl (semaines 2 et 4, voir `blockRules.ts`).
 */
const SAMEDI: SessionBlueprint = {
  day: 5,
  title: 'Jambes, triceps',
  durationLabel: '≈ 60 min',
  intensity: 'DUR',
  warmup: 'lower',
  readinessTest: false,
  notes: [],
  slots: [
    s('smith-squat', 3, reps(8), barre(), null, 150, 'Descente 3 s, le plus bas possible, pause 1 s en bas, remontée explosive.'),
    s('leg-extension', 3, reps(10, true, 'jambe'), machine(), null, 90, 'Unilatéral cette semaine : une jambe après l’autre. Descente 2 s, pic de contraction 1 s.'),
    s('leg-curl', 3, reps(10), machine(), null, 90, 'Les deux jambes ensemble cette semaine. Descente 2 s, pic de contraction 1 s.'),
    s('db-lunge', 3, reps(8, true, 'jambe'), halteres(), null, 120, 'Avant ou arrière, au choix : garde la même variante tout le cycle.'),
    { ...s('skull-crusher', 3, reps(12), barre(), null, 0, 'Descente en 2 s, contrôle total de la charge. Dips sur banc juste après, sans repos.'), superset: 'triceps-samedi' },
    { ...s('bench-dips', 3, reps(12), bodyweight(), null, 90, 'Le plus rapide possible, explosif.'), superset: 'triceps-samedi' },
    s('triceps-pushdown', 3, reps(range(8, 10)), machine(), null, 45, 'Les 3 séries sont différentes : ouvre les consignes.'),
    s('back-extension', 3, reps(10), bodyweight(), null, 60, 'Descente contrôlée en 2 s, pic de contraction 1 s.'),
  ],
};

export const BASE_SESSIONS: Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, SessionBlueprint>> = {
  0: LUNDI,
  1: MARDI,
  3: JEUDI,
  5: SAMEDI,
};
