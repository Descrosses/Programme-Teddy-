/**
 * Combines de Teddy : semaine 1 (initial) et dernière semaine du cycle (final).
 *
 * Aucun test de maximum. Les tests sont sous-maximaux et se font DANS les
 * séances : la charge de la 1re série de travail sur chaque exercice
 * principal (10 reps, 3 en réserve), plus le poids de corps et le tour de
 * bras, relevés à la maison.
 */

import type { DayIndex, SessionBlueprint, WeekIndex } from './types';

/** Dernière semaine active du cycle (4 tant que les 12 semaines ne sont pas validées). */
const LAST_WEEK = 4;

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
  return (week === 1 || week === LAST_WEEK) && day === 0;
}

/** Les mesures relevées à chaque combine, dans l'ordre d'affichage. */
export const COMBINE_METRICS = [
  'test-bodyweight',
  'test-arm-cm',
  'test-bench-10',
  'test-pulldown-10',
  'test-legpress-10',
  'test-shoulder-10',
] as const;

/**
 * Charge pour 10 reps → maximum ESTIMÉ (formule d'Epley).
 *
 * Les 3 reps gardées en réserve comptent : 10 reps à 3 en réserve ≈ 13 reps
 * possibles. C'est une estimation, jamais une mesure (règle I2), et elle ne
 * sert qu'à comparer la semaine 4 à la semaine 1 — pas à calculer des charges.
 */
export const REPS_POUR_ESTIMATION = 10 + 3;

export function maxEstime(kg: number): number {
  return Math.round(kg * (1 + REPS_POUR_ESTIMATION / 30) * 2) / 2;
}

/** Les mesures pour lesquelles le combine affiche un maximum estimé. */
export const AVEC_MAX_ESTIME = new Set<string>([
  'test-bench-10',
  'test-pulldown-10',
  'test-legpress-10',
  'test-shoulder-10',
]);
