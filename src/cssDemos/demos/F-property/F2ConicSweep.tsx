import styles from './F2ConicSweep.module.css';

export const code = `/* @property typed as <percentage> lets CSS animate inside conic-gradient */
@property --sweep {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

.ring {
  background: conic-gradient(
    oklch(68% .28 260) var(--sweep),
    oklch(20% .08 260) 0%
  );
  animation: sweepUp 2.2s cubic-bezier(.4,0,.2,1) infinite;
}

@keyframes sweepUp {
  0%   { --sweep:   0%; }
  60%  { --sweep: 100%; }
  100% { --sweep:   0%; }
}`;

export default function F2ConicSweep() {
  return (
    <div className={styles.stage}>
      <div className={styles.ring}  data-pct="CSS" />
      <div className={styles.ringB} data-pct="@prop" />
      <div className={styles.ringC} data-pct="erty" />
    </div>
  );
}
