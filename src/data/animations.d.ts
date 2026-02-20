import type { ReactNode } from "react";
export type AnimationCategoryId = "hover" | "entrance" | "loading" | "text" | "complex";
export type AnimationDifficulty = "Basic" | "Intermediate" | "Advanced";
export type CategoryIconName = "pointer" | "spark" | "loader" | "type" | "layers";
export interface AnimationDemo {
    id: string;
    title: string;
    description: string;
    category: AnimationCategoryId;
    difficulty: AnimationDifficulty;
    tags: string[];
    code: string;
    preview: (() => ReactNode) | null;
}
export interface AnimationCategory {
    id: AnimationCategoryId;
    label: string;
    icon: CategoryIconName;
    description: string;
}
export declare const animationCategories: AnimationCategory[];
export declare const animationDemos: AnimationDemo[];
export declare const animationDemoMetaById: Map<string, AnimationDemo>;
export declare const demoCategoryById: Map<string, AnimationCategoryId>;
export declare const categoryCounts: Map<AnimationCategoryId, number>;
