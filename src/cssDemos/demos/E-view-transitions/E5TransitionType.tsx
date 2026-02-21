import { useState, useEffect } from 'react';
import styles from './E5TransitionType.module.css';

export const code = `// startViewTransition types API (Chrome 125+) — direction-aware transitions
// Pass { types: ['forward'] } or { types: ['backward'] } to tag the transition.
// CSS uses :active-view-transition-type() to apply different animations per direction.

document.startViewTransition({
  update: () => setPage(next),
  types: ['forward'],      // or ['backward']
});

/* Target specific types in CSS */
:active-view-transition-type(forward)  ::view-transition-new(e5-page) {
  animation-name: slideInRight;
}
:active-view-transition-type(backward) ::view-transition-new(e5-page) {
  animation-name: slideInLeft;
}`;

const STYLE_ID = 'e5-vt-styles';
const VT_CSS = `
  ::view-transition-old(e5-page),
  ::view-transition-new(e5-page) {
    animation-duration: .3s;
    animation-timing-function: cubic-bezier(.4,0,.2,1);
    animation-fill-mode: both;
  }
  ::view-transition-old(e5-page) { animation-name: e5FadeOut; }
  :active-view-transition-type(forward)  ::view-transition-new(e5-page) {
    animation-name: e5SlideInFwd;
  }
  :active-view-transition-type(backward) ::view-transition-new(e5-page) {
    animation-name: e5SlideInBwd;
  }
  :active-view-transition-type(forward)  ::view-transition-old(e5-page) {
    animation-name: e5SlideOutFwd;
  }
  :active-view-transition-type(backward) ::view-transition-old(e5-page) {
    animation-name: e5SlideOutBwd;
  }
  @keyframes e5FadeOut     { to   { opacity:0; } }
  @keyframes e5SlideInFwd  { from { transform:translateX( 70px); opacity:0; } }
  @keyframes e5SlideInBwd  { from { transform:translateX(-70px); opacity:0; } }
  @keyframes e5SlideOutFwd { to   { transform:translateX(-70px); opacity:0; } }
  @keyframes e5SlideOutBwd { to   { transform:translateX( 70px); opacity:0; } }
`;

const PAGES = [
  { title: 'Introduction',  body: 'View Transition types let you tag a transition (e.g. "forward" or "backward") and target each direction in CSS with :active-view-transition-type().' },
  { title: 'Navigation',    body: 'Perfect for simulating browser back/forward: the page slides in from the right (forward) or left (backward) just like a native app.' },
  { title: 'Custom Types',  body: 'You are not limited to forward/back — use any string as a type: "modal-open", "expand", "collapse" and style each uniquely.' },
  { title: 'Fallback',      body: 'Older browsers that do not support the types option gracefully fall back to the default cross-fade. Zero breakage.' },
];

export default function E5TransitionType() {
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement('style');
      el.id = STYLE_ID;
      el.textContent = VT_CSS;
      document.head.appendChild(el);
    }
    return () => { document.getElementById(STYLE_ID)?.remove(); };
  }, []);

  const go = (dir: 'forward' | 'backward') => {
    const next = dir === 'forward' ? page + 1 : page - 1;
    if (document.startViewTransition) {
      document.startViewTransition({ update: () => setPage(next), types: [dir] });
    } else {
      setPage(next);
    }
  };

  const p = PAGES[page];

  return (
    <div className={styles.stage}>
      <div className={styles.toolbar}>
        <button className={styles.arrowBtn} disabled={page === 0} onClick={() => go('backward')}>← Back</button>
        <span className={styles.counter}>{page + 1} / {PAGES.length}</span>
        <button className={styles.arrowBtn} disabled={page === PAGES.length - 1} onClick={() => go('forward')}>Next →</button>
      </div>
      <div className={styles.page} style={{ background: `hsl(${205 + page * 18} 28% 9%)` }}>
        <p className={styles.pageNum}>PAGE {page + 1}</p>
        <p className={styles.pageTit}>{p.title}</p>
        <p className={styles.pageBot}>{p.body}</p>
      </div>
    </div>
  );
}
