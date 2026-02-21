import { useState } from 'react';
import styles from './A3FillMode.module.css';

export const code = `/* none: no fill before or after */
.box-none     { animation-fill-mode: none; }
/* forwards: holds final keyframe state */
.box-forwards { animation-fill-mode: forwards; }
/* backwards: applies first keyframe during delay */
.box-back     { animation-fill-mode: backwards; }
/* both: backwards + forwards combined */
.box-both     { animation-fill-mode: both; }

@keyframes fillDemo {
  from { opacity: 0.3; transform: translateY(18px); }
  to   { opacity: 1;   transform: translateY(0); }
}`;

const modes = [
  { label: 'none', cls: styles.none },
  { label: 'forwards', cls: styles.fwd },
  { label: 'backwards', cls: styles.back },
  { label: 'both', cls: styles.both },
];

export default function A3FillMode() {
  const [key, setKey] = useState(0);
  return (
    <div className={styles.stage} style={{ flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-end' }}>
        {modes.map(m => (
          <div key={m.label + key} className={styles.col}>
            <div className={`${styles.box} ${m.cls}`} />
            <span className={styles.label}>{m.label}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => setKey(k => k + 1)}
        style={{ marginTop: 4, fontSize: 11, padding: '4px 10px',
          background: '#1e2840', border: '1px solid #3a4c85',
          color: '#c5d1f5', borderRadius: 6, cursor: 'pointer' }}
      >
        Replay
      </button>
    </div>
  );
}
