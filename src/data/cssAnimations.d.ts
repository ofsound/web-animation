import type { Category, Demo } from "../types/demo";
export type CssAnimationCategoryId = `css-${string}`;
export interface CssAnimationCategory extends Category {
    id: CssAnimationCategoryId;
    sourceCategoryId: string;
}
export interface CssAnimationDemo extends Demo<CssAnimationCategoryId, "css"> {
    sourceCategoryId: string;
}
export declare const cssAnimationCategories: CssAnimationCategory[];
export declare const cssAnimationDemos: CssAnimationDemo[];
export declare const cssAnimationDemoMetaById: Map<string, {
    title: string;
    description: string;
    code: string;
}>;
export declare const cssDemosByCategory: Map<`css-${string}`, CssAnimationDemo[]>;
export declare const cssDemoCategoryById: Map<string, `css-${string}`>;
export declare const cssCategoryCounts: Map<`css-${string}`, number>;
