import styles from './G3Cube.module.css';

export const code = `/* 6-faced cube — each face pushed out by half its size (translateZ) */

/* Parent's perspective creates the camera */
.stage { perspective: 500px; }

/* Cube preserves 3D context for all children */
.cube  { transform-style: preserve-3d;
         animation: spinCube 8s linear infinite; }

/* Each face: rotate to its orientation, then push forward by depth/2 */
.front  { transform: translateZ(35px); }
.back   { transform: rotateY(180deg) translateZ(35px); }
.left   { transform: rotateY(-90deg) translateZ(35px); }
.right  { transform: rotateY( 90deg) translateZ(35px); }
.top    { transform: rotateX( 90deg) translateZ(35px); }
.bottom { transform: rotateX(-90deg) translateZ(35px); }`;

const FACES = [
  { cls: 'front',  label: 'F' },
  { cls: 'back',   label: 'B' },
  { cls: 'left',   label: 'L' },
  { cls: 'right',  label: 'R' },
  { cls: 'top',    label: 'T' },
  { cls: 'bottom', label: '↓' },
];

export default function G3Cube() {
  return (
    <div className={styles.stage}>
      <div className={styles.cube}>
        {FACES.map(({ cls, label }) => (
          <div key={cls} className={styles.face + ' ' + styles[cls as keyof typeof styles]}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
