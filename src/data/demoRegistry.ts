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

const sectionIdsByMode: Record<GalleryMode, Set<string>> = {
  tailwind: new Set(tailwindCategories.map((category) => category.id)),
  css: new Set(cssAnimationCategories.map((category) => category.id)),
};

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

assertNoDuplicateDemoIdsByMode({
  tailwind: tailwindDemoCategoryById,
  css: cssDemoCategoryById,
});

export function getGalleryData(mode: "tailwind"): TailwindGalleryData;
export function getGalleryData(mode: "css"): CssGalleryData;
export function getGalleryData(mode: GalleryMode): AnyGalleryData;
export function getGalleryData(mode: GalleryMode): AnyGalleryData {
  return mode === "tailwind" ? tailwindGalleryData : cssGalleryData;
}

export function resolveHashToModeAndTarget(hash: string): {
  mode: GalleryMode;
  targetId: string;
} | null {
  if (!hash) return null;

  if (sectionIdsByMode.tailwind.has(hash)) {
    return { mode: "tailwind", targetId: hash };
  }
  if (tailwindDemoCategoryById.has(hash)) {
    return { mode: "tailwind", targetId: hash };
  }
  if (sectionIdsByMode.css.has(hash)) {
    return { mode: "css", targetId: hash };
  }
  if (cssDemoCategoryById.has(hash)) {
    return { mode: "css", targetId: hash };
  }
  return null;
}
