import { useState, useEffect } from 'react';
import styles from './E3CustomSlide.module.css';

export const code = `/* Override the default cross-fade with a slide animation.
   ::view-transition-old and ::view-transition-new target the captured layers. */

::view-transition-old(e3-page) {
  animation: slideOut .35s cubic-bezier(.4, 0, .2, 1) both;
}
::view-transition-new(e3-page) {
  animation: slideIn  .35s cubic-bezier(.4, 0, .2, 1) both;
}

@keyframes slideOut { to   { transform: translateX(-100%); opacity: 0; } }
@keyframes slideIn  { from { transform: translateX( 100%); opacity: 0; } }

/* For "back" navigation, reverse the directions */
[data-going="back"]::view-transition-old(e3-page) {
  animation-name: slideOutRight;
}`;

// Inject custom ::view-transition-* styles into document <head>
const STYLE_ID = 'e3-vt-styles';
const VT_CSS = `
  ::view-transition-old(e3-page) {
    animation: e3SlideOut .32s cubic-bezier(.4,0,.2,1) both;
  }
  ::view-transition-new(e3-page) {
    animation: e3SlideIn  .32s cubic-bezier(.4,0,.2,1) both;
  }
  @keyframes e3SlideOut { to   { transform: translateX(-80px); opacity: 0; } }
  @keyframes e3SlideIn  { from { transform: translateX( 80px); opacity: 0; } }
`;

const PAGES = [
  { id: 0, icon: '🏠', title: 'Home',     desc: 'The default cross-fade is overridden here with a horizontal slide animation.' },
  { id: 1, icon: '📦', title: 'Products', desc: 'Each "page" has view-transition-name: e3-page, so the browser knows which layer to animate.' },
  { id: 2, icon: '📬', title: 'Contact',  desc: 'Custom animations are set on ::view-transition-old() and ::view-transition-new() in global CSS.' },
  { id: 3, icon: '⚙️', title: 'Settings', desc: 'The injected keyframes run in the top layer — they must be in unscoped document CSS.' },
];

export default function E3CustomSlide() {
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement('style');
      el.id = STYLE_ID;
      el.textContent = VT_CSS;
      document.head.appendChild(el);
    }
    return () => {
      document.getElementById(STYLE_ID)?.remove();
    };
  }, []);

  const go = (i: number) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => setPage(i));
    } else {
      setPage(i);
    }
  };

  const { icon, title, desc } = PAGES[page];

  return (
    <div className={styles.stage}>
      <div className={styles.nav}>
        {PAGES.map(p => (
          <button
            key={p.id}
            className={[styles.navBtn, page === p.id ? styles.active : ''].join(' ')}
            onClick={() => go(p.id)}
          >{p.icon} {p.title}</button>
        ))}
      </div>
      <div className={styles.page} style={{ background: `hsl(${220 + page * 20} 30% 10%)` }}>
        <div className={styles.icon}>{icon}</div>
        <p className={styles.title}>{title}</p>
        <p className={styles.desc}>{desc}</p>
      </div>
    </div>
  );
}
