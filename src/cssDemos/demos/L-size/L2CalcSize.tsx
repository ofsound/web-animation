import { useState } from 'react';
import styles from './L2CalcSize.module.css';

export const code = `/* calc-size() lets you do arithmetic on intrinsic sizes.
   "size" is a special keyword representing the intrinsic value. */

.pill {
  width: fit-content;
  transition: width .4s ease;
  interpolate-size: allow-keywords;
}

.pill.collapsed { width: 36px; }

/* calc-size(fit-content, size + 24px) = content width + 24px extra */
.pill.expanded  { width: calc-size(fit-content, size + 24px); }

/* Without calc-size(), you could NOT add a fixed amount to an intrinsic size */`;

const PILLS = [
  { icon: '⚡', label: 'View Transitions' },
  { icon: '🎯', label: 'Scroll-Driven' },
  { icon: '🎨', label: '@property' },
];

export default function L2CalcSize() {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div className={styles.stage}>
      <span className={styles.label}>click to expand</span>
      {PILLS.map((p, i) => (
        <button
          type="button"
          key={i}
          className={[styles.pill, expanded === i ? styles.expanded : styles.collapsed].join(' ')}
          onClick={() => setExpanded(expanded === i ? null : i)}
          aria-pressed={expanded === i}
          aria-label={`${expanded === i ? 'Collapse' : 'Expand'} ${p.label}`}
        >
          <span className={styles.icon}>{p.icon}</span>
          <span className={styles.text}>{p.label}</span>
        </button>
      ))}
    </div>
  );
}
