import { useCallback, useEffect, type ComponentType } from "react";
import { ComplexKeyframes } from "./categories/ComplexKeyframes";
import { EntranceEffects } from "./categories/EntranceEffects";
import { HoverInteractions } from "./categories/HoverInteractions";
import { LoadingStates } from "./categories/LoadingStates";
import { TextAnimations } from "./categories/TextAnimations";
import { CategorySection } from "./components/CategorySection";
import { MobileJumpBar, SectionNav } from "./components/SectionNav";
import {
  animationCategories,
  categoryCounts,
  demoCategoryById,
  type AnimationCategoryId,
} from "./data/animations";
import { useActiveSection } from "./hooks/useActiveSection";
import { useTheme } from "./hooks/useTheme";

const categoryComponents: Record<AnimationCategoryId, ComponentType> = {
  hover: HoverInteractions,
  entrance: EntranceEffects,
  loading: LoadingStates,
  text: TextAnimations,
  complex: ComplexKeyframes,
};

const sectionIds = animationCategories.map((category) => category.id);

/** Time to wait for section scroll before scrolling to demo; matches typical scroll duration. */
const SCROLL_DURATION_MS = 520;

function App() {
  const { theme, toggleTheme } = useTheme();
  const activeSection = useActiveSection(sectionIds);

  const getScrollBehavior = () => {
    if (typeof window === "undefined") return "auto";
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
  };

  const scrollToSection = useCallback((id: string, shouldUpdateHash = true) => {
    const section = document.getElementById(id);
    if (!section) return;

    section.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });

    if (shouldUpdateHash) {
      window.history.replaceState(null, "", `#${id}`);
    }
  }, []);

  const openDemo = useCallback((demoId: string, shouldUpdateHash = true) => {
    const categoryId = demoCategoryById.get(demoId);
    if (!categoryId) return;

    scrollToSection(categoryId, false);

    window.setTimeout(() => {
      const demo = document.getElementById(demoId);
      demo?.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });

      if (shouldUpdateHash) {
        window.history.replaceState(null, "", `#${demoId}`);
      }
    }, SCROLL_DURATION_MS);
  }, [scrollToSection]);

  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;

      if (sectionIds.includes(hash as AnimationCategoryId)) {
        scrollToSection(hash, false);
        return;
      }

      if (demoCategoryById.has(hash)) {
        openDemo(hash, false);
      }
    };

    handleHashNavigation();
    window.addEventListener("hashchange", handleHashNavigation);

    return () => window.removeEventListener("hashchange", handleHashNavigation);
  }, [openDemo, scrollToSection]);

  return (
    <div className="min-h-screen text-[var(--text-1)]">
      <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[color-mix(in_oklab,var(--surface-1)_86%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <div>
            <h1 className="text-balance text-lg leading-tight font-black tracking-[-0.02em] text-[var(--text-1)] sm:text-xl">
              Tailwind Animation Editorial Gallery
            </h1>
            <p className="mt-0.5 font-mono text-[11px] tracking-wide text-[var(--text-2)]">
              50 demos · React 19 · Tailwind v4
            </p>
          </div>

          <SectionNav
            categories={animationCategories}
            activeSection={activeSection}
            onSelect={scrollToSection}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </div>
      </header>

      <MobileJumpBar
        categories={animationCategories}
        activeSection={activeSection}
        onSelect={scrollToSection}
      />

      <main className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-6">
        <div className="pt-10 space-y-7 sm:space-y-10">
          {animationCategories.map((category, index) => {
            const SectionComponent = categoryComponents[category.id];

            return (
              <CategorySection
                key={category.id}
                category={category}
                count={categoryCounts.get(category.id) ?? 0}
                eager={index === 0}
              >
                <SectionComponent />
              </CategorySection>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-[var(--card-border)] py-8 text-center">
        <p className="font-mono text-xs tracking-wide text-[var(--text-3)]">
          Built for frontend developers · Motion-aware and deep-linkable
        </p>
      </footer>
    </div>
  );
}

export default App;
