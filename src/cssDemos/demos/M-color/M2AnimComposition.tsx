import styles from './M2AnimComposition.module.css';

export const code = `/* animation-composition controls how an animation's value
   COMBINES with the element's underlying base value */

/* replace (default): animation completely overrides the base transform */
.a { animation-composition: replace;    /* result = animation value only    */ }

/* add: animation value is added on top of the base transform */
.b { animation-composition: add;        /* result = base + animation value  */ }

/* accumulate: each iteration adds to the previous iteration's end value */
.c { animation-composition: accumulate; /* result = sum of all iterations   */ }

@keyframes slide {
  from { transform: translateX(0px); }
  to   { transform: translateX(80px); }
}`;

export default function M2AnimComposition() {
  return (
    <div className={styles.stage}>
      {[
        { cls: styles.dotReplace,    label: 'replace' },
        { cls: styles.dotAdd,        label: 'add' },
        { cls: styles.dotAccumulate, label: 'accumulate' },
      ].map(({ cls, label }) => (
        <div key={label} className={styles.row}>
          <span className={styles.modeLabel}>{label}</span>
          <div className={styles.track}>
            <div className={cls} />
          </div>
        </div>
      ))}
      <span className={styles.legend}>all share the same @keyframes slide</span>
    </div>
  );
}
