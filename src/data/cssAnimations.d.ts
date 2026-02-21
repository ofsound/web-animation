import { type DemoDefinition } from "../cssDemos/demos/catalog";
import type { CategoryIconName } from "./animations";
export type CssAnimationCategoryId = `css-${string}`;
export interface CssAnimationCategory {
    id: CssAnimationCategoryId;
    label: string;
    icon: CategoryIconName;
    description: string;
    sourceCategoryId: string;
}
export interface CssAnimationDemo {
    id: string;
    title: string;
    description: string;
    code: string;
    category: CssAnimationCategoryId;
    sourceCategoryId: string;
    component: DemoDefinition["Component"];
}
export declare const cssAnimationCategories: CssAnimationCategory[];
export declare const cssAnimationDemos: CssAnimationDemo[];
export declare const cssAnimationDemoMetaById: Map<string, {
    title: string;
    description: string;
    code: string;
}>;
export declare const cssDemoCategoryById: Map<string, `css-${string}`>;
export declare const cssCategoryCounts: Map<`css-${string}`, number>;
export declare const cssDemosByCategory: Map<`css-${string}`, CssAnimationDemo[]>;
