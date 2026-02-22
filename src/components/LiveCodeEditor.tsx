import { MaximizedCodeEditor } from "./MaximizedCodeEditor";
import type { DemoSource } from "../types/demo";

interface LiveCodeEditorProps {
  id: string;
  title: string;
  value: string;
  baselineValue: string;
  onChange: (value: string) => void;
  source: DemoSource;
  themeMode: "light" | "dark";
  isMaximized: boolean;
}

export function LiveCodeEditor({
  id,
  title,
  value,
  baselineValue,
  onChange,
  source,
  themeMode,
  isMaximized,
}: LiveCodeEditorProps) {
  return (
    <div
      id={`${id}-code-panel`}
      className={`code-panel relative flex min-h-0 flex-1 flex-col overflow-hidden ${
        isMaximized
          ? "mb-0 mt-0.5 rounded-b-3xl p-6 pt-1"
          : "mb-4 mt-1 max-h-[6.5rem] rounded-b-2xl px-4"
      }`}
    >
      <label id={`${id}-code-editor-label`} className="sr-only">
        Live code editor for {title}
      </label>
      <div
        className={`overflow-hidden ${
          isMaximized
            ? "flex h-full min-h-0 flex-col pl-0 pr-3 pt-1.5 pb-3"
            : "border-border-strong bg-surface-code focus-within:border-accent-brand focus-within:ring-accent-brand rounded-lg border shadow-inner focus-within:ring-1 p-2"
        }`}
      >
        {isMaximized ? (
          <MaximizedCodeEditor
            id={id}
            title={title}
            value={value}
            baselineValue={baselineValue}
            onChange={onChange}
            source={source}
            themeMode={themeMode}
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
