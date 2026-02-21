import styles from './H2CircleOrbit.module.css';

export const code = `/* offset-path: circle() — multiple elements share the same circular path.
   Staggered animation-delay spaces them evenly around the orbit. */

.satellite {
  offset-path: circle(70px at center);
  offset-rotate: 0deg;   /* keep emoji upright — don't auto-face path */
  animation: orbit 6s linear infinite;
}

/* 4 satellites at 25% intervals → 6s / 4 = 1.5s delay steps */
.s1 { animation-delay:    0s; }
.s2 { animation-delay: -1.5s; }
.s3 { animation-delay: -3.0s; }
.s4 { animation-delay: -4.5s; }

@keyframes orbit {
  to { offset-distance: 100%; }
}`;

const SATS = [
  { cls: styles.s1, icon: '🌙' },
  { cls: styles.s2, icon: '⭐' },
  { cls: styles.s3, icon: '☄️' },
  { cls: styles.s4, icon: '🛸' },
];

export default function H2CircleOrbit() {
  return (
    <div className={styles.stage}>
      <div className={styles.orbitRing} />
      <div className={styles.planet}>🌍</div>
      {SATS.map(({ cls, icon }) => (
        <div key={icon} className={`${styles.satellite} ${cls}`}>{icon}</div>
      ))}
    </div>
  );
}
