import type { AnimationCategory, Theme } from "../data/animations";
import { CategoryIcon } from "./CategoryIcon";

interface SectionNavProps {
  categories: AnimationCategory[];
  activeSection: string;
  onSelect: (id: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function SectionNav({
  categories,
  activeSection,
  onSelect,
  theme,
  onToggleTheme,
}: SectionNavProps) {
  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Section navigation">
        {categories.map((category) => {
          const isActive = activeSection === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-wide transition-all ${
                isActive
                  ? "border-[var(--brand)] bg-[color-mix(in_oklab,var(--brand)_16%,transparent)] text-[var(--text-1)]"
                  : "border-[var(--card-border)] bg-transparent text-[var(--text-2)] hover:border-[color-mix(in_oklab,var(--brand)_45%,var(--card-border))] hover:text-[var(--text-1)]"
              }`}
              aria-current={isActive ? "true" : undefined}
            >
              <CategoryIcon icon={category.icon} className="size-3.5" />
              {category.label}
            </button>
          );
        })}
      </nav>

      <button
        onClick={onToggleTheme}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--surface-2)] px-3 py-1.5 font-mono text-[11px] tracking-wide text-[var(--text-2)] transition hover:border-[var(--brand)] hover:text-[var(--text-1)]"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      >
        {theme === "dark" ? "☀ Light" : "☾ Dark"}
      </button>
    </>
  );
}

interface MobileJumpBarProps {
  categories: AnimationCategory[];
  activeSection: string;
  onSelect: (id: string) => void;
}

export function MobileJumpBar({ categories, activeSection, onSelect }: MobileJumpBarProps) {
  return (
    <div className="sticky top-[73px] z-40 border-b border-[var(--card-border)] bg-[color-mix(in_oklab,var(--surface-1)_88%,transparent)] px-4 py-2 backdrop-blur-md lg:hidden">
      <nav className="no-scrollbar flex gap-2 overflow-x-auto" aria-label="Mobile section jump navigation">
        {categories.map((category) => {
          const isActive = activeSection === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 font-mono text-[11px] transition ${
                isActive
                  ? "border-[var(--brand)] bg-[color-mix(in_oklab,var(--brand)_18%,transparent)] text-[var(--text-1)]"
                  : "border-[var(--card-border)] bg-[var(--surface-2)] text-[var(--text-2)]"
              }`}
              aria-current={isActive ? "true" : undefined}
            >
              {category.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
