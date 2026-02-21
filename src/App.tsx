import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimationCard } from "./components/AnimationCard";
import { CategoryIcon } from "./components/CategoryIcon";
import { CategorySection } from "./components/CategorySection";
import {
  getDemoRoutePath,
  getGalleryData,
  resolveDemoFromRoute,
  resolveLegacyHashToRoute,
  type DemoEntry,
  type GalleryMode,
} from "./data/demoRegistry";
import { useActiveSection } from "./hooks/useActiveSection";
import { useTheme } from "./hooks/useTheme";
import type { Category } from "./types/demo";

const MIN_PROGRAMMATIC_SCROLL_PAUSE_MS = 280;
const MAX_PROGRAMMATIC_SCROLL_PAUSE_MS = 1200;
const PROGRAMMATIC_SCROLL_PAUSE_MS_PER_PIXEL = 0.3;
const PROGRAMMATIC_SCROLL_CLASS = "is-programmatic-scrolling";
const DEFAULT_MODE: GalleryMode = "tailwind";

function isEditableKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  const tagName = target.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
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

type QueuedDemo = {
  id: string;
  mode: GalleryMode;
};

type ParsedRoute =
  | { kind: "mode"; mode: GalleryMode }
  | {
      kind: "demo";
      mode: GalleryMode;
      demoId: string;
      canonicalPath: string;
      isCanonical: boolean;
    }
  | { kind: "invalid"; redirectPath: string };

type PendingLegacySectionScroll = {
  mode: GalleryMode;
  sectionId: string;
  token: number;
};

