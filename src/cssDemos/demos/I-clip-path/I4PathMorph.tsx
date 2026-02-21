import styles from './I4PathMorph.module.css';

export const code = `/* clip-path: path() can morph between organic blob shapes.
   Requirement: same number of path commands and same command types. */

@keyframes blobMorph {
  0%  { clip-path: path('M 65 10 C 100 10 120 35 120 65 C 120 95 ...'); }
  33% { clip-path: path('M 65  5 C 110  5 125 40 118 70 C 111 100 ...'); }
  66% { clip-path: path('M 60  8 C  90  2 120 28 122 62 C 124  96 ...'); }
  100%{ clip-path: path('M 65 10 C 100 10 120 35 120 65 C 120 95 ...'); }
}

/* Unlike polygon(), path() supports curves — enabling smooth organic shapes */`;

export default function I4PathMorph() {
  return (
    <div className={styles.stage}>
      <div className={styles.blob} />
    </div>
  );
}
