import styles from './D2FadeOnScroll.module.css';

export const code = `/* No IntersectionObserver needed — pure CSS scroll-driven */
.card {
  animation: fadeUp linear both;
  animation-timeline: view(block);          /* tracks element in viewport */
  animation-range: entry 0% entry 30%;      /* animate while entering */
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}`;

const COLORS = [
  'oklch(68% .22 260)', 'oklch(68% .22 145)', 'oklch(68% .22 45)',
  'oklch(68% .22 320)', 'oklch(68% .22 200)', 'oklch(68% .22 30)',
];
const FILES = ['index.ts','App.tsx','styles.css','utils.ts','types.d.ts','config.json'];

export default function D2FadeOnScroll() {
  return (
    <div className={styles.stage}>
      <div className={styles.scroller}>
        <div className={styles.spacer} />
        <div className={styles.items}>
          {FILES.map((f, i) => (
            <div key={f} className={styles.card}>
              <div className={styles.dot} style={{ background: COLORS[i] }} />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
