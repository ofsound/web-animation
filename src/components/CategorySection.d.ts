import { type ReactNode } from "react";
import type { AnimationCategory } from "../data/animations";
interface CategorySectionProps {
    category: AnimationCategory;
    count: number;
    eager?: boolean;
    children: ReactNode;
}
export declare function CategorySection({ category, count, eager, children, }: CategorySectionProps): import("react/jsx-runtime").JSX.Element;
export {};
