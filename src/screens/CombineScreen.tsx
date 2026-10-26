import { useEffect, useState } from 'react';
import { Stepper, stepValue } from '../components/Stepper';
import { EXERCISES } from '../data/exercises';
import { AVEC_MAX_ESTIME, COMBINE_METRICS, maxEstime } from '../data/testSessions';
import { fr } from '../engine/format';
import { allCombines, getSettingsRow, saveCombine, saveSettings } from '../db/repo';
import type { CombinePhase, CombineRow } from '../db/db';
import styles from './Screens.module.css';

/** Deux combines seulement : semaine 1 et semaine 4. */
const PHASES: Array<{ id: CombinePhase; label: string; when: string }> = [
  { id: 'initial', label: 'Initial', when: 'Semaine 1' },
  { id: 'final', label: 'Final', when: 'Semaine 4' },
];

/** Réglages du stepper par unité de mesure. */
const MEASURE = {
  cm: { step: 5, min: 20, max: 400, unit: 'cm' },
  s: { step: 0.1, min: 0.5, max: 60, unit: 's' },
  m: { step: 5, min: 5, max: 200, unit: 'm' },
  kg: { step: 2.5, min: 0, max: 300, unit: 'kg' },
  reps: { step: 1, min: 0, max: 60, unit: 'reps' },
} as const;

/** D'où vient chaque mesure, pour que Teddy sache où la retrouver. */
const OU: Record<string, string> = {
  'test-bodyweight': 'Relevé à la maison : moyenne de 3 matins à jeun. Se saisit aussi dans Réglages.',
  'test-squat-8': 'La charge de ta 1re série de squat du mardi.',
  'test-bench-8': 'La charge de ta 1re série de développé couché du lundi.',
  'test-ohp-8': 'La charge de ta 1re série de développé militaire du jeudi.',
  'test-strict-pullup-max': 'Le test de fin de séance du lundi.',
  'test-broad-jump':
    'Semaine 1 : le meilleur des 3 sauts du mardi. Semaine 4 : le meilleur saut du readiness du vendredi.',
  'test-box-jump': 'La hauteur de box que tu as réellement utilisée, réception propre.',
};

