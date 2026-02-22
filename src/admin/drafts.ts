import type { DemoDraft, DemoFileKind, DemoRecord } from "./types";
import { FILE_KIND_ORDER } from "./types";

function emptyFileMap(): Record<DemoFileKind, string> {
  return {
    html: "<div class=\"rounded-xl border border-border-subtle bg-surface-card p-4\">\n  Edit HTML here\n</div>",
    css: "",
    js: "",
  };
}

function getDraftStorageKey(demoId: string): string {
  return `web-animation-admin-draft:${demoId}`;
}

export function toDemoDraft(demo: DemoRecord): DemoDraft {
  const files = emptyFileMap();
  const editableKinds = new Set(FILE_KIND_ORDER);

  for (const file of demo.files) {
    if (editableKinds.has(file.fileKind as DemoFileKind)) {
      files[file.fileKind as DemoFileKind] = file.content;
    }
  }

  return {
    categoryId: demo.categoryId,
    title: demo.title,
    slug: demo.slug,
    description: demo.description,
    difficulty: demo.difficulty ?? "",
    support: demo.support ?? "",
    files,
  };
}

function normalizeDraft(input: DemoDraft): DemoDraft {
  const normalizedFiles = emptyFileMap();
  for (const kind of FILE_KIND_ORDER) {
    normalizedFiles[kind] = input.files[kind] ?? "";
  }

  return {
    categoryId: input.categoryId,
    title: input.title,
    slug: input.slug,
    description: input.description,
    difficulty: input.difficulty,
    support: input.support,
    files: normalizedFiles,
  };
}

export function serializeDraft(input: DemoDraft): string {
  const normalized = normalizeDraft(input);
  return JSON.stringify({
    categoryId: normalized.categoryId,
    title: normalized.title,
    slug: normalized.slug,
    description: normalized.description,
    difficulty: normalized.difficulty,
    support: normalized.support,
    files: FILE_KIND_ORDER.map((kind) => [kind, normalized.files[kind]]),
  });
}

export function draftToPublishBody(draft: DemoDraft) {
  const normalized = normalizeDraft(draft);

  return {
    categoryId: normalized.categoryId,
    title: normalized.title.trim(),
    slug: normalized.slug.trim(),
    description: normalized.description,
    difficulty: normalized.difficulty.trim() || null,
    support: normalized.support.trim() || null,
    files: FILE_KIND_ORDER.map((fileKind) => ({
      fileKind,
      content: normalized.files[fileKind],
    })),
  };
}

export function readDraftFromStorage(demoId: string): DemoDraft | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(getDraftStorageKey(demoId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;

    const value = parsed as Record<string, unknown>;
    const base = {
      categoryId: String(value.categoryId ?? ""),
      title: String(value.title ?? ""),
      slug: String(value.slug ?? ""),
      description: String(value.description ?? ""),
      difficulty: String(value.difficulty ?? ""),
      support: String(value.support ?? ""),
    };

    const filesValue = value.files;
    if (Array.isArray(filesValue)) {
      const normalizedFiles = emptyFileMap();
      for (const pair of filesValue) {
        if (!Array.isArray(pair) || pair.length !== 2) continue;
        const [kind, content] = pair;
        if (
          typeof kind === "string" &&
          FILE_KIND_ORDER.includes(kind as DemoFileKind)
        ) {
          normalizedFiles[kind as DemoFileKind] = String(content ?? "");
        }
      }

      return normalizeDraft({
        ...base,
        files: normalizedFiles,
      });
    }

    if (filesValue && typeof filesValue === "object") {
      const fileObject = filesValue as Record<string, unknown>;
      const normalizedFiles = emptyFileMap();
      for (const kind of FILE_KIND_ORDER) {
        normalizedFiles[kind] = String(fileObject[kind] ?? "");
      }

      return normalizeDraft({
        ...base,
        files: normalizedFiles,
      });
    }

    return null;
  } catch {
    return null;
  }
}

export function writeDraftToStorage(demoId: string, draft: DemoDraft): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    getDraftStorageKey(demoId),
    JSON.stringify(normalizeDraft(draft)),
  );
}

export function clearDraftFromStorage(demoId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getDraftStorageKey(demoId));
}
