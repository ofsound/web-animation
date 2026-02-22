import { useMemo } from "react";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import type { DemoSource } from "../types/demo";

interface MaximizedSingleCodeEditorProps {
  id: string;
  title: string;
  value: string;
  onChange: (value: string) => void;
  source: DemoSource;
  themeMode: "light" | "dark";
  codeMirrorSetup: {
    foldGutter: boolean;
    lineNumbers: boolean;
    highlightActiveLineGutter: boolean;
    highlightActiveLine: boolean;
  };
  className: string;
}

function countLines(value: string): number {
  return value.split(/\r\n|\r|\n/).length;
}

export function MaximizedSingleCodeEditor({
  id,
  title,
  value,
  onChange,
  source,
  themeMode,
  codeMirrorSetup,
  className,
}: MaximizedSingleCodeEditorProps) {
  const lineCount = useMemo(() => Math.max(32, countLines(value) + 2), [value]);
  const editorHeightPx = lineCount * 22;
  const editorExtensions = useMemo(() => {
    if (source === "css") return [css()];
    return [html({ autoCloseTags: true, matchClosingTags: true })];
  }, [source]);
  const editorTheme = themeMode === "dark" ? githubDark : githubLight;

  return (
    <CodeMirror
      id={`${id}-code-editor`}
      value={value}
      onChange={onChange}
      extensions={editorExtensions}
      theme={editorTheme}
      basicSetup={codeMirrorSetup}
      height={`${editorHeightPx}px`}
      maxHeight={`${editorHeightPx}px`}
      className={className}
      aria-labelledby={`${id}-code-editor-label`}
      aria-describedby={`${id}-code-hint`}
      aria-label={`Live code editor for ${title}`}
    />
  );
}
