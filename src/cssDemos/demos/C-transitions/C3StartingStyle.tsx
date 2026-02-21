import {useState} from "react";
import styles from "./C3StartingStyle.module.css";

export const code = `/* @starting-style defines where a NEWLY INSERTED element begins its transition.
   No JS animation library needed — the browser handles it on DOM insertion. */

.item {
  opacity: 1;
  transform: translateX(0);
  transition:
    opacity   .4s ease,
    transform .4s cubic-bezier(.22,.99,.38,1.15);
}

@starting-style {
  .item {     /* <-- start FROM here when first added to DOM */
    opacity: 0;
    transform: translateX(-24px);
  }
}`;

let counter = 1;

export default function C3StartingStyle() {
  const [items, setItems] = useState<string[]>([" file_a.ts", " config.json"]);
  const add = () => {
    setItems((prev) => [...prev, ` module_${counter++}.ts`]);
  };
  return (
    <div className={styles.stage}>
      <button className={styles.btn} onClick={add}>
        + Add item
      </button>
      <div className={styles.list}>
        {items.map((item, i) => (
          <div key={item + i} className={styles.item}>
            <div className={styles.dot} />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
