import styles from './H3RayBurst.module.css';

export const code = `/* Each particle gets an individual offset-path pointing in its own direction.
   The burst effect is just staggered delays + the same @keyframes. */

// Generate N rays evenly around a circle
const rays = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * 360;
  const rad   = angle * Math.PI / 180;
  const dx    = Math.cos(rad) * 80;
  const dy    = Math.sin(rad) * 80;
  return {
    path: \`path('M 0 0 L \${dx} \${dy}')\`,
    delay: i * 0.18
  };
});

// Apply per-element:
<div style={{
  offsetPath: ray.path,
  animationDelay: ray.delay + 's',
  color: \`oklch(68% .25 \${angle})\`
}} />`;

const N = 10;
const COLORS = ['oklch(68% .26 260)','oklch(68% .26 300)','oklch(68% .26 340)',
  'oklch(68% .26 20)','oklch(68% .26 60)','oklch(68% .26 100)',
  'oklch(68% .26 140)','oklch(68% .26 180)','oklch(68% .26 220)','oklch(68% .26 240)'];

export default function H3RayBurst() {
  const rays = Array.from({ length: N }, (_, i) => {
    const angle = (i / N) * 360;
    const rad = angle * Math.PI / 180;
    const dx = Math.cos(rad) * 76;
    const dy = Math.sin(rad) * 64;
    return {
      path: `path('M 0 0 L ${dx} ${dy}')`,
      delay: `${i * 0.18}s`,
      color: COLORS[i % COLORS.length],
    };
  });

  return (
    <div className={styles.stage}>
      <div className={styles.center}>✨</div>
      {rays.map((r, i) => (
        <div
          key={i}
          className={styles.ray}
          style={{
            offsetPath: r.path,
            animationDelay: r.delay,
            color: r.color,
            background: r.color,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
