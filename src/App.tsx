import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
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
const MIN_SECTION_SCROLL_DURATION_MS = 300;
const MAX_SECTION_SCROLL_DURATION_MS = 1400;
const SECTION_SCROLL_MS_PER_PIXEL = 0.4;
const PROGRAMMATIC_SCROLL_CLASS = "is-programmatic-scrolling";

function isEditableKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  const tagName = target.tagName;
  if (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT"
  ) {
    return true;
  }

  return target.closest('[contenteditable="true"], [role="textbox"]') !== null;
}

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
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const [isProgrammaticScrolling, setIsProgrammaticScrolling] = useState(false);

  const galleryDataByMode = useMemo<Record<GalleryMode, GalleryDataView>>(
    () => ({
      tailwind: getGalleryData("tailwind"),
      css: getGalleryData("css"),
    }),
    [],
  );
  const { categories, demosByCategory, demoCategoryById } = useMemo(
    () => galleryDataByMode[galleryMode],
    [galleryDataByMode, galleryMode],
  );
  const activeMaximizedDemoId =
    maximizedDemoId && demoCategoryById.has(maximizedDemoId)
      ? maximizedDemoId
      : null;
  const orderedDemoIds = useMemo(
    () =>
      categories.flatMap((category) =>
        (demosByCategory.get(category.id) ?? []).map((demo) => demo.id),
      ),
    [categories, demosByCategory],
  );
  const activeMaximizedDemoIndex = useMemo(
    () =>
      activeMaximizedDemoId ? orderedDemoIds.indexOf(activeMaximizedDemoId) : -1,
    [activeMaximizedDemoId, orderedDemoIds],
  );
  const canMaximizedDemoGoPrev = activeMaximizedDemoIndex > 0;
  const canMaximizedDemoGoNext =
    activeMaximizedDemoIndex !== -1 &&
    activeMaximizedDemoIndex < orderedDemoIds.length - 1;
  const closeMaximizedDemo = useCallback(() => {
    setMaximizedDemoId(null);
  }, []);
  const navigateMaximizedDemo = useCallback(
    (direction: "prev" | "next") => {
      setMaximizedDemoId((activeId) => {
        if (!activeId) return activeId;

        const activeIndex = orderedDemoIds.indexOf(activeId);
        if (activeIndex === -1) return null;

        const nextIndex =
          direction === "prev" ? activeIndex - 1 : activeIndex + 1;

        if (nextIndex < 0 || nextIndex >= orderedDemoIds.length) {
          return activeId;
        }

        return orderedDemoIds[nextIndex] ?? activeId;
      });
    },
    [orderedDemoIds],
  );

  const sectionIds = useMemo(
    () => categories.map((category) => category.id),
    [categories],
  );
  const activeSection = useActiveSection(sectionIds);

  const prefersReducedMotion = useCallback(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  const setGalleryModeWithTransition = useCallback(
    (mode: GalleryMode) => {
      if (mode === galleryMode) return;

      const applyModeChange = (commitSynchronously = false) => {
        if (commitSynchronously) {
          flushSync(() => {
            closeMaximizedDemo();
            setGalleryMode(mode);
          });
          return;
        }

        closeMaximizedDemo();
        setGalleryMode(mode);
      };

      if (
        prefersReducedMotion() ||
        typeof document.startViewTransition !== "function"
      ) {
        applyModeChange();
        return;
      }

      try {
        document.startViewTransition(() => {
          applyModeChange(true);
        });
      } catch {
        applyModeChange();
      }
    },
    [closeMaximizedDemo, galleryMode, prefersReducedMotion],
  );

  const getNativeScrollBehavior = useCallback(() => {
    return prefersReducedMotion() ? "auto" : "smooth";
  }, [prefersReducedMotion]);

  const cancelSectionScrollAnimation = useCallback(() => {
    if (scrollAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollAnimationFrameRef.current);
      scrollAnimationFrameRef.current = null;
    }
    setIsProgrammaticScrolling(false);
  }, []);

  const scrollSectionToTarget = useCallback(
    (targetY: number, forceAnimated = false) => {
      cancelSectionScrollAnimation();

      const clampedTargetY = Math.max(
        0,
        Math.min(
          targetY,
          Math.max(
            0,
            document.documentElement.scrollHeight - window.innerHeight,
          ),
        ),
      );

      if (prefersReducedMotion() && !forceAnimated) {
        window.scrollTo({ top: clampedTargetY, behavior: "auto" });
        return;
      }

      const startY = window.scrollY;
      const distance = clampedTargetY - startY;
      if (Math.abs(distance) < 1) {
        window.scrollTo({ top: clampedTargetY, behavior: "auto" });
        return;
      }

      const duration = Math.min(
        MAX_SECTION_SCROLL_DURATION_MS,
        Math.max(
          MIN_SECTION_SCROLL_DURATION_MS,
          MIN_SECTION_SCROLL_DURATION_MS +
            Math.abs(distance) * SECTION_SCROLL_MS_PER_PIXEL,
        ),
      );

      setIsProgrammaticScrolling(true);

      let startTime: number | null = null;
      const easeInOutCubic = (value: number) =>
        value < 0.5
          ? 4 * value * value * value
          : 1 - Math.pow(-2 * value + 2, 3) / 2;

      const animate = (timestamp: number) => {
        if (startTime === null) {
          startTime = timestamp;
        }
        const elapsed = timestamp - startTime;
        const progress = Math.min(1, elapsed / duration);
        const easedProgress = easeInOutCubic(progress);

        window.scrollTo({
          top: startY + distance * easedProgress,
          behavior: "auto",
        });

        if (progress < 1) {
          scrollAnimationFrameRef.current =
            window.requestAnimationFrame(animate);
          return;
        }

        scrollAnimationFrameRef.current = null;
        setIsProgrammaticScrolling(false);
      };

      scrollAnimationFrameRef.current = window.requestAnimationFrame(animate);
    },
    [cancelSectionScrollAnimation, prefersReducedMotion],
  );

  const getSectionTargetY = useCallback((section: HTMLElement) => {
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    const scrollMarginTop =
      Number.parseFloat(window.getComputedStyle(section).scrollMarginTop) || 0;
    return sectionTop - scrollMarginTop;
  }, []);

  const nextNavigationToken = useCallback(() => {
    activeNavigationTokenRef.current += 1;
    return activeNavigationTokenRef.current;
  }, []);

  const isNavigationCurrent = useCallback(
    (token: number) => token === activeNavigationTokenRef.current,
    [],
  );

  const scrollToSectionWithToken = useCallback(
    (
      id: string,
      token: number,
      shouldUpdateHash = true,
      forceAnimated = false,
    ) => {
      if (!isNavigationCurrent(token)) return false;

      const section = document.getElementById(id);
      if (!section) return false;

      const targetY = getSectionTargetY(section);
      scrollSectionToTarget(targetY, forceAnimated);

      if (shouldUpdateHash) {
        window.history.replaceState(null, "", `#${id}`);
      }
      return true;
    },
    [getSectionTargetY, isNavigationCurrent, scrollSectionToTarget],
  );

  const scrollToSection = useCallback(
    (id: string, shouldUpdateHash = true) => {
      const token = nextNavigationToken();
      scrollToSectionWithToken(id, token, shouldUpdateHash, true);
    },
    [nextNavigationToken, scrollToSectionWithToken],
  );

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
          demo.scrollIntoView({
            behavior: getNativeScrollBehavior(),
            block: "start",
          });

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
      getNativeScrollBehavior,
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
  }, [
    galleryDataByMode,
    nextNavigationToken,
    openDemo,
    scrollToSectionWithToken,
  ]);

  useEffect(() => {
    const root = document.documentElement;
    if (isProgrammaticScrolling) {
      root.classList.add(PROGRAMMATIC_SCROLL_CLASS);
      return;
    }
    root.classList.remove(PROGRAMMATIC_SCROLL_CLASS);
  }, [isProgrammaticScrolling]);

  useEffect(() => {
    return () => {
      cancelSectionScrollAnimation();
      document.documentElement.classList.remove(PROGRAMMATIC_SCROLL_CLASS);
    };
  }, [cancelSectionScrollAnimation]);

  useEffect(() => {
    if (!activeMaximizedDemoId) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMaximizedDemoId(null);
        return;
      }
      if (isEditableKeyboardTarget(event.target)) {
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        if (!canMaximizedDemoGoPrev) return;
        event.preventDefault();
        navigateMaximizedDemo("prev");
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        if (!canMaximizedDemoGoNext) return;
        event.preventDefault();
        navigateMaximizedDemo("next");
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [
    activeMaximizedDemoId,
    canMaximizedDemoGoNext,
    canMaximizedDemoGoPrev,
    navigateMaximizedDemo,
  ]);

  return (
    <div className="min-h-screen text-[var(--color-text-primary)]">
      <aside className="fixed inset-y-0 left-0 z-50 flex w-20 flex-col border-r border-[var(--color-shell-sidebar-border)] bg-[var(--color-shell-sidebar-bg)] backdrop-blur-xl sm:w-72">
        <div className="border-b border-[var(--color-shell-sidebar-border)] px-3 py-4 sm:px-5">
          <div>
            <h1 className="text-center text-base leading-tight font-black tracking-[-0.02em] text-balance text-[var(--color-text-primary)] sm:text-left sm:text-2xl">
              Web Animation
            </h1>
            <p
              className="mt-0.5 hidden font-mono text-base tracking-wide text-[var(--color-text-secondary)] sm:block"
              data-source-file="src/App.tsx"
              data-source-line="98"
            >
              Feb 2026
            </p>
          </div>
        </div>

        <div className="border-b border-[var(--color-shell-sidebar-border)] px-2 py-3 sm:px-4">
          <div
            className="relative flex rounded-full border border-[var(--color-button-neutral-border)] bg-[var(--color-menu-toggle-track)] p-0.5"
            role="radiogroup"
            aria-label="Gallery mode"
          >
            {/* sliding pill indicator */}
            <span
              className="absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-[var(--color-menu-toggle-indicator)] transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
              style={{
                transform:
                  galleryMode === "css" ? "translateX(100%)" : "translateX(0)",
              }}
              aria-hidden
            />
            {(["tailwind", "css"] as const).map((mode) => (
              <button
                key={mode}
                role="radio"
                aria-checked={galleryMode === mode}
                onClick={() => {
                  setGalleryModeWithTransition(mode);
                }}
                className={`relative z-10 flex-1 rounded-full py-1.5 text-center text-[11px] font-black tracking-widest uppercase transition-colors duration-200 ${
                  galleryMode === mode
                    ? "text-[var(--color-menu-toggle-active-fg)]"
                    : "text-[var(--color-menu-toggle-inactive-fg)] hover:text-[var(--color-text-primary)]"
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
                  closeMaximizedDemo();
                  scrollToSection(category.id);
                }}
                className={`flex w-full items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-sm font-semibold tracking-wide transition-all sm:justify-start sm:px-3 ${
                  isActive
                    ? "border-[var(--color-menu-item-border-active)] bg-[var(--color-menu-item-bg-active)] text-[var(--color-text-primary)]"
                    : "border-[var(--color-button-neutral-border)] bg-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-menu-item-border-hover)] hover:text-[var(--color-text-primary)]"
                }`}
                aria-current={isActive ? "true" : undefined}
              >
                <CategoryIcon icon={category.icon} className="size-3.5" />
                <span className="hidden truncate sm:inline">
                  {category.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[var(--color-shell-sidebar-border)] px-2 py-3 sm:px-3">
          <button
            onClick={toggleTheme}
            className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--color-button-neutral-border)] bg-[var(--color-button-neutral-bg)] px-2 py-2 text-sm tracking-wide text-[var(--color-button-neutral-fg)] transition hover:border-[var(--color-button-neutral-border-hover)] hover:bg-[var(--color-button-neutral-bg-hover)] hover:text-[var(--color-button-neutral-fg-hover)] sm:justify-start sm:px-3"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            <span className="sm:hidden">{theme === "dark" ? "☀" : "☾"}</span>
            <span className="hidden sm:inline">
              {theme === "dark" ? "☀ Light" : "☾ Dark"}
            </span>
          </button>
        </div>
      </aside>

      {activeMaximizedDemoId && (
        <div
          className="fixed inset-y-0 left-20 right-0 z-[110] backdrop-blur-md sm:left-72"
          style={{
            background:
              "color-mix(in oklab, var(--color-app-bg) 56%, transparent)",
          }}
          onClick={closeMaximizedDemo}
          aria-hidden="true"
        />
      )}

      <main className="relative ml-20 bg-[var(--color-app-main)] pt-7 pb-24 sm:ml-72 sm:pt-10">
        <div className={activeMaximizedDemoId ? "" : "mode-gallery-content"}>
          {categories.map((category, index) => {
            const demos = demosByCategory.get(category.id) ?? [];
            return (
              <CategorySection
                key={category.id}
                category={category}
                eager={index === 0}
                surfaceTone={index % 2 === 0 ? "odd" : "even"}
              >
                {demos.map((demo) => (
                  <AnimationCard
                    key={demo.id}
                    id={demo.id}
                    themeMode={theme}
                    metadata={{
                      title: demo.title,
                      description: demo.description,
                      code: demo.code,
                      source: demo.source,
                    }}
                    isMaximized={activeMaximizedDemoId === demo.id}
                    onToggleMaximize={() =>
                      setMaximizedDemoId((activeId) =>
                        activeId === demo.id ? null : demo.id,
                      )
                    }
                    canGoPrev={canMaximizedDemoGoPrev}
                    canGoNext={canMaximizedDemoGoNext}
                    onGoPrev={() => navigateMaximizedDemo("prev")}
                    onGoNext={() => navigateMaximizedDemo("next")}
                  >
                    <demo.Component />
                  </AnimationCard>
                ))}
              </CategorySection>
            );
          })}
        </div>
      </main>

      <footer className="ml-20 border-t border-[var(--color-divider)] py-8 text-center sm:ml-72">
        <p className="font-mono text-xs tracking-wide text-[var(--color-text-tertiary)]">
          animation.csstune.com
        </p>
      </footer>
    </div>
  );
}

export default App;
