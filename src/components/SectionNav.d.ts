import type { CategoryIconName } from "../types/demo";
import type { Theme } from "../theme-init";
interface NavCategory {
    id: string;
    label: string;
    icon: CategoryIconName;
}
interface SectionNavProps {
    categories: NavCategory[];
    activeSection: string;
    onSelect: (id: string) => void;
    theme: Theme;
    onToggleTheme: () => void;
}
export declare function SectionNav({ categories, activeSection, onSelect, theme, onToggleTheme, }: SectionNavProps): import("react/jsx-runtime").JSX.Element;
interface MobileJumpBarProps {
    categories: NavCategory[];
    activeSection: string;
    onSelect: (id: string) => void;
}
export declare function MobileJumpBar({ categories, activeSection, onSelect }: MobileJumpBarProps): import("react/jsx-runtime").JSX.Element;
export {};
