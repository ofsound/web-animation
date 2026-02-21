import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimationCard } from "./components/AnimationCard";
import { CategoryIcon } from "./components/CategoryIcon";
import { CategorySection } from "./components/CategorySection";
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
  const [maximizedDemoId, setMaximizedDemoId] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const activeNavigationTokenRef = useRef(0);

  const galleryDataByMode = useMemo<Record<GalleryMode, GalleryDataView>>(
    () => ({
      tailwind: getGalleryData("tailwind"),
      css: getGalleryData("css"),
    }),
    [],
  );
  const { categories, demosByCategory, categoryCounts, demoCategoryById } = useMemo(
    () => galleryDataByMode[galleryMode],
    [galleryDataByMode, galleryMode],
  );
  const activeMaximizedDemoId =
    maximizedDemoId && demoCategoryById.has(maximizedDemoId)
      ? maximizedDemoId
      : null;
  const closeMaximizedDemo = useCallback(() => {
    setMaximizedDemoId(null);
  }, []);

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

  useEffect(() => {
    if (!activeMaximizedDemoId) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeMaximizedDemoId]);

  useEffect(() => {
    if (!activeMaximizedDemoId) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMaximizedDemoId(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [activeMaximizedDemoId]);

  return (
    <div className="min-h-screen text-[var(--text-1)]">
      {activeMaximizedDemoId ? (
        <button
          type="button"
          className="fixed top-0 right-0 bottom-0 left-20 z-[100] bg-[color-mix(in_oklab,var(--surface-1)_65%,black_35%)] backdrop-blur-[2px] sm:left-72"
          aria-label="Close maximized demo"
          onClick={closeMaximizedDemo}
        />
      ) : null}

      <aside className="fixed inset-y-0 left-0 z-50 flex w-20 flex-col border-r border-[var(--card-border)] bg-[color-mix(in_oklab,var(--surface-1)_90%,transparent)] backdrop-blur-xl sm:w-72">
        <div className="border-b border-[var(--card-border)] px-3 py-4 sm:px-5">
          <div>
            <h1 className="text-center text-base leading-tight font-black tracking-[-0.02em] text-balance text-[var(--text-1)] sm:text-left sm:text-xl">
              Web Animation
            </h1>
            <p
              className="mt-0.5 hidden font-mono text-[11px] tracking-wide text-[var(--text-2)] sm:block"
              data-source-file="src/App.tsx"
              data-source-line="98"
            >
              Feb 2026 - Tailwind + Native CSS
            </p>
          </div>
        </div>

        <div className="border-b border-[var(--card-border)] px-2 py-3 sm:px-4">
          <p className="mb-2 hidden font-mono text-[11px] tracking-wide text-[var(--text-3)] sm:block">
            Gallery
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                closeMaximizedDemo();
                setGalleryMode("tailwind");
              }}
              className={`flex w-full items-center justify-center rounded-xl border px-2 py-2 font-mono text-[11px] tracking-wide transition sm:justify-start sm:px-3 ${
                galleryMode === "tailwind"
                  ? "border-[var(--brand)] bg-[color-mix(in_oklab,var(--brand)_16%,transparent)] text-[var(--text-1)]"
                  : "border-[var(--card-border)] bg-[var(--surface-2)] text-[var(--text-2)] hover:border-[var(--brand)] hover:text-[var(--text-1)]"
              }`}
            >
              <span className="sm:hidden">TW</span>
              <span className="hidden sm:inline">Tailwind Demos</span>
            </button>
            <button
              onClick={() => {
                closeMaximizedDemo();
                setGalleryMode("css");
              }}
              className={`flex w-full items-center justify-center rounded-xl border px-2 py-2 font-mono text-[11px] tracking-wide transition sm:justify-start sm:px-3 ${
                galleryMode === "css"
                  ? "border-[var(--brand)] bg-[color-mix(in_oklab,var(--brand)_16%,transparent)] text-[var(--text-1)]"
                  : "border-[var(--card-border)] bg-[var(--surface-2)] text-[var(--text-2)] hover:border-[var(--brand)] hover:text-[var(--text-1)]"
              }`}
            >
              <span className="sm:hidden">CSS</span>
              <span className="hidden sm:inline">CSS Demos</span>
            </button>
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
                  closeMaximizedDemo();
                  scrollToSection(category.id);
                }}
                className={`flex w-full items-center justify-center gap-1.5 rounded-xl border px-2 py-2 font-mono text-[11px] tracking-wide transition-all sm:justify-start sm:px-3 ${
                  isActive
                    ? "border-[var(--brand)] bg-[color-mix(in_oklab,var(--brand)_16%,transparent)] text-[var(--text-1)]"
                    : "border-[var(--card-border)] bg-transparent text-[var(--text-2)] hover:border-[color-mix(in_oklab,var(--brand)_45%,var(--card-border))] hover:text-[var(--text-1)]"
                }`}
                aria-current={isActive ? "true" : undefined}
              >
                <CategoryIcon icon={category.icon} className="size-3.5" />
                <span className="hidden truncate sm:inline">{category.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[var(--card-border)] px-2 py-3 sm:px-3">
          <button
            onClick={toggleTheme}
            className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--surface-2)] px-2 py-2 font-mono text-[11px] tracking-wide text-[var(--text-2)] transition hover:border-[var(--brand)] hover:text-[var(--text-1)] sm:justify-start sm:px-3"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            <span className="sm:hidden">{theme === "dark" ? "☀" : "☾"}</span>
            <span className="hidden sm:inline">
              {theme === "dark" ? "☀ Light" : "☾ Dark"}
            </span>
          </button>
        </div>
      </aside>

      <main className="relative ml-20 bg-[var(--surface-main)] px-4 pb-24 pt-7 sm:ml-72 sm:px-7 sm:pt-10 lg:px-10 2xl:px-14">
        <div className="mx-auto w-full max-w-[1600px] space-y-7 sm:space-y-10">
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
                      source: demo.source,
                    }}
                    isMaximized={activeMaximizedDemoId === demo.id}
                    isObscured={
                      activeMaximizedDemoId !== null &&
                      activeMaximizedDemoId !== demo.id
                    }
                    onToggleMaximize={() =>
                      setMaximizedDemoId((activeId) =>
                        activeId === demo.id ? null : demo.id,
                      )
                    }
                  >
                    <demo.Component />
                  </AnimationCard>
                ))}
              </CategorySection>
            );
          })}
        </div>
      </main>

      <footer className="ml-20 border-t border-[var(--card-border)] py-8 text-center sm:ml-72">
        <p className="font-mono text-xs tracking-wide text-[var(--text-3)]">
          Built for frontend developers · Motion-aware and deep-linkable
        </p>
      </footer>
    </div>
  );
}

export default App;
