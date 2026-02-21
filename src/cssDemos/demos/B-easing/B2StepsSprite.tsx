import styles from './B2StepsSprite.module.css';

export const code = `/* steps(8, end) — jumps through 8 discrete positions */
/* Perfect for sprite-sheet frame-by-frame animation   */
@keyframes flipbook {
  from { transform: translateX(0); }
  to   { transform: translateX(-448px); }  /* 8 frames × 56px */
}

.frames {
  width: 448px;
  animation: flipbook 1s steps(8, end) infinite;
}`;

const FRAMES = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];

export default function B2StepsSprite() {
  return (
    <div className={styles.stage}>
      <div className={styles.strip}>
        <div className={styles.frames}>
          {FRAMES.map((f, i) => (
            <span key={i} className={styles.frame}>{f}</span>
          ))}
        </div>
      </div>
      <span className={styles.info}>steps(8, end) — moon phase flipbook</span>
    </div>
  );
}
