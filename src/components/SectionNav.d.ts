import type { AnimationCategory } from "../data/animations";
import type { Theme } from "../theme-init";
interface SectionNavProps {
    categories: AnimationCategory[];
    activeSection: string;
    onSelect: (id: string) => void;
    theme: Theme;
    onToggleTheme: () => void;
}
export declare function SectionNav({ categories, activeSection, onSelect, theme, onToggleTheme, }: SectionNavProps): import("react/jsx-runtime").JSX.Element;
interface MobileJumpBarProps {
    categories: AnimationCategory[];
    activeSection: string;
    onSelect: (id: string) => void;
}
export declare function MobileJumpBar({ categories, activeSection, onSelect }: MobileJumpBarProps): import("react/jsx-runtime").JSX.Element;
export {};
