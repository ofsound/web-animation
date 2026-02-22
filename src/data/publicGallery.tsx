import type { ComponentType } from "react";
import { IsolatedDemoFrame, type IsolatedDemoFiles } from "../components/IsolatedDemoFrame";
import { toLiveDatabaseCode } from "../lib/liveEditorUtils";
import type { Category, CategoryIconName, DemoDifficulty, SupportLevel } from "../types/demo";
import type { DemoEntry, GalleryDataRuntime, GalleryMode } from "./demoRegistry";

interface PublicCategoryRow {
  id: string;
  type: GalleryMode;
  slug: string;
  label: string;
  icon: string;
  description: string;
  sortOrder: number;
}

interface PublicDemoFileRow {
  demoId: string;
  fileKind: "html" | "css" | "js" | "tailwind_css";
  content: string;
  sortOrder: number;
}

interface PublicDemoRow {
  id: string;
  source: GalleryMode;
  categoryId: string;
  slug: string;
  title: string;
  description: string;
  status: "published";
  difficulty: string | null;
  support: string | null;
  sortOrder: number;
  files: PublicDemoFileRow[];
}

interface PublicGalleryResponse {
  categories: PublicCategoryRow[];
  demos: PublicDemoRow[];
}

const ICON_NAMES = new Set<CategoryIconName>([
  "pointer",
  "spark",
  "loader",
  "type",
  "layers",
]);

const DIFFICULTY_NAMES = new Set<DemoDifficulty>([
  "Basic",
  "Intermediate",
  "Advanced",
]);

const SUPPORT_NAMES = new Set<SupportLevel>([
  "widely-available",
  "baseline-2024",
  "new-2025",
  "experimental",
]);

function toCategoryIconName(input: string): CategoryIconName {
  return ICON_NAMES.has(input as CategoryIconName)
    ? (input as CategoryIconName)
    : "layers";
}

function toDifficulty(input: string | null): DemoDifficulty | undefined {
  if (!input) return undefined;
  return DIFFICULTY_NAMES.has(input as DemoDifficulty)
    ? (input as DemoDifficulty)
    : undefined;
}

function toSupport(input: string | null): SupportLevel | undefined {
  if (!input) return undefined;
  return SUPPORT_NAMES.has(input as SupportLevel)
    ? (input as SupportLevel)
    : undefined;
}

function toIsolatedFiles(files: PublicDemoFileRow[]): IsolatedDemoFiles {
  const bundle: IsolatedDemoFiles = {
    html: "",
    css: "",
    js: "",
    tailwindCss: "",
  };

  for (const file of files) {
    switch (file.fileKind) {
      case "html":
        bundle.html = file.content;
        break;
      case "css":
        bundle.css = file.content;
        break;
      case "js":
        bundle.js = file.content;
        break;
      case "tailwind_css":
        bundle.tailwindCss = file.content;
        break;
      default:
        break;
    }
  }

  return bundle;
}

function toIsolatedComponent(files: IsolatedDemoFiles): ComponentType {
  return function IsolatedComponent() {
    return <IsolatedDemoFrame files={files} />;
  };
}

function getPublicGalleryUrl(): string {
  if (typeof window !== "undefined") {
    // Use a relative API path in browsers to avoid origin parsing edge cases.
    return "/api/public/gallery";
  }

  try {
    return new URL(
      "/api/public/gallery",
      import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8787",
    ).toString();
  } catch {
    return "http://localhost:8787/api/public/gallery";
  }
}

const GALLERY_FETCH_TIMEOUT_MS = 15_000;

export async function fetchPublicGallery(): Promise<PublicGalleryResponse> {
  if (import.meta.env.MODE === "test") {
    return { categories: [], demos: [] };
  }

  const response = await fetch(getPublicGalleryUrl(), {
    credentials: "omit",
    signal: AbortSignal.timeout(GALLERY_FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Failed to load public gallery (${response.status}).`);
  }

  return (await response.json()) as PublicGalleryResponse;
}

export function toGalleryDataByMode(
  payload: PublicGalleryResponse,
): Record<GalleryMode, GalleryDataRuntime> {
  const categoryById = new Map<string, PublicCategoryRow>();
  const categoriesByMode: Record<GalleryMode, Category[]> = {
    tailwind: [],
    css: [],
  };

  for (const category of payload.categories) {
    categoryById.set(category.id, category);
    categoriesByMode[category.type].push({
      id: category.id,
      label: category.label,
      icon: toCategoryIconName(category.icon),
      description: category.description,
    });
  }

  const demosByModeAndCategory: Record<GalleryMode, Map<string, DemoEntry[]>> = {
    tailwind: new Map(),
    css: new Map(),
  };
  const demoCategoryByIdByMode: Record<GalleryMode, Map<string, string>> = {
    tailwind: new Map(),
    css: new Map(),
  };

  for (const mode of ["tailwind", "css"] as const) {
    for (const category of categoriesByMode[mode]) {
      demosByModeAndCategory[mode].set(category.id, []);
    }
  }

  const sortedDemos = payload.demos.slice().sort((a, b) => {
    if (a.source !== b.source) return a.source.localeCompare(b.source);
    if (a.categoryId !== b.categoryId) return a.categoryId.localeCompare(b.categoryId);
    return a.sortOrder - b.sortOrder;
  });

  for (const demo of sortedDemos) {
    const category = categoryById.get(demo.categoryId);
    if (!category) continue;

    const mode = category.type;
    if (!demosByModeAndCategory[mode].has(category.id)) {
      demosByModeAndCategory[mode].set(category.id, []);
    }

    const files = toIsolatedFiles(demo.files);
    const entry: DemoEntry = {
      id: demo.id,
      categoryId: category.id,
      title: demo.title,
      description: demo.description,
      code: toLiveDatabaseCode(files),
      Component: toIsolatedComponent(files),
      source: "database",
      difficulty: toDifficulty(demo.difficulty),
      support: toSupport(demo.support),
    };

    demosByModeAndCategory[mode].get(category.id)?.push(entry);
    demoCategoryByIdByMode[mode].set(demo.id, category.id);
  }

  const dataByMode: Record<GalleryMode, GalleryDataRuntime> = {
    tailwind: {
      categories: categoriesByMode.tailwind,
      demosByCategory: demosByModeAndCategory.tailwind,
      demoCategoryById: demoCategoryByIdByMode.tailwind,
      categoryCounts: new Map(),
    },
    css: {
      categories: categoriesByMode.css,
      demosByCategory: demosByModeAndCategory.css,
      demoCategoryById: demoCategoryByIdByMode.css,
      categoryCounts: new Map(),
    },
  };

  for (const mode of ["tailwind", "css"] as const) {
    const counts = new Map<string, number>();
    for (const category of dataByMode[mode].categories) {
      counts.set(category.id, dataByMode[mode].demosByCategory.get(category.id)?.length ?? 0);
    }
    dataByMode[mode].categoryCounts = counts;
  }

  return dataByMode;
}
