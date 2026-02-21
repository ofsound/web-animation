import styles from './B3StepsTypewriter.module.css';

export const code = `/* steps(n, end) expands width exactly one character per step */
@keyframes type1 { to { width: 22ch; } }

.line {
  width: 0;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid oklch(70% .22 260); /* cursor */
  font-family: monospace;

  animation:
    type1 2.2s steps(22, end) 1 forwards, /* type */
    blink  .7s step-end       6;           /* cursor blink */
}

@keyframes blink {
  50% { border-right-color: transparent; }
}`;

export default function B3StepsTypewriter() {
  return (
    <div className={styles.stage}>
      <span className={styles.line + ' ' + styles.l1}>const greeting = "hello";</span>
      <span className={styles.line + ' ' + styles.l2}>console.log(greeting);</span>
      <span className={styles.line + ' ' + styles.l3}>// steps() = one char per frame</span>
    </div>
  );
}
