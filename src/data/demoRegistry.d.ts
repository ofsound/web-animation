import type { Category, Demo } from "../types/demo";
import type { CssAnimationCategoryId, CssAnimationDemo } from "./cssAnimations";
import type { AnimationCategoryId } from "./animations";
import { type TailwindDemo } from "../tailwindDemos/demos/catalog";
export type GalleryMode = "tailwind" | "css";
export type DemoEntry = Demo;
export interface GalleryData<TCategoryId extends string = string, TDemo extends Demo<TCategoryId> = Demo<TCategoryId>> {
    categories: Category<TCategoryId>[];
    demosByCategory: Map<TCategoryId, TDemo[]>;
    demoCategoryById: Map<string, TCategoryId>;
    categoryCounts: Map<TCategoryId, number>;
}
export type TailwindGalleryData = GalleryData<AnimationCategoryId, TailwindDemo>;
export type CssGalleryData = GalleryData<CssAnimationCategoryId, CssAnimationDemo>;
export type AnyGalleryData = TailwindGalleryData | CssGalleryData;
export declare function assertNoDuplicateDemoIdsByMode(demoCategoryMaps: Record<GalleryMode, ReadonlyMap<string, string>>): void;
export declare function getGalleryData(mode: "tailwind"): TailwindGalleryData;
export declare function getGalleryData(mode: "css"): CssGalleryData;
export declare function getGalleryData(mode: GalleryMode): AnyGalleryData;
export declare function resolveHashToModeAndTarget(hash: string): {
    mode: GalleryMode;
    targetId: string;
} | null;
