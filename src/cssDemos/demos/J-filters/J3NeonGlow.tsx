import styles from './J3NeonGlow.module.css';

export const code = `/* Neon glow: stack multiple drop-shadow() filters — each adds a halo layer.
   Animating between low and high intensity creates the "pulse" effect. */

.neon {
  animation: neonPulse 2s ease-in-out infinite alternate;
}

@keyframes neonPulse {
  from {
    filter:
      drop-shadow(0 0  4px oklch(80% .28 260))
      drop-shadow(0 0 12px oklch(68% .28 260))
      drop-shadow(0 0 24px oklch(55% .28 260 / .7));
  }
  to {
    filter:
      drop-shadow(0 0  8px oklch(80% .28 260))
      drop-shadow(0 0 24px oklch(68% .28 260))
      drop-shadow(0 0 48px oklch(55% .28 260 / .9))
      drop-shadow(0 0 72px oklch(45% .28 260 / .5));
  }
}`;

export default function J3NeonGlow() {
  return (
    <div className={styles.stage}>
      <div className={styles.neon}>NEON</div>
      <div className={styles.neonGreen}>CSS FILTERS</div>
    </div>
  );
}
