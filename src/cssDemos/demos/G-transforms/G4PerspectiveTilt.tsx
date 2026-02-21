import { useRef } from 'react';
import styles from './G4PerspectiveTilt.module.css';

export const code = `// Track mouse position relative to card, map to rotateX/Y
function onMouseMove(e: MouseEvent) {
  const { left, top, width, height } = card.getBoundingClientRect();
  const x = (e.clientX - left) / width  - 0.5;  // -0.5 → +0.5
  const y = (e.clientY - top)  / height - 0.5;

  card.style.transform =
    \`rotateY(\${x * 28}deg) rotateX(\${-y * 28}deg) scale(1.04)\`;
  
  // Move a radial-gradient highlight with the cursor
  card.style.setProperty('--mx', \`\${(x + 0.5) * 100}%\`);
  card.style.setProperty('--my', \`\${(y + 0.5) * 100}%\`);
}`;

export default function G4PerspectiveTilt() {
  const cardRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = (e.clientX - left)  / width  - 0.5;
    const y = (e.clientY - top)   / height - 0.5;
    card.style.transform = `rotateY(${x * 28}deg) rotateX(${-y * 28}deg) scale(1.04)`;
    card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
  };

  const onLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = '';
    card.style.removeProperty('--mx');
    card.style.removeProperty('--my');
  };

  return (
    <div className={styles.stage} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div ref={cardRef} className={styles.card} style={{ position: 'relative' }}>
        <div className={styles.shine} />
        <span className={styles.icon}>💎</span>
        <span className={styles.label}>Move cursor over me</span>
        <span className={styles.sub}>perspective tilt + radial shine</span>
      </div>
    </div>
  );
}
