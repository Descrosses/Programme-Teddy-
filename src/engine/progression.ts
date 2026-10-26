/**
 * Règles de progression et de régression de Teddy (méthode, règles J1 et J2).
 *
 * Toutes ses charges sont autorégulées : la charge « du plan » est la dernière
 * réellement faite. La règle ne fait donc que dire s'il faut la garder, la
 * monter ou la baisser.
 *
 *   Règle 1 — conforme : on garde la charge.
 *   Règle 2 — haut de la fourchette de reps sur toutes les séries, avec la
 *             réserve prévue, deux séances de suite : on monte légèrement.
 *   Règle 4 — moins de réserve que prévu : on garde ; deux fois de suite : −5 %.
 *   Règle 5 — rep ratée : −5 %, on ne retente pas.
 *
 * Rien n'est appliqué en silence : l'appli propose, Teddy accepte ou saisit
 * sa propre charge. Jamais volume et intensité en même temps (J6) : la règle
 * ne touche qu'à la charge, les séries viennent de la semaine.
 */

import { PROGRESSION_RULES } from '../data/program';
import type { LoadStep, RPETarget } from '../data/types';
import { roundToStep } from './rounding';
import type { Occurrence } from './types';

/** Les règles que cette fonction peut émettre (3 n'est pas utilisée). */
export type ProgressionCase = 1 | 2 | 3 | 4 | 5;

export interface ProgressionResult {
  /** `null` = aucune règle applicable, on affiche la charge telle quelle. */
  case: ProgressionCase | null;
  /** Charge proposée, ou `null` si l'exercice n'est pas chargé. */
  suggestedKg: number | null;
  /** Charge de référence, avant ajustement. */
  plannedKg: number | null;
  /** Toujours 0 : aucun tableau de charges, donc aucun décalage à reporter. */
  offsetKg: number;
  source: 'plan' | 'historique';
  /** Phrase affichée à côté du bouton « accepter ». Vide si rien à proposer. */
  reason: string;
  /** Une suggestion n'est jamais appliquée sans un geste de Teddy. */
  requiresConfirm: boolean;
  /** Plafond atteint : jamais dans ce programme. */
  capped: boolean;
}

export interface ProgressionInput {
  /** Occurrences passées de CET exercice, triées par semaine croissante. */
  history: Occurrence[];
  /** Charge de référence pour la séance à venir. */
  plannedKg: number | null;
  /** Cible de réserve de la séance à venir. `null` → aucune règle. */
  targetRPE: RPETarget | null;
  step: LoadStep;
  /** Bas du corps : l'incrément à la barre est plus grand. */
  isLowerBody: boolean;
  /** Haut de la fourchette de reps de l'exercice (12 pour « 8-12 »). */
  topReps?: number;
  /** Ignoré : aucun plafond dans ce programme. */
  kgMax?: number;
}

const EPS = 1e-9;

const NOTHING: ProgressionResult = {
  case: null,
  suggestedKg: null,
  plannedKg: null,
  offsetKg: 0,
  source: 'plan',
  reason: '',
  requiresConfirm: false,
  capped: false,
};

