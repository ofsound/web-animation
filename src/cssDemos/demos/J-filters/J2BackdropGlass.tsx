import styles from './J2BackdropGlass.module.css';

export const code = `/* backdrop-filter blurs/adjusts what's visually BEHIND the element,
   not the element itself — the key to genuine glassmorphism */

.glass {
  background: oklch(85% .04 260 / .12);     /* semi-transparent fill */
  border: 1px solid oklch(85% .08 260 / .25); /* subtle frosted edge */

  backdrop-filter: blur(18px) saturate(1.6);
  -webkit-backdrop-filter: blur(18px) saturate(1.6);
}

/* The element behind MUST be a different stacking context (position/z-index)
   for backdrop-filter to have something to blur */`;

export default function J2BackdropGlass() {
  return (
    <div className={styles.stage}>
      <div className={styles.bg} />
      <div className={styles.glass}>
        <p className={styles.glassTitle}>🪟 Glassmorphism</p>
        <p className={styles.glassSub}>backdrop-filter: blur(18px)<br />saturate(1.6)</p>
        <span className={styles.glassTag}>Baseline 2024</span>
      </div>
    </div>
  );
}
