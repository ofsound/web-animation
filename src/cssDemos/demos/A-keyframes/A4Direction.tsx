import styles from './A4Direction.module.css';

export const code = `@keyframes slide {
  from { left: 4px; }
  to   { left: calc(100% - 20px); }
}

/* All share the same @keyframes, only direction differs */
.normal           { animation-direction: normal; }
.reverse          { animation-direction: reverse; }
.alternate        { animation-direction: alternate; }
.alternate-reverse{ animation-direction: alternate-reverse; }`;

const dirs = [
  { label: 'normal', cls: styles.normal },
  { label: 'reverse', cls: styles.reverse },
  { label: 'alternate', cls: styles.alternate },
  { label: 'alternate-reverse', cls: styles.alternateReverse },
];

export default function A4Direction() {
  return (
    <div className={styles.stage}>
      {dirs.map(d => (
        <div key={d.label} className={styles.row}>
          <span className={styles.lbl}>{d.label}</span>
          <div className={styles.track}>
            <div className={`${styles.dot} ${d.cls}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
