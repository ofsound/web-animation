import { useState } from 'react';
import styles from './K3LetterSpacing.module.css';

export const code = `// Split text into individual <span> elements.
// Each gets an animation-delay based on its index — no library needed.

{text.split('').map((char, i) => (
  <span
    key={i}
    className={styles.char}
    style={{ animationDelay: i * 0.06 + 's' }}
  >
    {char === ' ' ? '\u00A0' : char}
  </span>
))}

@keyframes charIn {
  from { opacity: 0; transform: translateY(20px) rotateX(-90deg); }
  to   { opacity: 1; transform: translateY(0)    rotateX(0deg);   }
}`;

const TEXT = 'CSS 2026';

export default function K3LetterSpacing() {
  const [key, setKey] = useState(0);
  return (
    <div className={styles.stage}>
      <div className={styles.word} key={key}>
        {TEXT.split('').map((ch, i) => (
          <span
            key={i}
            className={styles.char}
            style={{ animationDelay: `${i * 0.07}s` }}
          >{ch === ' ' ? ' ' : ch}</span>
        ))}
      </div>
      <button className={styles.btn} onClick={() => setKey(k => k + 1)}>▶ Replay</button>
    </div>
  );
}