export function CombineScreen() {
  const [rows, setRows] = useState<CombineRow[] | null>(null);
  const [phase, setPhase] = useState<CombinePhase>('initial');
  const [draft, setDraft] = useState<Record<string, number | null>>({});
  /** Poids de corps des Réglages : il ne se mesure pas en salle. */
  const [settingsBodyweight, setSettingsBodyweight] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      setRows(await allCombines());
      setSettingsBodyweight((await getSettingsRow()).bodyweightKg);
    })();
  }, []);

  useEffect(() => {
    if (!rows) return;
    setDraft(rows.find((r) => r.phase === phase)?.metrics ?? {});
    setSaved(false);
  }, [rows, phase]);

  if (!rows) return <div className={styles.loading}>Chargement…</div>;

  const byPhase = (p: CombinePhase) => rows.find((r) => r.phase === p)?.metrics ?? {};

  async function save() {
    await saveCombine(phase, { metrics: draft, date: new Date().toISOString().slice(0, 10) });
    /*
     * Le broad jump du combine initial EST la référence de readiness. La
     * reporter dans les Réglages à la main était une étape de plus qu'on
     * finissait par oublier — et sans elle, aucun feu tricolore.
     */
    const saut = draft['test-broad-jump'];
    if (phase === 'initial' && typeof saut === 'number' && saut > 0) {
      await saveSettings({ broadJumpBaselineCm: saut });
    }
    setRows(await allCombines());
    setSaved(true);
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.h1}>Combine</h1>
        <p className={styles.lead}>
          Aucun test de maximum : des charges pour 8 reps avec 3 en réserve, des tractions, des
          sauts. Mêmes conditions en semaine 1 et en semaine 4, c’est ce qui les rend comparables.
        </p>
      </header>

      <div className={styles.weeks}>
        {PHASES.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`${styles.week} ${phase === p.id ? styles.weekOn : ''}`}
            style={{ width: 'auto', padding: '0 14px', borderBottomColor: 'var(--accent)' }}
            onClick={() => setPhase(p.id)}
            aria-pressed={phase === p.id}
          >
            <span className={styles.weekNum} style={{ fontSize: '1rem' }}>
              {p.label}
            </span>
            <span className={styles.weekTag}>{p.when}</span>
          </button>
        ))}
      </div>

      {/* --- Comparaison des deux combines --------------------------------- */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Comparaison</h2>
        <p className={styles.cardSub}>
          Les maxima entre parenthèses sont <b>estimés</b> (formule d’Epley, 8 reps + 3 en
          réserve) : un repère de progression, jamais une mesure.
        </p>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mesure</th>
                <th>S1</th>
                <th>S4</th>
              </tr>
            </thead>
            <tbody>
              {COMBINE_METRICS.map((id) => {
                const i = byPhase('initial')[id];
                const f = byPhase('final')[id];
                const better =
                  typeof i === 'number' && typeof f === 'number' && f !== i ? f > i : null;
                return (
                  <tr key={id}>
                    <td>{EXERCISES[id]?.name ?? id}</td>
                    <td>{valeur(id, i)}</td>
                    <td
                      className={
                        better === null || id === 'test-bodyweight'
                          ? ''
                          : better
                            ? styles.deltaUp
                            : styles.deltaDown
                      }
                    >
                      {valeur(id, f)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Saisie guidée -------------------------------------------------- */}
      <h2 className={styles.sectionTitle}>
        Saisie — combine {PHASES.find((p) => p.id === phase)!.label.toLowerCase()}
      </h2>
      {phase === 'final' && (
        <p className={styles.hint}>
          Développés et squat : reprends la charge de la semaine 1 pour 8 reps. Si tu as dû la
          changer, saisis celle que tu as réellement utilisée et note le nombre de reps en réserve
          dans la remarque de l’exercice.
        </p>
      )}

      {COMBINE_METRICS.map((id) => {
        const def = EXERCISES[id];
        if (!def) return null;
        const cfg = MEASURE[def.measure ?? 'reps'];
        const v = draft[id] ?? null;
        return (
          <section key={id} className={styles.card}>
            <h3 className={styles.cardTitle}>{def.name}</h3>
            <p className={styles.cardSub}>{def.intent}</p>
            {OU[id] && <p className={styles.fieldHint}>{OU[id]}</p>}
            <div style={{ marginTop: 12 }}>
              <Stepper
                label={def.name}
                value={v}
                step={cfg.step}
                min={cfg.min}
                max={cfg.max}
                unit={cfg.unit}
                tone="accent"
                onStep={(d) =>
                  setDraft((prev) => ({
                    ...prev,
                    [id]: stepValue(prev[id] ?? null, d, cfg.min, cfg.max),
                  }))
                }
                onCommit={(val) => setDraft((prev) => ({ ...prev, [id]: val }))}
              />
            </div>
            {AVEC_MAX_ESTIME.has(id) && typeof v === 'number' && v > 0 && (
              <p className={styles.fieldHint}>
                Maximum <b>estimé</b> : ≈ {fr(maxEstime(v))} kg. Ce n’est pas une mesure.
              </p>
            )}
            {id === 'test-bodyweight' && settingsBodyweight !== null && v !== settingsBodyweight && (
              <button
                type="button"
                className={styles.secondary}
                style={{ width: '100%', margin: '10px 0 0' }}
                onClick={() => setDraft((prev) => ({ ...prev, [id]: settingsBodyweight }))}
              >
                Reprendre {fr(settingsBodyweight)} kg des Réglages
              </button>
            )}
          </section>
        );
      })}

      <button type="button" className={styles.primary} onClick={() => void save()}>
        Enregistrer le combine
      </button>
      {saved && (
        <p className={styles.hint}>
          Enregistré.
          {phase === 'initial' && typeof draft['test-broad-jump'] === 'number'
            ? ' Ton broad jump est maintenant ta référence de readiness.'
            : ''}
        </p>
      )}
    </div>
  );
}

/** « 60 kg (≈ 82 estimé) » pour les charges, la valeur seule ailleurs. */
function valeur(id: string, v: number | null | undefined): string {
  if (typeof v !== 'number') return '—';
  if (AVEC_MAX_ESTIME.has(id) && v > 0) return `${fr(v)} (≈ ${fr(maxEstime(v))})`;
  return fr(v);
}
