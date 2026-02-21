import styles from './G5TransformOrigin.module.css';

export const code = `/* transform-origin sets the pivot point for rotate, scale, skew.
   All four boxes share the same @keyframes — only origin differs. */

@keyframes swingBox {
  from { rotate: -40deg; }
  to   { rotate:  40deg; }
}

.a { transform-origin: top left;    }  /* swings from corner */
.b { transform-origin: center;      }  /* spins in place     */
.c { transform-origin: bottom right;}  /* swings from far corner */
.d { transform-origin: 80% 20%;     }  /* arbitrary point    */`;

const BOXES = [
  { cls: styles.originTopLeft,     label: 'top left' },
  { cls: styles.originCenter,      label: 'center' },
  { cls: styles.originBottomRight, label: 'bottom right' },
  { cls: styles.originCustom,      label: '80% 20%' },
];

export default function G5TransformOrigin() {
  return (
    <div className={styles.stage}>
      {BOXES.map(({ cls, label }) => (
        <div key={label} className={styles.col}>
          <div className={styles.pivot}>
            <div className={cls} />
          </div>
          <span className={styles.lbl}>{label}</span>
        </div>
      ))}
    </div>
  );
}
