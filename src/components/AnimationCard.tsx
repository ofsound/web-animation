import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import type { DemoSource } from "../types/demo";

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

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const CSS_RULE_LINE_PATTERN =
  /^\s*(?:@|\.|#|:|::|\*|[a-z][\w-]*(?:\[[^\]]+\])?)[^{()]*\{/i;

function toLiveTailwindMarkup(input: string): string | null {
  if (typeof window === "undefined") return null;

  let jsxLikeMarkup = input.trim();
  if (!jsxLikeMarkup) return null;

  jsxLikeMarkup = jsxLikeMarkup
    .replace(/\bclassName=/g, "class=")
    .replace(/\bhtmlFor=/g, "for=")
    .replace(/\{\s*"([^"]*)"\s*\}/g, "$1")
    .replace(/\{\s*'([^']*)'\s*\}/g, "$1")
    .replace(/<>\s*/g, "<div>")
    .replace(/\s*<\/>\s*/g, "</div>")
    .replace(/<([a-z][\w-]*)([^>]*)\/>/gi, (match, tag, attrs) => {
      return VOID_TAGS.has(String(tag).toLowerCase())
        ? match
        : `<${tag}${attrs}></${tag}>`;
    });

  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<div data-live-tailwind-root>${jsxLikeMarkup}</div>`,
    "text/html",
  );
  const root = doc.body.firstElementChild;
  if (!root) return null;

  root.querySelectorAll("script").forEach((element) => element.remove());
  root.querySelectorAll("*").forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.startsWith("on")) {
        element.removeAttribute(attribute.name);
      }
    }
  });

  return root.innerHTML || null;
}

function extractCssCandidate(input: string): string {
  const lines = input.split("\n");
  const firstRuleLine = lines.findIndex((line) =>
    CSS_RULE_LINE_PATTERN.test(line),
  );
  if (firstRuleLine === -1) return "";
  return lines.slice(firstRuleLine).join("\n");
}

function toScopedLiveCss(input: string, demoId: string): string {
  const cssCandidate = extractCssCandidate(input);
  if (!cssCandidate) return "";

  const withoutJsComments = cssCandidate.replace(/^\s*\/\/.*$/gm, "");
  const classSelectorPortable = withoutJsComments.replace(
    /(?<![\w-])\.([A-Za-z_-][\w-]*)/g,
    `[class*="$1"]`,
  );
  const scopedSelector = `[data-live-demo-root="${demoId}"]`;

  return `@scope (${scopedSelector}) {\n${classSelectorPortable}\n}`;
}

/* ── shared SVG props matching CategoryIcon stroke style ── */
const ACTION_ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

function IconMaximize({ className }: { className?: string }) {
  return (
    <svg className={className} {...ACTION_ICON_PROPS}>
      <polyline points="15 3 21 3 21 9" />
      <path d="M21 3l-7 7" />
      <polyline points="9 21 3 21 3 15" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

function IconMinimize({ className }: { className?: string }) {
  return (
    <svg className={className} {...ACTION_ICON_PROPS}>
      <polyline points="4 14 10 14 10 20" />
      <path d="M3 21l7-7" />
      <polyline points="20 10 14 10 14 4" />
      <path d="M21 3l-7 7" />
    </svg>
  );
}

function IconReplay({ className }: { className?: string }) {
  return (
    <svg className={className} {...ACTION_ICON_PROPS}>
      <path d="M21 12a9 9 0 1 1-2.2-5.9" />
      <polyline points="21 3 21 9 15 9" />
    </svg>
  );
}

function IconReset({ className }: { className?: string }) {
  return (
    <svg className={className} {...ACTION_ICON_PROPS}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function IconCopy({ className }: { className?: string }) {
  return (
    <svg className={className} {...ACTION_ICON_PROPS}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} {...ACTION_ICON_PROPS}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} {...ACTION_ICON_PROPS}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

/* ── shared button style tokens ── */
const ACTION_BTN_BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-button-neutral-border transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none";
const ACTION_BTN_HOVER =
  "hover:border-button-neutral-border-hover hover:text-text-primary";

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
  const maximizedEditorLineCount = useMemo(() => {
    const lineCount = liveCode.split(/\r\n|\r|\n/).length;
    return Math.max(32, lineCount + 2);
  }, [liveCode]);
  const maximizedEditorHeightPx = maximizedEditorLineCount * 22;
  const editorExtensions = useMemo(
    () =>
      source === "css"
        ? [css()]
        : [html({ autoCloseTags: true, matchClosingTags: true })],
    [source],
  );
  const editorTheme = themeMode === "dark" ? githubDark : githubLight;

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
              source === "css" ? "w-full" : ""
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
            ) : (
              <>
                {liveCss ? <style>{liveCss}</style> : null}
                {children}
              </>
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

        <div
          id={`${id}-code-panel`}
          className={`code-panel relative mt-1 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden ${
            isMaximized
              ? "rounded-b-3xl p-6 pt-2"
              : "max-h-[6.5rem] rounded-b-2xl px-4"
          }`}
          style={{
            background:
              "color-mix(in oklab, var(--color-surface-card-subtle) 92%, var(--color-app-bg))",
          }}
        >
          <label id={`${id}-code-editor-label`} className="sr-only">
            Live code editor for {title}
          </label>
          <div
            className={`border-border-strong bg-surface-code focus-within:border-accent-brand focus-within:ring-accent-brand overflow-hidden rounded-lg border shadow-inner focus-within:ring-1 ${
              isMaximized ? "p-3" : "p-2"
            }`}
          >
            {isMaximized ? (
              <CodeMirror
                id={`${id}-code-editor`}
                value={liveCode}
                onChange={(value) => setLiveCode(value)}
                extensions={editorExtensions}
                theme={editorTheme}
                basicSetup={{
                  foldGutter: false,
                  lineNumbers: true,
                  highlightActiveLineGutter: false,
                  highlightActiveLine: false,
                }}
                height={`${maximizedEditorHeightPx}px`}
                maxHeight={`${maximizedEditorHeightPx}px`}
                className="code-block code-editor text-text-tertiary min-h-0 w-full bg-transparent pr-1 font-mono text-sm leading-relaxed focus-visible:outline-none"
                aria-labelledby={`${id}-code-editor-label`}
                aria-describedby={`${id}-code-hint`}
              />
            ) : (
              <textarea
                id={`${id}-code-editor`}
                value={liveCode}
                onChange={(event) => setLiveCode(event.target.value)}
                className="code-block text-text-tertiary min-h-[3.875rem] w-full resize-none overflow-auto bg-transparent pr-1 font-mono text-[10px] leading-relaxed focus-visible:outline-none"
                aria-labelledby={`${id}-code-editor-label`}
                aria-describedby={`${id}-code-hint`}
                spellCheck={false}
              />
            )}
          </div>
        </div>

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
