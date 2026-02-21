import styles from './A2MultiStop.module.css';

export const code = `/* Five-stop heartbeat — note 14% / 28% / 42% timing */
@keyframes heartbeat {
  0%  { transform: scale(1); }
  14% { transform: scale(1.22); }   /* first beat peak */
  28% { transform: scale(0.96); }   /* slight rebound */
  42% { transform: scale(1.18); }   /* second beat peak */
  70% { transform: scale(1); }      /* settle */
  100%{ transform: scale(1); }      /* hold */
}

.heart {
  animation: heartbeat 1.4s linear infinite;
}`;

export default function A2MultiStop() {
  return (
    <div className={styles.stage}>
      <span className={styles.heart}>❤️</span>
    </div>
  );
}
