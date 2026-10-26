import { useState } from 'react';
import type { SetRow } from '../db/db';
import { fr, restLabel, workLabel } from '../engine/format';
import type { ResolvedExercise } from '../engine/getSession';
import { KG_MAX, KG_MIN, loadEntryFor, parseKg } from '../engine/loadEntry';
import type { RestTimer } from '../state/useRestTimer';
import type { SetPayload } from './ExerciseCard';
import { Stepper, stepValue } from './Stepper';
import styles from '../screens/Session.module.css';

/**
 * Superset : deux mouvements enchaînés sans repos, dans UN encadré.
 *
 * Chaque mouvement garde ses propres reps, sa propre charge et son propre
 * historique (ce sont deux exercices en base) ; mais un tour ne se valide
 * qu'une fois, pour les deux, et ne lance qu'UN chrono — celui du repos après
 * le duo, porté par le second mouvement.
 */
export function SupersetCard({
  exs,
  savedSets,
  timer,
  onSaveSet,
}: {
  exs: [ResolvedExercise, ResolvedExercise];
  savedSets: Record<string, SetRow[]>;
  timer: RestTimer;
  onSaveSet: (ex: ResolvedExercise, payload: SetPayload) => Promise<void>;
}) {
  const [a, b] = exs;
  const tours = Math.max(a.sets, b.sets);
  const savedFor = (ex: ResolvedExercise, i: number) =>
    (savedSets[ex.id] ?? []).find((s) => s.setIndex === i) ?? null;
  const fait = (i: number) => savedFor(a, i) !== null && savedFor(b, i) !== null;

  // Le tour en cours : le premier qui n'est pas fait pour les deux mouvements.
  let actif = 0;
  while (actif < tours && fait(actif)) actif++;

  const [edition, setEdition] = useState<number | null>(null);
  const repos = b.restSec || a.restSec;
  const notes = [...new Set([...a.notes, ...b.notes])];

  return (
    <section className={styles.superset} aria-label={`Superset ${a.name} et ${b.name}`}>
      <div className={styles.supersetHead}>
        <span className={styles.supersetBadge}>SUPERSET</span>
        <h3 className={styles.supersetTitle}>
          {a.name} + {b.name}
        </h3>
        <div className={styles.loadLine}>
          {workLabel(tours, a.work).replace(/^(\d+) ×/, '$1 tours ·')}
          {' + '}
          {workLabel(tours, b.work).replace(/^\d+ × /, '')}
        </div>
        <div className={styles.exSub}>
          <span>
            Les deux mouvements enchaînés, sans repos. <b>Repos {restLabel(repos)} après le duo.</b>
          </span>
        </div>
        {notes.map((n) => (
          <div key={n} className={styles.exSub}>
            {n}
          </div>
        ))}
        {(a.lastKg !== null || b.lastKg !== null) && (
          <div className={styles.exSub}>
            <span>
              Dernière fois : A {a.lastKg !== null ? `${fr(a.lastKg)} kg` : '—'} · B{' '}
              {b.lastKg !== null ? `${fr(b.lastKg)} kg` : '—'}
            </span>
          </div>
        )}
      </div>

      {Array.from({ length: tours }, (_, i) => {
        const sa = savedFor(a, i);
        const sb = savedFor(b, i);
        if (fait(i) && edition !== i) {
          return (
            <button
              key={i}
              type="button"
              className={`${styles.tourDone} tnum`}
              onClick={() => setEdition(i)}
            >
              <span className={styles.setIndex}>{i + 1}</span>
              <span className={styles.tourDoneText}>
                <span>
                  <b>A · {a.name}</b> — {resume(sa!)}
                </span>
                <span>
                  <b>B · {b.name}</b> — {resume(sb!)}
                </span>
              </span>
              <span className={styles.tourDoneFlag}>✓ Tour fait</span>
            </button>
          );
        }
        if (i === actif || edition === i) {
          return (
            <TourEntry
              key={i}
              index={i}
              tours={tours}
              exs={exs}
              repos={repos}
              saved={[sa, sb]}
              onDone={async (pa, pb) => {
                timer.prime();
                await onSaveSet(a, pa);
                await onSaveSet(b, pb);
                setEdition(null);
                if (repos > 0) timer.start(repos, `Superset — tour ${i + 1} fait`);
              }}
            />
          );
        }
        return (
          <div key={i} className={styles.tourTodo}>
            <span className={styles.setIndex}>{i + 1}</span>
            <span>À faire</span>
          </div>
        );
      })}
    </section>
  );
}

