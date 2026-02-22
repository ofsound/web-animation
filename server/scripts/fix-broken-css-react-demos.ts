import "dotenv/config";

import vm from "node:vm";
import { and, asc, eq, inArray } from "drizzle-orm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { db } from "../db/client.js";
import { demoCategories, demoFiles, demos } from "../db/schema.js";
import { createId } from "../utils.js";

type DemoFileKind = "html" | "css" | "js" | "tailwind_css" | "meta";

type DemoRow = {
  id: string;
  slug: string;
  title: string;
  categorySort: number;
  demoSort: number;
};

type DemoFileRow = {
  id: string;
  demoId: string;
  fileKind: DemoFileKind;
  content: string;
  sortOrder: number;
};

type DemoBundle = DemoRow & {
  mode: "css" | "tailwind";
  files: DemoFileRow[];
};

const BROKEN_HTML_PATTERNS: readonly RegExp[] = [
  /className\s*=/,
  /\{[^}]*\}/,
  /\.map\s*\(/,
  /\bkey\s*=/,
  /style=\{\{/,
];

const UNSUPPORTED_BLOCKERS: readonly { pattern: RegExp; reason: string }[] = [
  { pattern: /\buseEffect\b/, reason: "contains useEffect" },
  { pattern: /\buseLayoutEffect\b/, reason: "contains useLayoutEffect" },
  { pattern: /\buseMemo\b/, reason: "contains useMemo" },
  { pattern: /\buseCallback\b/, reason: "contains useCallback" },
  { pattern: /\buseReducer\b/, reason: "contains useReducer" },
  { pattern: /\buseContext\b/, reason: "contains useContext" },
  { pattern: /\bcreateContext\b/, reason: "contains createContext" },
  {
    pattern: /\buseSyncExternalStore\b/,
    reason: "contains useSyncExternalStore",
  },
  {
    pattern: /\buseImperativeHandle\b/,
    reason: "contains useImperativeHandle",
  },
  { pattern: /\bforwardRef\b/, reason: "contains forwardRef" },
  { pattern: /\bReact\.memo\b/, reason: "contains React.memo" },
];

function parseArgValue(flag: string): string | null {
  const argv = process.argv.slice(2);
  const prefixed = argv.find((arg) => arg.startsWith(`${flag}=`));
  if (prefixed) return prefixed.slice(flag.length + 1);

  const index = argv.indexOf(flag);
  if (index === -1) return null;
  return argv[index + 1] ?? null;
}

function hasFlag(flag: string): boolean {
  return process.argv.slice(2).includes(flag);
}

function parseModeArg(): "css" | "tailwind" | "all" {
  const raw = parseArgValue("--mode");
  if (!raw) return "css";

  const normalized = raw.trim().toLowerCase();
  if (normalized === "css" || normalized === "tailwind" || normalized === "all") {
    return normalized;
  }

  throw new Error(`Invalid --mode value: ${raw}. Use css, tailwind, or all.`);
}

function isBrokenHtml(html: string): boolean {
  return BROKEN_HTML_PATTERNS.some((pattern) => pattern.test(html));
}

function getFile(bundle: DemoBundle, kind: DemoFileKind): DemoFileRow | null {
  return bundle.files.find((file) => file.fileKind === kind) ?? null;
}

function extractLegacyTsx(metaContent: string | null, jsContent: string | null): string | null {
  if (metaContent) {
    try {
      const parsed = JSON.parse(metaContent) as {
        legacySource?: { tsx?: unknown };
      };
      if (typeof parsed?.legacySource?.tsx === "string") {
        return parsed.legacySource.tsx;
      }
    } catch {
      // Fall through to JS comment extraction.
    }
  }

  if (!jsContent) return null;
  const match = jsContent.match(
    /\/\*\s*Legacy React TSX source \(reference only, not executable JS\):\s*([\s\S]*?)\*\/\s*$/,
  );
  if (!match) return null;
  return match[1].trim();
}

function stripImportLines(source: string): string {
  return source.replace(/^\s*import[^\n]*\n/gm, "");
}

function removeCodeExportTemplate(source: string): string {
  const exportPattern = /export\s+const\s+code\s*=\s*`/g;
  let result = source;
  let match = exportPattern.exec(result);

  while (match) {
    const exportStart = match.index;
    const templateStart = exportStart + match[0].length - 1;
    let cursor = templateStart + 1;
    let interpolationDepth = 0;

    while (cursor < result.length) {
      const current = result[cursor];
      const next = result[cursor + 1];

      if (current === "\\") {
        cursor += 2;
        continue;
      }

      if (current === "$" && next === "{") {
        interpolationDepth += 1;
        cursor += 2;
        continue;
      }

      if (current === "}" && interpolationDepth > 0) {
        interpolationDepth -= 1;
        cursor += 1;
        continue;
      }

      if (current === "`" && interpolationDepth === 0) {
        cursor += 1;
        break;
      }

      cursor += 1;
    }

    while (cursor < result.length && /\s/.test(result[cursor])) {
      cursor += 1;
    }
    if (result[cursor] === ";") cursor += 1;
    while (cursor < result.length && /[ \t\r]/.test(result[cursor])) {
      cursor += 1;
    }
    if (result[cursor] === "\n") cursor += 1;

    result = `${result.slice(0, exportStart)}${result.slice(cursor)}`;
    exportPattern.lastIndex = 0;
    match = exportPattern.exec(result);
  }

  return result;
}

