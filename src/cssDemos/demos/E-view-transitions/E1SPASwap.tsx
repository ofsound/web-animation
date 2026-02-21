import { useState } from 'react';
import styles from './E1SPASwap.module.css';

export const code = `// Wrap any state update in startViewTransition()
// Elements with view-transition-name get a smooth cross-fade automatically

function switchTab(id: string) {
  if ('startViewTransition' in document) {
    document.startViewTransition(() => setTab(id));
  } else {
    setTab(id);   // graceful fallback
  }
}

/* CSS: give the morphing element a unique name */
.content {
  view-transition-name: e1-content;
}`;

const TABS = [
  { id: 'a', label: 'Overview',  bg: '#0f1826',
    title: '📄 Overview',      body: 'The View Transitions API wraps a DOM update in a cross-fade, capturing old and new states automatically.' },
  { id: 'b', label: 'Usage',    bg: '#0f1e18',
    title: '⚡ Usage',          body: 'Call document.startViewTransition(() => updateDOM()). Any element with view-transition-name morphs smoothly.' },
  { id: 'c', label: 'Support',  bg: '#1e1226',
    title: '🌐 Support',        body: 'Chrome 111+, Edge 111+, Safari 18+, Firefox 130+. Always wrap in feature-detection for older browsers.' },
];

export default function E1SPASwap() {
  const [tab, setTab] = useState('a');
  const current = TABS.find(t => t.id === tab)!;

  const switchTab = (id: string) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => setTab(id));
    } else {
      setTab(id);
    }
  };

  return (
    <div className={styles.stage}>
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={[styles.tab, tab === t.id ? styles.active : ''].join(' ')}
            onClick={() => switchTab(t.id)}
          >{t.label}</button>
        ))}
      </div>
      <div className={styles.content} style={{ background: current.bg }}>
        <p className={styles.title}>{current.title}</p>
        <p className={styles.body}>{current.body}</p>
      </div>
    </div>
  );
}
