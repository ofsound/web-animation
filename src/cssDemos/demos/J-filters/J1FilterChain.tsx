import { useState } from 'react';
import styles from './J1FilterChain.module.css';

export const code = `/* Multiple filter functions chain left-to-right.
   Each function modifies the result of the previous one. */

.element {
  filter:
    blur(2px)
    brightness(1.2)
    saturate(1.8)
    contrast(1.1);
}

/* Individual functions can be animated too: */
@keyframes glow {
  from { filter: brightness(1) drop-shadow(0 0 0px oklch(68% .28 260)); }
  to   { filter: brightness(1.3) drop-shadow(0 0 12px oklch(68% .28 260)); }
}`;

export default function J1FilterChain() {
  const [blur, setBlur]   = useState(0);
  const [bright, setBright] = useState(100);
  const [sat, setSat]     = useState(100);
  const [con, setCon]     = useState(100);

  const filter = [
    blur   > 0   ? `blur(${blur}px)`         : '',
    bright !== 100 ? `brightness(${bright/100})` : '',
    sat    !== 100 ? `saturate(${sat/100})`     : '',
    con    !== 100 ? `contrast(${con/100})`     : '',
  ].filter(Boolean).join(' ') || 'none';

  return (
    <div className={styles.stage}>
      <div className={styles.preview} style={{ filter }} />
      <div className={styles.controls}>
        {[
          { label: 'blur',       val: blur,   set: setBlur,   min: 0, max: 8,   step: 0.5, fmt: (v: number) => `${v}px`     },
          { label: 'brightness', val: bright, set: setBright, min: 0, max: 200, step: 5,   fmt: (v: number) => `${v}%`      },
          { label: 'saturate',   val: sat,    set: setSat,    min: 0, max: 300, step: 10,  fmt: (v: number) => `${v}%`      },
          { label: 'contrast',   val: con,    set: setCon,    min: 0, max: 200, step: 5,   fmt: (v: number) => `${v}%`      },
        ].map(({ label, val, set, min, max, step, fmt }) => (
          <div key={label} className={styles.row}>
            <span className={styles.rowLabel}>{label}</span>
            <input
              type="range"
              className={styles.slider}
              min={min} max={max} step={step}
              value={val}
              onChange={e => set(Number(e.target.value))}
            />
            <span className={styles.valLabel}>{fmt(val)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
