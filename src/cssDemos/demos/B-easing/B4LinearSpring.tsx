import styles from './B4LinearSpring.module.css';

export const code = `/* linear() lets you define any piecewise easing curve */
/* These values approximate spring physics with overshoot */

.spring {
  animation-timing-function: linear(
    0, 0.009, 0.035 3.1%, 0.141, 0.281 11.4%,
    0.723 22.9%, 0.938 29.2%, 1.017, 1.077, 1.121,
    1.149 40.6%, 1.159, 1.154, 1.129 50%,
    1.051 55.8%, 1.017 58.6%, 0.991,
    0.977 66.3%, 0.975 68.8%,
    1.001 80%, 1
  );
}

/* Values > 1 cause the "overshoot" — impossible with cubic-bezier y-clamped */`;

const rows = [
  { label: 'ease', cls: styles.std },
  { label: 'spring', cls: styles.spring },
  { label: 'bouncy', cls: styles.bouncy },
];

export default function B4LinearSpring() {
  return (
    <div className={styles.stage}>
      {rows.map(r => (
        <div key={r.label} className={styles.row}>
          <span className={styles.lbl}>{r.label}</span>
          <div className={styles.track}>
            <div className={`${styles.dot} ${r.cls}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
