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
export { COMBINE_METRICS, SPECIAL_SESSIONS, isCombineDay, specialSession } from './testSessions';

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
    name: 'Semaine de départ',
    short: 'Départ',
    intensityLabel: 'Séances de base',
    objective: 'Trouver et noter tes charges de travail, chronométrer les séances',
    color: '#d62f33',
  },
  accumulation: {
    block: 'accumulation',
    name: 'Mêmes séances, volume',
    short: 'Volume',
    intensityLabel: 'Série optionnelle',
    objective: 'Mêmes séances qu’en semaine 1, une série de plus possible selon le timing et la fatigue',
    color: '#2f6fa8',
  },
  deload: {
    block: 'deload',
    name: 'Deload',
    short: 'Deload',
    intensityLabel: '≥ 3 en réserve',
    objective: 'Récupérer, refaire les tests, décider de la suite',
    color: '#5e6b78',
  },
  maxforce: {
    block: 'maxforce',
    name: 'Force + hypertrophie',
    short: 'Force',
    intensityLabel: '5-8 reps, ≥ 2 en réserve',
    objective: 'Préparé, pas activé : en attente de la validation des 12 semaines',
    color: '#4b6584',
  },
  power: {
    block: 'power',
    name: 'Hypertrophie + congestion',
    short: 'Congest.',
    intensityLabel: '8-15 reps',
    objective: 'Préparé, pas activé : en attente de la validation des 12 semaines',
    color: '#a33b6b',
  },
  taper: {
    block: 'taper',
    name: 'Consolidation',
    short: 'Consol.',
    intensityLabel: '2-3 en réserve',
    objective: 'Préparé, pas activé : en attente de la validation des 12 semaines',
    color: '#1d2b3a',
  },
};

/**
 * Semaines ACTIVES du programme. Tedhi a choisi un cycle de 4 semaines.
 *
 * La périodisation complète sur 12 semaines est déjà décrite dans
 * `WEEK_BLOCKS` ci-dessous ; pour la prolonger après validation de Tedhi,
 * on élargit cette liste à 1…12 et on écrit les règles des semaines 5 à 12
 * dans `blockRules.ts`. Rien d'autre ne change : calendrier, sélecteur de
 * semaines, historique et progression suivent cette liste.
 */
export const PROGRAM_WEEKS = [1, 2, 3, 4] as const satisfies readonly WeekIndex[];
export const FIRST_WEEK = 1 as WeekIndex;
export const LAST_WEEK = PROGRAM_WEEKS[PROGRAM_WEEKS.length - 1] as WeekIndex;

/**
 * Bloc de chaque semaine. Semaines 1-4 : programme 4 semaines de Guillaume
 * (séances dupliquées). Semaines 5-12 : emplacement du programme 12 semaines,
 * à redéfinir quand il sera activé.
 */
export const WEEK_BLOCKS: Record<WeekIndex, Block> = {
  0: 'test',
  1: 'test',
  2: 'accumulation',
  3: 'accumulation',
  4: 'accumulation',
  5: 'maxforce',
  6: 'maxforce',
  7: 'maxforce',
  8: 'deload',
  9: 'power',
  10: 'power',
  11: 'power',
  12: 'taper',
};

const ACTIVE = new Set<number>(PROGRAM_WEEKS);
const jours = (w: number): readonly DayIndex[] => (ACTIVE.has(w) ? TRAINING_DAYS : []);

/**
 * Jours réellement occupés : lundi, mardi, jeudi, samedi, sur les semaines
 * actives. Les variantes (mercredi au lieu de mardi, vendredi au lieu de
 * jeudi ou de samedi) se font en ouvrant la séance un autre jour : rien
 * n'oblige à la faire à la date affichée.
 */
export const WEEK_DAYS: Record<WeekIndex, readonly DayIndex[]> = {
  0: [],
  1: jours(1),
  2: jours(2),
  3: jours(3),
  4: jours(4),
  5: jours(5),
  6: jours(6),
  7: jours(7),
  8: jours(8),
  9: jours(9),
  10: jours(10),
  11: jours(11),
  12: jours(12),
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
  'smith-incline-press',
  'supinated-lat-pulldown',
  'smith-military-press',
  'smith-squat',
] as const;

/**
 * Règles de progression et de régression de Tedhi (méthode, règles J1 et J2).
 *
 *  1. Conforme : on garde la charge.
 *  2. Haut de la fourchette de reps atteint sur TOUTES les séries, avec la
 *     réserve prévue, deux séances de suite → on monte légèrement.
 *  4. Moins de réserve que prévu → on garde la charge ; deux fois de suite →
 *     −5 %.
 *  5. Rep ratée → −5 %, on ne retente pas.
 */
/**
 * Suggestions de charge : DÉSACTIVÉES. Tedhi gère ses charges lui-même
 * (décision de Guillaume) ; l'appli garde l'historique et montre la dernière
 * performance, sans rien proposer.
 */
export const LOAD_SUGGESTIONS = false;

export const PROGRESSION_RULES = {
  /** Règle 2 : incréments, selon le matériel. */
  bump: { lowerBodyBarKg: 5, upperBodyBarKg: 2.5 },
  /** Séances consécutives au haut de la fourchette avant de monter. */
  sessionsAtTop: 2,
  tooHard: { recalcAfterOccurrences: 2, recalcFactor: 0.95 },
  missedRep: { loadFactor: 0.95 },
  /**
   * Tendance des sauts : calculée par `trends.ts` mais SANS effet sur les
   * séances de Tedhi (son programme n'a pas de « cas 7 » sur 4 semaines).
   */
  explosiveDecline: { weeks: 2, deloadAfterDays: 10 },
} as const;