function stripLegacyTsx(tsxSource: string): string {
  return removeCodeExportTemplate(stripImportLines(tsxSource)).trim();
}

function findUnsupportedBlocker(tsxSource: string): string | null {
  for (const blocker of UNSUPPORTED_BLOCKERS) {
    if (blocker.pattern.test(tsxSource)) {
      return blocker.reason;
    }
  }
  return null;
}

function transpileLegacyModule(tsxSource: string): string {
  const sourceToCompile = [
    "const { useState, useRef, useId, useMemo, useCallback, useEffect, useLayoutEffect, useReducer } = React;",
    "const styles = __legacyStyles;",
    stripLegacyTsx(tsxSource),
  ].join("\n");

  return ts.transpileModule(sourceToCompile, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
    reportDiagnostics: false,
  }).outputText;
}

function loadLegacyComponentForSSR(transpiledModuleCode: string): React.ComponentType {
  const moduleRef: { exports: Record<string, unknown> } = { exports: {} };
  const sandbox: Record<string, unknown> = {
    module: moduleRef,
    exports: moduleRef.exports,
    React,
    require: (specifier: string) => {
      if (specifier === "react") return React;
      throw new Error(`Unsupported import in legacy TSX: ${specifier}`);
    },
    __legacyStyles: new Proxy(
      {},
      {
        get: (_target, key) => String(key),
      },
    ),
  };

  vm.runInNewContext(transpiledModuleCode, sandbox, {
    timeout: 2000,
  });

  const exported = moduleRef.exports as { default?: unknown };
  if (typeof exported.default !== "function") {
    throw new Error("Legacy TSX did not export a default component function.");
  }

  return exported.default as React.ComponentType;
}

function renderLegacyTsxToStaticHtml(tsxSource: string): string {
  const transpiled = transpileLegacyModule(tsxSource);
  const Component = loadLegacyComponentForSSR(transpiled);
  return renderToStaticMarkup(React.createElement(Component));
}

