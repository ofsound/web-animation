import 'dotenv/config';
import { db } from './server/db/client.ts';
import { demos, demoFiles } from './server/db/schema.ts';
import { eq, and } from 'drizzle-orm';

const html = `<div class="stage" style="flex-direction: column; gap: 12px;">
  <div style="display: flex; gap: 18px; align-items: flex-end;">
    <div class="col">
      <div class="box none"></div>
      <span class="label">none</span>
    </div>
    <div class="col">
      <div class="box fwd"></div>
      <span class="label">forwards</span>
    </div>
    <div class="col">
      <div class="box back"></div>
      <span class="label">backwards</span>
    </div>
    <div class="col">
      <div class="box both"></div>
      <span class="label">both</span>
    </div>
  </div>
  <button
    type="button"
    data-role="replay-fill-mode"
    style="margin-top: 4px; font-size: 11px; padding: 4px 10px; background: #1e2840; border: 1px solid #3a4c85; color: #c5d1f5; border-radius: 6px; cursor: pointer;"
  >
    Replay
  </button>
</div>`;

const js = `(() => {
  const replayButton = document.querySelector('[data-role="replay-fill-mode"]');
  if (!replayButton) return;

  const restartAnimations = () => {
    const boxes = document.querySelectorAll('.box');
    boxes.forEach((box) => {
      if (!(box instanceof HTMLElement)) return;
      box.style.animation = 'none';
      void box.offsetWidth;
      box.style.animation = '';
    });
  };

  replayButton.addEventListener('click', restartAnimations);
})();`;

async function main() {
  const [demo] = await db
    .select({ id: demos.id })
    .from(demos)
    .where(eq(demos.slug, 'keyframes-fill-mode'))
    .limit(1);

  if (!demo) {
    throw new Error('Demo not found: keyframes-fill-mode');
  }

  await db
    .update(demoFiles)
    .set({ content: html, updatedAt: new Date() })
    .where(and(eq(demoFiles.demoId, demo.id), eq(demoFiles.fileKind, 'html')));

  await db
    .update(demoFiles)
    .set({ content: js, updatedAt: new Date() })
    .where(and(eq(demoFiles.demoId, demo.id), eq(demoFiles.fileKind, 'js')));

  console.log(JSON.stringify({
    updatedDemoId: demo.id,
    slug: 'keyframes-fill-mode',
    updatedFileKinds: ['html', 'js'],
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
