import styles from './C1MultiProp.module.css';

export const code = `/* Four properties — each can have its own duration & easing */
.card {
  border: 1px solid #2a3a68;
  background: linear-gradient(160deg, #141e3a, #0d1526);

  transition:
    transform    .38s cubic-bezier(.22,.99,.38,1.18),  /* overshoot */
    box-shadow   .38s ease,
    background   .38s ease,
    border-color .38s ease;
}

.card:hover {
  transform:   translateY(-10px) scale(1.03);
  box-shadow:  0 20px 48px oklch(45% .22 260 / .45);
  background:  linear-gradient(160deg, #1d2e58, #111e42);
  border-color: oklch(65% .22 260 / .8);
}`;

export default function C1MultiProp() {
  return (
    <div className={styles.stage}>
      <div className={styles.card}>
        <span className={styles.icon}>🎴</span>
        <p className={styles.title}>Hover me</p>
        <p className={styles.sub}>4 properties, 1 transition rule</p>
      </div>
    </div>
  );
}
