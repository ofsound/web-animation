import styles from './F3RotatingBorder.module.css';

export const code = `/* @property <angle> makes it possible to animate conic-gradient's "from" angle */
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

.card::before {
  background: conic-gradient(
    from var(--angle),          /* ← rotates as --angle animates */
    oklch(68% .28 260),
    oklch(68% .28 320),
    oklch(68% .28 260)
  );
  animation: rotateBorder 3s linear infinite;
}

@keyframes rotateBorder {
  to { --angle: 360deg; }   /* only possible because type is declared */
}`;

export default function F3RotatingBorder() {
  return (
    <div className={styles.stage}>
      <div className={styles.card}>
        <span className={styles.cardLabel}>card A</span>
      </div>
      <div className={styles.cardB}>
        <span className={styles.cardLabel}>card B</span>
      </div>
    </div>
  );
}
