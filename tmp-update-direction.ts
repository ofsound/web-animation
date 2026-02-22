import 'dotenv/config';
import { db } from './server/db/client.ts';
import { demos, demoFiles } from './server/db/schema.ts';
import { eq, and } from 'drizzle-orm';

const html = `<div class="stage" data-role="direction-stage"></div>`;

const js = `(() => {
  const stage = document.querySelector('[data-role="direction-stage"]');
  if (!(stage instanceof HTMLElement)) return;

  const directions = [
    { label: 'normal', cls: 'normal' },
    { label: 'reverse', cls: 'reverse' },
    { label: 'alternate', cls: 'alternate' },
    { label: 'alternate-reverse', cls: 'alternate-reverse' },
  ];

  stage.replaceChildren();

  directions.forEach((direction) => {
    const row = document.createElement('div');
    row.className = 'row';

    const label = document.createElement('span');
    label.className = 'lbl';
    label.textContent = direction.label;

    const track = document.createElement('div');
    track.className = 'track';

    const dot = document.createElement('div');
    dot.className = 'dot ' + direction.cls;

    track.appendChild(dot);
    row.appendChild(label);
    row.appendChild(track);
    stage.appendChild(row);
  });
})();`;

async function main() {
  const [demo] = await db
    .select({ id: demos.id })
    .from(demos)
    .where(eq(demos.slug, 'keyframes-direction'))
    .limit(1);

  if (!demo) {
    throw new Error('Demo not found: keyframes-direction');
  }

  await db
    .update(demoFiles)
    .set({ content: html, updatedAt: new Date() })
    .where(and(eq(demoFiles.demoId, demo.id), eq(demoFiles.fileKind, 'html')));

  await db
    .update(demoFiles)
    .set({ content: js, updatedAt: new Date() })
    .where(and(eq(demoFiles.demoId, demo.id), eq(demoFiles.fileKind, 'js')));

  console.log(
    JSON.stringify(
      {
        updatedDemoId: demo.id,
        slug: 'keyframes-direction',
        updatedFileKinds: ['html', 'js'],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
