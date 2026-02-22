import "dotenv/config";
import { createHash } from "node:crypto";
import path from "node:path";
import { promises as fs } from "node:fs";
import { and, eq } from "drizzle-orm";
import ts from "typescript";
import { db } from "../db/client";
import { demoCategories, demoFiles, demos } from "../db/schema";
import { createId } from "../utils";

type DemoSourceMode = "tailwind" | "css";
type DemoFileKind = "html" | "css" | "js" | "tailwind_css" | "meta";

type SeedCategory = {
  id: string;
  type: DemoSourceMode;
  slug: string;
  label: string;
  icon: string;
  description: string;
  sortOrder: number;
};

type SeedDemoFiles = Record<DemoFileKind, string>;

type SeedDemo = {
  id: string;
  source: DemoSourceMode;
  categorySlug: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string | null;
  support: string | null;
  sortOrder: number;
  files: SeedDemoFiles;
};

type ParsedTailwindCategory = {
  id: string;
  label: string;
  icon: string;
  description: string;
};

type ParsedTailwindDemo = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  code: string;
};

type ParsedCssCatalogDemo = {
  id: string;
  title: string;
  description: string;
  support: string;
  codeAlias: string;
};

type ParsedCssCatalogCategory = {
  id: string;
  title: string;
  demos: ParsedCssCatalogDemo[];
};

type ImportMeta = {
  managedBy?: string;
  sourceHash?: string;
};

type Summary = {
  categoriesCreated: number;
  categoriesUpdated: number;
  categoriesSkipped: number;
  demosCreated: number;
  demosUpdated: number;
  demosSkippedUnmanaged: number;
  demosSkippedModified: number;
};

const IMPORTER_ID = "static-demo-importer";
const IMPORTER_VERSION = 1;
const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const CSS_CATEGORY_ICON_BY_ID: Record<string, string> = {
  keyframes: "spark",
  easing: "spark",
  transitions: "pointer",
  scroll: "layers",
  "view-transitions": "layers",
  property: "loader",
  transforms: "pointer",
  "motion-path": "pointer",
  "clip-path": "pointer",
  filters: "type",
  text: "type",
  size: "loader",
  color: "layers",
};

const CSS_CATEGORY_DESCRIPTION_BY_ID: Record<string, string> = {
  keyframes: "Keyframe fundamentals and timing composition techniques.",
  easing: "Easing strategies from cubic-bezier curves to stepped timing.",
  transitions: "Transition primitives including starting-style and allow-discrete.",
  scroll: "Scroll-linked timelines, ranges, and view timeline patterns.",
  "view-transitions": "View Transition API techniques for state and page-like morphing.",
  property: "Typed custom property animation with @property registration.",
  transforms: "2D/3D transform composition, perspective, and transform origin.",
  "motion-path": "Motion path APIs with path(), circle(), ray(), and ellipse().",
  "clip-path": "clip-path morphs and reveal patterns with geometric shapes.",
  filters: "Filter and backdrop-filter animation patterns.",
  text: "Typography animation patterns from gradients to variable fonts.",
  size: "Layout/size transition techniques, including modern and fallback approaches.",
  color: "Color-space motion and animation composition behavior.",
};

const FILE_KIND_ORDER: DemoFileKind[] = [
  "html",
  "css",
  "js",
  "tailwind_css",
  "meta",
];

function parseArgs() {
  const args = new Set(process.argv.slice(2));
  const onlyValue = Array.from(args)
    .find((arg) => arg.startsWith("--only="))
    ?.split("=")[1];

  let only: DemoSourceMode | null = null;
  if (onlyValue === "tailwind" || onlyValue === "css") {
    only = onlyValue;
  }

  return {
    dryRun: args.has("--dry-run"),
    forceSync: args.has("--force-sync"),
    only,
  };
}

function toCssCategoryId(rawId: string): string {
  return `css-${rawId}`;
}

