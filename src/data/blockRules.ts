/**
 * Modifications par semaine, encodées comme des règles.
 *
 * Personne ne recopie une séance quatre fois : l'engine part des quatre trames
 * de `baseSessions.ts` (semaine 1) et applique les règles ci-dessous selon le
 * bloc de la semaine.
 *
 *   S1  calibration         on trouve et on note les charges, combine initial
 *   S2  accumulation        2-3 en réserve, double progression
 *   S3  accumulation        idem
 *   S4  deload adaptable    2 séries, ≥ 3 en réserve, combine final
 *
 * Cycle de 4 semaines (choix de Teddy). La structure 12 semaines est prête
 * mais pas activée : voir la fin de ce fichier.
 */

import {
  rirRange,
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
// Groupes d'exercices
// ---------------------------------------------------------------------------

/** Les mouvements principaux (lettre A de chaque séance). */
const PRINCIPAUX = ['bench-press', 'lat-pulldown', 'leg-press', 'machine-shoulder-press'];

// ---------------------------------------------------------------------------
// Semaine 1 — calibration et combine initial
// ---------------------------------------------------------------------------

const S1: BlockRuleSet[] = [
  {
    block: 'test',
    rules: [],
    notes: [
      'Semaine 1 — calibration. Aucune charge n’est écrite d’avance : sur chaque exercice, monte par paliers et garde la charge qui laisse 2 à 3 reps en réserve (3 sur l’exercice principal) avec une technique propre. Note-la.',
      'Combine initial : la charge de ta 1re série sur l’exercice principal (10 reps, 3 en réserve) va dans l’onglet Combine.',
      'Chronomètre la séance. Si elle dépasse 60 min, retire d’abord le dernier exercice avant les abdos et préviens Guillaume.',
    ],
  },
];

// ---------------------------------------------------------------------------
// Semaines 2 et 3 — accumulation hypertrophique
// ---------------------------------------------------------------------------

const S2_S3: BlockRuleSet[] = [
  {
    block: 'accumulation',
    rules: PRINCIPAUX.map((id) => patch(id, { targetRPE: rirRange(2, 3) })),
    notes: [
      'Accumulation : 2 à 3 reps en réserve. Double progression : d’abord les reps jusqu’au haut de la plage, puis la charge quand le haut est tenu deux séances de suite.',
    ],
  },
  {
    block: 'accumulation',
    day: 3,
    rules: [],
    notes: [
      'Ischio-jambiers : 4e série de leg curl possible, seulement si tu as bien récupéré de la séance jambes précédente (plus de courbatures après 48 h).',
    ],
  },
];

// ---------------------------------------------------------------------------
// Semaine 4 — deload et combine final
// ---------------------------------------------------------------------------

const NOTE_RETEST =
  '1re série : reprends ta charge de la semaine 1 pour 10 reps et note combien il t’en reste en réserve. C’est la comparaison du combine final.';

const S4: BlockRuleSet[] = [
  {
    block: 'deload',
    rules: PRINCIPAUX.map((id) => patch(id, { sets: 2, note: NOTE_RETEST })),
    notes: ['Combine final : note les re-tests dans l’onglet Combine pour les comparer à la semaine 1.'],
  },
];

// ---------------------------------------------------------------------------
// Semaines 5 à 12 — PRÉPARÉES, PAS ACTIVÉES
// ---------------------------------------------------------------------------

/*
 * En attente de la validation des 12 semaines par Teddy. Le plan est écrit
 * dans `programme-teddy-4-semaines.md` (section 10) :
 *
 *   S5-S7   force + hypertrophie : principaux 5-8 reps, jamais moins de
 *           2 en réserve ; secondaires 8-15 reps.
 *   S8      deload adaptable, comme la S4.
 *   S9-S11  congestion : principaux 8-12 reps, repos INCHANGÉS sur les
 *           polyarticulaires ; isolation 12-15 reps, repos 60-75 s, +1 série
 *           sur deux isolations ; dernière série dégressive possible, jamais
 *           imposée.
 *   S12     consolidation : volume de S1, re-tests sous-maximaux.
 *
 * Pour les activer : écrire ici les règles des blocs « maxforce »,
 * « power » et « taper », puis élargir PROGRAM_WEEKS dans `program.ts`.
 */

// ---------------------------------------------------------------------------

export const BLOCK_RULES: BlockRuleSet[] = [...S1, ...S2_S3, ...S4];

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
