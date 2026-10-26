/**
 * Modifications par semaine, encodées comme des règles.
 *
 * Personne ne recopie une séance quatre fois : l'engine part des quatre trames
 * de `baseSessions.ts` (semaine 1) et applique les règles ci-dessous selon le
 * bloc de la semaine.
 *
 *   S1  calibration   3 en réserve, on trouve et on note les charges, tests
 *   S2  intensité     3 → 2 en réserve, même volume
 *   S3  volume        +1 série sur les exercices D et E, intensité stable
 *   S4  allègement    accessoires à 2 séries, re-tests du combine final
 *
 * Le volume et l'intensité n'augmentent jamais la même semaine (règle J6).
 */

import {
  maxSet,
  attempts,
  noLoad,
  rir,
  type Block,
  type DayIndex,
  type LoadSpec,
  type RPETarget,
  type Slot,
  type WeekIndex,
  type Work,
} from './types';

// ---------------------------------------------------------------------------
// Formes de règles
// ---------------------------------------------------------------------------

export interface SlotPatch {
  sets?: number;
  work?: Work;
  restSec?: number;
  targetRPE?: RPETarget | null;
  /** Multiplie la charge résolue. Non utilisé par le programme de Teddy. */
  loadFactor?: number;
  /** Facteur appliqué une seule fois à l'entrée d'un bloc. Non utilisé ici. */
  loadFactorAtBlockEntry?: number;
  load?: LoadSpec;
  note?: string;
  /** Contraste. Non utilisé par le programme de Teddy. */
  contrastWith?: string;
}

export type SlotRule =
  | { op: 'patch'; exId: string; patch: SlotPatch }
  | { op: 'remove'; exId: string }
  | { op: 'insert'; slot: Slot; after?: string; atStart?: true };

export interface BlockRuleSet {
  block: Block;
  /** Absent = s'applique à tous les jours du bloc. */
  day?: DayIndex;
  /** Première semaine où ces règles s'appliquent. Absent = tout le bloc. */
  fromWeek?: WeekIndex;
  rules: SlotRule[];
  notes?: string[];
}

const patch = (exId: string, p: SlotPatch): SlotRule => ({ op: 'patch', exId, patch: p });

const test = (exId: string, work: Work, restSec: number, note?: string): Slot => ({
  exId,
  sets: 1,
  work,
  load: noLoad(),
  targetRPE: null,
  restSec,
  ...(note ? { note } : {}),
});

// ---------------------------------------------------------------------------
// Ce que le moteur attend encore, mais que ce programme n'utilise pas
// ---------------------------------------------------------------------------

/**
 * Le programme de Teddy n'a pas de semaine de deload : la semaine 4 est un
 * allègement écrit ci-dessous, exercice par exercice. Ces constantes restent
 * pour le moteur, qui ne les lit que si une semaine porte le bloc « deload ».
 */
export const DELOAD_POLICY = {
  accessorySets: 2,
  accessoryLoadFactor: 0.8,
  jumpVolumeDivisor: 2,
  maxRPE: 6,
  removeExIds: [] as string[],
  coreSets: 2,
  carryLoadFactor: 0.8,
  notes: ['Semaine allégée.'],
};

export const DELOAD_CORE: Readonly<Record<string, { sets: number; work: Work }>> = {};

/** Contraste lourd → explosif : absent du programme de Teddy. */
export interface ContrastSpec {
  heavy: string;
  explosive: string;
  explosiveReps: number;
  restAfterHeavySec: number;
  restAfterExplosiveSec: number;
  cycleLabel: string;
}

export const CONTRAST_BY_DAY: Partial<Record<DayIndex, ContrastSpec>> = {};

// ---------------------------------------------------------------------------
// Groupes d'exercices
// ---------------------------------------------------------------------------

/** Les mouvements principaux (lettre B de chaque séance). */
const PRINCIPAUX = ['bench-press', 'back-squat', 'overhead-press', 'split-squat'];

/** Écrits « 3 en réserve » en semaine 1. */
const A_TROIS = [
  ...PRINCIPAUX,
  'incline-db-press',
  'db-row',
  'leg-press',
  'barbell-row',
  'dips',
];

/** Écrits « 2-3 en réserve » en semaine 1. */
const A_DEUX_TROIS = [
  'lateral-raise',
  'leg-curl',
  'lat-pulldown',
  'biceps-curl',
  'triceps-extension',
  'leg-extension',
];

/** Les explosifs, toujours en début de séance. */
const EXPLOSIFS = ['med-ball-chest-pass', 'box-jump', 'explosive-push-up', 'kb-swing'];

/** Le gainage de fin de séance. */
const GAINAGE = ['plank', 'side-plank'];

/** Tout ce qui n'est ni principal, ni explosif, ni gainage. */
const ACCESSOIRES = [
  'pullup',
  'incline-db-press',
  'db-row',
  'lateral-raise',
  'leg-press',
  'leg-curl',
  'calf-raise',
  'barbell-row',
  'lat-pulldown',
  'dips',
  'biceps-curl',
  'triceps-extension',
  'leg-extension',
];

/** Semaines 2 et 3 : tout passe à 2 reps en réserve. */
const DEUX_EN_RESERVE: SlotRule[] = [...A_TROIS, ...A_DEUX_TROIS].map((id) =>
  patch(id, { targetRPE: rir(2) }),
);

const TEST_TRACTIONS = test(
  'test-strict-pullup-max',
  maxSet(),
  0,
  'Test du combine : 1 série, reps propres uniquement. Note le nombre.',
);

