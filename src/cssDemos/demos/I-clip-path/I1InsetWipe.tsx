import { useState } from 'react';
import styles from './I1InsetWipe.module.css';

export const code = `/* clip-path: inset() with animated right edge = wipe reveal */

.fill {
  animation: wipeIn .9s cubic-bezier(.25,.1,.25,1) both;
}

@keyframes wipeIn {
  from { clip-path: inset(0 100% 0 0 round 6px); }  /* fully clipped */
  to   { clip-path: inset(0   0% 0 0 round 6px); }  /* fully visible */
}

/* The round parameter preserves border-radius on the clip shape */`;

const BARS = [
  { label: 'CSS',    pct: '84%' },
  { label: 'Motion', pct: '71%' },
  { label: 'Scroll', pct: '93%' },
  { label: '@prop',  pct: '62%' },
];

export default function I1InsetWipe() {
  const [key, setKey] = useState(0);
  return (
    <div className={styles.stage}>
      <button className={styles.btn} onClick={() => setKey(k => k + 1)}>▶ Replay</button>
      <div className={styles.tracks} key={key}>
        {BARS.map(({ label, pct }) => (
          <div key={label} className={styles.row}>
            <span className={styles.rowLabel}>{label}</span>
            <div className={styles.bar}>
              <div className={styles.fill} style={{ width: pct }} />
              <span className={styles.valLabel}>{pct}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
