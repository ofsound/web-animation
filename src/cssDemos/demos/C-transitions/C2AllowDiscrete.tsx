import { useState } from 'react';
import styles from './C2AllowDiscrete.module.css';

export const code = `/* Without allow-discrete, display:none would snap with no transition */
.panel {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity   .35s ease,
    transform .35s ease,
    display   .35s allow-discrete;   /* Baseline 2024 */
}

.panel:not(.visible) {
  display: none;       /* discrete — normally blocks transition */
  opacity: 0;
  transform: translateY(10px) scale(.96);
}

@starting-style {    /* entry transition start values */
  .panel.visible { opacity: 0; transform: translateY(10px); }
}`;

export default function C2AllowDiscrete() {
  const [visible, setVisible] = useState(true);
  return (
    <div className={styles.stage}>
      <button className={styles.btn} onClick={() => setVisible(v => !v)}>
        {visible ? 'Hide panel' : 'Show panel'}
      </button>
      <div className={[styles.panel, visible ? styles.visible : ''].join(' ')}>
        <p style={{ margin: 0 }}>I use display: none</p>
        <p style={{ margin: 0 }}>yet I still animate!</p>
        <span className={styles.badge}>allow-discrete</span>
      </div>
    </div>
  );
}
