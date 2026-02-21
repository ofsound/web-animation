import styles from './D5NamedScrollTimeline.module.css';

export const code = `/* Named scroll-timeline lets a SIBLING element subscribe to the scroll */

/* Publisher: the scrollable element names its timeline */
.content-pane {
  scroll-timeline: --prose block;
}

/* Consumer: a totally different element subscribes by name */
.progress-ring {
  animation: fillRing linear both;
  animation-timeline: --prose;    /* references the named timeline */
}

@keyframes fillRing {
  from { background: conic-gradient(oklch(68% .28 260) 0%,   #1e2a46 0%); }
  to   { background: conic-gradient(oklch(68% .28 260) 100%, #1e2a46 0%); }
}`;

const LINES = [
  'wide','med','wide','short','wide','med','wide','short',
  'wide','med','wide','short','wide','med',
];

export default function D5NamedScrollTimeline() {
  return (
    <div className={styles.stage}>
      <div className={styles.scroller}>
        {LINES.map((cls, i) => (
          <div key={i} className={`${styles.line} ${styles[cls as 'wide'|'med'|'short']}`} />
        ))}
      </div>
      <div className={styles.sidebar}>
        <div className={styles.ring} />
        <div className={styles.ringLabel}>scroll<br />progress</div>
      </div>
    </div>
  );
}
