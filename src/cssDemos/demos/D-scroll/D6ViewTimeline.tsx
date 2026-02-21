import styles from './D6ViewTimeline.module.css';

export const code = `/* view-timeline names a timeline tied to the element's viewport intersection.
   A child element can then subscribe to it by that name. */

.card {
  view-timeline: --card block;   /* each card publishes its own intersection */
}

.read-bar {
  animation: reveal linear both;
  animation-timeline: --card;    /* consumer reads parent's named timeline */
  animation-range: entry 0% cover 50%;
}

@keyframes reveal {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}`;

const POSTS = [
  { name: 'Lea Verou', handle: '@leaverou', color: 'oklch(70% .24 320)',
    text: 'The new CSS view-timeline is incredibly powerful — no JS needed to animate on scroll intersection.' },
  { name: 'Adam Argyle', handle: '@argyleink', color: 'oklch(70% .24 145)',
    text: 'Naming a scroll timeline and subscribing to it from a sibling element is a game changer for pure CSS rigs.' },
  { name: 'Una Kravets', handle: '@una', color: 'oklch(70% .24 45)',
    text: 'animation-range: entry 0% cover 50% is all you need for a beautiful scroll-driven reveal.' },
  { name: 'Bramus', handle: '@bramus', color: 'oklch(70% .24 200)',
    text: 'CSS scroll-driven animations shipped cross-browser in 2024 and they are fully composited on the GPU.' },
];

export default function D6ViewTimeline() {
  return (
    <div className={styles.stage}>
      <div className={styles.scroller}>
        <div className={styles.feed}>
          {POSTS.map(p => (
            <div key={p.handle} className={styles.card}>
              <div className={styles.top}>
                <div className={styles.avatar} style={{ background: p.color }} />
                <div>
                  <div className={styles.name}>{p.name}</div>
                  <div className={styles.handle}>{p.handle}</div>
                </div>
              </div>
              <p className={styles.body}>{p.text}</p>
              <div className={styles.readBar} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
