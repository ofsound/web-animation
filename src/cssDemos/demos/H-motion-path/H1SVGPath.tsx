import styles from './H1SVGPath.module.css';

export const code = `/* offset-path lets an element travel along any SVG/CSS path */
.rocket {
  offset-path: path('M 20,160 C 80,20 160,180 240,80 S 360,20 440,100');
  offset-distance: 0%;
  offset-rotate: auto;    /* automatically faces direction of travel */

  animation: followPath 4s ease-in-out infinite;
}

@keyframes followPath {
  from { offset-distance:   0%; }
  to   { offset-distance: 100%; }
}`;

// Same path used in both CSS and SVG overlay
const PATH = 'M 20,160 C 80,20 160,180 240,80 S 360,20 440,100';

export default function H1SVGPath() {
  return (
    <div className={styles.stage}>
      {/* Dotted guide line */}
      <svg className={styles.svg} viewBox="0 0 460 200" preserveAspectRatio="none">
        <path className={styles.pathLine} d={PATH} />
      </svg>
      {/* The element travelling along the path */}
      <div className={styles.rocket}>🚀</div>
    </div>
  );
}
