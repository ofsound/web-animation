import styles from './A6MultipleAnims.module.css';

export const code = `/* Three @keyframes applied to one element — comma-separated */
.gem {
  animation:
    spin   6s   linear      infinite,
    float  2.4s ease-in-out infinite alternate,
    pulse  1.8s ease-in-out infinite alternate;
}

@keyframes spin  { to   { transform: rotate(1turn); } }
@keyframes float {
  from { translate: 0 12px; }
  to   { translate: 0 -16px; }
}
@keyframes pulse {
  from { filter: drop-shadow(0 0 8px oklch(68% .28 260 / .5)); }
  to   { filter: drop-shadow(0 0 28px oklch(75% .3 320 / .9)); }
}`;

export default function A6MultipleAnims() {
  return (
    <div className={styles.stage}>
      <span className={styles.gem}>💎</span>
    </div>
  );
}
