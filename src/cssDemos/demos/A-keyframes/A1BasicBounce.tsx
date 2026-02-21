import styles from './A1BasicBounce.module.css';

export const code = `@keyframes bounce {
  from {
    transform: translateY(0) scaleY(1) scaleX(1);
  }
  90% {
    transform: translateY(-130px) scaleY(1.06) scaleX(.96);
  }
  to {
    transform: translateY(-140px) scaleY(1.08) scaleX(.94);
  }
}

.ball {
  animation: bounce 1s ease-in-out infinite alternate;
  transform-origin: center bottom;
}

@keyframes shadowShrink {
  from { transform: scaleX(1); opacity: .6; }
  to   { transform: scaleX(.35); opacity: .2; }
}`;

export default function A1BasicBounce() {
  return (
    <div className={styles.stage}>
      <div className={styles.track}>
        <div className={styles.ball} />
        <div className={styles.shadow} />
      </div>
    </div>
  );
}
