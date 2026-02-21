import styles from './D4AnimRange.module.css';

export const code = `/* animation-range narrows WHEN in the scroll timeline the animation runs */
.card {
  animation: slideIn linear both;
  animation-timeline: view(block);

  /* Only animates during the "entry" phase of the scroll intersection */
  animation-range: entry 0% cover 18%;
}

@keyframes slideIn {
  from { opacity: 0; transform: scale(.88) translateY(20px); filter: blur(3px); }
  to   { opacity: 1; transform: scale(1)   translateY(0);    filter: blur(0); }
}`;

const ITEMS = [
  { label: 'Dashboard.tsx',   color: 'oklch(68% .22 260)' },
  { label: 'Sidebar.tsx',     color: 'oklch(68% .22 145)' },
  { label: 'useScroll.ts',    color: 'oklch(68% .22 45)'  },
  { label: 'animations.css',  color: 'oklch(68% .22 320)' },
  { label: 'tokens.json',     color: 'oklch(68% .22 200)' },
];

export default function D4AnimRange() {
  return (
    <div className={styles.stage}>
      <div className={styles.scroller}>
        <div className={styles.feed}>
          {ITEMS.map(it => (
            <div key={it.label} className={styles.card}>
              <div className={styles.swatch} style={{ background: it.color }} />
              {it.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
