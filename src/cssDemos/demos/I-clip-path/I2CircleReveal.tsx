import { useState } from 'react';
import styles from './I2CircleReveal.module.css';

export const code = `/* clip-path: circle() transitions from 0% → 120% for a radial reveal */

.panel {
  clip-path: circle(0% at 50% 50%);     /* collapsed — invisible */
  transition: clip-path .55s cubic-bezier(.4,0,.2,1);
}

.panel.open {
  clip-path: circle(120% at 50% 50%);  /* expanded past all corners */
}

/* You can also reveal from a click point by setting the "at X Y" to
   the mouse coordinates for a true material-design ripple reveal. */`;

export default function I2CircleReveal() {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.stage}>
      <button className={styles.btn} onClick={() => setOpen(true)}>
        Reveal panel ✦
      </button>
      <div className={[styles.panel, open ? styles.open : ''].join(' ')}>
        <p className={styles.panelTitle}>🎭 Circle Reveal</p>
        <p className={styles.panelSub}>clip-path: circle(0% → 120%)</p>
        <button className={styles.closeBtn} onClick={() => setOpen(false)}>
          ✕ Close
        </button>
      </div>
    </div>
  );
}
