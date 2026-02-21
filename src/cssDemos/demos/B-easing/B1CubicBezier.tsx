import styles from './B1CubicBezier.module.css';

export const code = `/* Same @keyframes, different timing functions */
@keyframes race {
  from { left: 4px; }
  to   { left: calc(100% - 20px); }
}

.ease    { animation-timing-function: ease; }
.ease-in { animation-timing-function: ease-in; }
.ease-out{ animation-timing-function: ease-out; }
/* custom overshoot — note x2 can exceed 1 for elastic feel */
.bounce  { animation-timing-function: cubic-bezier(.22,.99,.44,1.35); }`;

const rows = [
  { label: 'ease (default)',             cls: styles.ease },
  { label: 'ease-in',                    cls: styles.easeIn },
  { label: 'ease-out',                   cls: styles.easeOut },
  { label: 'cubic-bezier(.22,.99,.44,1.35) ↩', cls: styles.bounce },
];

export default function B1CubicBezier() {
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
