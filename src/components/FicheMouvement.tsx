import { useState } from 'react';
import type { ExerciseDef } from '../data/types';
import styles from '../screens/Session.module.css';

/**
 * Fiche du mouvement : l'infographie d'exécution fournie par Guillaume
 * (position de départ, contraction, fin du mouvement, muscles ciblés, points
 * clés), livrée AVEC l'appli dans `public/fiches/`. Elle est donc disponible
 * hors ligne et identique sur tous les téléphones, sans rien importer.
 *
 * Sur un écran de téléphone, l'infographie entière est trop petite pour être
 * lue : un appui l'ouvre en plein écran, un second appui l'agrandit pour lire
 * les points clés, en faisant défiler.
 */
export function FicheMouvement({ def, label }: { def: ExerciseDef; label?: string }) {
  const [ouverte, setOuverte] = useState(false);
  const [zoom, setZoom] = useState(false);
  if (!def.fiche) return null;
  const src = `${import.meta.env.BASE_URL}${def.fiche}`;

  return (
    <>
      <button
        type="button"
        className={styles.disclosure}
        onClick={() => {
          setZoom(false);
          setOuverte(true);
        }}
      >
        📖 {label ?? 'Fiche du mouvement'}
      </button>

      {ouverte && (
        <div
          className={styles.ficheOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={`Fiche du mouvement : ${def.name}`}
        >
          <div className={styles.ficheBar}>
            <span>{zoom ? 'Fais défiler pour lire' : 'Touche l’image pour l’agrandir'}</span>
            <button type="button" className={styles.ficheClose} onClick={() => setOuverte(false)}>
              Fermer
            </button>
          </div>
          <div className={styles.ficheScroll}>
            <button
              type="button"
              className={styles.ficheImgButton}
              onClick={() => setZoom((z) => !z)}
              aria-label={zoom ? 'Réduire la fiche' : 'Agrandir la fiche'}
            >
              <img
                src={src}
                alt={`Fiche technique : ${def.name}`}
                className={zoom ? styles.ficheImgZoom : styles.ficheImg}
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