function toTailwindHtmlSnippet(input: string): string {
  return input
    .trim()
    .replace(/\bclassName=/g, "class=")
    .replace(/\bhtmlFor=/g, "for=")
    .replace(/\{\s*"([^"]*)"\s*\}/g, "$1")
    .replace(/\{\s*'([^']*)'\s*\}/g, "$1")
    .replace(/<>\s*/g, "<div>")
    .replace(/\s*<\/>\s*/g, "</div>")
    .replace(/<([a-z][\w-]*)([^>]*)\/>/gi, (match, tag, attrs) => {
      return VOID_TAGS.has(String(tag).toLowerCase())
        ? match
        : `<${tag}${attrs}></${tag}>`;
    });
}

function parseCodeAliasMapFromCssIndex(indexSource: string, indexFilePath: string): Map<string, string> {
  const aliasMap = new Map<string, string>();
  const exportPattern =
    /export\s*\{\s*default\s+as\s+[A-Za-z0-9_]+\s*,\s*code\s+as\s+([A-Za-z0-9_]+)\s*\}\s*from\s*['"](.+?)['"]/g;

  for (const match of indexSource.matchAll(exportPattern)) {
    const codeAlias = match[1];
    const relativePath = match[2];
    if (!codeAlias || !relativePath) continue;

    const resolvedWithoutExt = path.resolve(path.dirname(indexFilePath), relativePath);
    const tsxPath = `${resolvedWithoutExt}.tsx`;
    aliasMap.set(codeAlias, tsxPath);
  }

  return aliasMap;
}

function findExportedArrayLiteral(
  sourceFile: ts.SourceFile,
  exportName: string,
): ts.ArrayLiteralExpression {
  const unwrap = (expression: ts.Expression): ts.Expression => {
    let current = expression;

    while (
      ts.isAsExpression(current) ||
      ts.isTypeAssertionExpression(current) ||
      ts.isParenthesizedExpression(current)
    ) {
      current = current.expression;
    }

    return current;
  };

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== exportName) {
        continue;
      }

      if (!declaration.initializer) {
        throw new Error(`Expected "${exportName}" to be initialized.`);
      }

      const unwrapped = unwrap(declaration.initializer);
      if (!ts.isArrayLiteralExpression(unwrapped)) {
        throw new Error(`Expected "${exportName}" to be an array literal.`);
      }

      return unwrapped;
    }
  }

  throw new Error(`Could not find "${exportName}" declaration.`);
}

