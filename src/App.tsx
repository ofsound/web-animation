import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimationCard } from "./components/AnimationCard";
import { CategorySection } from "./components/CategorySection";
import { Sidebar } from "./components/Sidebar";
import {
  createEmptyGalleryDataByMode,
  createGalleryRegistry,
  type GalleryDataRuntime,
  type DemoEntry,
  type GalleryMode,
} from "./data/demoRegistry";
import { fetchPublicGallery, toGalleryDataByMode } from "./data/publicGallery";
import { useActiveSection } from "./hooks/useActiveSection";
import { useTheme } from "./hooks/useTheme";
import {
  parseRoute,
  isEditableKeyboardTarget,
  DEFAULT_MODE,
} from "./lib/parseRoute";
import type { Category } from "./types/demo";

const MIN_PROGRAMMATIC_SCROLL_PAUSE_MS = 280;
const MAX_PROGRAMMATIC_SCROLL_PAUSE_MS = 1200;
const PROGRAMMATIC_SCROLL_PAUSE_MS_PER_PIXEL = 0.3;
const PROGRAMMATIC_SCROLL_CLASS = "is-programmatic-scrolling";

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

type PendingLegacySectionScroll = {
  mode: GalleryMode;
  sectionId: string;
  token: number;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const [remoteGalleryDataByMode, setRemoteGalleryDataByMode] = useState<
    Record<GalleryMode, GalleryDataRuntime>
  >(() => createEmptyGalleryDataByMode());
  const [isRemoteGalleryLoading, setIsRemoteGalleryLoading] = useState(true);
  const [remoteGalleryError, setRemoteGalleryError] = useState<string | null>(
    null,
  );
  const galleryDataByMode = useMemo<Record<GalleryMode, GalleryDataView>>(
    () => remoteGalleryDataByMode,
    [remoteGalleryDataByMode],
  );
  const galleryRegistry = useMemo(
    () => createGalleryRegistry(galleryDataByMode),
    [galleryDataByMode],
  );

  useEffect(() => {
    let cancelled = false;

    const loadRemoteGallery = async () => {
      setRemoteGalleryError(null);
      try {
        const payload = await fetchPublicGallery();
        if (cancelled) return;

        const runtimeDataByMode = toGalleryDataByMode(payload);
        setRemoteGalleryDataByMode(runtimeDataByMode);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load database gallery.", error);
        const isTimeout =
          error instanceof DOMException && error.name === "AbortError";
        setRemoteGalleryError(
          isTimeout
            ? "The gallery request timed out. Check that the API is reachable and environment variables (e.g. DATABASE_URL) are set on Vercel."
            : "Unable to load demos from the API. The gallery requires published database demos.",
        );
      } finally {
        if (!cancelled) {
          setIsRemoteGalleryLoading(false);
        }
      }
    };

    void loadRemoteGallery();
    return () => {
      cancelled = true;
    };
  }, []);

  const parsedRoute = useMemo(
    () => parseRoute(location.pathname, galleryRegistry),
    [galleryRegistry, location.pathname],
  );
  const effectiveGalleryMode =
    parsedRoute.kind === "invalid" ? DEFAULT_MODE : parsedRoute.mode;
  const activeMaximizedDemoId =
    parsedRoute.kind === "demo" ? parsedRoute.demoId : null;
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
  const { categories, demosByCategory, demoCategoryById } = useMemo(
    () => galleryDataByMode[effectiveGalleryMode],
    [effectiveGalleryMode, galleryDataByMode],
  );
  const activeMaximizedDemoCategoryId = useMemo(() => {
    if (!activeMaximizedDemoId) return null;
    return demoCategoryById.get(activeMaximizedDemoId) ?? null;
  }, [activeMaximizedDemoId, demoCategoryById]);
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

      navigate(galleryRegistry.getDemoRoutePath(nextDemo.mode, nextDemo.id));
    },
    [activeMaximizedDemoIndex, galleryRegistry, maximizedDemoQueue, navigate],
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
    if (isRemoteGalleryLoading) return;

    if (parsedRoute.kind === "invalid") {
      navigate(parsedRoute.redirectPath, { replace: true });
      return;
    }
    if (parsedRoute.kind === "demo" && !parsedRoute.isCanonical) {
      navigate(parsedRoute.canonicalPath, { replace: true });
    }
  }, [isRemoteGalleryLoading, navigate, parsedRoute]);

  useEffect(() => {
    if (isRemoteGalleryLoading) return;

    const handleLegacyHashNavigation = () => {
      const hash = window.location.hash.replace("#", "");
      const resolved = galleryRegistry.resolveLegacyHashToRoute(hash);
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
  }, [galleryRegistry, isRemoteGalleryLoading, navigate, nextNavigationToken]);

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
      <Sidebar
        categories={categories}
        activeSection={activeSection}
        effectiveGalleryMode={effectiveGalleryMode}
        theme={theme}
        onToggleTheme={toggleTheme}
        onModeChange={setGalleryModeWithTransition}
        onSectionClick={scrollToSection}
        onCloseMaximized={closeMaximizedDemo}
      />

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

      <main
        className={
          isRemoteGalleryLoading
            ? "relative ml-20 min-h-screen bg-black sm:ml-72"
            : "bg-app-main relative ml-20 pt-7 pb-24 sm:ml-72 sm:pt-10"
        }
      >
        {isRemoteGalleryLoading ? (
          <div className="px-6 sm:px-10">
            <div className="grid min-h-screen place-items-center">
              <div className="w-full max-w-sm rounded-2xl border border-border-strong/70 bg-surface-card/85 px-8 py-10 text-center shadow-glow-subtle backdrop-blur-sm">
                <div
                  className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-accent-brand/25 border-t-accent-brand motion-reduce:animate-none"
                  aria-hidden="true"
                />
                <p className="mt-4 font-mono text-xs tracking-[0.18em] text-text-secondary uppercase">
                  Loading gallery…
                </p>
              </div>
            </div>
          </div>
        ) : null}
        {!isRemoteGalleryLoading && remoteGalleryError ? (
          <div className="px-6 py-8 sm:px-10">
            <p className="rounded-xl border border-status-error/40 bg-status-error/10 px-4 py-3 text-sm">
              {remoteGalleryError}
            </p>
          </div>
        ) : null}
        <div className={activeMaximizedDemoId ? "" : "mode-gallery-content"}>
          {categories.map((category, index) => {
            const demos = demosByCategory.get(category.id) ?? [];
            return (
              <CategorySection
                key={category.id}
                category={category}
                eager={
                  index === 0 ||
                  activeMaximizedDemoCategoryId === category.id ||
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
                      navigate(
                        galleryRegistry.getDemoRoutePath(
                          effectiveGalleryMode,
                          demo.id,
                        ),
                      );
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
