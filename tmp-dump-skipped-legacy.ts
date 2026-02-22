import 'dotenv/config';
import { and, asc, eq } from 'drizzle-orm';
import { db } from './server/db/client';
import { demoCategories, demoFiles, demos } from './server/db/schema';

type Rec = {
  slug: string;
  title: string;
  categorySort: number;
  demoSort: number;
  html: string;
  js: string;
  meta: string | null;
};

const SKIPPED = new Set([
  'keyframes-play-state',
  'transitions-allow-discrete',
  'transitions-starting-style-insertion',
  'view-transitions-spa-state-swap',
  'view-transitions-shared-hero-morph',
  'view-transitions-class-batch',
  'transforms-card-flip',
  'transforms-perspective-text-tilt',
  'clip-path-inset-wipe-reveal',
  'clip-path-circle-radial-spotlight',
  'filters-filter-chain-transition',
  'text-letter-spacing-reveal',
  'text-typewriter-cursor',
  'size-interpolate-size',
  'size-calc-size-fractional-auto',
  'size-max-height-fallback',
]);

async function main() {
  const demoRows = await db
    .select({
      id: demos.id,
      slug: demos.slug,
      title: demos.title,
      categorySort: demoCategories.sortOrder,
      demoSort: demos.sortOrder,
    })
    .from(demos)
    .innerJoin(demoCategories, eq(demoCategories.id, demos.categoryId))
    .where(and(eq(demoCategories.type, 'css'), eq(demos.status, 'published')))
    .orderBy(
      asc(demoCategories.sortOrder),
      asc(demoCategories.createdAt),
      asc(demos.sortOrder),
      asc(demos.createdAt),
    );

  const selected = demoRows.filter((row) => SKIPPED.has(row.slug));

  const out: Rec[] = [];
  for (const row of selected) {
    const files = await db
      .select({ fileKind: demoFiles.fileKind, content: demoFiles.content })
      .from(demoFiles)
      .where(eq(demoFiles.demoId, row.id))
      .orderBy(asc(demoFiles.sortOrder));

    const html = files.find((f) => f.fileKind === 'html')?.content ?? '';
    const js = files.find((f) => f.fileKind === 'js')?.content ?? '';
    const meta = files.find((f) => f.fileKind === 'meta')?.content ?? null;

    out.push({
      slug: row.slug,
      title: row.title,
      categorySort: row.categorySort,
      demoSort: row.demoSort,
      html,
      js,
      meta,
    });
  }

  console.log(JSON.stringify(out, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
