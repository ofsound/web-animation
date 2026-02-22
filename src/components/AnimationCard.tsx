import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DemoSource } from "../types/demo";
import { toLiveTailwindMarkup, toScopedLiveCss } from "../lib/liveEditorUtils";
import {
  IconCheck,
  IconCopy,
  IconMaximize,
  IconMinimize,
  IconReplay,
  IconReset,
  IconX,
  ACTION_BTN_BASE,
  ACTION_BTN_HOVER,
} from "./AnimationCardIcons";
import { LiveCodeEditor } from "./LiveCodeEditor";

type CopyResult = "success" | "error";

interface DemoMetadata {
  title: string;
  description: string;
  code: string;
  source?: DemoSource;
}

interface AnimationCardProps {
  id: string;
  metadata: DemoMetadata;
  children: ReactNode;
  themeMode?: "light" | "dark";
  accent?: string;
  onCopyResult?: (result: CopyResult, demoId: string) => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
  onGoPrev?: () => void;
  onGoNext?: () => void;
  queuePosition?: number;
  queueTotal?: number;
}

export function AnimationCard({
  id,
  metadata,
  children,
  themeMode = "dark",
  accent,
  onCopyResult,
  isMaximized = false,
  onToggleMaximize,
  canGoPrev = false,
  canGoNext = false,
  onGoPrev,
  onGoNext,
  queuePosition = 0,
  queueTotal = 0,
}: AnimationCardProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [replayKey, setReplayKey] = useState(0);
  const [liveCode, setLiveCode] = useState(() => metadata.code);

  // ── FLIP animation: grow from original card position to centered fixed layout ──
  const cardRef = useRef<HTMLElement>(null);
  const prevRectRef = useRef<DOMRect | null>(null);
  const [flipStyle, setFlipStyle] = useState<CSSProperties | null>(null);
  const [placeholderHeight, setPlaceholderHeight] = useState<number | null>(
    null,
  );
  // Tracks the timer that drops the elevated z-index after the close transition
  const closeZTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending close-z timer on unmount
  useEffect(() => {
    return () => {
      if (closeZTimerRef.current !== null) clearTimeout(closeZTimerRef.current);
    };
  }, []);

  const handleToggleMaximize = () => {
    // Capture the current rendered rect before React re-renders.
    // Works for both open (small card, no transform) and close (large fixed
    // card, getBoundingClientRect already accounts for the applied transform).
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      prevRectRef.current = rect;
      if (!isMaximized) {
        setPlaceholderHeight(rect.height);
      }
    }
    onToggleMaximize?.();
  };

  useLayoutEffect(() => {
    if (!prevRectRef.current || !cardRef.current) {
      // Card can close via backdrop/Escape without going through the card button.
      // In that case there is no FLIP origin rect; clear reserved slot on next frame.
      if (!isMaximized && placeholderHeight !== null) {
        requestAnimationFrame(() => {
          setPlaceholderHeight(null);
        });
      }
      return;
    }

    const first = prevRectRef.current;
    const finalRect = cardRef.current.getBoundingClientRect();

    if (isMaximized) {
      // ── OPEN: small → large ─────────────────────────────────────────────
      // Cancel any in-flight close timer so z-index state is clean.
      if (closeZTimerRef.current !== null) {
        clearTimeout(closeZTimerRef.current);
        closeZTimerRef.current = null;
      }

      // finalRect has no transform yet (flipStyle is still null).
      // Compute center-to-center delta so the fixed card starts exactly at the
      // minimized card's on-screen position.
      const dx =
        first.left + first.width / 2 - (finalRect.left + finalRect.width / 2);
      const dy =
        first.top + first.height / 2 - (finalRect.top + finalRect.height / 2);
      const scaleX = first.width / finalRect.width;
      const scaleY = first.height / finalRect.height;

      // Jump instantly to the small-card position (suppress transition)
      setFlipStyle({
        transition: "none",
        transform: `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`,
      });

      // Two rAFs guarantee the suppressed frame is committed before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlipStyle({ transform: "none" });
          prevRectRef.current = null;
        });
      });
    } else {
      // ── CLOSE: large → small ────────────────────────────────────────────
      // first = maximized card's visual rect.
      // finalRect = small card back in grid flow.
      const dx =
        first.left + first.width / 2 - (finalRect.left + finalRect.width / 2);
      const dy =
        first.top + first.height / 2 - (finalRect.top + finalRect.height / 2);
      const scaleX = first.width / finalRect.width;
      const scaleY = first.height / finalRect.height;

      // Jump the small card to where the large card was (no transition).
      // Keep zIndex elevated so it stays above sibling cards until fully settled.
      setFlipStyle({
        transition: "none",
        transform: `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`,
        zIndex: 130,
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Release the transform — Tailwind `transition-transform duration-300` animates
          // back to identity. Keep z-index elevated for the full 300 ms duration.
          setFlipStyle({ zIndex: 130 });
          prevRectRef.current = null;

          // Drop elevated z-index only after the transition has finished.
          closeZTimerRef.current = setTimeout(() => {
            setFlipStyle(null);
            setPlaceholderHeight(null);
            closeZTimerRef.current = null;
          }, 320);
        });
      });
    }
  }, [isMaximized, placeholderHeight]);
  const iconSize = isMaximized ? "size-4" : "size-3.5";

  const { title, description, source = "tailwind" } = metadata;
  const isCodeDirty = liveCode !== metadata.code;

  const liveTailwindMarkup = useMemo(
    () => (source === "tailwind" ? toLiveTailwindMarkup(liveCode) : null),
    [liveCode, source],
  );
  const liveCss = useMemo(
    () => (source === "css" ? toScopedLiveCss(liveCode, id) : ""),
    [id, liveCode, source],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(liveCode);
      setCopyState("copied");
      onCopyResult?.("success", id);
    } catch {
      setCopyState("failed");
      onCopyResult?.("error", id);
    }

    setTimeout(() => setCopyState("idle"), 1800);
  };
  const slotStyle: CSSProperties | undefined =
    isMaximized && placeholderHeight !== null
      ? { minHeight: `${placeholderHeight}px` }
      : undefined;

  return (
    <div style={slotStyle}>
      <article
        ref={cardRef}
        id={id}
        className={`border-border-subtle bg-surface-card flex flex-col overflow-hidden border transition-transform duration-300 ${
          isMaximized
            ? "fixed inset-y-0 right-0 left-20 z-[120] m-auto h-auto max-h-[calc(100dvh-1rem)] w-[min(1100px,calc(100vw-5rem-1rem))] rounded-3xl border-2 sm:left-72 sm:max-h-[calc(100dvh-2rem)] sm:w-[min(1100px,calc(100vw-18rem-2rem))]"
            : "relative rounded-2xl"
        }`}
        style={{
          ...(accent ? { boxShadow: `0 10px 30px -20px ${accent}` } : {}),
          ...(flipStyle ?? {}),
        }}
      >
        {isMaximized && (onGoPrev || onGoNext) ? (
          <div className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-1.5">
            <button
              onClick={onGoPrev}
              disabled={!canGoPrev || !onGoPrev}
              className={`${ACTION_BTN_BASE} ${ACTION_BTN_HOVER} bg-surface-card-action text-text-primary px-2.5 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-45`}
              title="Go to previous card"
              aria-label={`Show previous card before ${title}`}
            >
              <span className="font-mono">Prev</span>
              <span aria-hidden className="font-mono text-[10px]">
                ← ↑
              </span>
            </button>
            <button
              onClick={onGoNext}
              disabled={!canGoNext || !onGoNext}
              className={`${ACTION_BTN_BASE} ${ACTION_BTN_HOVER} bg-surface-card-action text-text-primary px-2.5 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-45`}
              title="Go to next card"
              aria-label={`Show next card after ${title}`}
            >
              <span className="font-mono">Next</span>
              <span aria-hidden className="font-mono text-[10px]">
                ↓ →
              </span>
            </button>
            {queueTotal > 0 ? (
              <span
                className="border-button-neutral-border bg-surface-card-action text-text-secondary inline-flex min-w-[4.5rem] items-center justify-center rounded-lg border px-2.5 py-1.5 font-mono text-[11px]"
                aria-label={`Card ${queuePosition} of ${queueTotal}`}
              >
                {queuePosition}/{queueTotal}
              </span>
            ) : null}
          </div>
        ) : null}

        {onToggleMaximize ? (
          <button
            onClick={handleToggleMaximize}
            className={`${ACTION_BTN_BASE} ${ACTION_BTN_HOVER} bg-surface-card-action absolute top-3 right-3 z-20 ${
              isMaximized
                ? "text-text-primary px-2.5 py-1.5 text-xs"
                : "text-text-secondary p-1.5"
            }`}
            aria-label={
              isMaximized
                ? `Exit expanded view for ${title}`
                : `Expand ${title}`
            }
            title={isMaximized ? "Minimize view" : "Maximize view"}
          >
            {isMaximized ? (
              <>
                <IconMinimize className={iconSize} />
                <span className="font-mono">Minimize</span>
              </>
            ) : (
              <IconMaximize className={iconSize} />
            )}
          </button>
        ) : null}

        <div
          className={`animation-demo-surface group bg-demo-preview-bg relative flex items-center justify-center ${
            isMaximized
              ? "aspect-[5/2] w-full p-5 sm:p-6"
              : "aspect-[8/5] w-full p-7"
          }`}
        >
          <div
            key={`${id}-${replayKey}`}
            data-live-demo-root={id}
            className={`flex h-full items-center justify-center ${
              source !== "tailwind" ? "w-full" : ""
            }`}
          >
            {source === "tailwind" ? (
              liveTailwindMarkup ? (
                <div
                  className="max-w-full"
                  dangerouslySetInnerHTML={{ __html: liveTailwindMarkup }}
                />
              ) : (
                children
              )
            ) : source === "css" ? (
              <>
                {liveCss ? <style>{liveCss}</style> : null}
                {children}
              </>
            ) : (
              children
            )}
          </div>
          <button
            onClick={() => setReplayKey((value) => value + 1)}
            className={`${ACTION_BTN_BASE} ${ACTION_BTN_HOVER} bg-surface-card-action text-text-secondary absolute top-3 left-3 z-20 ${
              isMaximized ? "px-2.5 py-1.5 text-xs" : "p-1.5"
            }`}
            title="Replay animation"
            aria-label={`Replay ${title} animation`}
          >
            <IconReplay className={iconSize} />
            {isMaximized && <span className="font-mono">Replay</span>}
          </button>
        </div>

        <div
          className={`from-surface-card-header-start to-surface-card-subtle relative flex items-baseline justify-between gap-3 bg-gradient-to-b ${isMaximized ? "px-6 py-5" : "px-4 pt-2"}`}
        >
          <div className="min-w-0 flex-1">
            <h3
              className={
                isMaximized
                  ? "text-text-primary text-xl font-semibold"
                  : "text-text-primary text-base font-semibold"
              }
            >
              {title}
            </h3>
            {isMaximized && (
              <p className="text-text-secondary mt-0.5 text-sm leading-relaxed sm:text-base">
                {description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => setLiveCode(metadata.code)}
              disabled={!isCodeDirty}
              className={`${ACTION_BTN_BASE} bg-button-neutral-bg text-text-secondary enabled:hover:border-button-neutral-border-hover enabled:hover:bg-button-neutral-bg-hover enabled:hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 ${
                isMaximized ? "px-2.5 py-1.5 text-xs" : "p-1.5"
              }`}
              title="Reset code"
              aria-label={`Reset code for ${title}`}
            >
              <IconReset className={iconSize} />
              {isMaximized && <span className="font-mono">Reset</span>}
            </button>
            <button
              onClick={handleCopy}
              className={`${ACTION_BTN_BASE} ${ACTION_BTN_HOVER} bg-button-neutral-bg text-text-secondary ${
                isMaximized ? "px-2.5 py-1.5 text-xs" : "p-1.5"
              } ${copyState === "copied" ? "border-status-success/50! text-status-success!" : copyState === "failed" ? "border-status-error/50! text-status-error!" : ""}`}
              title={
                copyState === "copied"
                  ? "Copied!"
                  : copyState === "failed"
                    ? "Copy failed"
                    : "Copy code"
              }
              aria-label={`Copy code for ${title}`}
            >
              {copyState === "copied" ? (
                <>
                  <IconCheck className={iconSize} />
                  {isMaximized && <span className="font-mono">Copied</span>}
                </>
              ) : copyState === "failed" ? (
                <>
                  <IconX className={iconSize} />
                  {isMaximized && <span className="font-mono">Failed</span>}
                </>
              ) : (
                <>
                  <IconCopy className={iconSize} />
                  {isMaximized && <span className="font-mono">Copy</span>}
                </>
              )}
            </button>
          </div>
        </div>

        <LiveCodeEditor
          id={id}
          title={title}
          value={liveCode}
          onChange={setLiveCode}
          source={source}
          themeMode={themeMode}
          isMaximized={isMaximized}
        />

        <span className="sr-only" aria-live="polite">
          {copyState === "copied"
            ? `${title} code copied to clipboard.`
            : copyState === "failed"
              ? `Failed to copy ${title} code.`
              : ""}
        </span>
      </article>
    </div>
  );
}
