import { CategoryIcon } from "./CategoryIcon";
import type { Category } from "../types/demo";
import type { GalleryMode } from "../data/demoRegistry";

interface SidebarProps {
  categories: Category[];
  activeSection: string;
  effectiveGalleryMode: GalleryMode;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onModeChange: (mode: GalleryMode) => void;
  onSectionClick: (sectionId: string) => void;
  onCloseMaximized: () => void;
}

export function Sidebar({
  categories,
  activeSection,
  effectiveGalleryMode,
  theme,
  onToggleTheme,
  onModeChange,
  onSectionClick,
  onCloseMaximized,
}: SidebarProps) {
  return (
    <aside className="border-shell-sidebar-border bg-shell-sidebar-bg fixed inset-y-0 left-0 z-50 flex w-20 flex-col border-r backdrop-blur-xl sm:w-72">
      <div className="border-shell-sidebar-border border-b px-3 py-4 sm:px-5">
        <div>
          <h1 className="text-text-primary text-center text-base leading-tight font-black tracking-[-0.02em] text-balance sm:text-left sm:text-2xl">
            Web Animation
          </h1>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p
              className="text-text-secondary hidden font-mono text-base tracking-wide sm:block"
              data-source-file="src/components/Sidebar.tsx"
              data-source-line="38"
            >
              February 2026
            </p>
            <button
              onClick={onToggleTheme}
              className="border-button-neutral-border bg-button-neutral-bg text-text-secondary hover:border-button-neutral-border-hover hover:bg-button-neutral-bg-hover hover:text-text-primary inline-flex size-8 shrink-0 items-center justify-center rounded-lg border text-base transition"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </div>
        </div>
      </div>

      <div className="border-shell-sidebar-border border-b px-2 py-3 sm:px-4">
        <div
          className="border-button-neutral-border bg-menu-toggle-track relative flex rounded-lg border p-1"
          role="radiogroup"
          aria-label="Gallery mode"
        >
          <span
            className="bg-menu-toggle-indicator absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-md transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
            style={{
              transform:
                effectiveGalleryMode === "css"
                  ? "translateX(100%)"
                  : "translateX(0)",
            }}
            aria-hidden
          />
          {(["tailwind", "css"] as const).map((mode) => (
            <button
              key={mode}
              role="radio"
              aria-checked={effectiveGalleryMode === mode}
              onClick={() => onModeChange(mode)}
              className={`relative z-10 flex-1 rounded-md py-2.5 text-center text-sm font-bold tracking-wide transition-colors duration-200 ${
                effectiveGalleryMode === mode
                  ? "text-text-inverse"
                  : "text-text-tertiary hover:text-text-primary"
              }`}
            >
              {mode === "tailwind" ? (
                <>
                  <span className="sm:hidden">TW</span>
                  <span className="hidden sm:inline">Tailwind</span>
                </>
              ) : (
                "CSS"
              )}
            </button>
          ))}
        </div>
      </div>

      <nav
        className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-2 py-3 sm:px-3 sm:py-4"
        aria-label="Section navigation"
      >
        {categories.map((category) => {
          const isActive = activeSection === category.id;
          return (
            <button
              key={category.id}
              onClick={() => {
                onCloseMaximized();
                onSectionClick(category.id);
              }}
              className={`flex w-full items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-sm font-semibold tracking-wide transition-all sm:justify-start sm:px-3 ${
                isActive
                  ? "border-menu-item-border-active bg-menu-item-bg-active text-text-primary"
                  : "border-button-neutral-border text-text-secondary bg-transparent"
              }`}
              aria-current={isActive ? "true" : undefined}
            >
              <CategoryIcon icon={category.icon} className="size-3.5" />
              <span className="hidden truncate sm:inline">{category.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
