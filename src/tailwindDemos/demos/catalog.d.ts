import { type AnimationCategoryId } from "../../data/animations";
import type { Demo } from "../../types/demo";
export type TailwindDemo = Demo<AnimationCategoryId, "tailwind">;
export declare const tailwindDemos: TailwindDemo[];
export declare const tailwindCategories: import("../../data/animations").AnimationCategory[];
export declare const tailwindDemosByCategory: Map<AnimationCategoryId, TailwindDemo[]>;
export declare const tailwindDemoCategoryById: Map<string, AnimationCategoryId>;
export declare const tailwindCategoryCounts: Map<AnimationCategoryId, number>;
