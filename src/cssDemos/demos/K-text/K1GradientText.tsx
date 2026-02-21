import styles from './K1GradientText.module.css';

export const code = `/* background-clip: text clips the gradient to the glyph shapes */
.text {
  background: linear-gradient(135deg, oklch(72% .28 260), oklch(72% .28 80));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;   /* fallback */
}

/* Animated gradient angle via @property <angle>: */
@property --grad-angle { syntax: '<angle>'; inherits: false; initial-value: 135deg; }
@keyframes rotateGrad  { to { --grad-angle: 495deg; } }

/* Shimmer effect: animate background-position on a 200%-wide gradient: */
@keyframes shimmer {
  from { background-position: 200% center; }
  to   { background-position:   0% center; }
}`;

export default function K1GradientText() {
  return (
    <div className={styles.stage}>
      <div className={styles.big}>GRADIENT</div>
      <div className={styles.medium}>Shimmer Effect</div>
      <span className={styles.sub}>background-clip: text</span>
    </div>
  );
}
