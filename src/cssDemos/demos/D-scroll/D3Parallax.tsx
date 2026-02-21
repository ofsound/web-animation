import styles from './D3Parallax.module.css';

export const code = `/* Each layer gets its own scroll-linked animation at a different rate */
.bg     { animation: parBg    linear; animation-timeline: scroll(); }
.stars  { animation: parStars linear; animation-timeline: scroll(); }
.planet { animation: parMid   linear; animation-timeline: scroll(); }
.fg     { animation: parFg    linear; animation-timeline: scroll(); }

@keyframes parBg    { to { translate: 0  40px; } }  /* 0.15× speed */
@keyframes parStars { to { translate: 0  80px; } }
@keyframes parMid   { to { translate: 0 160px; } }
@keyframes parFg    { to { translate: 0 260px; } }  /* fastest (foreground) */`;

export default function D3Parallax() {
  return (
    <div className={styles.stage}>
      <div className={styles.scroller}>
        <div className={styles.scene}>
          <div className={styles.bg} />
          <div className={styles.stars} />
          <div className={styles.planet}>🪐</div>
          <div className={styles.fg}>← scroll me →</div>
        </div>
      </div>
    </div>
  );
}
