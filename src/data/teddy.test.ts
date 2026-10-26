/**
 * Garde-fous du programme POWERBUILDING — MASSE & FORCE (Teddy).
 *
 * Ils vérifient à chaque déploiement les règles bloquantes de la méthode et
 * les décisions validées par Guillaume le 26/10/2026.
 */

import { describe, expect, it } from 'vitest';
import { BASE_SESSIONS } from './baseSessions';
import { EXERCISES } from './exercises';
import { BLOCK_RULES } from './blockRules';
import { PROGRAM_WEEKS, WEEK_BLOCKS, WEEK_DAYS } from './program';
import { COMBINE_METRICS, maxEstime } from './testSessions';
import { rir } from './types';
import { getSession } from '../engine/getSession';
import { EMPTY_CONTEXT, type Occurrence } from '../engine/types';
import { applyProgression } from '../engine/progression';
import { dateFor, schedule } from '../engine/calendar';

const toutesLesSeances = () =>
  PROGRAM_WEEKS.flatMap((w) => WEEK_DAYS[w].map((d) => ({ w, d, s: getSession(w, d, EMPTY_CONTEXT) })));

const ex = (w: 1 | 2 | 3 | 4, d: 0 | 1 | 3 | 5, id: string) =>
  getSession(w, d, EMPTY_CONTEXT)!.exercises.find((e) => e.id === id)!;

describe('structure', () => {
  it('cycle de 4 semaines : seules les semaines 1 à 4 portent des séances', () => {
    expect([...PROGRAM_WEEKS]).toEqual([1, 2, 3, 4]);
    for (const w of [5, 6, 7, 8, 9, 10, 11, 12] as const) expect(WEEK_DAYS[w]).toHaveLength(0);
  });

  it('la périodisation 12 semaines est préparée', () => {
    expect([4, 8].map((w) => WEEK_BLOCKS[w as 4 | 8])).toEqual(['deload', 'deload']);
    expect(WEEK_BLOCKS[12]).toBe('taper');
  });

  it('4 séances : lundi, mardi, jeudi, samedi — une seule séance jambes', () => {
    for (const w of PROGRAM_WEEKS) expect([...WEEK_DAYS[w]]).toEqual([0, 1, 3, 5]);
    const jambes = Object.values(BASE_SESSIONS).filter((b) => b!.warmup === 'lower');
    expect(jambes).toHaveLength(1);
    expect(toutesLesSeances()).toHaveLength(16);
  });

  it('chaque exercice des trames et des règles existe au catalogue', () => {
    const ids = [
      ...Object.values(BASE_SESSIONS).flatMap((b) => b!.slots.map((s) => s.exId)),
      ...BLOCK_RULES.flatMap((r) => r.rules.map((x) => (x.op === 'insert' ? x.slot.exId : x.exId))),
      ...COMBINE_METRICS,
    ];
    for (const id of ids) expect(EXERCISES[id], id).toBeDefined();
  });

  it('R3 — aucune séance ne dépasse 60 min, échauffement compris', () => {
    for (const { w, d, s } of toutesLesSeances()) {
      expect(s, `S${w} J${d}`).not.toBeNull();
      expect(s!.plannedMin, `S${w} J${d}`).toBeLessThanOrEqual(60);
    }
  });

  it('des abdos à chaque séance, environ 8 séries par semaine', () => {
    let series = 0;
    for (const d of [0, 1, 3, 5] as const) {
      const abdos = getSession(1, d, EMPTY_CONTEXT)!.exercises.filter((e) => e.def.role === 'core');
      expect(abdos.length, `jour ${d}`).toBeGreaterThanOrEqual(1);
      series += abdos.reduce((n, e) => n + e.sets, 0);
    }
    expect(series).toBe(8);
  });

  it('aucun exercice imposé parmi ceux à éviter', () => {
    const interdits = ['weighted-pullup', 'back-squat', 'hanging-leg-raise', 'ab-wheel', 'overhead-press', 'deadlift'];
    for (const { s } of toutesLesSeances()) {
      for (const e of s!.exercises) expect(interdits.includes(e.id), e.id).toBe(false);
    }
  });

  it('les abdos avancés ne sont jamais prescrits d’office', () => {
    for (const { s } of toutesLesSeances()) {
      for (const e of s!.exercises) expect(e.name, e.id).not.toMatch(/niveau [23]/);
    }
  });

  it('aucune charge écrite d’avance, sauf le départ du développé incliné', () => {
    for (const { s } of toutesLesSeances()) {
      for (const e of s!.exercises) {
        if (e.id === 'incline-db-press') continue;
        expect(e.load.kg, e.id).toBeNull();
      }
    }
  });

  it('R2 — aucun test de maximum de charge', () => {
    for (const id of Object.keys(EXERCISES)) expect(id).not.toMatch(/1rm/i);
  });

  it('pas de readiness au saut : il n’y a plus d’explosif', () => {
    for (const { s } of toutesLesSeances()) expect(s!.readinessTest).toBe(false);
  });
});

