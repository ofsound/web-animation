import {useState} from "react";
import styles from "./L3MaxHeightFallback.module.css";

export const code = `/* OLD max-height hack — easing applies to max-height, not actual height.
   The element snaps open because most of the transition is from 200px down to content height. */
.panel { max-height: 0;    transition: max-height .5s ease; overflow: hidden; }
.open  { max-height: 200px; }  /* arbitrary large value — bad easing */

/* NEW interpolate-size — direct height: 0 → auto, correct easing */
.panel {
  height: 0;
  overflow: hidden;
  interpolate-size: allow-keywords;
  transition: height .5s ease;   /* easing applies to the true height */
}
.open { height: auto; }`;

export default function L3MaxHeightFallback() {
  const [oldOpen, setOldOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const BODY = "Height animates to the actual content height. Easing is correct!";
  return (
    <div className={styles.stage}>
      <div className={styles.col}>
        <div className={styles.colTitle}>Old max-height hack</div>
        <button className={styles.btn} onClick={() => setOldOpen((o) => !o)}>
          {oldOpen ? "Close ▲" : "Open ▼"}
        </button>
        <div className={[styles.oldPanel, oldOpen ? styles.open : ""].join(" ")}>
          <div className={styles.inner}>
            <span className={[styles.badge, styles.badgeOld].join(" ")}>max-height</span>
            <br />
            Max-height easing is wrong —<br />
            snaps at end.
          </div>
        </div>
      </div>
      <div className={styles.col}>
        <div className={styles.colTitle}>New interpolate-size</div>
        <button className={styles.btn} onClick={() => setNewOpen((o) => !o)}>
          {newOpen ? "Close ▲" : "Open ▼"}
        </button>
        <div className={[styles.newPanel, newOpen ? styles.open : ""].join(" ")}>
          <div className={styles.inner}>
            <span className={[styles.badge, styles.badgeNew].join(" ")}>height: auto</span>
            <br />
            {BODY}
          </div>
        </div>
      </div>
    </div>
  );
}
