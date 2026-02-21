import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import { CssCategory } from "./categories/CssCategory";
import { ComplexKeyframes } from "./categories/ComplexKeyframes";
import { EntranceEffects } from "./categories/EntranceEffects";
import { HoverInteractions } from "./categories/HoverInteractions";
import { LoadingStates } from "./categories/LoadingStates";
import { TextAnimations } from "./categories/TextAnimations";
import { CategorySection } from "./components/CategorySection";
import { MobileJumpBar, SectionNav } from "./components/SectionNav";
import {
  cssAnimationCategories,
  cssCategoryCounts,
  cssDemoCategoryById,
  cssDemosByCategory,
  type CssAnimationCategoryId,
} from "./data/cssAnimations";
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

type GalleryMode = "tailwind" | "css";

/** Time to wait for section scroll before scrolling to demo; matches typical scroll duration. */
const SCROLL_DURATION_MS = 520;

function App() {
  const [galleryMode, setGalleryMode] = useState<GalleryMode>("tailwind");
  const { theme, toggleTheme } = useTheme();
  const sectionIds = useMemo(
    () =>
      galleryMode === "tailwind"
        ? animationCategories.map((category) => category.id)
        : cssAnimationCategories.map((category) => category.id),
    [galleryMode],
  );
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

  const openDemo = useCallback(
    (demoId: string, mode: GalleryMode, shouldUpdateHash = true) => {
      const categoryId =
        mode === "tailwind"
          ? demoCategoryById.get(demoId)
          : cssDemoCategoryById.get(demoId);
      if (!categoryId) return;

      scrollToSection(categoryId, false);

      window.setTimeout(() => {
        const demo = document.getElementById(demoId);
        demo?.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });

        if (shouldUpdateHash) {
          window.history.replaceState(null, "", `#${demoId}`);
        }
      }, SCROLL_DURATION_MS);
    },
    [scrollToSection],
  );

  useEffect(() => {
    const tailwindSectionIds = animationCategories.map(
      (category) => category.id,
    );
    const cssSectionIds = cssAnimationCategories.map((category) => category.id);

    const handleHashNavigation = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;

      if (tailwindSectionIds.includes(hash as AnimationCategoryId)) {
        setGalleryMode("tailwind");
        window.setTimeout(() => scrollToSection(hash, false), 0);
        return;
      }

      if (demoCategoryById.has(hash)) {
        setGalleryMode("tailwind");
        window.setTimeout(() => openDemo(hash, "tailwind", false), 0);
        return;
      }

      if (cssSectionIds.includes(hash as CssAnimationCategoryId)) {
        setGalleryMode("css");
        window.setTimeout(() => scrollToSection(hash, false), 0);
        return;
      }

      if (cssDemoCategoryById.has(hash)) {
        setGalleryMode("css");
        window.setTimeout(() => openDemo(hash, "css", false), 0);
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
            <h1 className="text-lg leading-tight font-black tracking-[-0.02em] text-balance text-[var(--text-1)] sm:text-xl">
              Web Animation
            </h1>
            <p
              className="mt-0.5 font-mono text-[11px] tracking-wide text-[var(--text-2)]"
              data-source-file="src/App.tsx"
              data-source-line="98"
            >
              Feb 2026 - Tailwind + Native CSS
            </p>
          </div>

          <SectionNav
            categories={
              galleryMode === "tailwind"
                ? animationCategories
                : cssAnimationCategories
            }
            activeSection={activeSection}
            onSelect={scrollToSection}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </div>

        <div className="mx-auto flex max-w-7xl items-center gap-2 px-5 pb-3 sm:px-6">
          <button
            onClick={() => setGalleryMode("tailwind")}
            className={`rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-wide transition ${
              galleryMode === "tailwind"
                ? "border-[var(--brand)] bg-[color-mix(in_oklab,var(--brand)_16%,transparent)] text-[var(--text-1)]"
                : "border-[var(--card-border)] bg-[var(--surface-2)] text-[var(--text-2)] hover:border-[var(--brand)] hover:text-[var(--text-1)]"
            }`}
          >
            Tailwind Demos
          </button>
          <button
            onClick={() => setGalleryMode("css")}
            className={`rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-wide transition ${
              galleryMode === "css"
                ? "border-[var(--brand)] bg-[color-mix(in_oklab,var(--brand)_16%,transparent)] text-[var(--text-1)]"
                : "border-[var(--card-border)] bg-[var(--surface-2)] text-[var(--text-2)] hover:border-[var(--brand)] hover:text-[var(--text-1)]"
            }`}
          >
            CSS Demos
          </button>
        </div>
      </header>

      <MobileJumpBar
        categories={
          galleryMode === "tailwind"
            ? animationCategories
            : cssAnimationCategories
        }
        activeSection={activeSection}
        onSelect={scrollToSection}
      />

      <main className="relative mx-auto max-w-7xl bg-[var(--surface-main)] px-5 pb-24 sm:px-6">
        {galleryMode === "tailwind" ? (
          <div className="space-y-7 pt-10 sm:space-y-10">
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
        ) : (
          <div className="space-y-7 pt-10 sm:space-y-10">
            {cssAnimationCategories.map((category, index) => {
              const demos = cssDemosByCategory.get(category.id) ?? [];

              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  count={cssCategoryCounts.get(category.id) ?? 0}
                  eager={index === 0}
                >
                  <CssCategory demos={demos} />
                </CategorySection>
              );
            })}
          </div>
        )}
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
