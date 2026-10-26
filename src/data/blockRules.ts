/**
 * Modifications par semaine, encodées comme des règles.
 *
 * Personne ne recopie une séance quatre fois : l'engine part des quatre trames
 * de `baseSessions.ts` (semaine 1) et applique les règles ci-dessous selon le
 * bloc de la semaine.
 *
 * Programme 4 semaines de Guillaume : la même séance chaque semaine, une
 * série optionnelle en plus à partir de la semaine 2 sur certains exercices.
 */

import {
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
  /** Multiplie la charge résolue. Non utilisé par le programme de Tedhi. */
  loadFactor?: number;
  /** Facteur appliqué une seule fois à l'entrée d'un bloc. Non utilisé ici. */
  loadFactorAtBlockEntry?: number;
  load?: LoadSpec;
  note?: string;
  /** Contraste. Non utilisé par le programme de Tedhi. */
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


// ---------------------------------------------------------------------------
// Deload (semaine 4) — appliqué par le moteur à tout ce qui n'est pas principal
// ---------------------------------------------------------------------------

/**
 * Deload planifié, mais adaptable : si le bilan de la semaine 3 montre une
 * fatigue basse, Guillaume peut garder le volume de la semaine 1 à 3 reps en
 * réserve. Dans l'autre sens, la séance allégée reste disponible chaque jour.
 *
 * Par défaut : 2 séries par exercice, charges des accessoires à 90 % de la
 * dernière charge réelle, au moins 3 reps en réserve partout.
 */
export const DELOAD_POLICY = {
  accessorySets: 2,
  accessoryLoadFactor: 0.9,
  jumpVolumeDivisor: 2,
  /** RPE 7 = au moins 3 reps en réserve. */
  maxRPE: 7,
  removeExIds: [] as string[],
  coreSets: 2,
  carryLoadFactor: 0.9,
  notes: [
    'Semaine 4 — deload : 2 séries par exercice, au moins 3 reps en réserve. Tu dois sortir de la semaine frais.',
    'Deload adaptable : si ton bilan de la semaine 3 montre une fatigue basse, Guillaume peut te faire garder le volume de la semaine 1.',
  ],
};

export const DELOAD_CORE: Readonly<Record<string, { sets: number; work: Work }>> = {};

/** Contraste lourd → explosif : absent de ce programme. */
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
// Programme 4 semaines de Guillaume — séances dupliquées
// ---------------------------------------------------------------------------

/*
 * Décision de Guillaume (26/10/2026) : chaque séance est la même de la
 * semaine 1 à la semaine 4. Aucune progression de charge proposée : Tedhi la
 * gère lui-même. La seule progression écrite est le VOLUME — une série
 * optionnelle sur certains exercices à partir de la semaine 2.
 */

/** Critères de la série optionnelle, les deux à remplir. */
const SERIE_OPTIONNELLE =
  '4e série OPTIONNELLE. Fais-la seulement si ta séance du lundi précédent a tenu en 60 min ou moins (durée réelle dans le résumé de fin de séance) ET que tu n’as pas fini épuisé, sans courbatures aux épaules 48 h après. Sinon, arrête-toi à 3 séries.';

const S1: BlockRuleSet[] = [
  {
    block: 'test',
    rules: [],
    notes: [
      'Semaine 1 : trouve tes charges de travail et note-les. Chronomètre la séance.',
    ],
  },
];

const S2_S4: BlockRuleSet[] = [
  {
    block: 'accumulation',
    day: 0,
    rules: [
      patch('smith-military-press', {
        sets: 4,
        note: `Puis aussitôt 10 à 12 reps à environ 60 % de la charge : saisis-les sous la partie lourde. ${SERIE_OPTIONNELLE}`,
      }),
      patch('lateral-raise', {
        sets: 4,
        note: `Puis aussitôt le max de reps à environ 60 % de la charge : saisis-les sous les 10 reps. ${SERIE_OPTIONNELLE}`,
      }),
    ],
  },
];

// ---------------------------------------------------------------------------
// Programme 12 semaines prise de masse — PRÉPARÉ, PAS ACTIVÉ
// ---------------------------------------------------------------------------

/*
 * Second temps, après accord de Tedhi. Le plan validé est écrit dans
 * `programme-teddy-4-semaines.md` (section 10) :
 *
 *   S1-S3   accumulation hypertrophique, 2-3 en réserve.
 *   S4      deload adaptable.
 *   S5-S7   force + hypertrophie : principaux 5-8 reps, jamais moins de
 *           2 en réserve ; secondaires 8-15 reps.
 *   S8      deload adaptable.
 *   S9-S11  congestion : repos inchangés sur les polyarticulaires, repos
 *           courts sur l'isolation, dégressives possibles, jamais imposées.
 *   S12     consolidation, re-tests sous-maximaux.
 */

export const BLOCK_RULES: BlockRuleSet[] = [...S1, ...S2_S4];

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
