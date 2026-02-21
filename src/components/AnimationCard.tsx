import { useMemo, useState, type ReactNode } from "react";
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
  isObscured?: boolean;
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
  const firstRuleLine = lines.findIndex((line) => CSS_RULE_LINE_PATTERN.test(line));
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

export function AnimationCard({
  id,
  metadata,
  children,
  accent,
  onCopyResult,
  isMaximized = false,
  isObscured = false,
  onToggleMaximize,
}: AnimationCardProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [replayKey, setReplayKey] = useState(0);
  const [liveCode, setLiveCode] = useState(() => metadata.code);

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
      id={id}
      className={`group flex flex-col overflow-hidden border border-[var(--card-border)] bg-[var(--surface-2)] shadow-[0_8px_28px_-20px_color-mix(in_oklab,var(--text-1)_55%,transparent)] transition-all duration-300 ${
        isMaximized
          ? "fixed top-2 right-2 bottom-2 left-[calc(5rem+0.5rem)] z-[120] h-[calc(100dvh-1rem)] rounded-3xl border-2 sm:top-4 sm:right-4 sm:bottom-4 sm:left-[calc(18rem+0.75rem)]"
          : "relative rounded-2xl"
      } ${isObscured ? "pointer-events-none opacity-0 sm:opacity-20" : ""}`}
      style={accent ? { boxShadow: `0 10px 30px -20px ${accent}` } : undefined}
    >
      {onToggleMaximize ? (
        <button
          onClick={onToggleMaximize}
          className={`absolute top-3 right-3 z-20 rounded-md border border-[var(--card-border)] bg-[var(--surface-3)] px-2 py-1 font-mono transition hover:border-[var(--brand)] hover:text-[var(--text-1)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none ${
            isMaximized ? "text-xs text-[var(--text-1)]" : "text-[10px] text-[var(--text-2)]"
          }`}
          aria-label={isMaximized ? `Exit expanded view for ${title}` : `Expand ${title}`}
          title={isMaximized ? "Minimize view" : "Maximize view"}
        >
          {isMaximized ? "Minimize" : "Maximize"}
        </button>
      ) : null}

      <div
        className={`relative flex items-center justify-center ${
          isMaximized ? "min-h-[260px] p-8 sm:min-h-[300px]" : "min-h-[210px] p-7"
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
      </div>

      <div className={isMaximized ? "relative px-6 py-5" : "relative px-4 py-4"}>
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3
            className={
              isMaximized
                ? "text-xl font-semibold text-[var(--text-1)]"
                : "text-sm font-semibold text-[var(--text-1)]"
            }
          >
            {title}
          </h3>
          <button
            onClick={() => setReplayKey((value) => value + 1)}
            className={`rounded-md border border-[var(--card-border)] bg-[var(--surface-3)] font-mono text-[var(--text-2)] transition hover:border-[var(--brand)] hover:text-[var(--text-1)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none ${
              isMaximized ? "px-3 py-1.5 text-xs" : "px-2 py-1 text-[10px]"
            }`}
            title="Replay animation"
            aria-label={`Replay ${title} animation`}
          >
            Replay
          </button>
        </div>
        <p
          className={
            isMaximized
              ? "text-sm leading-relaxed text-[var(--text-2)] sm:text-base"
              : "text-xs leading-relaxed text-[var(--text-2)]"
          }
        >
          {description}
        </p>
      </div>

      <div
        id={`${id}-code-panel`}
        className={`relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--surface-3)] ${
          isMaximized ? "rounded-b-3xl p-6 pt-12" : "rounded-b-2xl p-4 pt-9"
        }`}
      >
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <button
            onClick={() => setLiveCode(metadata.code)}
            disabled={!isCodeDirty}
            className={`rounded-md border border-[var(--card-border)] bg-[var(--surface-2)] font-mono text-[var(--text-2)] transition enabled:hover:border-[var(--brand)] enabled:hover:text-[var(--text-1)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none ${
              isMaximized ? "px-3 py-1.5 text-xs" : "px-2 py-1 text-[10px]"
            }`}
            aria-label={`Reset code for ${title}`}
          >
            Reset
          </button>
          <button
            onClick={handleCopy}
            className={`rounded-md border border-[var(--card-border)] bg-[var(--surface-2)] font-mono text-[var(--text-2)] transition hover:border-[var(--brand)] hover:text-[var(--text-1)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none ${
              isMaximized ? "px-3 py-1.5 text-xs" : "px-2 py-1 text-[10px]"
            }`}
            aria-label={`Copy code for ${title}`}
          >
            {copyState === "copied"
              ? "Copied"
              : copyState === "failed"
                ? "Failed"
                : "Copy"}
          </button>
        </div>
        <label htmlFor={`${id}-code-editor`} className="sr-only">
          Live code editor for {title}
        </label>
        <textarea
          id={`${id}-code-editor`}
          rows={isMaximized ? 16 : 8}
          value={liveCode}
          onChange={(event) => setLiveCode(event.target.value)}
          spellCheck={false}
          className={`code-block code-editor w-full flex-1 resize-y overflow-auto bg-transparent pr-1 font-mono leading-relaxed text-[var(--text-3)] focus-visible:outline-none ${
            isMaximized ? "min-h-[45dvh] text-sm" : "min-h-[10.5rem] text-[10px]"
          }`}
          aria-describedby={`${id}-code-hint`}
        />
        <p
          id={`${id}-code-hint`}
          className={`pt-2 font-mono text-[var(--text-3)] ${
            isMaximized ? "text-xs" : "text-[10px]"
          }`}
        >
          Live editor - preview updates as you type
        </p>
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
