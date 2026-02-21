import styles from './H4EllipseCar.module.css';

export const code = `/* offset-path: ellipse() — no SVG markup needed.
   offset-rotate: auto makes the car steer automatically. */

.car {
  offset-path: ellipse(100px 55px at center);
  offset-rotate: auto;   /* car faces the direction it's travelling */
  animation: driveLoop 4s linear infinite;
}

@keyframes driveLoop {
  from { offset-distance:   0%; }
  to   { offset-distance: 100%; }
}

/* Compare: offset-rotate: 0deg would keep the emoji facing right always */`;

export default function H4EllipseCar() {
  return (
    <div className={styles.stage}>
      <div className={styles.track} />
      <div className={styles.shadow}>🚗</div>
      <div className={styles.car}>🚗</div>
    </div>
  );
}
