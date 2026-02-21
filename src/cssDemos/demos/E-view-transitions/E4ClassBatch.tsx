import { useState } from 'react';
import styles from './E4ClassBatch.module.css';

export const code = `/* Multiple view-transition-name values on different elements —
   each one gets its own captured layer and morphs independently */

.avatar { view-transition-name: e4-avatar; }
.name   { view-transition-name: e4-name;   }
.stat   { view-transition-name: e4-stat;   }
.score  { view-transition-name: e4-score;  }

// Each element animates between its old and new position/size/content
// The avatar color, the text, and the score all morph simultaneously
document.startViewTransition(() => setProfile(next));`;

const PROFILES = [
  { icon: '🦊', bg: 'oklch(65% .25 40)',  name: 'Fox#9834',  stat: '2,341 matches', score: '98' },
  { icon: '🐉', bg: 'oklch(65% .25 145)', name: 'Draco#1111', stat: '5,887 matches', score: '71' },
  { icon: '🌊', bg: 'oklch(65% .25 220)', name: 'Wave#4422',  stat: '891 matches',   score: '84' },
  { icon: '⚡', bg: 'oklch(65% .25 80)',  name: 'Bolt#2277',  stat: '3,209 matches', score: '55' },
];

export default function E4ClassBatch() {
  const [idx, setIdx] = useState(0);
  const p = PROFILES[idx];

  const next = () => {
    const nxt = (idx + 1) % PROFILES.length;
    if (document.startViewTransition) {
      document.startViewTransition(() => setIdx(nxt));
    } else {
      setIdx(nxt);
    }
  };

  return (
    <div className={styles.stage}>
      <button className={styles.btn} onClick={next}>Next player →</button>
      <div className={styles.card} style={{ background: p.bg + '18' }}>
        <div className={styles.avatar} style={{ background: p.bg }}>{p.icon}</div>
        <div className={styles.info}>
          <p className={styles.name}>{p.name}</p>
          <p className={styles.stat}>{p.stat}</p>
        </div>
        <div className={styles.score} style={{ color: p.bg }}>{p.score}</div>
      </div>
    </div>
  );
}
