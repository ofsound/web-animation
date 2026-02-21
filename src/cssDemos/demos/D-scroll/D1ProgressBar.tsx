import styles from './D1ProgressBar.module.css';

export const code = `/* Pure CSS — no JavaScript involved */
.progress-bar {
  position: sticky;
  top: 0;
  width: 100%;
  height: 4px;
  transform-origin: left;

  animation: progress linear both;
  animation-timeline: scroll(nearest block); /* tracks the scroll container */
}

@keyframes progress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}`;

const Para = ({ cls }: { cls: string }) => <div className={cls} />;

export default function D1ProgressBar() {
  return (
    <div className={styles.stage}>
      <div className={styles.scroller}>
        <div className={styles.bar} />
        <div className={styles.content}>
          {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
            <Para key={i} cls={
              styles.para + ' ' +
              (i % 5 === 0 ? styles.heading : i % 3 === 0 ? styles.short : i % 2 === 0 ? styles.wide : styles.med)
            } />
          ))}
        </div>
      </div>
    </div>
  );
}
