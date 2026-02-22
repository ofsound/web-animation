import { Suspense, lazy } from "react";
import type { DemoSource } from "../types/demo";

interface LiveCodeEditorProps {
  id: string;
  title: string;
  value: string;
  onChange: (value: string) => void;
  source: DemoSource;
  themeMode: "light" | "dark";
  isMaximized: boolean;
}

const MaximizedCodeEditor = lazy(() =>
  import("./MaximizedCodeEditor").then((module) => ({
    default: module.MaximizedCodeEditor,
  })),
);

export function LiveCodeEditor({
  id,
  title,
  value,
  onChange,
  source,
  themeMode,
  isMaximized,
}: LiveCodeEditorProps) {
  return (
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
          <Suspense
            fallback={
              <textarea
                id={`${id}-code-editor`}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="code-block text-text-tertiary min-h-[16rem] w-full resize-y overflow-auto bg-transparent pr-1 font-mono text-sm leading-relaxed focus-visible:outline-none"
                aria-labelledby={`${id}-code-editor-label`}
                aria-describedby={`${id}-code-hint`}
                spellCheck={false}
              />
            }
          >
            <MaximizedCodeEditor
              id={id}
              title={title}
              value={value}
              onChange={onChange}
              source={source}
              themeMode={themeMode}
            />
          </Suspense>
        ) : (
          <textarea
            id={`${id}-code-editor`}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="code-block text-text-tertiary min-h-[3.875rem] w-full resize-none overflow-auto bg-transparent pr-1 font-mono text-[10px] leading-relaxed focus-visible:outline-none"
            aria-labelledby={`${id}-code-editor-label`}
            aria-describedby={`${id}-code-hint`}
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}
