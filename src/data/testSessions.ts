/**
 * Combines de Teddy : semaine 1 (initial) et semaine 4 (final).
 *
 * Pas de semaine de tests à part, pas de 1RM. Teddy est traité en
 * intermédiaire prudent (pratique longue mais irrégulière) : la méthode
 * interdit tout test de maximum à ce niveau. Les tests sont donc
 * sous-maximaux et se font DANS les séances :
 *
 *   - charge pour 8 reps avec 3 en réserve (squat, développé couché,
 *     développé militaire) — la 1re série de travail de la semaine 1 ;
 *   - tractions max au poids du corps, fin de séance du lundi ;
 *   - broad jump (référence de readiness) et hauteur de box jump ;
 *   - poids de corps, moyenne de 3 matins à la maison.
 *
 * Les séances de test sont produites par les règles de bloc (`blockRules.ts`),
 * pas écrites ici : aucune séance de Teddy n'est « spéciale ».
 */

import type { DayIndex, SessionBlueprint, WeekIndex } from './types';

export interface SpecialSession {
  week: WeekIndex;
  day: DayIndex;
  blueprint: SessionBlueprint;
}

export const SPECIAL_SESSIONS: SpecialSession[] = [];

/** Séance écrite en toutes lettres pour cette case du calendrier : jamais pour Teddy. */
export function specialSession(week: number, day: DayIndex): SessionBlueprint | null {
  return SPECIAL_SESSIONS.find((s) => s.week === week && s.day === day)?.blueprint ?? null;
}

/**
 * Jour de combine ? Sert au rappel de poids de corps sur l'écran Aujourd'hui :
 * la moyenne de 3 matins doit être prête AVANT le lundi de la semaine 1 et de
 * la semaine 4.
 */
export function isCombineDay(week: number, day: DayIndex): boolean {
  return (week === 1 || week === 4) && day === 0;
}

/** Les mesures relevées à chaque combine, dans l'ordre d'affichage. */
export const COMBINE_METRICS = [
  'test-bodyweight',
  'test-squat-8',
  'test-bench-8',
  'test-ohp-8',
  'test-strict-pullup-max',
  'test-broad-jump',
  'test-box-jump',
] as const;

/**
 * Charge pour 8 reps → maximum ESTIMÉ (formule d'Epley).
 *
 * Les 3 reps gardées en réserve comptent : 8 reps à 3 en réserve ≈ 11 reps
 * possibles. C'est une estimation, jamais une mesure (règle I2), et elle ne
 * sert qu'à comparer la semaine 4 à la semaine 1 — pas à calculer des charges.
 */
export const REPS_POUR_ESTIMATION = 8 + 3;

export function maxEstime(kg: number): number {
  return Math.round(kg * (1 + REPS_POUR_ESTIMATION / 30) * 2) / 2;
}

/** Les mesures pour lesquelles le combine affiche un maximum estimé. */
export const AVEC_MAX_ESTIME = new Set<string>(['test-squat-8', 'test-bench-8', 'test-ohp-8']);
