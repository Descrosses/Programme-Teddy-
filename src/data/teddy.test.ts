/**
 * Garde-fous du programme de Teddy.
 *
 * Ils remplacent les tests de transcription du programme 12 semaines : ici,
 * pas de tableau de charges à relire, mais des règles bloquantes de la méthode
 * à vérifier à chaque déploiement.
 */

import { describe, expect, it } from 'vitest';
import { BASE_SESSIONS } from './baseSessions';
import { EXERCISES } from './exercises';
import { BLOCK_RULES } from './blockRules';
import { PROGRAM_WEEKS, WEEK_DAYS } from './program';
import { COMBINE_METRICS, maxEstime } from './testSessions';
import { rir } from './types';
import { getSession } from '../engine/getSession';
import { EMPTY_CONTEXT, type Occurrence } from '../engine/types';
import { applyProgression } from '../engine/progression';
import { dateFor, schedule } from '../engine/calendar';

const toutesLesSeances = () =>
  PROGRAM_WEEKS.flatMap((w) => WEEK_DAYS[w].map((d) => ({ w, d, s: getSession(w, d, EMPTY_CONTEXT) })));

describe('programme de Teddy — structure', () => {
  it('4 semaines de 4 séances : lundi, mardi, jeudi, vendredi', () => {
    for (const w of PROGRAM_WEEKS) expect([...WEEK_DAYS[w]]).toEqual([0, 1, 3, 4]);
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

  it('chaque séance se résout, sans exercice perdu', () => {
    for (const { w, d, s } of toutesLesSeances()) {
      expect(s, `S${w} J${d}`).not.toBeNull();
      expect(s!.exercises.length).toBeGreaterThanOrEqual(6);
    }
  });

  it('R3 — aucune séance ne dépasse 60 min, échauffement compris', () => {
    for (const { w, d, s } of toutesLesSeances()) {
      expect(s!.plannedMin, `S${w} J${d}`).toBeLessThanOrEqual(60);
    }
  });

  it('l’explosif ouvre chaque séance (règle A4), hors test de la semaine 1', () => {
    for (const { w, d, s } of toutesLesSeances()) {
      const premier = s!.exercises.find((e) => e.def.role !== 'test');
      expect(premier!.def.role, `S${w} J${d}`).toBe('power');
    }
  });

  it('aucune charge n’est écrite d’avance, sauf le départ du développé incliné', () => {
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
});

describe('programme de Teddy — progression des semaines', () => {
  const bench = (w: 1 | 2 | 3 | 4) =>
    getSession(w, 0, EMPTY_CONTEXT)!.exercises.find((e) => e.id === 'bench-press')!;
  const incline = (w: 1 | 2 | 3 | 4) =>
    getSession(w, 0, EMPTY_CONTEXT)!.exercises.find((e) => e.id === 'incline-db-press')!;

  it('S1 à 3 en réserve, S2 et S3 à 2 en réserve', () => {
    expect(bench(1).targetRPE!.label).toBe('3 en réserve');
    expect(bench(2).targetRPE!.label).toBe('2 en réserve');
    expect(bench(3).targetRPE!.label).toBe('2 en réserve');
  });

  it('J6 — S3 ajoute une série sans toucher à l’intensité', () => {
    expect(incline(2).sets).toBe(3);
    expect(incline(3).sets).toBe(4);
    expect(incline(3).targetRPE!.label).toBe(incline(2).targetRPE!.label);
  });

  it('S4 allège les accessoires à 2 séries', () => {
    expect(incline(4).sets).toBe(2);
  });

  it('pas de readiness test en semaine 1, le saut de référence s’y mesure', () => {
    const mardi1 = getSession(1, 1, EMPTY_CONTEXT)!;
    expect(mardi1.readinessTest).toBe(false);
    expect(mardi1.exercises[0]!.id).toBe('test-broad-jump');
    expect(getSession(2, 1, EMPTY_CONTEXT)!.readinessTest).toBe(true);
  });

  it('séance allégée : 2 séries, explosifs retirés', () => {
    const s = getSession(2, 0, {
      ...EMPTY_CONTEXT,
      readiness: { level: 'rouge', pctDelta: 0, jumpCm: 0, baselineCm: 0, label: '', effect: '' },
    })!;
    expect(s.exercises.some((e) => e.def.role === 'power')).toBe(false);
    for (const e of s.exercises) expect(e.sets).toBeLessThanOrEqual(2);
  });
});

describe('règles de progression (J1, J2)', () => {
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
    applyProgression({ history, plannedKg: 60, targetRPE: rir(2), step: 2.5, isLowerBody, topReps: 8 });

  it('une seule séance au haut de la fourchette : on garde', () => {
    expect(run([occ(60, 7, [8, 8, 8])]).suggestedKg).toBe(60);
  });

  it('deux séances de suite au haut de la fourchette : +2,5 kg haut, +5 kg bas', () => {
    const h = [occ(60, 7, [8, 8, 8]), occ(60, 7, [8, 8, 8])];
    expect(run(h).suggestedKg).toBe(62.5);
    expect(run(h, true).suggestedKg).toBe(65);
  });

  it('moins de réserve que prévu : on garde, puis −5 % la deuxième fois', () => {
    expect(run([occ(60, 8, [8, 8, 8])]).suggestedKg).toBe(60);
    expect(run([occ(60, 8, [8, 8, 8]), occ(60, 8, [8, 7, 7])]).suggestedKg).toBe(57.5);
  });

  it('rep ratée : on redescend', () => {
    expect(run([occ(60, 9, [8, 5], true)]).suggestedKg).toBe(57.5);
  });
});

describe('combine et calendrier', () => {
  it('le maximum estimé compte les 3 reps en réserve', () => {
    expect(maxEstime(60)).toBe(82);
  });

  it('le lundi de départ est la semaine 1, la dernière séance le vendredi de la semaine 4', () => {
    expect(dateFor('2026-11-02', 1, 0)).toBe('2026-11-02');
    expect(dateFor('2026-11-02', 4, 4)).toBe('2026-11-27');
    expect(schedule('2026-11-02')).toHaveLength(16);
  });
});