/** Charge suggérée pour la prochaine occurrence d'un exercice. */
export function applyProgression(input: ProgressionInput): ProgressionResult {
  const { history, plannedKg, targetRPE, step, isLowerBody, topReps } = input;

  if (plannedKg === null) return { ...NOTHING };
  const base: ProgressionResult = { ...NOTHING, plannedKg, suggestedKg: plannedKg };

  const last = lastCompleted(history);
  if (!last || last.kg === null) return base;
  const lastKg = last.kg;

  // Règle 5 — rep ratée : prioritaire, « ne retente pas ».
  if (last.failed) {
    const kg = Math.min(
      roundToStep(lastKg * PROGRESSION_RULES.missedRep.loadFactor, step),
      round2(lastKg - step),
    );
    return {
      ...base,
      case: 5,
      suggestedKg: kg,
      source: 'historique',
      reason: `Rep ratée à ${fr(lastKg)} kg : on redescend à ${fr(kg)} kg. Ne retente pas.`,
      requiresConfirm: true,
    };
  }

  // Sans cible de réserve (explosifs, mollets), aucune règle : on garde.
  if (targetRPE === null || last.targetRPE === null || last.rpe === null) {
    return { ...base, suggestedKg: lastKg, source: 'historique' };
  }

  // Règle 4 — moins de réserve que prévu.
  if (last.rpe > last.targetRPE.max + EPS) {
    const consecutive = countTrailingTooHard(history);
    if (consecutive >= PROGRESSION_RULES.tooHard.recalcAfterOccurrences) {
      const kg = roundToStep(lastKg * PROGRESSION_RULES.tooHard.recalcFactor, step);
      return {
        ...base,
        case: 4,
        suggestedKg: kg,
        source: 'historique',
        reason: `Deux séances de suite avec moins de réserve que prévu : on baisse à ${fr(kg)} kg.`,
        requiresConfirm: true,
      };
    }
    return {
      ...base,
      case: 4,
      suggestedKg: lastKg,
      source: 'historique',
      reason: `Il te restait ${fr(10 - last.rpe)} rep(s) en réserve pour ${last.targetRPE.label} prévues : on garde ${fr(lastKg)} kg.`,
      requiresConfirm: true,
    };
  }

  // Règle 2 — haut de fourchette deux séances de suite, même charge.
  if (topReps !== undefined && atTopTwice(history, topReps, lastKg)) {
    const bump = bumpFor(step, isLowerBody);
    const kg = roundToStep(lastKg + bump, step);
    return {
      ...base,
      case: 2,
      suggestedKg: kg,
      source: 'historique',
      reason: `Haut de la fourchette (${topReps} reps) atteint deux séances de suite avec la réserve prévue : +${fr(bump)} kg.`,
      requiresConfirm: true,
    };
  }

  // Règle 1 — conforme : on garde.
  return { ...base, case: 1, suggestedKg: lastKg, source: 'historique' };
}

/** +5 kg à la barre en bas du corps, +2,5 kg en haut ; un cran ailleurs. */
function bumpFor(step: LoadStep, isLowerBody: boolean): number {
  if (step !== 2.5) return step === 1 ? 2 : step;
  return isLowerBody
    ? PROGRESSION_RULES.bump.lowerBodyBarKg
    : PROGRESSION_RULES.bump.upperBodyBarKg;
}

/** Une séance où toutes les séries atteignent `top` reps, sans dépasser la cible d'effort. */
function atTop(o: Occurrence, top: number): boolean {
  if (!o.completed || o.rpe === null || o.targetRPE === null) return false;
  if (o.rpe > o.targetRPE.max + EPS) return false;
  const reps = (o.sets ?? []).map((s) => s.reps).filter((r): r is number => r !== null);
  return reps.length > 0 && reps.every((r) => r >= top);
}

function atTopTwice(history: Occurrence[], top: number, kg: number): boolean {
  const faites = history.filter((o) => o.completed);
  const n = PROGRESSION_RULES.sessionsAtTop;
  if (faites.length < n) return false;
  return faites.slice(-n).every((o) => o.kg === kg && atTop(o, top));
}

/** Nombre d'occurrences consécutives, en partant de la fin, au-dessus de la cible. */
function countTrailingTooHard(history: Occurrence[]): number {
  let n = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const o = history[i]!;
    if (!o.completed || o.rpe === null || o.targetRPE === null) break;
    if (o.rpe > o.targetRPE.max + EPS) n++;
    else break;
  }
  return n;
}

// ---------------------------------------------------------------------------

/** Dernière occurrence réellement effectuée. Une séance sautée est ignorée. */
export function lastCompleted(history: Occurrence[]): Occurrence | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const o = history[i]!;
    if (o.completed) return o;
  }
  return null;
}

/** Texte court du cas, pour l'historique et l'écran Progression. */
export const CASE_LABELS: Record<ProgressionCase, string> = {
  1: 'Conforme — on garde',
  2: 'Haut de fourchette — on monte',
  3: '—',
  4: 'Moins de réserve que prévu',
  5: 'Rep ratée — on redescend',
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function fr(n: number): string {
  return String(n).replace('.', ',');
}
