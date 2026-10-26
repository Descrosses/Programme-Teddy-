import { useEffect, useState } from 'react';
import { Stepper, stepValue } from '../components/Stepper';
import type { DayKind } from '../data/nutrition';
import type { DayIndex, WeekIndex } from '../data/types';
import { humanDate } from '../engine/calendar';
import { fr } from '../engine/format';
import { allMeasurements, getMeasurement, saveMeasurement } from '../db/repo';
import type { MeasurementRow } from '../db/db';
import styles from './Screens.module.css';

/**
 * Nutrition — principes généraux uniquement.
 *
 * Le programme d'origine portait un plan au gramme près, avec calories et
 * macronutriments. Celui de Teddy n'en porte AUCUN, et c'est une règle du
 * projet, pas un oubli : pas de calories chiffrées, pas de grammes, pas de
 * menu pesé, pas de compléments. Seulement des principes, et un journal de
 * poids pour suivre la prise de masse.
 *
 * Le plan alimentaire détaillé viendra après le questionnaire nutrition de
 * Teddy, et il suivra les mêmes règles.
 */

interface Props {
  todayKind: DayKind;
  kindProgramme: DayKind;
  todayDay: DayIndex | null;
  todayWeek: WeekIndex | null;
  onDayKindChange: () => void;
}

const PRINCIPES: Array<{ titre: string; texte: string }> = [
  {
    titre: '4 prises par jour',
    texte:
      'Petit-déjeuner, midi, collation, soir. La régularité compte plus que la perfection d’un repas.',
  },
  {
    titre: 'Une source de protéines à chaque prise',
    texte: 'Œufs, viande, poisson, laitages (skyr, fromage blanc), légumineuses.',
  },
  {
    titre: 'Un petit-déjeuner plus complet',
    texte:
      'Un fruit seul, c’est léger pour prendre du muscle : ajoute un féculent (pain complet, flocons d’avoine) et une protéine.',
  },
  {
    titre: 'Les féculents autour de la séance',
    texte:
      'En priorité au repas qui précède l’entraînement et à celui qui le suit : riz, pâtes, pommes de terre, pain.',
  },
  {
    titre: 'Légumes et fruits à chaque repas principal',
    texte: 'Une moitié d’assiette de légumes le midi et le soir, des fruits en collation.',
  },
  {
    titre: 'Hydratation',
    texte: 'Tes 2 L par jour, c’est bien. Un peu plus les jours de séance.',
  },
  {
    titre: 'En déplacement',
    texte:
      'Prévois 2 ou 3 options transportables : sandwich pain complet + poulet ou thon, skyr, fruits, oléagineux. Repère quoi prendre en station ou en supermarché.',
  },
];

export function NutritionScreen(props: Props) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [poids, setPoids] = useState<number | null>(null);
  const [historique, setHistorique] = useState<MeasurementRow[]>([]);

  async function recharger() {
    setPoids((await getMeasurement(todayIso))?.weightKg ?? null);
    setHistorique((await allMeasurements()).filter((r) => r.weightKg !== null).slice(-7).reverse());
  }

  useEffect(() => {
    void recharger();
    // `todayIso` ne change pas pendant la vie de l'écran.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function enregistrer(v: number | null) {
    setPoids(v);
    await saveMeasurement(todayIso, { weightKg: v });
    await recharger();
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.h1}>Nutrition</h1>
        <p className={styles.lead}>
          {props.todayKind === 'train' ? 'Jour d’entraînement.' : 'Jour de repos.'} Des principes,
          pas de calories ni de grammes. Ton plan détaillé arrive après ton questionnaire
          nutrition.
        </p>
      </header>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Les principes</h2>
        {PRINCIPES.map((p) => (
          <div key={p.titre} style={{ marginTop: 12 }}>
            <b>{p.titre}</b>
            <p className={styles.cardSub} style={{ marginTop: 4 }}>
              {p.texte}
            </p>
          </div>
        ))}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Poids du matin</h2>
        <p className={styles.cardSub}>
          À jeun, au réveil, plusieurs matins par semaine. C’est la moyenne qui compte, jamais une
          pesée isolée. Les courbes sont dans Progrès → Poids.
        </p>
        <div style={{ marginTop: 12 }}>
          <Stepper
            label={`Poids — ${humanDate(todayIso)}`}
            value={poids}
            step={0.1}
            min={40}
            max={160}
            unit="kg"
            tone="accent"
            onStep={(d) => void enregistrer(stepValue(poids ?? 83, d, 40, 160))}
            onCommit={(v) => void enregistrer(v)}
          />
        </div>
        {historique.length > 0 && (
          <p className={styles.fieldHint}>
            Dernières pesées :{' '}
            {historique.map((r) => `${humanDate(r.date).split(' ').slice(1).join(' ')} ${fr(r.weightKg!)}`).join(' · ')}
          </p>
        )}
      </section>

      <p className={styles.hint}>
        Compléments (whey, créatine) : aucun avis ici, ce n’est pas le rôle de ce programme. Ces
        principes sont généraux et ne remplacent pas un conseil de santé individuel.
      </p>
    </div>
  );
}