function getObjectPropertyByName(
  node: ts.ObjectLiteralExpression,
  name: string,
): ts.Expression | null {
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const propertyName = property.name.getText().replace(/['"]/g, "");
    if (propertyName === name) {
      return property.initializer;
    }
  }

  return null;
}

function getRequiredString(
  node: ts.ObjectLiteralExpression,
  key: string,
  context: string,
): string {
  const value = getObjectPropertyByName(node, key);
  if (!value || !ts.isStringLiteralLike(value)) {
    throw new Error(`Expected string property "${key}" for ${context}.`);
  }

  return value.text;
}

function getRequiredIdentifier(
  node: ts.ObjectLiteralExpression,
  key: string,
  context: string,
): string {
  const value = getObjectPropertyByName(node, key);
  if (!value || !ts.isIdentifier(value)) {
    throw new Error(`Expected identifier property "${key}" for ${context}.`);
  }

  return value.text;
}

function parseTailwindAnimations(
  animationsSource: string,
): { categories: ParsedTailwindCategory[]; demos: ParsedTailwindDemo[] } {
  const sourceFile = ts.createSourceFile(
    "animations.ts",
    animationsSource,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS,
  );

  const categoryArray = findExportedArrayLiteral(sourceFile, "animationCategories");
  const demoArray = findExportedArrayLiteral(sourceFile, "animationDemos");

  const categories = categoryArray.elements.map((element, index) => {
    if (!ts.isObjectLiteralExpression(element)) {
      throw new Error(`Expected category object at index ${index}.`);
    }

    return {
      id: getRequiredString(element, "id", `tailwind category ${index}`),
      label: getRequiredString(element, "label", `tailwind category ${index}`),
      icon: getRequiredString(element, "icon", `tailwind category ${index}`),
      description: getRequiredString(
        element,
        "description",
        `tailwind category ${index}`,
      ),
    };
  });

  const demos = demoArray.elements.map((element, index) => {
    if (!ts.isObjectLiteralExpression(element)) {
      throw new Error(`Expected tailwind demo object at index ${index}.`);
    }

    return {
      id: getRequiredString(element, "id", `tailwind demo ${index}`),
      title: getRequiredString(element, "title", `tailwind demo ${index}`),
      description: getRequiredString(element, "description", `tailwind demo ${index}`),
      category: getRequiredString(element, "category", `tailwind demo ${index}`),
      difficulty: getRequiredString(element, "difficulty", `tailwind demo ${index}`),
      code: getRequiredString(element, "code", `tailwind demo ${index}`),
    };
  });

  return { categories, demos };
}

function parseCssCatalog(catalogSource: string): ParsedCssCatalogCategory[] {
  const sourceFile = ts.createSourceFile(
    "catalog.ts",
    catalogSource,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS,
  );

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== "demoCategories") {
        continue;
      }

      if (!declaration.initializer || !ts.isArrayLiteralExpression(declaration.initializer)) {
        throw new Error('Expected "demoCategories" to be an array literal.');
      }

      return declaration.initializer.elements.map((element, categoryIndex) => {
        if (!ts.isObjectLiteralExpression(element)) {
          throw new Error(`Expected category object at index ${categoryIndex}.`);
        }

        const categoryId = getRequiredString(element, "id", `category ${categoryIndex}`);
        const categoryTitle = getRequiredString(element, "title", `category ${categoryId}`);
        const demosValue = getObjectPropertyByName(element, "demos");
        if (!demosValue || !ts.isArrayLiteralExpression(demosValue)) {
          throw new Error(`Expected demos array for category "${categoryId}".`);
        }

        const demosForCategory = demosValue.elements.map((demoElement, demoIndex) => {
          if (!ts.isObjectLiteralExpression(demoElement)) {
            throw new Error(`Expected demo object at index ${demoIndex} in "${categoryId}".`);
          }

          return {
            id: getRequiredString(demoElement, "id", `demo ${demoIndex} in ${categoryId}`),
            title: getRequiredString(demoElement, "title", `demo ${demoIndex} in ${categoryId}`),
            description: getRequiredString(
              demoElement,
              "description",
              `demo ${demoIndex} in ${categoryId}`,
            ),
            support: getRequiredString(
              demoElement,
              "support",
              `demo ${demoIndex} in ${categoryId}`,
            ),
            codeAlias: getRequiredIdentifier(
              demoElement,
              "code",
              `demo ${demoIndex} in ${categoryId}`,
            ),
          };
        });

        return {
          id: categoryId,
          title: categoryTitle,
          demos: demosForCategory,
        };
      });
    }
  }

  throw new Error('Could not find "demoCategories" declaration in CSS catalog.');
}

function parseExportedCode(sourceText: string, filePath: string): string {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TSX,
  );

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const isExported = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!isExported) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== "code") {
        continue;
      }

      const initializer = declaration.initializer;
      if (!initializer) {
        throw new Error(`Missing initializer for exported "code" in ${filePath}.`);
      }

      if (ts.isNoSubstitutionTemplateLiteral(initializer)) {
        return initializer.text;
      }
      if (ts.isStringLiteral(initializer)) {
        return initializer.text;
      }

      return initializer.getText(sourceFile).slice(1, -1);
    }
  }

  throw new Error(`Could not find exported "code" constant in ${filePath}.`);
}

