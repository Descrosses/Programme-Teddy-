import { useEffect, useState } from 'react';
import { BarChart, LineChart, type Series } from '../components/Chart';
import { NotesBrowser } from '../components/NotesBrowser';
import { SessionDurations } from '../components/SessionDurations';
import { VisualTracking } from '../components/VisualTracking';
import { WeightOverview } from '../components/WeightOverview';
import { EXERCISES } from '../data/exercises';
import { DAY_LABELS_SHORT } from '../data/types';
import { fr } from '../engine/format';
import { explosiveTrend } from '../engine/trends';
import type { HistoryIndex, SessionContext } from '../engine/types';
import {
  allReadiness,
  allSessions,
  allSets,
  buildHistoryIndex,
  getSettingsRow,
  toEngineSettings,
  toReadinessRecords,
} from '../db/repo';
import type { ReadinessRow, SessionRow, SetRow } from '../db/db';
import styles from './Screens.module.css';

/** Les quatre mouvements principaux de Tedhi (lettre A de chaque séance). */
const LIFTS: Array<{ id: string; label: string }> = [
  { id: 'bench-press', label: 'Couché' },
  { id: 'lat-pulldown', label: 'Tirage' },
  { id: 'leg-press', label: 'Presse' },
  { id: 'machine-shoulder-press', label: 'Épaules' },
];

/**
 * L'écran répond à une seule question — « est-ce que ça bouge ? » — par trois
 * moyens : les charges, le poids de corps et l'œil. Un sélecteur en haut plutôt
 * que huit sections empilées : les courbes se consultent le soir, les photos une
 * fois par semaine, on ne veut pas faire défiler les unes pour atteindre les
 * autres.
 *
 * Le poids a sa propre vue et pas une carte de plus sous les charges : il porte
 * son propre sélecteur de période, deux graphiques et un tableau de treize
 * lignes. Empilé sous le reste, on ne l'aurait jamais atteint au pouce.
 */
type Vue = 'chiffres' | 'poids' | 'remarques' | 'photos';

