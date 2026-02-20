import { useState, type ReactNode } from "react";
import { animationDemoMetaById, type AnimationDemo } from "../data/animations";

type CopyResult = "success" | "error";

interface AnimationCardProps {
  /** Demo id; metadata (title, description, code, etc.) is read from animationDemoMetaById */
  id: string;
  /** The live preview (JSX) for the animation demo */
  children: ReactNode;
  accent?: string;
  onCopyResult?: (result: CopyResult, demoId: string) => void;
}

export function AnimationCard({
  id,
  children,
  accent,
  onCopyResult,
}: AnimationCardProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [replayKey, setReplayKey] = useState(0);

  const metadata = animationDemoMetaById.get(id);
  if (!metadata) {
    throw new Error(`AnimationCard: no metadata found for demo id "${id}"`);
  }

  const { title, description, code } = metadata as AnimationDemo;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
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
      className="group relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--surface-2)] shadow-[0_8px_28px_-20px_color-mix(in_oklab,var(--text-1)_55%,transparent)] transition-all duration-300"
      style={accent ? { boxShadow: `0 10px 30px -20px ${accent}` } : undefined}
    >
      <div className="relative flex min-h-[210px] items-center justify-center p-7">
        <div key={`${id}-${replayKey}`}>{children}</div>
      </div>

      <div className="relative px-4 py-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-[var(--text-1)]">
            {title}
          </h3>
          <button
            onClick={() => setReplayKey((value) => value + 1)}
            className="rounded-md border border-[var(--card-border)] bg-[var(--surface-3)] px-2 py-1 font-mono text-[10px] text-[var(--text-2)] transition hover:border-[var(--brand)] hover:text-[var(--text-1)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
            title="Replay animation"
            aria-label={`Replay ${title} animation`}
          >
            Replay
          </button>
        </div>
        <p className="text-xs leading-relaxed text-[var(--text-2)]">
          {description}
        </p>
      </div>

      <div
        id={`${id}-code-panel`}
        className="relative overflow-hidden rounded-b-2xl border border-t-0 border-[var(--card-border)] bg-[var(--surface-3)] p-4 pt-9"
      >
        <button
          onClick={handleCopy}
          className="absolute right-3 top-3 z-10 rounded-md border border-[var(--card-border)] bg-[var(--surface-2)] px-2 py-1 font-mono text-[10px] text-[var(--text-2)] transition hover:border-[var(--brand)] hover:text-[var(--text-1)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
          aria-label={`Copy code for ${title}`}
        >
          {copyState === "copied"
            ? "Copied"
            : copyState === "failed"
              ? "Failed"
              : "Copy"}
        </button>
        <pre className="code-block overflow-hidden">
          <code className="font-mono text-[10px] leading-relaxed text-[var(--text-3)]">
            {code}
          </code>
        </pre>
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