function resume(s: SetRow): string {
  const reps = s.actualReps !== null ? `${s.actualReps} reps` : '—';
  return s.actualKg !== null ? `${reps} · ${fr(s.actualKg)} kg` : reps;
}

function plannedReps(ex: ResolvedExercise): number {
  if (ex.work.kind !== 'reps') return 0;
  const r = ex.work.reps;
  return r === 'max' ? 0 : typeof r === 'number' ? r : r.max;
}

function TourEntry({
  index,
  tours,
  exs,
  repos,
  saved,
  onDone,
}: {
  index: number;
  tours: number;
  exs: [ResolvedExercise, ResolvedExercise];
  repos: number;
  saved: [SetRow | null, SetRow | null];
  onDone: (a: SetPayload, b: SetPayload) => Promise<void>;
}) {
  const [a, b] = exs;
  const ea = loadEntryFor(a, saved[0]?.actualKg ?? undefined);
  const eb = loadEntryFor(b, saved[1]?.actualKg ?? undefined);
  const [repsA, setRepsA] = useState<number>(saved[0]?.actualReps ?? plannedReps(a));
  const [kgA, setKgA] = useState<number | null>(ea.initialKg);
  const [repsB, setRepsB] = useState<number>(saved[1]?.actualReps ?? plannedReps(b));
  const [kgB, setKgB] = useState<number | null>(eb.initialKg);

  const payload = (reps: number, kg: number | null): SetPayload => ({
    setIndex: index,
    actualKg: kg,
    actualReps: reps,
    actualRpe: null,
    measureValue: null,
    measureUnit: null,
    failed: false,
  });

  return (
    <div className={styles.tourEntry}>
      <div className={styles.tourEntryHead}>
        <span className={styles.setIndex}>{index + 1}</span>
        <span className={styles.tourCount}>
          Tour {index + 1} sur {tours}
        </span>
      </div>

      <div className={styles.tourMove}>A · {a.name}</div>
      <div className={styles.steppers}>
        <Stepper label="Reps" value={repsA} step={1} min={0} max={60} onStep={(d) => setRepsA((v) => stepValue(v, d, 0, 60))} />
        <Stepper
          label="Charge · kg"
          value={kgA}
          emptyLabel={ea.emptyLabel}
          step={ea.step}
          min={KG_MIN}
          max={KG_MAX}
          unit="kg"
          onStep={(d) => setKgA((v) => stepValue(v ?? 0, d, KG_MIN, KG_MAX))}
          onCommitText={(brut: string) => setKgA((v) => parseKg(brut, v))}
        />
      </div>

      <div className={styles.tourChain}>
        <span />
        ENCHAÎNE, SANS REPOS
        <span />
      </div>

      <div className={styles.tourMove}>B · {b.name}</div>
      <div className={styles.steppers}>
        <Stepper label="Reps" value={repsB} step={1} min={0} max={60} onStep={(d) => setRepsB((v) => stepValue(v, d, 0, 60))} />
        <Stepper
          label="Charge · kg"
          value={kgB}
          emptyLabel={eb.emptyLabel}
          step={eb.step}
          min={KG_MIN}
          max={KG_MAX}
          unit="kg"
          onStep={(d) => setKgB((v) => stepValue(v ?? 0, d, KG_MIN, KG_MAX))}
          onCommitText={(brut: string) => setKgB((v) => parseKg(brut, v))}
        />
      </div>

      <button
        type="button"
        className={styles.validate}
        onClick={() => void onDone(payload(repsA, kgA), payload(repsB, kgB))}
      >
        Valider le tour {index + 1}
        {repos > 0 ? ` — repos ${restLabel(repos)}` : ''}
      </button>
    </div>
  );
}
