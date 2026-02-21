import { useState } from 'react';
import styles from './A5PlayState.module.css';

export const code = `@keyframes spin {
  to { transform: rotate(360deg); }
}

.gear {
  animation: spin 3s linear infinite;
}

/* Toggle with a single class — no animation duplication */
.gear.paused {
  animation-play-state: paused;
}`;

export default function A5PlayState() {
  const [paused, setPaused] = useState(false);
  return (
    <div className={styles.stage}>
      <span className={[styles.gear, paused ? styles.paused : ''].join(' ')}>⚙️</span>
      <button className={styles.btn} onClick={() => setPaused(p => !p)}>
        {paused ? '▶ Resume' : '⏸ Pause'}
      </button>
    </div>
  );
}
