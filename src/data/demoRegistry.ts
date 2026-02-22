import type { Category, Demo } from "../types/demo";
import type { CssAnimationCategoryId, CssAnimationDemo } from "./cssAnimations";
import {
  cssAnimationCategories,
  cssCategoryCounts,
  cssDemoCategoryById,
  cssDemosByCategory,
} from "./cssAnimations";
import type { AnimationCategoryId } from "./animations";
import {
  tailwindCategories,
  tailwindCategoryCounts,
  tailwindDemoCategoryById,
  tailwindDemosByCategory,
  type TailwindDemo,
} from "../tailwindDemos/demos/catalog";

export type GalleryMode = "tailwind" | "css";
export type LegacyHashRoute =
  | {
      kind: "demo";
      mode: GalleryMode;
      demoId: string;
      path: string;
    }
  | {
      kind: "section";
      mode: GalleryMode;
      sectionId: string;
      path: string;
    };

export type DemoEntry = Demo;

interface GalleryData<
  TCategoryId extends string = string,
  TDemo extends Demo<TCategoryId> = Demo<TCategoryId>,
> {
  categories: Category<TCategoryId>[];
  demosByCategory: Map<TCategoryId, TDemo[]>;
  demoCategoryById: Map<string, TCategoryId>;
  categoryCounts: Map<TCategoryId, number>;
}

type TailwindGalleryData = GalleryData<AnimationCategoryId, TailwindDemo>;
type CssGalleryData = GalleryData<CssAnimationCategoryId, CssAnimationDemo>;
type AnyGalleryData = TailwindGalleryData | CssGalleryData;

export interface GalleryDataRuntime {
  categories: Category[];
  demosByCategory: ReadonlyMap<string, DemoEntry[]>;
  demoCategoryById: ReadonlyMap<string, string>;
  categoryCounts: ReadonlyMap<string, number>;
}

export interface GalleryRegistry {
  getGalleryData: (mode: GalleryMode) => GalleryDataRuntime;
  resolveDemoFromRoute: (
    mode: GalleryMode,
    slug: string,
  ) => { demoId: string; canonicalSlug: string } | null;
  getDemoRoutePath: (mode: GalleryMode, demoId: string) => string;
  resolveHashToModeAndTarget: (
    hash: string,
  ) => { mode: GalleryMode; targetId: string } | null;
  resolveLegacyHashToRoute: (hash: string) => LegacyHashRoute | null;
}

const tailwindGalleryData: TailwindGalleryData = {
  categories: tailwindCategories,
  demosByCategory: tailwindDemosByCategory,
  demoCategoryById: tailwindDemoCategoryById,
  categoryCounts: tailwindCategoryCounts,
};

const cssGalleryData: CssGalleryData = {
  categories: cssAnimationCategories,
  demosByCategory: cssDemosByCategory,
  demoCategoryById: cssDemoCategoryById,
  categoryCounts: cssCategoryCounts,
};

function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base || "demo";
}

export function toDemoRouteSlug(title: string, demoId: string): string {
  return `${slugifyTitle(title)}~${demoId}`;
}

export function assertNoDuplicateDemoIdsByMode(
  demoCategoryMaps: Record<GalleryMode, ReadonlyMap<string, string>>,
): void {
  const seen = new Map<string, GalleryMode>();

  for (const [mode, demoCategoryMap] of Object.entries(demoCategoryMaps) as [
    GalleryMode,
    ReadonlyMap<string, string>,
  ][]) {
    for (const demoId of demoCategoryMap.keys()) {
      const existingMode = seen.get(demoId);
      if (existingMode) {
        throw new Error(
          `Duplicate demo id "${demoId}" found in both "${existingMode}" and "${mode}" galleries.`,
        );
      }
      seen.set(demoId, mode);
    }
  }
}