export function ProgressScreen() {
  const [vue, setVue] = useState<Vue>('chiffres');
  const [data, setData] = useState<{
    history: HistoryIndex;
    readiness: ReadinessRow[];
    sets: SetRow[];
    sessions: SessionRow[];
    baseline: number | null;
    oneRM: Record<string, number>;
    ctx: SessionContext;
  } | null>(null);
  const [lift, setLift] = useState<string>('bench-press');

  useEffect(() => {
    void (async () => {
      const [sets, readiness, settingsRow, sessions] = await Promise.all([
        allSets(),
        allReadiness(),
        getSettingsRow(),
        allSessions(),
      ]);
      const history = buildHistoryIndex(sets);
      setData({
        history,
        readiness,
        sets,
        sessions,
        baseline: settingsRow.broadJumpBaselineCm,
        oneRM: settingsRow.oneRM,
        /*
         * La durée prévue d'une séance se calcule depuis la séance RÉSOLUE :
         * elle dépend des règles de bloc, du deload, des séries réellement
         * prescrites. On reconstruit donc le même contexte que l'écran Séance ;
         * la readiness, elle, est posée séance par séance par le composant.
         */
        ctx: {
          settings: toEngineSettings(settingsRow),
          history,
          readiness: null,
          explosiveDecline: explosiveTrend(toReadinessRecords(readiness)).declining,
        },
      });
    })();
  }, []);

  if (!data) return <div className={styles.loading}>Chargement…</div>;

  // --- charge réelle vs plan, semaine par semaine ---------------------------
  // Aucune charge écrite d'avance pour Tedhi : seule la courbe réelle existe.
  const exId = LIFTS.find((l) => l.id === lift)!.id;
  const realPoints = (data.history[exId] ?? [])
    .filter((o) => o.kg !== null)
    .map((o) => ({ x: o.week, y: o.kg! }));

  const liftSeries: Series[] = [{ label: 'Réel', color: 'var(--accent)', points: realPoints }];

  // --- RPE moyen par séance -------------------------------------------------
  const bySession = new Map<string, { sum: number; n: number; week: number; day: number }>();
  for (const s of data.sets) {
    if (s.actualRpe === null) continue;
    const key = `${s.week}-${s.day}`;
    const cur = bySession.get(key) ?? {
      sum: 0,
      n: 0,
      week: s.week,
      day: s.day,
    };
    cur.sum += s.actualRpe;
    cur.n += 1;
    bySession.set(key, cur);
  }
  const rpeBars = [...bySession.values()]
    .sort((a, b) => a.week - b.week || a.day - b.day)
    .slice(-12)
    .map((v) => ({
      label: `${v.week}${DAY_LABELS_SHORT[v.day as 0 | 1 | 2 | 3 | 4][0]}`,
      value: Math.round((v.sum / v.n) * 10) / 10,
      color: v.sum / v.n >= 9 ? 'var(--rouge)' : 'var(--accent)',
    }));

  const weeksX = Object.fromEntries(
    Array.from({ length: 4 }, (_, i) => [i + 1, `S${i + 1}`]),
  );

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.h1}>Progression</h1>
        <p className={styles.lead}>
          {vue === 'chiffres' && 'Ce que tu as réellement soulevé, semaine après semaine.'}
          {vue === 'poids' && 'Le poids de corps depuis la semaine 1, pas sur sept jours.'}
          {vue === 'remarques' &&
            'Tout ce que tu as noté sur chaque mouvement, du plus récent au plus ancien.'}
          {vue === 'photos' && 'Une photo par semaine. Ce que les courbes ne montrent pas.'}
        </p>
      </header>

      <div className={styles.segment} role="group" aria-label="Vue">
        {(
          [
            ['chiffres', 'Charges'],
            ['poids', 'Poids'],
            ['remarques', 'Remarques'],
            ['photos', 'Photos'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`${styles.segmentButton} ${vue === id ? styles.segmentOn : ''}`}
            onClick={() => setVue(id)}
            aria-pressed={vue === id}
          >
            {label}
          </button>
        ))}
      </div>

      {vue === 'poids' && <WeightOverview />}

      {vue === 'remarques' && <NotesBrowser />}

      {vue === 'photos' && <VisualTracking />}

      {vue === 'chiffres' && (
        <>
          <div className={styles.weeks}>
            {LIFTS.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`${styles.week} ${lift === l.id ? styles.weekOn : ''}`}
                style={{
                  width: 'auto',
                  padding: '0 14px',
                  borderBottomColor: 'var(--accent)',
                }}
                onClick={() => setLift(l.id)}
                aria-pressed={lift === l.id}
              >
                <span className={styles.weekNum} style={{ fontSize: '1rem' }}>
                  {l.label}
                </span>
              </button>
            ))}
          </div>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>{EXERCISES[lift]?.name} — charge par semaine</h2>
            <p className={styles.cardSub}>
              {realPoints.length === 0
                ? 'Rien d’enregistré pour l’instant.'
                : `Dernière charge travaillée : ${fr(realPoints[realPoints.length - 1]!.y)} kg.`}
            </p>
            <LineChart
              series={liftSeries}
              xLabels={weeksX}
              unit="kg"
              emptyMessage="Valide des séries pour voir la courbe apparaître."
            />
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Durée des séances</h2>
            <p className={styles.cardSub}>
              Mesurée entre la première ouverture de la séance et « Séance terminée ». Le trait
              clair sur la barre marque la durée prévue.
            </p>
            <SessionDurations
              rows={data.sessions}
              readinessRows={data.readiness}
              baselineCm={data.baseline}
              ctx={data.ctx}
            />
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Effort moyen par séance (RPE)</h2>
            <p className={styles.cardSub}>
              Les 12 dernières séances, en RPE (10 − reps en réserve). Une barre rouge signale une séance à 9 ou plus, soit 1 rep en réserve ou moins.
            </p>
            <BarChart bars={rpeBars} emptyMessage="Aucun RPE saisi pour l’instant." />
          </section>
        </>
      )}
    </div>
  );
}
