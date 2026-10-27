/**
 * Garde-fous du programme POWERBUILDING — MASSE & FORCE (Tedhi).
 *
 * Ils vérifient à chaque déploiement les règles bloquantes de la méthode et
 * les décisions validées par Guillaume le 26/10/2026.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BASE_SESSIONS } from './baseSessions';
import { EXERCISES } from './exercises';
import { BLOCK_RULES } from './blockRules';
import { PROGRAM_WEEKS, WEEK_DAYS } from './program';
import { COMBINE_METRICS } from './testSessions';
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

  it('aucun exercice imposé parmi ceux à éviter', () => {
    const interdits = ['weighted-pullup', 'back-squat', 'hanging-leg-raise', 'overhead-press', 'deadlift'];
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

describe('programme 4 semaines — séances dupliquées', () => {
  it('R3 — en semaine 1, aucune séance ne dépasse 60 min (estimation)', () => {
    for (const d of [0, 1, 3, 5] as const) {
      expect(getSession(1, d, EMPTY_CONTEXT)!.plannedMin, `jour ${d}`).toBeLessThanOrEqual(60);
    }
  });

  it('le lundi est la séance de Guillaume, identique chaque semaine', () => {
    const ids = (w: 1 | 2 | 3 | 4) => getSession(w, 0, EMPTY_CONTEXT)!.exercises.map((e) => e.id).join(',');
    expect(ids(1)).toBe(
      'reverse-pec-deck,smith-military-press,lateral-raise,front-raise,bench-rear-delt-fly,skull-crusher,ez-curl,suitcase-hold',
    );
    for (const w of [2, 3, 4] as const) expect(ids(w)).toBe(ids(1));
  });

  it('militaire et latérales : 3 séries en S1, 4 (dont une optionnelle) ensuite', () => {
    expect(ex(1, 0, 'smith-military-press').sets).toBe(3);
    expect(ex(1, 0, 'lateral-raise').sets).toBe(3);
    for (const w of [2, 3, 4] as const) {
      expect(ex(w, 0, 'smith-military-press').sets).toBe(4);
      expect(ex(w, 0, 'lateral-raise').notes.join(' ')).toMatch(/OPTIONNELLE/);
    }
  });

  it('repos du lundi : 2 min 30 au militaire, 1 min 30 aux latérales', () => {
    expect(ex(1, 0, 'smith-military-press').restSec).toBe(150);
    expect(ex(1, 0, 'lateral-raise').restSec).toBe(90);
  });

  it('superset du lundi : barre au front et curl EZ partagent un encadré, un seul repos', () => {
    const skull = ex(1, 0, 'skull-crusher');
    const curl = ex(1, 0, 'ez-curl');
    expect(skull.superset).toBe('bras-lundi');
    expect(curl.superset).toBe('bras-lundi');
    expect(skull.restSec).toBe(0);
    expect(curl.restSec).toBe(90);
  });

  it('mardi : la séance dos de Guillaume, superset tirage horizontal + pull over', () => {
    const ids = getSession(1, 1, EMPTY_CONTEXT)!.exercises.map((e) => e.id).join(',');
    expect(ids).toBe(
      'supinated-lat-pulldown,single-arm-pulldown,close-grip-cable-row,cable-pullover,db-row-elbow-out,db-shrug,ab-wheel',
    );
    expect(ex(1, 1, 'close-grip-cable-row').superset).toBe('dos-mardi');
    expect(ex(1, 1, 'cable-pullover').superset).toBe('dos-mardi');
    expect(ex(1, 1, 'cable-pullover').restSec).toBe(120);
  });

  it('jeudi : la séance pecs-biceps de Guillaume, superset écarté + pull over', () => {
    const ids = (w: 1 | 2 | 3 | 4) => getSession(w, 3, EMPTY_CONTEXT)!.exercises.map((e) => e.id).join(',');
    expect(ids(1)).toBe(
      'cable-fly-low-high,smith-incline-press,db-bench-press,db-fly,db-pullover,db-curl,machine-curl,roman-side-bench',
    );
    for (const w of [2, 3, 4] as const) expect(ids(w)).toBe(ids(1));
    expect(ex(1, 3, 'db-fly').superset).toBe('pecs-jeudi');
    expect(ex(1, 3, 'db-pullover').superset).toBe('pecs-jeudi');
    expect(ex(1, 3, 'db-fly').restSec).toBe(0);
    expect(ex(1, 3, 'db-pullover').restSec).toBe(90);
    expect(ex(1, 3, 'smith-incline-press').restSec).toBe(150);
  });

  it('incliné Smith et couché haltères : 3 séries en S1, 4 (dont une optionnelle) ensuite', () => {
    for (const id of ['smith-incline-press', 'db-bench-press']) {
      expect(ex(1, 3, id).sets, id).toBe(3);
      for (const w of [2, 3, 4] as const) {
        expect(ex(w, 3, id).sets, id).toBe(4);
        expect(ex(w, 3, id).notes.join(' '), id).toMatch(/OPTIONNELLE.*jeudi/);
      }
    }
  });

  it('chaque mouvement du lundi, du mardi et du jeudi a sa fiche, livrée avec l’appli', () => {
    for (const e of [0, 1, 3].flatMap((d) => getSession(1, d as 0 | 1 | 3, EMPTY_CONTEXT)!.exercises)) {
      expect(e.def.fiche, e.id).toBe(`fiches/${e.id}.webp`);
      expect(existsSync(join(process.cwd(), 'public', e.def.fiche!)), e.id).toBe(true);
    }
  });

  it('aucune suggestion de charge : Tedhi gère ses charges', () => {
    for (const { s } of toutesLesSeances()) {
      for (const e of s!.exercises) expect(e.suggestion, e.id).toBeNull();
    }
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
  it('les mesures se limitent au poids de corps et au tour de bras', () => {
    expect([...COMBINE_METRICS]).toEqual(['test-bodyweight', 'test-arm-cm']);
  });

  it('lundi de départ = semaine 1, dernière séance le samedi de la semaine 4', () => {
    expect(dateFor('2026-11-02', 1, 0)).toBe('2026-11-02');
    expect(dateFor('2026-11-02', 4, 5)).toBe('2026-11-28');
    expect(schedule('2026-11-02')).toHaveLength(16);
  });
});