export function createGalleryRegistry(
  dataByMode: Record<GalleryMode, GalleryDataRuntime>,
): GalleryRegistry {
  const sectionIdsByMode: Record<GalleryMode, Set<string>> = {
    tailwind: new Set(dataByMode.tailwind.categories.map((category) => category.id)),
    css: new Set(dataByMode.css.categories.map((category) => category.id)),
  };

  const demoCategoryByIdByMode: Record<GalleryMode, ReadonlyMap<string, string>> = {
    tailwind: dataByMode.tailwind.demoCategoryById,
    css: dataByMode.css.demoCategoryById,
  };

  assertNoDuplicateDemoIdsByMode(demoCategoryByIdByMode);

  const demoModeById = new Map<string, GalleryMode>();
  const demoTitleByMode: Record<GalleryMode, Map<string, string>> = {
    tailwind: new Map(),
    css: new Map(),
  };

  for (const mode of ["tailwind", "css"] as const) {
    for (const category of dataByMode[mode].categories) {
      const demos = dataByMode[mode].demosByCategory.get(category.id) ?? [];
      for (const demo of demos) {
        demoModeById.set(demo.id, mode);
        demoTitleByMode[mode].set(demo.id, demo.title);
      }
    }
  }

  const getDemoRoutePath = (mode: GalleryMode, demoId: string): string => {
    const title = demoTitleByMode[mode].get(demoId);
    if (!title) {
      return `/${mode}`;
    }

    return `/${mode}/${toDemoRouteSlug(title, demoId)}`;
  };

  const resolveHashToModeAndTarget = (
    hash: string,
  ): { mode: GalleryMode; targetId: string } | null => {
    if (!hash) return null;

    if (sectionIdsByMode.tailwind.has(hash)) {
      return { mode: "tailwind", targetId: hash };
    }
    if (demoCategoryByIdByMode.tailwind.has(hash)) {
      return { mode: "tailwind", targetId: hash };
    }
    if (sectionIdsByMode.css.has(hash)) {
      return { mode: "css", targetId: hash };
    }
    if (demoCategoryByIdByMode.css.has(hash)) {
      return { mode: "css", targetId: hash };
    }
    return null;
  };

  return {
    getGalleryData: (mode: GalleryMode) => dataByMode[mode],
    resolveDemoFromRoute: (mode: GalleryMode, slug: string) => {
      if (!slug) return null;

      const separatorIndex = slug.lastIndexOf("~");
      if (separatorIndex <= 0 || separatorIndex >= slug.length - 1) return null;

      const demoId = slug.slice(separatorIndex + 1);
      if (demoModeById.get(demoId) !== mode) return null;

      const title = demoTitleByMode[mode].get(demoId);
      if (!title) return null;

      return {
        demoId,
        canonicalSlug: toDemoRouteSlug(title, demoId),
      };
    },
    getDemoRoutePath,
    resolveHashToModeAndTarget,
    resolveLegacyHashToRoute: (hash: string) => {
      const resolved = resolveHashToModeAndTarget(hash);
      if (!resolved) return null;

      const { mode, targetId } = resolved;
      if (sectionIdsByMode[mode].has(targetId)) {
        return {
          kind: "section",
          mode,
          sectionId: targetId,
          path: `/${mode}`,
        };
      }

      if (demoCategoryByIdByMode[mode].has(targetId)) {
        return {
          kind: "demo",
          mode,
          demoId: targetId,
          path: getDemoRoutePath(mode, targetId),
        };
      }

      return null;
    },
  };
}

const staticGalleryDataByMode: Record<GalleryMode, GalleryDataRuntime> = {
  tailwind: {
    categories: tailwindGalleryData.categories,
    demosByCategory: tailwindGalleryData.demosByCategory,
    demoCategoryById: tailwindGalleryData.demoCategoryById,
    categoryCounts: tailwindGalleryData.categoryCounts,
  },
  css: {
    categories: cssGalleryData.categories,
    demosByCategory: cssGalleryData.demosByCategory,
    demoCategoryById: cssGalleryData.demoCategoryById,
    categoryCounts: cssGalleryData.categoryCounts,
  },
};

const staticGalleryRegistry = createGalleryRegistry(staticGalleryDataByMode);

export function getGalleryData(mode: "tailwind"): TailwindGalleryData;
export function getGalleryData(mode: "css"): CssGalleryData;
export function getGalleryData(mode: GalleryMode): AnyGalleryData;
export function getGalleryData(mode: GalleryMode): AnyGalleryData {
  return mode === "tailwind" ? tailwindGalleryData : cssGalleryData;
}

export function resolveDemoFromRoute(
  mode: GalleryMode,
  slug: string,
): { demoId: string; canonicalSlug: string } | null {
  return staticGalleryRegistry.resolveDemoFromRoute(mode, slug);
}

export function getDemoRoutePath(mode: GalleryMode, demoId: string): string {
  return staticGalleryRegistry.getDemoRoutePath(mode, demoId);
}

export function resolveHashToModeAndTarget(hash: string): {
  mode: GalleryMode;
  targetId: string;
} | null {
  return staticGalleryRegistry.resolveHashToModeAndTarget(hash);
}

export function resolveLegacyHashToRoute(hash: string): LegacyHashRoute | null {
  return staticGalleryRegistry.resolveLegacyHashToRoute(hash);
}
