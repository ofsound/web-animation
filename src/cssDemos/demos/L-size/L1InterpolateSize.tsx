import { useId, useState } from 'react';
import styles from './L1InterpolateSize.module.css';

export const code = `/* interpolate-size: allow-keywords — Chrome 129+ / Safari 18.4+
   Finally makes height: 0 → auto transitions work natively in CSS! */

.accordion-body {
  interpolate-size: allow-keywords;  /* opt-in per element */
  height: 0;
  overflow: hidden;
  transition: height .4s cubic-bezier(.4,0,.2,1);
}

.accordion-body.open {
  height: auto;   /* browser now correctly interpolates to the content height */
}

/* Previously required JS to measure scrollHeight and set it explicitly */`;

const ITEMS = [
  { title: 'interpolate-size',   body: 'Allows CSS transitions to/from intrinsic keyword sizes like auto, min-content, max-content, and fit-content.' },
  { title: 'Browser support',    body: 'Chrome 129+, Edge 129+, Safari 18.4+. Falls back gracefully — the panel just snaps open instead of animating.' },
];

export default function L1InterpolateSize() {
  const [open, setOpen] = useState<number | null>(0);
  const idPrefix = useId();

  return (
    <div className={styles.stage}>
      {ITEMS.map((item, i) => (
        <div key={i} className={styles.card}>
          <button
            type="button"
            id={`${idPrefix}-header-${i}`}
            className={styles.header}
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            aria-controls={`${idPrefix}-panel-${i}`}
          >
            <span>{item.title}</span>
            <span className={[styles.toggle, open === i ? styles.open : ''].join(' ')}>▾</span>
          </button>
          <div
            id={`${idPrefix}-panel-${i}`}
            className={[styles.body, open === i ? styles.open : ''].join(' ')}
            role="region"
            aria-labelledby={`${idPrefix}-header-${i}`}
          >
            <div className={styles.bodyInner}>{item.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
