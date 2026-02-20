import { useState, type ReactNode } from "react";

interface AnimationCardProps {
  id: string;
  title: string;
  description: string;
  code: string;
  children: ReactNode;
  category: string;
}

export function AnimationCard({
  id,
  title,
  description,
  code,
  children,
  category,
}: AnimationCardProps) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [replaying, setReplaying] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplay = () => {
    setReplaying(true);
    setTimeout(() => setReplaying(false), 50);
  };

  return (
    <div
      id={id}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]"
    >
      {/* Category badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-white/40 uppercase">
          {category}
        </span>
      </div>

      {/* Preview area */}
      <div className="flex min-h-[200px] items-center justify-center p-8 pt-12">
        {!replaying && children}
      </div>

      {/* Info bar */}
      <div className="border-t border-white/[0.06] px-5 py-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/90">{title}</h3>
          <div className="flex gap-1.5">
            <button
              onClick={handleReplay}
              className="rounded-md bg-white/[0.06] px-2 py-1 font-mono text-[10px] text-white/50 transition-colors hover:bg-white/[0.12] hover:text-white/80"
              title="Replay animation"
            >
              ↻ Replay
            </button>
            <button
              onClick={() => setShowCode(!showCode)}
              className="rounded-md bg-white/[0.06] px-2 py-1 font-mono text-[10px] text-white/50 transition-colors hover:bg-white/[0.12] hover:text-white/80"
            >
              {showCode ? "Hide" : "Code"}
            </button>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-white/40">{description}</p>
      </div>

      {/* Code panel */}
      {showCode && (
        <div className="border-t border-white/[0.06] bg-black/40">
          <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-2">
            <span className="font-mono text-[10px] tracking-wider text-white/30 uppercase">
              JSX / Tailwind
            </span>
            <button
              onClick={handleCopy}
              className="rounded-md bg-white/[0.06] px-2 py-1 font-mono text-[10px] text-white/50 transition-colors hover:bg-white/[0.12] hover:text-white/80"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <pre className="code-block overflow-x-auto p-4">
            <code className="font-mono text-xs leading-relaxed text-white/60">
              {code}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}
