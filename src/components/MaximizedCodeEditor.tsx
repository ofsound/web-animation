import { useMemo } from "react";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import type { DemoSource } from "../types/demo";

interface MaximizedCodeEditorProps {
  id: string;
  title: string;
  value: string;
  onChange: (value: string) => void;
  source: DemoSource;
  themeMode: "light" | "dark";
}

export function MaximizedCodeEditor({
  id,
  title,
  value,
  onChange,
  source,
  themeMode,
}: MaximizedCodeEditorProps) {
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
      aria-label={`Live code editor for ${title}`}
    />
  );
}