function buildLegacyRuntimeJs(slug: string, transpiledModuleCode: string): string {
  const preamble = `(() => {
  const mount = document.querySelector('[data-role="legacy-react-root"]');
  if (!(mount instanceof HTMLElement)) return;

  const unitlessStyleProps = new Set([
    'opacity',
    'zIndex',
    'fontWeight',
    'lineHeight',
    'flex',
    'flexGrow',
    'flexShrink',
    'order',
    'zoom',
    'scale',
  ]);

  const runtime = {
    hooks: [],
    ids: [],
    hookIndex: 0,
    idSeed: Math.random().toString(36).slice(2, 8),
    component: null,
    rendering: false,
  };

  const Fragment = Symbol('LegacyFragment');

  const toKebabCase = (value) => value.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());

  const setInlineStyle = (element, styleValue) => {
    if (typeof styleValue === 'string') {
      element.setAttribute('style', styleValue);
      return;
    }

    if (!styleValue || typeof styleValue !== 'object') {
      return;
    }

    for (const [rawKey, rawValue] of Object.entries(styleValue)) {
      if (rawValue === null || rawValue === undefined) continue;

      const key = String(rawKey);
      const value = rawValue;
      if (key.startsWith('--')) {
        element.style.setProperty(key, String(value));
        continue;
      }

      const cssKey = toKebabCase(key);
      const cssValue =
        typeof value === 'number' && value !== 0 && !unitlessStyleProps.has(key)
          ? String(value) + 'px'
          : String(value);
      element.style.setProperty(cssKey, cssValue);
    }
  };

  const flattenChildren = (children, output) => {
    for (const child of children) {
      if (Array.isArray(child)) {
        flattenChildren(child, output);
      } else {
        output.push(child);
      }
    }
  };

  const createElement = (type, props, ...children) => {
    const normalizedProps = props ? { ...props } : {};
    const flatChildren = [];
    flattenChildren(children, flatChildren);
    normalizedProps.children = flatChildren;
    return { type, props: normalizedProps };
  };

  const appendChildNode = (parent, node) => {
    const childNode = toDomNode(node);
    parent.appendChild(childNode);
  };

  const applyProps = (element, props) => {
    for (const [rawKey, rawValue] of Object.entries(props)) {
      const key = String(rawKey);
      const value = rawValue;

      if (key === 'children' || key === 'key') continue;

      if (key === 'className') {
        element.className = value ? String(value) : '';
        continue;
      }

      if (key === 'style') {
        setInlineStyle(element, value);
        continue;
      }

      if (key === 'ref') {
        if (value && typeof value === 'object' && 'current' in value) {
          value.current = element;
        }
        continue;
      }

      if (key === 'htmlFor') {
        element.setAttribute('for', String(value));
        continue;
      }

      if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value);
        continue;
      }

      if (value === false || value === null || value === undefined) continue;

      if (
        key === 'checked' ||
        key === 'disabled' ||
        key === 'selected' ||
        key === 'open' ||
        key === 'aria-hidden'
      ) {
        if (value) {
          element.setAttribute(key, '');
          try {
            element[key] = true;
          } catch {
            // Ignore read-only boolean attrs.
          }
        }
        continue;
      }

      if (value === true) {
        element.setAttribute(key, '');
        continue;
      }

      element.setAttribute(key, String(value));
    }
  };

  const toDomNode = (node) => {
    if (node === null || node === undefined || typeof node === 'boolean') {
      return document.createTextNode('');
    }

    if (Array.isArray(node)) {
      const fragment = document.createDocumentFragment();
      node.forEach((child) => appendChildNode(fragment, child));
      return fragment;
    }

    if (typeof node === 'string' || typeof node === 'number') {
      return document.createTextNode(String(node));
    }

    if (!node || typeof node !== 'object') {
      return document.createTextNode('');
    }

    const vnodeType = node.type;
    const vnodeProps = node.props ?? {};

    if (vnodeType === Fragment) {
      const fragment = document.createDocumentFragment();
      const children = Array.isArray(vnodeProps.children)
        ? vnodeProps.children
        : vnodeProps.children !== undefined
          ? [vnodeProps.children]
          : [];
      children.forEach((child) => appendChildNode(fragment, child));
      return fragment;
    }

    if (typeof vnodeType === 'function') {
      const rendered = vnodeType(vnodeProps);
      return toDomNode(rendered);
    }

    if (typeof vnodeType !== 'string') {
      return document.createTextNode('');
    }

    const element = document.createElement(vnodeType);
    applyProps(element, vnodeProps);

    const children = Array.isArray(vnodeProps.children)
      ? vnodeProps.children
      : vnodeProps.children !== undefined
        ? [vnodeProps.children]
        : [];

    children.forEach((child) => appendChildNode(element, child));
    return element;
  };

  const renderNow = () => {
    if (typeof runtime.component !== 'function' || runtime.rendering) return;

    runtime.rendering = true;
    runtime.hookIndex = 0;

    try {
      const vnode = createElement(runtime.component, {});
      const dom = toDomNode(vnode);
      mount.replaceChildren(dom);
    } finally {
      runtime.rendering = false;
    }
  };

  const useState = (initialValue) => {
    const index = runtime.hookIndex++;

    if (!(index in runtime.hooks)) {
      runtime.hooks[index] =
        typeof initialValue === 'function' ? initialValue() : initialValue;
    }

    const setState = (nextValue) => {
      const previous = runtime.hooks[index];
      const resolved =
        typeof nextValue === 'function' ? nextValue(previous) : nextValue;

      if (Object.is(previous, resolved)) return;
      runtime.hooks[index] = resolved;
      renderNow();
    };

    return [runtime.hooks[index], setState];
  };

  const useRef = (initialValue) => {
    const index = runtime.hookIndex++;
    if (!(index in runtime.hooks)) {
      runtime.hooks[index] = { current: initialValue };
    }
    return runtime.hooks[index];
  };

  const useId = () => {
    const index = runtime.hookIndex++;
    if (!runtime.ids[index]) {
      runtime.ids[index] = 'legacy-id-' + runtime.idSeed + '-' + index;
    }
    return runtime.ids[index];
  };

  const useMemo = (factory) => factory();
  const useCallback = (callback) => callback;
  const useEffect = () => {};
  const useLayoutEffect = () => {};

  const useReducer = (reducer, initialArg, init) => {
    const [state, setState] = useState(() =>
      typeof init === 'function' ? init(initialArg) : initialArg,
    );
    const dispatch = (action) => {
      setState((prevState) => reducer(prevState, action));
    };
    return [state, dispatch];
  };

  const React = {
    Fragment,
    createElement,
    useState,
    useRef,
    useId,
    useMemo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useReducer,
  };

  const module = { exports: {} };
  const exports = module.exports;
  const require = (specifier) => {
    if (specifier === 'react') return React;
    throw new Error('Unsupported import in migrated demo: ' + specifier);
  };

  const __legacyStyles = new Proxy(
    {},
    {
      get: (_target, key) => String(key),
    },
  );

  try {
`;

  const postamble = `
  } catch (error) {
    console.error('Failed to initialize migrated demo: ${slug}', error);
    return;
  }

  const component = module.exports?.default ?? exports.default;
  if (typeof component !== 'function') {
    console.error('Migrated demo component missing default export: ${slug}');
    return;
  }

  runtime.component = component;
  renderNow();
})();`;

  return [preamble, transpiledModuleCode, postamble].join("\n");
}

