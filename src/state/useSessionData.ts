/**
 * Chargement d'une séance : réglages, historique, readiness, séries déjà
 * saisies. Tout vient de la base locale, rien du réseau.
 */

import { useCallback, useEffect, useState } from 'react';
import type { DayIndex, WeekIndex } from '../data/types';
import { dateFor } from '../engine/calendar';
import { getSession as buildSession, type ResolvedSession } from '../engine/getSession';
import { readiness as computeReadiness } from '../engine/readiness';
import { explosiveTrend, type ExplosiveTrend } from '../engine/trends';
import type { HistoryIndex, ReadinessResult } from '../engine/types';
import type { ReadinessRow, SessionRow, SetRow } from '../db/db';
import {
  allReadiness,
  allSessionExercises,
  buildHistoryIndex,
  allSets,
  ensureSession,
  getReadiness,
  getSession as getSessionRow,
  getSettingsRow,
  toEngineSettings,
  toReadinessRecords,
} from '../db/repo';
import { EXERCISES } from '../data/exercises';
import { applyCustom, type CustomRow, type Replaced } from '../engine/customExercise';
import type { SessionExerciseRow } from '../db/db';

export interface SessionData {
  loading: boolean;
  /** `null` = pas de séance ce jour-là. */
  session: ResolvedSession | null;
  row: SessionRow | null;
  /** Séries déjà enregistrées, groupées par exercice. */
  savedSets: Record<string, SetRow[]>;
  /**
   * Les occurrences réelles des 12 semaines, déjà construites ici pour §11.
   * L'encart « la dernière fois » lit la MÊME chose : une seule requête, une
   * seule vérité. Deux sources finiraient par se contredire.
   */
  history: HistoryIndex;
  readinessRow: ReadinessRow | null;
  readiness: ReadinessResult | null;
  baselineCm: number | null;
  trend: ExplosiveTrend;
  date: string;
  /**
   * TOUTES les lignes d'exercices de séance, les douze semaines.
   *
   * Les puces « remplacé par » et « ajouté la semaine dernière » regardent les
   * séances passées du même jour : l'écran a donc besoin de l'ensemble, pas
   * seulement de la séance du jour.
   */
  customRows: SessionExerciseRow[];
  /** Ce que le programme prévoyait et qu'un remplacement a mis de côté. */
  replaced: Replaced[];
  reload: () => Promise<void>;
}

/** Effet d'une séance allégée demandée à la main : celui du readiness rouge. */
const SEANCE_ALLEGEE: ReadinessResult = {
  level: 'rouge',
  pctDelta: 0,
  jumpCm: 0,
  baselineCm: 0,
  label: 'Séance allégée demandée (stress, mauvaise nuit).',
  effect: '2 séries par exercice, 4 reps en réserve, explosifs retirés.',
};

export function useSessionData(week: WeekIndex, day: DayIndex): SessionData {
  const [state, setState] = useState<Omit<SessionData, 'reload'>>(() => empty());

  const reload = useCallback(async () => {
    const settingsRow = await getSettingsRow();
    const settings = toEngineSettings(settingsRow);
    /*
     * Sans date de début, la séance n'avait PAS de ligne en base : rien ne
     * s'enregistrait — échauffement, séries, fin de séance, chrono — et sans
     * le moindre message. On la date donc d'aujourd'hui ; dès que la date de
     * début est réglée, `realignScheduleDates` la recale sur le calendrier.
     */
    const date = settings.startDate
      ? dateFor(settings.startDate, week, day)
      : new Date().toISOString().slice(0, 10);

    const [sets, readinessRows, readinessRow, customRows, existingRow] = await Promise.all([
      allSets(),
      allReadiness(),
      getReadiness(week, day),
      allSessionExercises(),
      getSessionRow(week, day),
    ]);

    const history = buildHistoryIndex(sets);
    const trend = explosiveTrend(toReadinessRecords(readinessRows), date || undefined);

    /*
     * Séance allégée demandée à la main : elle passe avant le saut du jour.
     * Le stress de Tedhi (8/10 au bilan) peut justifier d'alléger n'importe
     * quelle séance, y compris un jour sans readiness test.
     */
    const readinessResult: ReadinessResult | null = existingRow?.lightSession
      ? SEANCE_ALLEGEE
      : readinessRow
        ? computeReadiness(settings.broadJumpBaselineCm, readinessRow.jumpCm)
        : null;

    const prescrite = buildSession(week, day, {
      settings,
      history,
      readiness: readinessResult,
      explosiveDecline: trend.declining,
    });

    // La ligne de séance n'est créée que si la case porte une séance.
    const row = prescrite && date ? await ensureSession(week, day, date) : null;

    /*
     * Les remplacements et ajouts s'appliquent APRÈS la séance prescrite, et
     * seulement ceux de cette séance-là. L'ordre compte : on part toujours de
     * ce que le programme dit, puis on y pose ce qui a été décidé sur place.
     * L'inverse — garder une séance modifiée en base — aurait fait du
     * remplacement une correction du programme, qu'il n'est pas.
     */
    const duJour = customRows.filter((r) => r.sessionId === row?.id);
    const applique =
      prescrite === null
        ? { exercises: [], replaced: [] }
        : applyCustom(prescrite.exercises, duJour as CustomRow[], (id) => EXERCISES[id]);
    const session = prescrite === null ? null : { ...prescrite, exercises: applique.exercises };

    const savedSets: Record<string, SetRow[]> = {};
    if (row?.id !== undefined) {
      for (const s of sets.filter((x) => x.sessionId === row.id)) {
        (savedSets[s.exerciseId] ??= []).push(s);
      }
      for (const list of Object.values(savedSets)) list.sort((a, b) => a.setIndex - b.setIndex);
    }

    setState({
      loading: false,
      session,
      row,
      savedSets,
      readinessRow: readinessRow ?? null,
      readiness: readinessResult,
      baselineCm: settings.broadJumpBaselineCm,
      trend,
      date,
      history,
      customRows,
      replaced: applique.replaced,
    });
  }, [week, day]);

  useEffect(() => {
    setState(empty());
    void reload();
  }, [reload]);

  return { ...state, reload };
}

function empty(): Omit<SessionData, 'reload'> {
  return {
    loading: true,
    session: null,
    row: null,
    savedSets: {},
    readinessRow: null,
    readiness: null,
    baselineCm: null,
    trend: {
      declining: false,
      consecutiveDrops: 0,
      suggestEarlyDeload: false,
      weekly: [],
      message: '',
    },
    date: '',
    history: {},
    customRows: [],
    replaced: [],
  };
}
