import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimationCard } from "./components/AnimationCard";
import { CategorySection } from "./components/CategorySection";
import { MobileJumpBar, SectionNav } from "./components/SectionNav";
import {
  getGalleryData,
  resolveHashToModeAndTarget,
  type DemoEntry,
  type GalleryMode,
} from "./data/demoRegistry";
import { useActiveSection } from "./hooks/useActiveSection";
import { useTheme } from "./hooks/useTheme";
import type { Category } from "./types/demo";

const MAX_DEMO_LOOKUP_FRAMES = 45;

type GalleryDataView = {
  categories: Category[];
  demosByCategory: ReadonlyMap<string, DemoEntry[]>;
  demoCategoryById: ReadonlyMap<string, string>;
  categoryCounts: ReadonlyMap<string, number>;
};

function App() {
  const [galleryMode, setGalleryMode] = useState<GalleryMode>("tailwind");
  const { theme, toggleTheme } = useTheme();
  const activeNavigationTokenRef = useRef(0);

  const galleryDataByMode = useMemo<Record<GalleryMode, GalleryDataView>>(
    () => ({
      tailwind: getGalleryData("tailwind"),
      css: getGalleryData("css"),
    }),
    [],
  );
  const { categories, demosByCategory, categoryCounts } = useMemo(
    () => galleryDataByMode[galleryMode],
    [galleryDataByMode, galleryMode],
  );

  const sectionIds = useMemo(
    () => categories.map((category) => category.id),
    [categories],
  );
  const activeSection = useActiveSection(sectionIds);

  const getScrollBehavior = () => {
    if (typeof window === "undefined") return "auto";
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
  };

  const nextNavigationToken = useCallback(() => {
    activeNavigationTokenRef.current += 1;
    return activeNavigationTokenRef.current;
  }, []);

  const isNavigationCurrent = useCallback(
    (token: number) => token === activeNavigationTokenRef.current,
    [],
  );

  const scrollToSectionWithToken = useCallback((
    id: string,
    token: number,
    shouldUpdateHash = true,
  ) => {
    if (!isNavigationCurrent(token)) return false;

    const section = document.getElementById(id);
    if (!section) return false;

    section.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });

    if (shouldUpdateHash) {
      window.history.replaceState(null, "", `#${id}`);
    }
    return true;
  }, [isNavigationCurrent]);

  const scrollToSection = useCallback((id: string, shouldUpdateHash = true) => {
    const token = nextNavigationToken();
    scrollToSectionWithToken(id, token, shouldUpdateHash);
  }, [nextNavigationToken, scrollToSectionWithToken]);

  const openDemo = useCallback(
    (
      demoId: string,
      mode: GalleryMode,
      shouldUpdateHash = true,
      navigationToken?: number,
    ) => {
      const data = galleryDataByMode[mode];
      const categoryId = data.demoCategoryById.get(demoId);
      if (!categoryId) return;

      const token = navigationToken ?? nextNavigationToken();
      scrollToSectionWithToken(categoryId, token, false);

      let frameCount = 0;
      const findDemoAndScroll = () => {
        if (!isNavigationCurrent(token)) return;

        const demo = document.getElementById(demoId);
        if (demo) {
          demo.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });

          if (shouldUpdateHash) {
            window.history.replaceState(null, "", `#${demoId}`);
          }
          return;
        }

        frameCount += 1;
        if (frameCount < MAX_DEMO_LOOKUP_FRAMES) {
          window.requestAnimationFrame(findDemoAndScroll);
        }
      };

      window.requestAnimationFrame(findDemoAndScroll);
    },
    [
      galleryDataByMode,
      isNavigationCurrent,
      nextNavigationToken,
      scrollToSectionWithToken,
    ],
  );

  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash.replace("#", "");
      const resolved = resolveHashToModeAndTarget(hash);
      if (!resolved) return;

      const token = nextNavigationToken();
      setGalleryMode(resolved.mode);
      const { targetId } = resolved;
      const categoryIds = galleryDataByMode[resolved.mode].categories.map(
        (c) => c.id,
      );
      const isSection = categoryIds.includes(targetId);

      window.requestAnimationFrame(() => {
        if (isSection) {
          scrollToSectionWithToken(targetId, token, false);
          return;
        }
        openDemo(targetId, resolved.mode, false, token);
      });
    };

    handleHashNavigation();
    window.addEventListener("hashchange", handleHashNavigation);

    return () => window.removeEventListener("hashchange", handleHashNavigation);
  }, [galleryDataByMode, nextNavigationToken, openDemo, scrollToSectionWithToken]);

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
            categories={categories}
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
        categories={categories}
        activeSection={activeSection}
        onSelect={scrollToSection}
      />

      <main className="relative mx-auto max-w-7xl bg-[var(--surface-main)] px-5 pb-24 sm:px-6">
        <div className="space-y-7 pt-10 sm:space-y-10">
          {categories.map((category, index) => {
            const demos = demosByCategory.get(category.id) ?? [];
            return (
              <CategorySection
                key={category.id}
                category={category}
                count={categoryCounts.get(category.id) ?? 0}
                eager={index === 0}
              >
                {demos.map((demo) => (
                  <AnimationCard
                    key={demo.id}
                    id={demo.id}
                    metadata={{
                      title: demo.title,
                      description: demo.description,
                      code: demo.code,
                    }}
                  >
                    <demo.Component />
                  </AnimationCard>
                ))}
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