describe('semaines', () => {
  it('S1 : 3 en réserve sur le principal ; S2-S3 : 2-3', () => {
    expect(ex(1, 0, 'bench-press').targetRPE!.label).toBe('3 en réserve');
    expect(ex(2, 0, 'bench-press').targetRPE!.label).toBe('2-3 en réserve');
    expect(ex(3, 1, 'lat-pulldown').targetRPE!.label).toBe('2-3 en réserve');
  });

  it('S4 deload : 2 séries, au moins 3 en réserve', () => {
    for (const { w, s } of toutesLesSeances()) {
      if (w !== 4) continue;
      for (const e of s!.exercises) {
        expect(e.sets, e.id).toBeLessThanOrEqual(2);
        if (e.targetRPE) expect(e.targetRPE.max, e.id).toBeLessThanOrEqual(7);
      }
    }
  });

  it('repos longs sur les polyarticulaires, plus courts sur l’isolation', () => {
    expect(ex(1, 0, 'bench-press').restSec).toBeGreaterThanOrEqual(120);
    expect(ex(1, 3, 'leg-press').restSec).toBeGreaterThanOrEqual(120);
    expect(ex(1, 5, 'lateral-raise').restSec).toBeLessThanOrEqual(75);
  });

  it('séance allégée : 2 séries maximum', () => {
    const s = getSession(2, 0, {
      ...EMPTY_CONTEXT,
      readiness: { level: 'rouge', pctDelta: 0, jumpCm: 0, baselineCm: 0, label: '', effect: '' },
    })!;
    for (const e of s.exercises) expect(e.sets).toBeLessThanOrEqual(2);
  });
});

describe('double progression (J1, J2)', () => {
  const occ = (kg: number, rpe: number, reps: number[], failed = false): Occurrence => ({
    exerciseId: 'bench-press',
    week: 1,
    day: 0,
    kg,
    plannedKg: kg,
    rpe,
    failed,
    targetRPE: rir(3),
    completed: true,
    sets: reps.map((r) => ({ reps: r, kg })),
  });
  const run = (history: Occurrence[], isLowerBody = false) =>
    applyProgression({ history, plannedKg: 60, targetRPE: rir(2), step: 2.5, isLowerBody, topReps: 12 });

  it('reps pas encore au haut de la plage : on garde la charge', () => {
    expect(run([occ(60, 7, [12, 11, 10]), occ(60, 7, [12, 12, 11])]).suggestedKg).toBe(60);
  });

  it('haut de la plage deux séances de suite : on monte', () => {
    const h = [occ(60, 7, [12, 12, 12]), occ(60, 7, [12, 12, 12])];
    expect(run(h).suggestedKg).toBe(62.5);
    expect(run(h, true).suggestedKg).toBe(65);
  });

  it('moins de réserve que prévu : on garde, puis −5 % la deuxième fois', () => {
    expect(run([occ(60, 8, [12, 12, 12])]).suggestedKg).toBe(60);
    expect(run([occ(60, 8, [12, 12, 12]), occ(60, 8, [10, 9, 9])]).suggestedKg).toBe(57.5);
  });

  it('rep ratée : on redescend', () => {
    expect(run([occ(60, 9, [10, 6], true)]).suggestedKg).toBe(57.5);
  });
});

describe('combine et calendrier', () => {
  it('le maximum estimé compte 10 reps + 3 en réserve', () => {
    expect(maxEstime(60)).toBe(86);
  });

  it('lundi de départ = semaine 1, dernière séance le samedi de la semaine 4', () => {
    expect(dateFor('2026-11-02', 1, 0)).toBe('2026-11-02');
    expect(dateFor('2026-11-02', 4, 5)).toBe('2026-11-28');
    expect(schedule('2026-11-02')).toHaveLength(16);
  });
});
