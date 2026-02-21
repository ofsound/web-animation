import styles from './D7StickyReveal.module.css';

export const code = `.stage {
  width: min(100%, 380px);
  height: 180px;
  border-radius: 14px;
  border: 1px solid #2f3a63;
  background: linear-gradient(160deg, #111a34 0%, #0d1223 60%);
  display: grid;
  place-items: center;
  overflow: hidden;
  position: relative;
}

.box {
  min-width: 96px;
  min-height: 48px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #3a4c85;
  background: linear-gradient(120deg, oklch(70% .18 255), oklch(76% .14 200));
  color: #0a1022;
  font-weight: 700;
  display: grid;
  place-items: center;
  animation: d7-rise linear both; animation-timeline: view(); animation-range: contain 0% contain 100%;
}

.label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: .02em;
  white-space: nowrap;
}

.stage:hover .box {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 10px 28px rgba(81, 130, 255, .35);
}

@keyframes d7-rise{from{opacity:.2;translate:0 20px}to{opacity:1;translate:0 0}}`;

export default function D7StickyReveal() {
  return (
    <div className={styles.stage}>
      <div className={styles.box}>
        <span className={styles.label}>D7 · Contain Range</span>
      </div>
    </div>
  );
}
