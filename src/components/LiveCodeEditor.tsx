import { useMemo } from "react";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
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

export function LiveCodeEditor({
  id,
  title,
  value,
  onChange,
  source,
  themeMode,
  isMaximized,
}: LiveCodeEditorProps) {
  const maximizedEditorLineCount = useMemo(() => {
    const lineCount = value.split(/\r\n|\r|\n/).length;
    return Math.max(32, lineCount + 2);
  }, [value]);
  const maximizedEditorHeightPx = maximizedEditorLineCount * 22;
  const editorExtensions = useMemo(
    () =>
      source === "css"
        ? [css()]
        : [html({ autoCloseTags: true, matchClosingTags: true })],
    [source],
  );
  const editorTheme = themeMode === "dark" ? githubDark : githubLight;

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
          <CodeMirror
            id={`${id}-code-editor`}
            value={value}
            onChange={onChange}
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
