/**
 * Échauffements, en listes cochables. 8 minutes, comptées dans la durée de la
 * séance (règle C5 : les minutes déclarées incluent l'échauffement).
 *
 * Chaque `id` est stable : c'est ce qu'on stocke dans `sessions.warmupChecked`.
 */

import type { Warmup } from './types';

export const WARMUP_LOWER: Warmup = {
  id: 'lower',
  durationLabel: '8 min',
  items: [
    { id: 'wl-velo', label: 'Vélo ou rameur, allure facile', detail: '3 min' },
    { id: 'wl-squat', label: 'Squat poids du corps', detail: '× 10' },
    { id: 'wl-fentes', label: 'Fentes', detail: '5 / jambe' },
    { id: 'wl-hanches', label: 'Mobilité des hanches', detail: '1 min' },
    { id: 'wl-ramp', label: 'Montées de charge', detail: '2-3 séries jusqu’à la charge du jour' },
  ],
};

export const WARMUP_UPPER: Warmup = {
  id: 'upper',
  durationLabel: '8 min',
  items: [
    { id: 'wu-rameur', label: 'Rameur ou vélo, allure facile', detail: '3 min' },
    { id: 'wu-elastique', label: 'Tirages à l’élastique', detail: '2 × 15' },
    { id: 'wu-epaules', label: 'Rotations d’épaules', detail: '× 10 / sens' },
    { id: 'wu-ramp', label: 'Montées de charge', detail: '2-3 séries jusqu’à la charge du jour' },
  ],
};

export const WARMUPS = { lower: WARMUP_LOWER, upper: WARMUP_UPPER } as const;
