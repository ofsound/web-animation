import styles from './M1Oklch.module.css';

export const code = `/* oklch(L% C H) — Lightness, Chroma, Hue
   L is perceptually uniform: oklch(68% .25 0) looks same brightness as oklch(68% .25 180)
   hsl(55%, 80%) looks very different brightness than hsl(240, 80%) */

/* Animated hue via @property — traverses the full colour wheel */
@property --hue { syntax: '<number>'; inherits: false; initial-value: 0; }

.swatch { background: oklch(68% .28 var(--hue)); }

@keyframes hueCycle {
  from { --hue:   0; }
  to   { --hue: 360; }
}`;

export default function M1Oklch() {
  return (
    <div className={styles.stage}>
      <span className={styles.label}>HSL hue sweep (uneven luminance)</span>
      <div className={[styles.strip, styles.hslStrip].join(' ')} />
      <span className={styles.label}>OKLCH hue sweep (perceptually uniform)</span>
      <div className={[styles.strip, styles.oklchStrip].join(' ')} />
      <span className={styles.label}>Animated oklch hue cycle (@property)</span>
      <div className={styles.animSwatch} />
    </div>
  );
}
