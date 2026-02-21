import { useState } from 'react';
import styles from './K4Typewriter.module.css';

export const code = `/* Typewriter via steps() on width + a blinking cursor border-right.
   Stagger multiple lines with animation-delay. */

.line {
  overflow: hidden;
  white-space: nowrap;
  width: 0;
  border-right: 2px solid oklch(68% .22 260);

  animation:
    typeIn        .9s steps(28, end) forwards,
    cursorBlink   .7s step-end      infinite;
}

@keyframes typeIn      { to   { width: 100%; } }
@keyframes cursorBlink {
  0%, 100% { border-right-color: oklch(68% .22 260); }
  50%      { border-right-color: transparent; }
}`;

const LINES = [
  'offset-path: circle();',
  'animation-timeline: view();',
  'backdrop-filter: blur(18px);',
];

export default function K4Typewriter() {
  const [key, setKey] = useState(0);
  return (
    <div className={styles.stage}>
      <div className={styles.lines} key={key}>
        {LINES.map((l, i) => (
          <div key={i} className={styles.line}>{l}</div>
        ))}
      </div>
      <button className={styles.btn} onClick={() => setKey(k => k + 1)}>▶ Replay</button>
    </div>
  );
}
