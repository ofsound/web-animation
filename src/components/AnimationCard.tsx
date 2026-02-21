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
  accent?: string;
  onCopyResult?: (result: CopyResult, demoId: string) => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
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
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--color-button-neutral-border)] transition focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:outline-none";
const ACTION_BTN_HOVER =
  "hover:border-[var(--color-button-neutral-border-hover)] hover:text-[var(--color-button-neutral-fg-hover)]";

export function AnimationCard({
  id,
  metadata,
  children,
  accent,
  onCopyResult,
  isMaximized = false,
  onToggleMaximize,
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
      prevRectRef.current = cardRef.current.getBoundingClientRect();
    }
    onToggleMaximize?.();
  };

  useLayoutEffect(() => {
    if (!prevRectRef.current || !cardRef.current) return;

    const first = prevRectRef.current;
    const finalRect = cardRef.current.getBoundingClientRect();

    if (isMaximized) {
      // ── OPEN: small → large ─────────────────────────────────────────────
      // Cancel any in-flight close timer so z-index state is clean.
      if (closeZTimerRef.current !== null) {
        clearTimeout(closeZTimerRef.current);
        closeZTimerRef.current = null;
      }

      // finalRect has NO transform yet (flipStyle is still null).
      // CSS positions the card at `left: calc(50vw+…) top: 50%`; after
      // translate(-50%,-50%) the visual center lands at (finalRect.left, finalRect.top).
      const dx = first.left + first.width / 2 - finalRect.left;
      const dy = first.top + first.height / 2 - finalRect.top;
      const scaleX = first.width / finalRect.width;
      const scaleY = first.height / finalRect.height;

      // Jump instantly to the small-card position (suppress transition)
      setFlipStyle({
        transition: "none",
        transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scaleX}, ${scaleY})`,
      });

      // Two rAFs guarantee the suppressed frame is committed before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlipStyle({ transform: "translate(-50%, -50%)" });
          prevRectRef.current = null;
        });
      });
    } else {
      // ── CLOSE: large → small ────────────────────────────────────────────
      // first = maximized card's visual rect (getBoundingClientRect includes the
      // translate(-50%,-50%) transform, so it's the true on-screen position).
      // finalRect = small card back in grid flow (no transform).
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
          // Release the transform — Tailwind `transition-all duration-300` animates
          // back to identity. Keep z-index elevated for the full 300 ms duration.
          setFlipStyle({ zIndex: 130 });
          prevRectRef.current = null;

          // Drop elevated z-index only after the transition has finished.
          closeZTimerRef.current = setTimeout(() => {
            setFlipStyle(null);
            closeZTimerRef.current = null;
          }, 320);
        });
      });
    }
  }, [isMaximized]);
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

  return (
    <article
      ref={cardRef}
      id={id}
      className={`group flex flex-col overflow-hidden border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] transition-all duration-300 ${
        isMaximized
          ? "fixed top-1/2 left-[calc(50vw+2.5rem)] z-[120] h-[min(700px,calc(100dvh-1rem))] w-[min(1100px,calc(100vw-5rem-1rem))] rounded-3xl border-2 sm:left-[calc(50vw+9rem)] sm:h-[min(700px,calc(100dvh-2rem))] sm:w-[min(1100px,calc(100vw-18rem-2rem))]"
          : "relative rounded-2xl"
      }`}
      style={{
        ...(accent ? { boxShadow: `0 10px 30px -20px ${accent}` } : {}),
        ...(flipStyle ?? {}),
      }}
    >
      {onToggleMaximize ? (
        <button
          onClick={handleToggleMaximize}
          className={`${ACTION_BTN_BASE} ${ACTION_BTN_HOVER} absolute top-3 right-3 z-20 bg-[var(--color-surface-card-action)] ${
            isMaximized
              ? "px-2.5 py-1.5 text-xs text-[var(--color-text-primary)]"
              : "p-1.5 text-[var(--color-text-secondary)]"
          }`}
          aria-label={
            isMaximized ? `Exit expanded view for ${title}` : `Expand ${title}`
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
        className={`relative flex items-center justify-center ${
          isMaximized
            ? "min-h-[200px] p-5 sm:min-h-[220px] sm:p-6"
            : "min-h-[210px] p-7"
        }`}
      >
        <div
          key={`${id}-${replayKey}`}
          data-live-demo-root={id}
          className={`flex items-center justify-center ${
            isMaximized || source === "css" ? "w-full" : ""
          }`}
        >
          {source === "tailwind" ? (
            liveTailwindMarkup ? (
              <div
                className={isMaximized ? "w-full" : "max-w-full"}
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
          className={`${ACTION_BTN_BASE} ${ACTION_BTN_HOVER} absolute right-3 bottom-3 z-20 bg-[var(--color-surface-card-action)] text-[var(--color-text-secondary)] ${
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
        className={`relative bg-[var(--color-surface-card-subtle)] ${isMaximized ? "px-6 py-5" : "px-4 py-4"}`}
      >
        <div className="mb-2">
          <h3
            className={
              isMaximized
                ? "text-xl font-semibold text-[var(--color-text-primary)]"
                : "text-sm font-semibold text-[var(--color-text-primary)]"
            }
          >
            {title}
          </h3>
        </div>
        <p
          className={
            isMaximized
              ? "text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base"
              : "text-xs leading-relaxed text-[var(--color-text-secondary)]"
          }
        >
          {description}
        </p>
      </div>

      <div
        id={`${id}-code-panel`}
        className={`code-panel relative flex min-h-0 flex-1 flex-col overflow-hidden border-t border-[var(--color-border-subtle)] ${
          isMaximized ? "rounded-b-3xl p-6 pt-12" : "rounded-b-2xl p-4 pt-9"
        }`}
        style={{
          background:
            "color-mix(in oklab, var(--color-surface-card-subtle) 92%, var(--color-app-bg))",
        }}
      >
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <button
            onClick={() => setLiveCode(metadata.code)}
            disabled={!isCodeDirty}
            className={`${ACTION_BTN_BASE} bg-[var(--color-button-neutral-bg)] text-[var(--color-button-neutral-fg)] enabled:hover:border-[var(--color-button-neutral-border-hover)] enabled:hover:bg-[var(--color-button-neutral-bg-hover)] enabled:hover:text-[var(--color-button-neutral-fg-hover)] disabled:cursor-not-allowed disabled:opacity-40 ${
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
            className={`${ACTION_BTN_BASE} ${ACTION_BTN_HOVER} bg-[var(--color-button-neutral-bg)] text-[var(--color-button-neutral-fg)] ${
              isMaximized ? "px-2.5 py-1.5 text-xs" : "p-1.5"
            } ${copyState === "copied" ? "border-emerald-500/50! text-emerald-400!" : copyState === "failed" ? "border-red-500/50! text-red-400!" : ""}`}
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
        <label htmlFor={`${id}-code-editor`} className="sr-only">
          Live code editor for {title}
        </label>
        <textarea
          id={`${id}-code-editor`}
          rows={isMaximized ? 16 : 3}
          value={liveCode}
          onChange={(event) => setLiveCode(event.target.value)}
          spellCheck={false}
          className={`code-block code-editor w-full flex-1 resize-y overflow-auto bg-transparent pr-1 font-mono leading-relaxed text-[var(--color-text-tertiary)] focus-visible:outline-none ${
            isMaximized ? "min-h-[14rem] text-sm" : "min-h-[6.5rem] text-[10px]"
          }`}
          aria-describedby={`${id}-code-hint`}
        />
      </div>

      <span className="sr-only" aria-live="polite">
        {copyState === "copied"
          ? `${title} code copied to clipboard.`
          : copyState === "failed"
            ? `Failed to copy ${title} code.`
            : ""}
      </span>
    </article>
  );
}