function parseCssModuleImportPath(tsxSource: string): string | null {
  const match = tsxSource.match(
    /import\s+[A-Za-z0-9_]+\s+from\s+['"](.+?\.module\.css)['"]/,
  );
  return match?.[1] ?? null;
}

function computeSourceHash(input: {
  source: DemoSourceMode;
  categorySlug: string;
  title: string;
  description: string;
  difficulty: string | null;
  support: string | null;
  html: string;
  css: string;
  js: string;
  tailwindCss: string;
}): string {
  const payload = JSON.stringify({
    source: input.source,
    categorySlug: input.categorySlug,
    title: input.title,
    description: input.description,
    difficulty: input.difficulty,
    support: input.support,
    html: input.html,
    css: input.css,
    js: input.js,
    tailwindCss: input.tailwindCss,
  });

  return createHash("sha256").update(payload).digest("hex");
}

function parseMeta(content: string | null): ImportMeta | null {
  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as ImportMeta;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

async function buildSeedData(only: DemoSourceMode | null): Promise<{
  categories: SeedCategory[];
  demos: SeedDemo[];
}> {
  const categories: SeedCategory[] = [];
  const demosForImport: SeedDemo[] = [];

  if (!only || only === "tailwind") {
    const animationsPath = path.resolve(process.cwd(), "src/data/animations.ts");
    const animationsSource = await fs.readFile(animationsPath, "utf8");
    const parsedTailwind = parseTailwindAnimations(animationsSource);

    for (const [sortOrder, category] of parsedTailwind.categories.entries()) {
      categories.push({
        id: category.id,
        type: "tailwind",
        slug: category.id,
        label: category.label,
        icon: category.icon,
        description: category.description,
        sortOrder,
      });
    }

    const sortOrderByCategory = new Map<string, number>();
    for (const demo of parsedTailwind.demos) {
      const nextSortOrder = sortOrderByCategory.get(demo.category) ?? 0;
      sortOrderByCategory.set(demo.category, nextSortOrder + 1);

      const html = toTailwindHtmlSnippet(demo.code);
      const css = "";
      const js = "";
      const tailwindCss = "";

      const sourceHash = computeSourceHash({
        source: "tailwind",
        categorySlug: demo.category,
        title: demo.title,
        description: demo.description,
        difficulty: demo.difficulty,
        support: null,
        html,
        css,
        js,
        tailwindCss,
      });

      const meta = JSON.stringify(
        {
          managedBy: IMPORTER_ID,
          importerVersion: IMPORTER_VERSION,
          sourceMode: "tailwind",
          sourceHash,
        },
        null,
        2,
      );

      demosForImport.push({
        id: demo.id,
        source: "tailwind",
        categorySlug: demo.category,
        slug: demo.id,
        title: demo.title,
        description: demo.description,
        difficulty: demo.difficulty,
        support: null,
        sortOrder: nextSortOrder,
        files: {
          html,
          css,
          js,
          tailwind_css: tailwindCss,
          meta,
        },
      });
    }
  }

  if (!only || only === "css") {
    const cssCatalogPath = path.resolve(process.cwd(), "src/cssDemos/demos/catalog.ts");
    const cssIndexPath = path.resolve(process.cwd(), "src/cssDemos/demos/index.ts");

    const [catalogSource, indexSource] = await Promise.all([
      fs.readFile(cssCatalogPath, "utf8"),
      fs.readFile(cssIndexPath, "utf8"),
    ]);

    const parsedCatalog = parseCssCatalog(catalogSource);
    const codeAliasPathMap = parseCodeAliasMapFromCssIndex(indexSource, cssIndexPath);

    for (const [sortOrder, category] of parsedCatalog.entries()) {
      const categoryId = toCssCategoryId(category.id);
      categories.push({
        id: categoryId,
        type: "css",
        slug: categoryId,
        label: category.title,
        icon: CSS_CATEGORY_ICON_BY_ID[category.id] ?? "layers",
        description:
          CSS_CATEGORY_DESCRIPTION_BY_ID[category.id] ??
          "Native CSS animation and transition techniques.",
        sortOrder,
      });
    }

    for (const category of parsedCatalog) {
      const categorySlug = toCssCategoryId(category.id);

      for (const [sortOrder, demo] of category.demos.entries()) {
        const sourcePath = codeAliasPathMap.get(demo.codeAlias);
        if (!sourcePath) {
          throw new Error(`Missing code path for alias "${demo.codeAlias}" (${demo.id}).`);
        }

        const tsxSource = await fs.readFile(sourcePath, "utf8");
        const codeSnippet = parseExportedCode(tsxSource, sourcePath);
        const cssModuleImportPath = parseCssModuleImportPath(tsxSource);
        const cssModuleSource = cssModuleImportPath
          ? await fs
              .readFile(path.resolve(path.dirname(sourcePath), cssModuleImportPath), "utf8")
              .catch(() => null)
          : null;

        const html = "";
        const css = "";
        const js = "";
        const tailwindCss = "";

        const sourceHash = computeSourceHash({
          source: "css",
          categorySlug,
          title: demo.title,
          description: demo.description,
          difficulty: null,
          support: demo.support,
          html,
          css,
          js,
          tailwindCss,
        });

        const meta = JSON.stringify(
          {
            managedBy: IMPORTER_ID,
            importerVersion: IMPORTER_VERSION,
            sourceMode: "css",
            sourceHash,
            legacySource: {
              note: "Legacy React + CSS module source preserved for manual migration.",
              tsx: tsxSource,
              cssModule: cssModuleSource,
              codeSnippet,
            },
          },
          null,
          2,
        );

        demosForImport.push({
          id: demo.id,
          source: "css",
          categorySlug,
          slug: demo.id,
          title: demo.title,
          description: demo.description,
          difficulty: null,
          support: demo.support,
          sortOrder,
          files: {
            html,
            css,
            js,
            tailwind_css: tailwindCss,
            meta,
          },
        });
      }
    }
  }

  return { categories, demos: demosForImport };
}

async function main() {
  const { dryRun, forceSync, only } = parseArgs();
  const summary: Summary = {
    categoriesCreated: 0,
    categoriesUpdated: 0,
    categoriesSkipped: 0,
    demosCreated: 0,
    demosUpdated: 0,
    demosSkippedUnmanaged: 0,
    demosSkippedModified: 0,
  };

  const seedData = await buildSeedData(only);

  const [existingCategoryRows, existingDemoRows, existingFileRows] = await Promise.all([
    db.select().from(demoCategories),
    db.select().from(demos),
    db.select().from(demoFiles),
  ]);

  const categoryBySlug = new Map(existingCategoryRows.map((row) => [row.slug, row] as const));
  const categoryById = new Map(existingCategoryRows.map((row) => [row.id, row] as const));
  const categorySlugById = new Map(existingCategoryRows.map((row) => [row.id, row.slug] as const));

  const demoBySlug = new Map(existingDemoRows.map((row) => [row.slug, row] as const));
  const demoById = new Map(existingDemoRows.map((row) => [row.id, row] as const));

  const filesByDemoId = new Map<string, Map<DemoFileKind, (typeof existingFileRows)[number]>>();
  for (const row of existingFileRows) {
    const key = row.demoId;
    const map = filesByDemoId.get(key) ?? new Map<DemoFileKind, (typeof existingFileRows)[number]>();
    map.set(row.fileKind as DemoFileKind, row);
    filesByDemoId.set(key, map);
  }

  const categoryIdBySlug = new Map<string, string>();
  const now = new Date();

  for (const category of seedData.categories) {
    const existing = categoryBySlug.get(category.slug);

    if (!existing) {
      const id = categoryById.has(category.id) ? createId("cat") : category.id;
      const row = {
        id,
        type: category.type,
        slug: category.slug,
        label: category.label,
        icon: category.icon,
        description: category.description,
        sortOrder: category.sortOrder,
      } as const;

      if (!dryRun) {
        await db.insert(demoCategories).values(row);
      }

      const insertedRow = {
        ...row,
        createdAt: now,
        updatedAt: now,
      };

      categoryBySlug.set(row.slug, insertedRow);
      categoryById.set(row.id, insertedRow);
      categorySlugById.set(row.id, row.slug);
      categoryIdBySlug.set(row.slug, row.id);
      summary.categoriesCreated += 1;
      continue;
    }

    if (existing.type !== category.type) {
      throw new Error(
        `Category slug "${category.slug}" exists with type "${existing.type}" but seed requires "${category.type}".`,
      );
    }

    categoryIdBySlug.set(category.slug, existing.id);

    if (!forceSync) {
      summary.categoriesSkipped += 1;
      continue;
    }

    const shouldUpdate =
      existing.label !== category.label ||
      existing.icon !== category.icon ||
      existing.description !== category.description ||
      existing.sortOrder !== category.sortOrder;

    if (!shouldUpdate) {
      summary.categoriesSkipped += 1;
      continue;
    }

    if (!dryRun) {
      await db
        .update(demoCategories)
        .set({
          label: category.label,
          icon: category.icon,
          description: category.description,
          sortOrder: category.sortOrder,
          updatedAt: new Date(),
        })
        .where(eq(demoCategories.id, existing.id));
    }

    const updated = {
      ...existing,
      label: category.label,
      icon: category.icon,
      description: category.description,
      sortOrder: category.sortOrder,
      updatedAt: new Date(),
    };
    categoryBySlug.set(existing.slug, updated);
    categoryById.set(existing.id, updated);
    summary.categoriesUpdated += 1;
  }

  for (const demo of seedData.demos) {
    const categoryId = categoryIdBySlug.get(demo.categorySlug);
    if (!categoryId) {
      throw new Error(
        `Could not resolve category "${demo.categorySlug}" for demo "${demo.id}".`,
      );
    }

    const existing = demoBySlug.get(demo.slug);
    const desiredHash = computeSourceHash({
      source: demo.source,
      categorySlug: demo.categorySlug,
      title: demo.title,
      description: demo.description,
      difficulty: demo.difficulty,
      support: demo.support,
      html: demo.files.html,
      css: demo.files.css,
      js: demo.files.js,
      tailwindCss: demo.files.tailwind_css,
    });

    const desiredMeta = JSON.stringify(
      {
        ...parseMeta(demo.files.meta),
        managedBy: IMPORTER_ID,
        importerVersion: IMPORTER_VERSION,
        sourceMode: demo.source,
        sourceHash: desiredHash,
      },
      null,
      2,
    );
    const desiredFiles: SeedDemoFiles = {
      ...demo.files,
      meta: desiredMeta,
    };

    if (!existing) {
      const id = demoById.has(demo.id) ? createId("demo") : demo.id;
      const row = {
        id,
        source: demo.source,
        categoryId,
        slug: demo.slug,
        title: demo.title,
        description: demo.description,
        difficulty: demo.difficulty,
        support: demo.support,
        sortOrder: demo.sortOrder,
        status: "published" as const,
      };

      if (!dryRun) {
        await db.insert(demos).values(row);
      }

      const fileValues = FILE_KIND_ORDER.map((fileKind, sortOrder) => ({
        id: createId("file"),
        demoId: id,
        fileKind,
        content: desiredFiles[fileKind],
        sortOrder,
      }));

      if (!dryRun) {
        await db.insert(demoFiles).values(fileValues);
      }

      const insertedDemo = {
        ...row,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      demoBySlug.set(row.slug, insertedDemo);
      demoById.set(row.id, insertedDemo);

      const fileMap = new Map<DemoFileKind, (typeof existingFileRows)[number]>();
      for (const file of fileValues) {
        fileMap.set(file.fileKind, {
          ...file,
          createdAt: now,
          updatedAt: now,
        });
      }
      filesByDemoId.set(id, fileMap);

      summary.demosCreated += 1;
      continue;
    }

    const existingFilesForDemo = filesByDemoId.get(existing.id) ?? new Map();
    const existingMeta = parseMeta(existingFilesForDemo.get("meta")?.content ?? null);

    let updateAllowed = forceSync;
    if (!forceSync) {
      if (!existingMeta || existingMeta.managedBy !== IMPORTER_ID) {
        summary.demosSkippedUnmanaged += 1;
        updateAllowed = false;
      } else {
        const existingCategorySlug = categorySlugById.get(existing.categoryId) ?? existing.categoryId;
        const currentHash = computeSourceHash({
          source: existing.source as DemoSourceMode,
          categorySlug: existingCategorySlug,
          title: existing.title,
          description: existing.description,
          difficulty: existing.difficulty,
          support: existing.support,
          html: existingFilesForDemo.get("html")?.content ?? "",
          css: existingFilesForDemo.get("css")?.content ?? "",
          js: existingFilesForDemo.get("js")?.content ?? "",
          tailwindCss: existingFilesForDemo.get("tailwind_css")?.content ?? "",
        });

        if (existingMeta.sourceHash !== currentHash) {
          summary.demosSkippedModified += 1;
          updateAllowed = false;
        } else {
          updateAllowed = true;
        }
      }
    }

    if (!updateAllowed) {
      continue;
    }

    if (!dryRun) {
      await db
        .update(demos)
        .set({
          source: demo.source,
          categoryId,
          title: demo.title,
          description: demo.description,
          difficulty: demo.difficulty,
          support: demo.support,
          sortOrder: demo.sortOrder,
          updatedAt: new Date(),
        })
        .where(eq(demos.id, existing.id));
    }

    for (const [sortOrder, fileKind] of FILE_KIND_ORDER.entries()) {
      const existingFile = existingFilesForDemo.get(fileKind);
      const content = desiredFiles[fileKind];

      if (!existingFile) {
        const insertValue = {
          id: createId("file"),
          demoId: existing.id,
          fileKind,
          content,
          sortOrder,
        };
        if (!dryRun) {
          await db.insert(demoFiles).values(insertValue);
        }
        existingFilesForDemo.set(fileKind, {
          ...insertValue,
          createdAt: now,
          updatedAt: now,
        });
        continue;
      }

      if (
        existingFile.content === content &&
        existingFile.sortOrder === sortOrder
      ) {
        continue;
      }

      if (!dryRun) {
        await db
          .update(demoFiles)
          .set({
            content,
            sortOrder,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(demoFiles.demoId, existing.id),
              eq(demoFiles.fileKind, fileKind),
            ),
          );
      }

      existingFilesForDemo.set(fileKind, {
        ...existingFile,
        content,
        sortOrder,
        updatedAt: new Date(),
      });
    }

    const desiredKinds = new Set(FILE_KIND_ORDER);
    const extraKinds = Array.from(existingFilesForDemo.keys()).filter(
      (fileKind) => !desiredKinds.has(fileKind),
    );
    for (const fileKind of extraKinds) {
      if (!dryRun) {
        await db
          .delete(demoFiles)
          .where(
            and(
              eq(demoFiles.demoId, existing.id),
              eq(demoFiles.fileKind, fileKind),
            ),
          );
      }
      existingFilesForDemo.delete(fileKind);
    }

    summary.demosUpdated += 1;
  }

  const modeLabel = only ? ` (${only})` : "";
  console.log(`Static demo import${modeLabel} complete.`);
  console.log(`dryRun=${dryRun} forceSync=${forceSync}`);
  console.log(`categories: created=${summary.categoriesCreated}, updated=${summary.categoriesUpdated}, skipped=${summary.categoriesSkipped}`);
  console.log(
    `demos: created=${summary.demosCreated}, updated=${summary.demosUpdated}, skippedUnmanaged=${summary.demosSkippedUnmanaged}, skippedModified=${summary.demosSkippedModified}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