// ---------------------------------------------------------------------------
// Semaine 1 — calibration et combine initial
// ---------------------------------------------------------------------------

const S1: BlockRuleSet[] = [
  {
    block: 'test',
    rules: [],
    notes: [
      'Semaine 1 — calibration. Aucune charge n’est écrite d’avance : sur chaque exercice, monte par paliers et garde la charge qui laisse environ 3 reps en réserve avec une technique propre. Note-la.',
      'Chronomètre la séance. Si elle dépasse 60 min, retire d’abord le dernier accessoire et préviens Guillaume.',
    ],
  },
  {
    block: 'test',
    day: 0,
    rules: [{ op: 'insert', slot: TEST_TRACTIONS }],
    notes: ['Combine initial : tractions max en fin de séance.'],
  },
  {
    block: 'test',
    day: 1,
    rules: [
      {
        op: 'insert',
        atStart: true,
        slot: test(
          'test-broad-jump',
          attempts(3),
          60,
          'Ton meilleur saut devient ta référence de readiness : saisis-le dans l’onglet Combine.',
        ),
      },
    ],
    notes: [
      'Combine initial : 3 broad jumps après l’échauffement. Le test de readiness démarre la semaine prochaine, sur cette référence.',
    ],
  },
];

// ---------------------------------------------------------------------------
// Semaine 2 — intensité
// ---------------------------------------------------------------------------

const S2: BlockRuleSet[] = [
  {
    block: 'accumulation',
    rules: DEUX_EN_RESERVE,
    notes: [
      'Semaine 2 — intensité : même volume, 2 reps en réserve au lieu de 3. Pars de tes charges de la semaine 1 ; l’appli te propose la suite.',
    ],
  },
];

// ---------------------------------------------------------------------------
// Semaine 3 — volume
// ---------------------------------------------------------------------------

/** +1 série sur les exercices D et E de chaque séance. */
const PLUS_UNE_SERIE: Record<number, Array<[string, number]>> = {
  0: [['incline-db-press', 4], ['db-row', 4]],
  1: [['leg-curl', 4], ['calf-raise', 3]],
  3: [['lat-pulldown', 4], ['dips', 4]],
  4: [['leg-curl', 4], ['calf-raise', 3]],
};

const S3: BlockRuleSet[] = [
  {
    block: 'maxforce',
    rules: DEUX_EN_RESERVE,
    notes: [
      'Semaine 3 — volume : une série de plus sur deux accessoires. L’intensité ne bouge pas (2 en réserve).',
    ],
  },
  ...([0, 1, 3, 4] as const).map(
    (day): BlockRuleSet => ({
      block: 'maxforce',
      day,
      rules: (PLUS_UNE_SERIE[day] ?? []).map(([id, sets]) => patch(id, { sets })),
    }),
  ),
];

// ---------------------------------------------------------------------------
// Semaine 4 — allègement et combine final
// ---------------------------------------------------------------------------

const NOTE_RETEST =
  '1re série : reprends ta charge de la semaine 1 pour 8 reps et note combien il t’en reste en réserve. C’est la comparaison du combine final. Puis 2 séries normales.';

const S4: BlockRuleSet[] = [
  {
    block: 'taper',
    rules: [
      ...PRINCIPAUX.map((id) => patch(id, { sets: 3, targetRPE: rir(2), note: NOTE_RETEST })),
      ...ACCESSOIRES.map((id) =>
        patch(id, {
          sets: 2,
          ...(A_TROIS.includes(id) || A_DEUX_TROIS.includes(id) ? { targetRPE: rir(3) } : {}),
        }),
      ),
      ...EXPLOSIFS.map((id) => patch(id, { sets: 2 })),
      ...GAINAGE.map((id) => patch(id, { sets: 2 })),
    ],
    notes: [
      'Semaine 4 — allègement et réévaluation : accessoires à 2 séries, 3 en réserve. Tu dois sortir de la semaine frais.',
      'Combine final : note les re-tests dans l’onglet Combine pour les comparer à la semaine 1.',
    ],
  },
  {
    block: 'taper',
    day: 0,
    rules: [{ op: 'insert', slot: TEST_TRACTIONS }],
    notes: ['Combine final : tractions max en fin de séance, comme à la semaine 1.'],
  },
  {
    block: 'taper',
    day: 4,
    rules: [],
    notes: ['Combine final : ton meilleur broad jump du readiness d’aujourd’hui est ta mesure finale.'],
  },
];

// ---------------------------------------------------------------------------

export const BLOCK_RULES: BlockRuleSet[] = [...S1, ...S2, ...S3, ...S4];

const sApplique = (r: BlockRuleSet, block: Block, day: DayIndex, week: WeekIndex): boolean =>
  r.block === block &&
  (r.day === undefined || r.day === day) &&
  (r.fromWeek === undefined || week >= r.fromWeek);

/** Règles applicables à une séance donnée. */
export function rulesFor(block: Block, day: DayIndex, week: WeekIndex): SlotRule[] {
  return BLOCK_RULES.filter((r) => sApplique(r, block, day, week)).flatMap((r) => r.rules);
}

/** Notes de bloc à afficher en tête de séance. */
export function blockNotesFor(block: Block, day: DayIndex, week: WeekIndex): string[] {
  return BLOCK_RULES.filter((r) => sApplique(r, block, day, week)).flatMap((r) => r.notes ?? []);
}
