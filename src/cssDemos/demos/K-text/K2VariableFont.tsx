import styles from './K2VariableFont.module.css';

export const code = `/* font-weight is a first-class animatable property (wght axis shorthand) */
@keyframes weightCycle {
  from { font-weight: 100; }
  to   { font-weight: 900; }
}

/* For axes without a CSS property, animate font-variation-settings directly */
@keyframes stretchCycle {
  from { font-variation-settings: 'wdth' 75; }
  to   { font-variation-settings: 'wdth' 125; }
}

/* font-style: oblique with an angle drives the 'ital'/'slnt' axis */
@keyframes italicSlant {
  from { font-style: oblique  0deg; }
  to   { font-style: oblique 14deg; }
}`;

export default function K2VariableFont() {
  return (
    <div className={styles.stage}>
      <div className={styles.weightAnim}>Variable Weight</div>
      <span className={styles.label}>font-weight: 100 → 900</span>
      <div className={styles.axisAnim}>Slant Axis</div>
      <span className={styles.label}>font-style: oblique 0→14deg</span>
    </div>
  );
}