function parseRoute(pathname: string): ParsedRoute {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return { kind: "invalid", redirectPath: `/${DEFAULT_MODE}` };
  }

  const [modeSegment, slugSegment, ...rest] = segments;
  if (modeSegment !== "tailwind" && modeSegment !== "css") {
    return { kind: "invalid", redirectPath: `/${DEFAULT_MODE}` };
  }
  const mode: GalleryMode = modeSegment;

  if (segments.length === 1) {
    return { kind: "mode", mode };
  }

  if (!slugSegment || rest.length > 0) {
    return { kind: "invalid", redirectPath: `/${mode}` };
  }

  let decodedSlug = slugSegment;
  try {
    decodedSlug = decodeURIComponent(slugSegment);
  } catch {
    return { kind: "invalid", redirectPath: `/${mode}` };
  }

  const resolved = resolveDemoFromRoute(mode, decodedSlug);
  if (!resolved) {
    return { kind: "invalid", redirectPath: `/${mode}` };
  }

  const canonicalPath = getDemoRoutePath(mode, resolved.demoId);
  return {
    kind: "demo",
    mode,
    demoId: resolved.demoId,
    canonicalPath,
    isCanonical: decodedSlug === resolved.canonicalSlug,
  };
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const parsedRoute = useMemo(
    () => parseRoute(location.pathname),
    [location.pathname],
  );
  const effectiveGalleryMode =
    parsedRoute.kind === "invalid" ? DEFAULT_MODE : parsedRoute.mode;
  const activeMaximizedDemoId =
    parsedRoute.kind === "demo" ? parsedRoute.demoId : null;
  const { theme, toggleTheme } = useTheme();
  const activeNavigationTokenRef = useRef(0);
  const pendingLegacySectionScrollRef =
    useRef<PendingLegacySectionScroll | null>(null);
  const scrollPauseTimeoutRef = useRef<number | null>(null);
  const [isProgrammaticScrolling, setIsProgrammaticScrolling] = useState(false);
  const [preloadedSectionsByMode, setPreloadedSectionsByMode] = useState<
    Record<GalleryMode, string[]>
  >({
    tailwind: [],
    css: [],
  });
  const preloadedSectionsByModeRef = useRef<Record<GalleryMode, Set<string>>>({
    tailwind: new Set(),
    css: new Set(),
  });

  const galleryDataByMode = useMemo<Record<GalleryMode, GalleryDataView>>(
    () => ({
      tailwind: getGalleryData("tailwind"),
      css: getGalleryData("css"),
    }),
    [],
  );
  const maximizedDemoQueue = useMemo<QueuedDemo[]>(
    () =>
      (["tailwind", "css"] as const).flatMap((mode) => {
        const data = galleryDataByMode[mode];
        return data.categories.flatMap((category) =>
          (data.demosByCategory.get(category.id) ?? []).map((demo) => ({
            id: demo.id,
            mode,
          })),
        );
      }),
    [galleryDataByMode],
  );
  const maximizedDemoIndexById = useMemo(
    () =>
      new Map(maximizedDemoQueue.map(({ id }, index) => [id, index] as const)),
    [maximizedDemoQueue],
  );
  const { categories, demosByCategory } = useMemo(
    () => galleryDataByMode[effectiveGalleryMode],
    [effectiveGalleryMode, galleryDataByMode],
  );
  const activeMaximizedDemoIndex = useMemo(() => {
    if (!activeMaximizedDemoId) return -1;
    return maximizedDemoIndexById.get(activeMaximizedDemoId) ?? -1;
  }, [activeMaximizedDemoId, maximizedDemoIndexById]);
  const activeMaximizedDemoPosition =
    activeMaximizedDemoIndex === -1 ? 0 : activeMaximizedDemoIndex + 1;
  const maximizedDemoTotal = maximizedDemoQueue.length;
  const canMaximizedDemoGoPrev = activeMaximizedDemoIndex > 0;
  const canMaximizedDemoGoNext =
    activeMaximizedDemoIndex !== -1 &&
    activeMaximizedDemoIndex < maximizedDemoQueue.length - 1;
  const closeMaximizedDemo = useCallback(() => {
    navigate(`/${effectiveGalleryMode}`);
  }, [effectiveGalleryMode, navigate]);
  const navigateMaximizedDemo = useCallback(
    (direction: "prev" | "next") => {
      if (activeMaximizedDemoIndex === -1) return;

      const nextIndex =
        direction === "prev"
          ? activeMaximizedDemoIndex - 1
          : activeMaximizedDemoIndex + 1;
      if (nextIndex < 0 || nextIndex >= maximizedDemoQueue.length) {
        return;
      }

      const nextDemo = maximizedDemoQueue[nextIndex];
      if (!nextDemo) return;

      navigate(getDemoRoutePath(nextDemo.mode, nextDemo.id));
    },
    [activeMaximizedDemoIndex, maximizedDemoQueue, navigate],
  );

  const sectionIds = useMemo(
    () => categories.map((category) => category.id),
    [categories],
  );
  const preloadedSectionIds = useMemo(
    () => new Set(preloadedSectionsByMode[effectiveGalleryMode]),
    [effectiveGalleryMode, preloadedSectionsByMode],
  );
  const activeSection = useActiveSection(sectionIds);

  const prefersReducedMotion = useCallback(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  const setGalleryModeWithTransition = useCallback(
    (mode: GalleryMode) => {
      if (mode === effectiveGalleryMode && !activeMaximizedDemoId) return;
      const targetPath = `/${mode}`;

      const applyModeChange = (commitSynchronously = false) => {
        if (commitSynchronously) {
          flushSync(() => navigate(targetPath));
          window.scrollTo({ top: 0, behavior: "auto" });
          return;
        }

        navigate(targetPath);
        window.scrollTo({ top: 0, behavior: "auto" });
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
    [
      activeMaximizedDemoId,
      effectiveGalleryMode,
      navigate,
      prefersReducedMotion,
    ],
  );

  const resolveScrollBehavior = useCallback(
    (forceAnimated = false): ScrollBehavior => {
      if (prefersReducedMotion() && !forceAnimated) {
        return "auto";
      }
      return "smooth";
    },
    [prefersReducedMotion],
  );

  const clearProgrammaticScrollPause = useCallback(() => {
    if (scrollPauseTimeoutRef.current !== null) {
      window.clearTimeout(scrollPauseTimeoutRef.current);
      scrollPauseTimeoutRef.current = null;
    }
    setIsProgrammaticScrolling(false);
  }, []);

  const beginProgrammaticScrollPause = useCallback(
    (distance: number, behavior: ScrollBehavior) => {
      if (behavior === "auto" || Math.abs(distance) < 1) {
        clearProgrammaticScrollPause();
        return;
      }

      const pauseDurationMs = Math.min(
        MAX_PROGRAMMATIC_SCROLL_PAUSE_MS,
        Math.max(
          MIN_PROGRAMMATIC_SCROLL_PAUSE_MS,
          MIN_PROGRAMMATIC_SCROLL_PAUSE_MS +
            Math.abs(distance) * PROGRAMMATIC_SCROLL_PAUSE_MS_PER_PIXEL,
        ),
      );

      setIsProgrammaticScrolling(true);
      if (scrollPauseTimeoutRef.current !== null) {
        window.clearTimeout(scrollPauseTimeoutRef.current);
      }
      scrollPauseTimeoutRef.current = window.setTimeout(() => {
        scrollPauseTimeoutRef.current = null;
        setIsProgrammaticScrolling(false);
      }, pauseDurationMs + 120);
    },
    [clearProgrammaticScrollPause],
  );

  const scrollToTargetY = useCallback(
    (targetY: number, forceAnimated = false) => {
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

      const behavior = resolveScrollBehavior(forceAnimated);
      const distance = clampedTargetY - window.scrollY;
      beginProgrammaticScrollPause(distance, behavior);

      window.scrollTo({
        top: clampedTargetY,
        behavior,
      });
    },
    [beginProgrammaticScrollPause, resolveScrollBehavior],
  );

  const getElementTargetY = useCallback((element: HTMLElement) => {
    const elementTop = window.scrollY + element.getBoundingClientRect().top;
    const scrollMarginTop =
      Number.parseFloat(window.getComputedStyle(element).scrollMarginTop) || 0;
    return elementTop - scrollMarginTop;
  }, []);

  const preloadSectionsThrough = useCallback(
    (mode: GalleryMode, sectionId: string) => {
      const categoryIds = galleryDataByMode[mode].categories.map(
        (category) => category.id,
      );
      const targetIndex = categoryIds.indexOf(sectionId);
      if (targetIndex === -1) {
        return false;
      }

      const sectionsToPreload = categoryIds.slice(0, targetIndex + 1);
      const modeSet = preloadedSectionsByModeRef.current[mode];
      let didAdd = false;

      sectionsToPreload.forEach((id) => {
        if (modeSet.has(id)) return;
        modeSet.add(id);
        didAdd = true;
      });

      if (!didAdd) {
        return false;
      }

      setPreloadedSectionsByMode((current) => ({
        ...current,
        [mode]: Array.from(modeSet),
      }));

      return true;
    },
    [galleryDataByMode],
  );

  const runAfterPotentialPreload = useCallback(
    (didPreload: boolean, callback: () => void) => {
      window.requestAnimationFrame(() => {
        if (!didPreload) {
          callback();
          return;
        }

        window.requestAnimationFrame(callback);
      });
    },
    [],
  );

  const nextNavigationToken = useCallback(() => {
    activeNavigationTokenRef.current += 1;
    return activeNavigationTokenRef.current;
  }, []);

  const isNavigationCurrent = useCallback(
    (token: number) => token === activeNavigationTokenRef.current,
    [],
  );

  const scrollToSectionWithToken = useCallback(
    (id: string, token: number, mode: GalleryMode, forceAnimated = false) => {
      if (!isNavigationCurrent(token)) return false;

      const didPreload = preloadSectionsThrough(mode, id);
      runAfterPotentialPreload(didPreload, () => {
        if (!isNavigationCurrent(token)) return;

        const section = document.getElementById(id);
        if (!(section instanceof HTMLElement)) return;

        scrollToTargetY(getElementTargetY(section), forceAnimated);
      });

      return true;
    },
    [
      getElementTargetY,
      isNavigationCurrent,
      preloadSectionsThrough,
      runAfterPotentialPreload,
      scrollToTargetY,
    ],
  );

  const scrollToSection = useCallback(
    (id: string) => {
      const token = nextNavigationToken();
      scrollToSectionWithToken(id, token, effectiveGalleryMode, true);
    },
    [effectiveGalleryMode, nextNavigationToken, scrollToSectionWithToken],
  );

  useEffect(() => {
    if (parsedRoute.kind === "invalid") {
      navigate(parsedRoute.redirectPath, { replace: true });
      return;
    }
    if (parsedRoute.kind === "demo" && !parsedRoute.isCanonical) {
      navigate(parsedRoute.canonicalPath, { replace: true });
    }
  }, [navigate, parsedRoute]);

  useEffect(() => {
    const handleLegacyHashNavigation = () => {
      const hash = window.location.hash.replace("#", "");
      const resolved = resolveLegacyHashToRoute(hash);
      if (!resolved) return;

      if (resolved.kind === "section") {
        pendingLegacySectionScrollRef.current = {
          mode: resolved.mode,
          sectionId: resolved.sectionId,
          token: nextNavigationToken(),
        };
      } else {
        pendingLegacySectionScrollRef.current = null;
      }

      navigate(resolved.path, { replace: true });
    };

    handleLegacyHashNavigation();
    window.addEventListener("hashchange", handleLegacyHashNavigation);

    return () =>
      window.removeEventListener("hashchange", handleLegacyHashNavigation);
  }, [navigate, nextNavigationToken]);

  useEffect(() => {
    const pending = pendingLegacySectionScrollRef.current;
    if (!pending || activeMaximizedDemoId || effectiveGalleryMode !== pending.mode) {
      return;
    }

    if (scrollToSectionWithToken(pending.sectionId, pending.token, pending.mode)) {
      pendingLegacySectionScrollRef.current = null;
    }
  }, [activeMaximizedDemoId, effectiveGalleryMode, scrollToSectionWithToken]);

  useEffect(() => {
    const root = document.documentElement;
    if (isProgrammaticScrolling) {
      root.classList.add(PROGRAMMATIC_SCROLL_CLASS);
      return;
    }
    root.classList.remove(PROGRAMMATIC_SCROLL_CLASS);
  }, [isProgrammaticScrolling]);

  useEffect(() => {
    if (!isProgrammaticScrolling) return;

    const handleScrollEnd = () => {
      clearProgrammaticScrollPause();
    };

    window.addEventListener("scrollend", handleScrollEnd, { once: true });
    return () => window.removeEventListener("scrollend", handleScrollEnd);
  }, [clearProgrammaticScrollPause, isProgrammaticScrolling]);

  useEffect(() => {
    return () => {
      clearProgrammaticScrollPause();
      document.documentElement.classList.remove(PROGRAMMATIC_SCROLL_CLASS);
    };
  }, [clearProgrammaticScrollPause]);

  useEffect(() => {
    if (!activeMaximizedDemoId) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMaximizedDemo();
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
    closeMaximizedDemo,
    navigateMaximizedDemo,
  ]);

  return (
    <div className="text-text-primary min-h-screen">
      <aside className="border-shell-sidebar-border bg-shell-sidebar-bg fixed inset-y-0 left-0 z-50 flex w-20 flex-col border-r backdrop-blur-xl sm:w-72">
        <div className="border-shell-sidebar-border border-b px-3 py-4 sm:px-5">
          <div>
            <h1 className="text-text-primary text-center text-base leading-tight font-black tracking-[-0.02em] text-balance sm:text-left sm:text-2xl">
              Web Animation
            </h1>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <p
                className="text-text-secondary hidden font-mono text-base tracking-wide sm:block"
                data-source-file="src/App.tsx"
                data-source-line="98"
              >
                February 2026
              </p>
              <button
                onClick={toggleTheme}
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
            {/* sliding indicator */}
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
                onClick={() => {
                  setGalleryModeWithTransition(mode);
                }}
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
                  closeMaximizedDemo();
                  scrollToSection(category.id);
                }}
                className={`flex w-full items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-sm font-semibold tracking-wide transition-all sm:justify-start sm:px-3 ${
                  isActive
                    ? "border-menu-item-border-active bg-menu-item-bg-active text-text-primary"
                    : "border-button-neutral-border text-text-secondary bg-transparent"
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
      </aside>

      {activeMaximizedDemoId && (
        <div
          className="fixed inset-y-0 right-0 left-20 z-[110] backdrop-blur-md sm:left-72"
          style={{
            background:
              "color-mix(in oklab, var(--color-app-bg) 56%, transparent)",
          }}
          onClick={closeMaximizedDemo}
          aria-hidden="true"
        />
      )}

      <main className="bg-app-main relative ml-20 pt-7 pb-24 sm:ml-72 sm:pt-10">
        <div className={activeMaximizedDemoId ? "" : "mode-gallery-content"}>
          {categories.map((category, index) => {
            const demos = demosByCategory.get(category.id) ?? [];
            return (
              <CategorySection
                key={category.id}
                category={category}
                eager={
                  index === 0 ||
                  activeMaximizedDemoId !== null ||
                  preloadedSectionIds.has(category.id)
                }
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
                    onToggleMaximize={() => {
                      if (activeMaximizedDemoId === demo.id) {
                        closeMaximizedDemo();
                        return;
                      }
                      navigate(getDemoRoutePath(effectiveGalleryMode, demo.id));
                    }}
                    canGoPrev={canMaximizedDemoGoPrev}
                    canGoNext={canMaximizedDemoGoNext}
                    onGoPrev={() => navigateMaximizedDemo("prev")}
                    onGoNext={() => navigateMaximizedDemo("next")}
                    queuePosition={activeMaximizedDemoPosition}
                    queueTotal={maximizedDemoTotal}
                  >
                    <demo.Component />
                  </AnimationCard>
                ))}
              </CategorySection>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default App;
