import styles from './F4ThemeHue.module.css';

export const code = `/* @property <number> with inherits: true — one animated value drives an
   entire design system. Children just use calc(var(--hue) + offset). */

@property --hue {
  syntax: '<number>';
  inherits: true;        /* propagates to all descendants */
  initial-value: 260;
}

.root { animation: cycleHue 6s linear infinite; }

@keyframes cycleHue {
  from { --hue: 260; }
  to   { --hue: 620; }   /* +360 = full colour wheel lap */
}

/* Children derive their colour from the single animated prop */
.primary { background: oklch(60% .25 var(--hue)); }
.muted   { background: oklch(40% .15 calc(var(--hue) + 30)); }
.light   { background: oklch(80% .18 calc(var(--hue) - 30)); }`;

export default function F4ThemeHue() {
  return (
    <div className={styles.root}>
      <div className={styles.swatch} />
      <div className={styles.swatchMuted} />
      <div className={styles.swatchLight} />
      <p className={styles.note}>one @property --hue drives all three swatches</p>
    </div>
  );
}
