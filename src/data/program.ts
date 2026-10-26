/**
 * `program.ts` — point d'entrée unique du programme.
 *
 * L'engine et les écrans importent d'ici, jamais des fichiers internes.
 * Si un jour tu veux corriger une charge ou une consigne, tu ouvres le fichier
 * pointé par le commentaire, tu changes UNE valeur, et les tests te disent
 * immédiatement si tu as cassé la cohérence avec le .md.
 */

// §9 — tableau des charges + ligne RDL
export { MAIN_LIFT_TABLE, prescriptionFor } from './mainLiftTable';

// §5, §7, §8, §12 — catalogue des exercices
export { EXERCISES, EXERCISE_IDS, exercise } from './exercises';

// §6 — échauffements cochables
export { WARMUPS, WARMUP_LOWER, WARMUP_UPPER } from './warmups';

// §7 — les 5 trames de référence
export { BASE_SESSIONS } from './baseSessions';

// §8 — modifications par bloc, encodées en règles
export {
  BLOCK_RULES,
  CONTRAST_BY_DAY,
  DELOAD_CORE,
  DELOAD_POLICY,
  blockNotesFor,
  rulesFor,
  type BlockRuleSet,
  type ContrastSpec,
  type SlotPatch,
  type SlotRule,
} from './blockRules';

// Combines de la semaine 1 et de la semaine 4
export {
  AVEC_MAX_ESTIME,
  COMBINE_METRICS,
  REPS_POUR_ESTIMATION,
  SPECIAL_SESSIONS,
  isCombineDay,
  maxEstime,
  specialSession,
} from './testSessions';

export * from './types';

// ---------------------------------------------------------------------------
// §2 — Périodisation. La seule table qui dit à quel bloc appartient une semaine.
// ---------------------------------------------------------------------------

import { TRAINING_DAYS, type Block, type DayIndex, type WeekIndex } from './types';

export interface BlockInfo {
  block: Block;
  name: string;
  /** Version courte, pour le sélecteur de semaines où la place manque. */
  short: string;
  /** Intensité des lifts principaux, telle qu'écrite en §2. */
  intensityLabel: string;
  objective: string;
  /** Couleur du bloc dans la vue Semaine. */
  color: string;
}

export const BLOCKS: Record<Block, BlockInfo> = {
  test: {
    block: 'test',
    name: 'Calibration + combine initial',
    short: 'Calib.',
    intensityLabel: '3 en réserve',
    objective: 'Trouver et noter les charges de travail, mesurer les références',
    color: '#d62f33',
  },
  accumulation: {
    block: 'accumulation',
    name: 'Intensité',
    short: 'Intens.',
    intensityLabel: '2 en réserve',
    objective: 'Même volume, un cran plus près de l’effort',
    color: '#2f6fa8',
  },
  maxforce: {
    block: 'maxforce',
    name: 'Volume',
    short: 'Volume',
    intensityLabel: '2 en réserve',
    objective: 'Une série de plus sur deux accessoires, intensité stable',
    color: '#4b6584',
  },
  deload: {
    block: 'deload',
    name: 'Deload',
    short: 'Deload',
    intensityLabel: 'Léger',
    objective: 'Non utilisé dans ce programme',
    color: '#8a8a8a',
  },
  power: {
    block: 'power',
    name: 'Puissance',
    short: 'Puiss.',
    intensityLabel: '—',
    objective: 'Non utilisé dans ce programme',
    color: '#8a8a8a',
  },
  taper: {
    block: 'taper',
    name: 'Allègement + combine final',
    short: 'Bilan',
    intensityLabel: '3 en réserve',
    objective: 'Sortir frais, refaire les tests, décider du bloc suivant',
    color: '#5e6b78',
  },
};

/**
 * Les semaines du programme, dans l'ordre. Teddy n'a pas de semaine 0 : son
 * combine initial se fait PENDANT la semaine 1, dans les séances de
 * calibration. Les index 0 et 5 à 12 existent dans le type mais ne portent
 * aucune séance.
 */
export const PROGRAM_WEEKS = [1, 2, 3, 4] as const satisfies readonly WeekIndex[];
export const FIRST_WEEK = 1 as WeekIndex;
export const LAST_WEEK = 4 as WeekIndex;

/** Bloc de chaque semaine. */
export const WEEK_BLOCKS: Record<WeekIndex, Block> = {
  0: 'test',
  1: 'test',
  2: 'accumulation',
  3: 'maxforce',
  4: 'taper',
  5: 'taper',
  6: 'taper',
  7: 'taper',
  8: 'taper',
  9: 'taper',
  10: 'taper',
  11: 'taper',
  12: 'taper',
};

/**
 * Jours réellement occupés : lundi, mardi, jeudi, vendredi, les semaines 1 à 4.
 * Mercredi entre les deux blocs, et 72 h entre les deux séances de jambes.
 */
export const WEEK_DAYS: Record<WeekIndex, readonly DayIndex[]> = {
  0: [],
  1: TRAINING_DAYS,
  2: TRAINING_DAYS,
  3: TRAINING_DAYS,
  4: TRAINING_DAYS,
  5: [],
  6: [],
  7: [],
  8: [],
  9: [],
  10: [],
  11: [],
  12: [],
};

// ---------------------------------------------------------------------------
// Readiness et règles de progression : seuils bruts.
// L'engine s'en sert, il ne les redéfinit pas.
// ---------------------------------------------------------------------------

/** Feu tricolore sur le broad jump du jour vs la référence de la semaine 1. */
export const READINESS_THRESHOLDS = {
  /** ≥ −2 % → vert. */
  greenPct: -2,
  /** ≥ −5 % → orange, en dessous → rouge. */
  orangePct: -5,
  orange: {
    /** −5 % sur les mouvements principaux. */
    mainLoadFactor: 0.95,
    /** Une série de moins sur les accessoires. */
    accessorySetsDelta: -1,
  },
  red: {
    /** Séance allégée : 2 séries par exercice… */
    sets: 2,
    /** … à 4 reps en réserve. */
    rir: 4,
  },
} as const;

/** Les mouvements qui prennent les −5 % du readiness orange. */
export const BIG_MOVEMENT_IDS = [
  'back-squat',
  'bench-press',
  'overhead-press',
  'split-squat',
] as const;

/**
 * Règles de progression et de régression de Teddy (méthode, règles J1 et J2).
 *
 *  1. Conforme : on garde la charge.
 *  2. Haut de la fourchette de reps atteint sur TOUTES les séries, avec la
 *     réserve prévue, deux séances de suite → on monte légèrement.
 *  4. Moins de réserve que prévu → on garde la charge ; deux fois de suite →
 *     −5 %.
 *  5. Rep ratée → −5 %, on ne retente pas.
 */
export const PROGRESSION_RULES = {
  /** Règle 2 : incréments, selon le matériel. */
  bump: { lowerBodyBarKg: 5, upperBodyBarKg: 2.5 },
  /** Séances consécutives au haut de la fourchette avant de monter. */
  sessionsAtTop: 2,
  tooHard: { recalcAfterOccurrences: 2, recalcFactor: 0.95 },
  missedRep: { loadFactor: 0.95 },
  /**
   * Tendance des sauts : calculée par `trends.ts` mais SANS effet sur les
   * séances de Teddy (son programme n'a pas de « cas 7 » sur 4 semaines).
   */
  explosiveDecline: { weeks: 2, deloadAfterDays: 10 },
} as const;
