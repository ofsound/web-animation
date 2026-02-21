import { useRef } from 'react';
import styles from './C4DialogPopover.module.css';

export const code = `/* Native <dialog> element — smooth open AND close */
dialog {
  opacity: 1;
  transform: scale(1) translateY(0);
  transition:
    opacity   .3s ease,
    transform .3s cubic-bezier(.22,.99,.38,1.1),
    display   .3s allow-discrete,
    overlay   .3s allow-discrete;   /* keeps it in top layer during exit */
}

@starting-style {
  dialog[open] {    /* entry: start from here */
    opacity: 0;
    transform: scale(.94) translateY(12px);
  }
}`;

export default function C4DialogPopover() {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <div className={styles.stage}>
      <button className={styles.openBtn} onClick={() => ref.current?.show()}>
        Open dialog
      </button>
      <dialog ref={ref} className={styles.dialog}>
        <p className={styles.dialogTitle}>Native &lt;dialog&gt;</p>
        <p className={styles.dialogBody}>
          Uses @starting-style for entry and<br />
          allow-discrete for the exit fade.
        </p>
        <button className={styles.closeBtn} onClick={() => ref.current?.close()}>
          Close
        </button>
      </dialog>
    </div>
  );
}