function wrapInitialHtml(innerHtml: string): string {
  return `<div data-role="legacy-react-root">${innerHtml}</div>`;
}

type FallbackConversion = {
  html: string;
  js: string;
};

function buildFallbackConversion(slug: string): FallbackConversion | null {
  if (slug === "text-stagger-letters") {
    return {
      html: `<div class="flex text-3xl font-bold text-text-primary" data-role="stagger-letters-root"></div>`,
      js: `(() => {
  const root = document.querySelector('[data-role="stagger-letters-root"]');
  if (!(root instanceof HTMLElement)) return;

  const text = 'ANIMATE';
  root.replaceChildren();

  text.split('').forEach((char, index) => {
    const span = document.createElement('span');
    span.className = 'animate-fade-in-up';
    span.style.animationDelay = \`\${index * 80}ms\`;
    span.textContent = char;
    root.appendChild(span);
  });
})();`,
    };
  }

  if (slug === "text-word-stagger") {
    return {
      html: `<p class="text-lg text-text-secondary" data-role="word-stagger-root"></p>`,
      js: `(() => {
  const root = document.querySelector('[data-role="word-stagger-root"]');
  if (!(root instanceof HTMLElement)) return;

  const text = 'Modern animations with Tailwind';
  root.replaceChildren();

  text.split(' ').forEach((word, index) => {
    const span = document.createElement('span');
    span.className = 'mr-2 inline-block animate-fade-in-up';
    span.style.animationDelay = \`\${index * 120}ms\`;
    span.textContent = word;
    root.appendChild(span);
  });
})();`,
    };
  }

  return null;
}

async function upsertDemoFile(
  demo: DemoBundle,
  kind: DemoFileKind,
  content: string,
): Promise<"updated" | "inserted" | "unchanged"> {
  const existing = getFile(demo, kind);
  if (existing) {
    if (existing.content === content) return "unchanged";
    await db
      .update(demoFiles)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(demoFiles.id, existing.id));
    return "updated";
  }

  const maxSortOrder = demo.files.reduce(
    (acc, file) => Math.max(acc, file.sortOrder),
    -1,
  );
  await db.insert(demoFiles).values({
    id: createId("file"),
    demoId: demo.id,
    fileKind: kind,
    content,
    sortOrder: maxSortOrder + 1,
  });
  return "inserted";
}

