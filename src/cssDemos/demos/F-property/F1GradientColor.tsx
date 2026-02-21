import styles from './F1GradientColor.module.css';

export const code = `/* Without @property, custom props are opaque strings — no interpolation */
@keyframes broken {
  from { --color: oklch(68% .28 260); }
  to   { --color: oklch(68% .28 30);  }  /* snaps, no smooth transition */
}

/* WITH @property — tell the browser the type, and it interpolates correctly */
@property --gc-from {
  syntax: '<color>';     /* now the browser knows HOW to interpolate */
  inherits: false;
  initial-value: oklch(68% .28 260);
}

@keyframes working {
  from { --gc-from: oklch(68% .28 260); }
  to   { --gc-from: oklch(68% .28 30);  }  /* smoothly traverses hue wheel */
}`;

export default function F1GradientColor() {
  return (
    <div className={styles.stage}>
      <span className={styles.label}>without @property — snaps / broken interpolation</span>
      <div className={styles.barDumb} />
      <span className={styles.label}>with @property &lt;color&gt; — smooth hue traversal</span>
      <div className={styles.barSmart} />
    </div>
  );
}
