import styles from './G1IndividualTransforms.module.css';

export const code = `/* CSS 2022+: translate, rotate, scale are INDEPENDENT properties.
   They compose in a fixed order (translate → rotate → scale)
   and animating one never clobbers the others. */

/* Old way — each animation overwrites transform entirely: */
.old { animation: moveOld 1s infinite; }
@keyframes moveOld { to { transform: translateY(-20px); } }
/* A second animation on transform would fight the first! */

/* New way — animate each individually: */
.box { animation: move 1.8s ease infinite, spin 2.4s linear infinite; }
@keyframes move { to { translate: 0 -22px; } }   /* only affects translate */
@keyframes spin { to { rotate: 360deg; }    }   /* only affects rotate */
/* They compose safely — no conflicts */`;

export default function G1IndividualTransforms() {
  return (
    <div className={styles.stage}>
      <div className={styles.col}>
        <div className={styles.boxTranslate} />
        <span className={styles.capLabel}>translate<br/>only</span>
      </div>
      <div className={styles.col}>
        <div className={styles.boxRotate} />
        <span className={styles.capLabel}>rotate<br/>only</span>
      </div>
      <div className={styles.col}>
        <div className={styles.boxScale} />
        <span className={styles.capLabel}>scale<br/>only</span>
      </div>
      <div className={styles.col}>
        <div className={styles.boxAll} />
        <span className={styles.capLabel}>all three<br/>together</span>
      </div>
    </div>
  );
}