async function loadCssDemoBundles(): Promise<DemoBundle[]> {
  const mode = parseModeArg();
  const typeFilter = mode === "all" ? ["css", "tailwind"] : [mode];

  const demoRows = await db
    .select({
      id: demos.id,
      slug: demos.slug,
      title: demos.title,
      categorySort: demoCategories.sortOrder,
      demoSort: demos.sortOrder,
      mode: demoCategories.type,
    })
    .from(demos)
    .innerJoin(demoCategories, eq(demoCategories.id, demos.categoryId))
    .where(and(inArray(demoCategories.type, typeFilter), eq(demos.status, "published")))
    .orderBy(
      asc(demoCategories.sortOrder),
      asc(demoCategories.createdAt),
      asc(demos.sortOrder),
      asc(demos.createdAt),
    );

  const demoIds = demoRows.map((row) => row.id);
  const fileRows = demoIds.length
    ? await db
        .select({
          id: demoFiles.id,
          demoId: demoFiles.demoId,
          fileKind: demoFiles.fileKind,
          content: demoFiles.content,
          sortOrder: demoFiles.sortOrder,
        })
        .from(demoFiles)
        .where(inArray(demoFiles.demoId, demoIds))
        .orderBy(asc(demoFiles.demoId), asc(demoFiles.sortOrder))
    : [];

  const filesByDemoId = new Map<string, DemoFileRow[]>();
  for (const file of fileRows) {
    const existing = filesByDemoId.get(file.demoId) ?? [];
    existing.push(file);
    filesByDemoId.set(file.demoId, existing);
  }

  return demoRows.map((demoRow) => ({
    ...demoRow,
    files: filesByDemoId.get(demoRow.id) ?? [],
  }));
}

async function main(): Promise<void> {
  const apply = hasFlag("--apply");
  const dryRun = !apply;
  const slugFilter = parseArgValue("--slug");
  const mode = parseModeArg();

  const bundles = await loadCssDemoBundles();
  const candidates = bundles.filter((bundle) => {
    if (slugFilter && bundle.slug !== slugFilter) return false;
    const html = getFile(bundle, "html")?.content ?? "";
    return isBrokenHtml(html);
  });

  const autoFixed: Array<{
    slug: string;
    title: string;
    htmlAction: string;
    jsAction: string;
  }> = [];
  const skipped: Array<{ slug: string; title: string; reason: string }> = [];
  const failed: Array<{ slug: string; title: string; reason: string }> = [];

  for (const demo of candidates) {
    const currentHtml = getFile(demo, "html")?.content ?? "";
    const currentJs = getFile(demo, "js")?.content ?? "";
    const meta = getFile(demo, "meta")?.content ?? null;
    const legacyTsx = extractLegacyTsx(meta, currentJs);

    if (!legacyTsx) {
      const fallback = buildFallbackConversion(demo.slug);
      if (!fallback) {
        skipped.push({
          slug: demo.slug,
          title: demo.title,
          reason: "legacy TSX source not found in meta/js",
        });
        continue;
      }

      if (dryRun) {
        autoFixed.push({
          slug: demo.slug,
          title: demo.title,
          htmlAction:
            currentHtml === fallback.html ? "unchanged" : "would-update",
          jsAction: currentJs === fallback.js ? "unchanged" : "would-update",
        });
        continue;
      }

      const htmlAction = await upsertDemoFile(demo, "html", fallback.html);
      const jsAction = await upsertDemoFile(demo, "js", fallback.js);

      autoFixed.push({
        slug: demo.slug,
        title: demo.title,
        htmlAction,
        jsAction,
      });
      continue;
    }

    const blocker = findUnsupportedBlocker(legacyTsx);
    if (blocker) {
      skipped.push({
        slug: demo.slug,
        title: demo.title,
        reason: blocker,
      });
      continue;
    }

    try {
      const transpiled = transpileLegacyModule(legacyTsx);
      const initialMarkup = renderLegacyTsxToStaticHtml(legacyTsx);
      const nextHtml = wrapInitialHtml(initialMarkup);
      const nextJs = buildLegacyRuntimeJs(demo.slug, transpiled);

      if (dryRun) {
        autoFixed.push({
          slug: demo.slug,
          title: demo.title,
          htmlAction: currentHtml === nextHtml ? "unchanged" : "would-update",
          jsAction: currentJs === nextJs ? "unchanged" : "would-update",
        });
        continue;
      }

      const htmlAction = await upsertDemoFile(demo, "html", nextHtml);
      const jsAction = await upsertDemoFile(demo, "js", nextJs);

      autoFixed.push({
        slug: demo.slug,
        title: demo.title,
        htmlAction,
        jsAction,
      });
    } catch (error) {
      failed.push({
        slug: demo.slug,
        title: demo.title,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: dryRun ? "dry-run" : "apply",
        targetMode: mode,
        slugFilter,
        brokenCandidates: candidates.length,
        autoFixedCount: autoFixed.length,
        skippedCount: skipped.length,
        failedCount: failed.length,
        autoFixed,
        skipped,
        failed,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error("Failed to run broken CSS React demo fixer.");
  console.error(error);
  process.exitCode = 1;
});
