/**
 * Mesures de Tedhi : semaine 1 (début) et dernière semaine du cycle (fin).
 * Poids de corps et tour de bras, relevés à la maison.
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

/** Séance écrite en toutes lettres pour cette case du calendrier : jamais pour Tedhi. */
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

/**
 * Les mesures relevées au début et à la fin du cycle : poids de corps et tour
 * de bras. Aucune mesure de force : le programme 4 semaines ne cherche pas à
 * en développer, Tedhi gère ses charges lui-même.
 */
export const COMBINE_METRICS = ['test-bodyweight', 'test-arm-cm'] as const;
