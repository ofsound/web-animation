import { type ReactNode } from "react";
interface SectionCategory {
    id: string;
    label: string;
}
interface CategorySectionProps {
    category: SectionCategory;
    count: number;
    eager?: boolean;
    children: ReactNode;
}
export declare function CategorySection({ category, count, eager, children, }: CategorySectionProps): import("react/jsx-runtime").JSX.Element;
export {};
