import { useState } from 'react';
import styles from './G2CardFlip.module.css';

export const code = `/* Three ingredients for a 3D flip: */

/* 1. Camera — parent element gets perspective */
.stage   { perspective: 800px; }

/* 2. Pivot — preserve-3d makes children share the same 3D space */
.scene   { transform-style: preserve-3d;
           transition: transform .65s cubic-bezier(.4,0,.2,1); }
.flipped { transform: rotateY(180deg); }

/* 3. Faces — backface-visibility: hidden hides the face pointing away */
.front { backface-visibility: hidden; }
.back  { backface-visibility: hidden;
         transform: rotateY(180deg); }  /* pre-rotated to start face-down */`;

export default function G2CardFlip() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={styles.stage}>
      <button
        type="button"
        className={[styles.scene, flipped ? styles.flipped : ''].join(' ')}
        onClick={() => setFlipped(f => !f)}
        aria-pressed={flipped}
        aria-label={flipped ? 'Flip card to front face' : 'Flip card to back face'}
      >
        <div className={styles.face + ' ' + styles.front}>
          <span className={styles.icon}>🃏</span>
          <span className={styles.title}>Click to flip</span>
          <span className={styles.hint}>backface-visibility: hidden</span>
        </div>
        <div className={styles.face + ' ' + styles.back}>
          <span className={styles.icon}>✅</span>
          <span className={styles.title}>Back face!</span>
          <span className={styles.backHint}>transform: rotateY(180deg)</span>
        </div>
      </button>
    </div>
  );
}
