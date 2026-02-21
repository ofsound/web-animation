import { useState } from 'react';
import styles from './E2HeroMorph.module.css';

export const code = `/* Each avatar gets a UNIQUE view-transition-name.
   When the detail view renders the same name, the browser morphs it. */

// List row avatar
<div
  style={{ viewTransitionName: 'avatar-' + person.id }}
  className={styles.rowAvatar}
/>

// Detail view — same name → browser connects them for position/size morph
<div
  style={{ viewTransitionName: 'avatar-' + selected.id }}
  className={styles.detailAvatar}
/>`;

const PEOPLE = [
  { id: 'lea',  name: 'Lea Verou',    role: 'CSS WG',    color: 'oklch(70% .24 320)', bio: 'CSS Working Group member, author of css.land and Prism.js.' },
  { id: 'una',  name: 'Una Kravets',  role: 'Chrome',    color: 'oklch(70% .24 145)', bio: 'Developer advocate at Google, creator of the CSS podcast.' },
  { id: 'adam', name: 'Adam Argyle',  role: 'Chrome',    color: 'oklch(70% .24 260)', bio: 'CSS/UX engineer at Google, Open-UI contributor.' },
];

export default function E2HeroMorph() {
  const [sel, setSel] = useState<string | null>(null);
  const person = PEOPLE.find(p => p.id === sel);

  const goTo = (id: string | null) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => setSel(id));
    } else {
      setSel(id);
    }
  };

  return (
    <div className={styles.stage}>
      {/* Render either list OR detail, never both, to avoid duplicate view-transition-name values. */}
      {!person ? (
        <div className={styles.list}>
          {PEOPLE.map(p => (
            <button
              key={p.id}
              type="button"
              className={styles.row}
              onClick={() => goTo(p.id)}
              aria-label={`Open ${p.name} profile`}
            >
              <div
                className={styles.rowAvatar}
                style={{ background: p.color, viewTransitionName: 'avatar-' + p.id } as React.CSSProperties}
              />
              <div>
                <div className={styles.rowName}>{p.name}</div>
                <div className={styles.rowRole}>{p.role}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          className={styles.detail}
          onClick={() => goTo(null)}
          aria-label={`Close ${person.name} profile`}
        >
          <div
            className={styles.detailAvatar}
            style={{ background: person.color, viewTransitionName: 'avatar-' + person.id } as React.CSSProperties}
          />
          <p className={styles.detailName}>{person.name}</p>
          <p className={styles.detailRole}>{person.role}</p>
          <p className={styles.detailBio}>{person.bio}</p>
          <span className={styles.back}>← tap to go back</span>
        </button>
      )}
    </div>
  );
}
