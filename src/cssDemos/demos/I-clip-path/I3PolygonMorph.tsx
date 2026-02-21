import styles from './I3PolygonMorph.module.css';

export const code = `/* clip-path polygon() morphs smoothly IF vertex count matches */

@keyframes morphPoly {
  0% {
    /* 10-point star — 12 vertices */
    clip-path: polygon(
      50% 0%, 61% 35%, 98% 35%, 68% 57%,
      79% 91%, 50% 70%, 21% 91%, 32% 57%,
      2% 35%, 39% 35%, 50% 0%, 50% 0%
    );
  }
  100% {
    /* hexagon padded to 12 vertices */
    clip-path: polygon(
      50% 2%,  93% 26%, 93% 74%, 50% 98%,
      7%  74%, 7%  26%, 50% 2%,  50% 2%,
      50% 2%,  50% 2%,  50% 2%,  50% 2%
    );
  }
}`;

export default function I3PolygonMorph() {
  return (
    <div className={styles.stage}>
      <div className={styles.shape} />
      <span className={styles.hint}>vertex counts must match for smooth interpolation</span>
    </div>
  );
}
