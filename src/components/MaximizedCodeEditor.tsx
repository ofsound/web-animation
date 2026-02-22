import { useMemo, useState } from "react";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import {
  toLiveDatabaseCode,
  toLiveDatabaseFiles,
} from "../lib/liveEditorUtils";
import type { DemoSource } from "../types/demo";
import { IconCheck, IconCopy, IconX } from "./AnimationCardIcons";
import { MaximizedSingleCodeEditor } from "./MaximizedSingleCodeEditor";

interface MaximizedCodeEditorProps {
  id: string;
  title: string;
  value: string;
  baselineValue: string;
  onChange: (value: string) => void;
  source: DemoSource;
  themeMode: "light" | "dark";
}

type DatabasePanelKind = "html" | "css" | "js";

const DATABASE_PANEL_ORDER: DatabasePanelKind[] = [
  "html",
  "css",
  "js",
];

const DATABASE_PANEL_LABEL: Record<DatabasePanelKind, string> = {
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
};

const CODEMIRROR_SETUP = {
  foldGutter: false,
  lineNumbers: true,
  highlightActiveLineGutter: false,
  highlightActiveLine: false,
} as const;

const EDITOR_CLASS =
  "code-block code-editor text-text-tertiary min-h-0 w-full bg-transparent pr-1 font-mono text-sm leading-relaxed focus-visible:outline-none";

const EDITOR_CLASS_DATABASE =
  "code-block code-editor text-text-tertiary h-full min-h-0 w-full bg-transparent pr-1 font-mono text-xs leading-relaxed focus-visible:outline-none";

function toDatabaseColumns(maximizedPanel: DatabasePanelKind | null): string {
  if (!maximizedPanel) return "repeat(3, minmax(220px, 1fr))";

  return DATABASE_PANEL_ORDER.map((panel) =>
    panel === maximizedPanel ? "minmax(420px, 1fr)" : "56px",
  ).join(" ");
}

function toPanelExtensions(panel: DatabasePanelKind) {
  if (panel === "html") {
    return [html({ autoCloseTags: true, matchClosingTags: true })];
  }

  if (panel === "css") {
    return [css()];
  }

  return [];
}

export function MaximizedCodeEditor({
  id,
  title,
  value,
  onChange,
  source,
  themeMode,
}: MaximizedCodeEditorProps) {
  const [maximizedPanel, setMaximizedPanel] = useState<DatabasePanelKind | null>(
    null,
  );
  const [panelCopyState, setPanelCopyState] = useState<
    Record<DatabasePanelKind, "idle" | "copied" | "failed">
  >({
    html: "idle",
    css: "idle",
    js: "idle",
  });
  const databaseFiles = useMemo(
    () => (source === "database" ? toLiveDatabaseFiles(value) : null),
    [source, value],
  );
  const databaseColumns = useMemo(
    () => toDatabaseColumns(maximizedPanel),
    [maximizedPanel],
  );
  const editorTheme = themeMode === "dark" ? githubDark : githubLight;

  if (source === "database" && databaseFiles) {
    const updatePanel = (panel: DatabasePanelKind, nextValue: string) => {
      onChange(
        toLiveDatabaseCode({
          ...databaseFiles,
          [panel]: nextValue,
        }),
      );
    };

    const copyPanel = async (panel: DatabasePanelKind) => {
      try {
        await navigator.clipboard.writeText(databaseFiles[panel]);
        setPanelCopyState((current) => ({ ...current, [panel]: "copied" }));
      } catch {
        setPanelCopyState((current) => ({ ...current, [panel]: "failed" }));
      }

      window.setTimeout(() => {
        setPanelCopyState((current) => ({ ...current, [panel]: "idle" }));
      }, 1500);
    };

    return (
      <div className="flex h-full min-h-0 flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {DATABASE_PANEL_ORDER.map((panel) => (
            <button
              key={panel}
              type="button"
              onClick={() =>
                setMaximizedPanel((current) => (current === panel ? null : panel))
              }
              className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${
                maximizedPanel === panel
                  ? "border-accent-brand bg-accent-soft text-text-primary"
                  : "border-border-subtle bg-surface-control text-text-secondary"
              }`}
            >
              {DATABASE_PANEL_LABEL[panel]}
            </button>
          ))}
          {maximizedPanel ? (
            <button
              type="button"
              onClick={() => setMaximizedPanel(null)}
              className="rounded-md border border-border-subtle bg-surface-control px-2 py-1 text-[11px] font-semibold text-text-secondary"
            >
              Show all
            </button>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden pb-1">
          <div
            className="grid h-full min-w-[740px] gap-2.5"
            style={{ gridTemplateColumns: databaseColumns }}
          >
            {DATABASE_PANEL_ORDER.map((panel) => {
              const compressed = maximizedPanel !== null && maximizedPanel !== panel;
              const panelLabel = DATABASE_PANEL_LABEL[panel];
              const copyState = panelCopyState[panel];

              return (
                <section
                  key={panel}
                  className="border-border-strong bg-surface-code flex min-h-0 flex-col overflow-hidden rounded-xl border shadow-inner"
                >
                  {compressed ? (
                    <div className="flex h-[180px] flex-col items-center gap-1.5 px-1 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          void copyPanel(panel);
                        }}
                        className={`inline-flex size-7 items-center justify-center rounded border transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none ${
                          copyState === "copied"
                            ? "border-status-success/50 text-status-success"
                            : copyState === "failed"
                              ? "border-status-error/50 text-status-error"
                              : "border-border-subtle bg-surface-control text-text-secondary hover:border-button-neutral-border-hover hover:text-text-primary"
                        }`}
                        title={`Copy ${panelLabel}`}
                        aria-label={`Copy ${panelLabel} code`}
                      >
                        {copyState === "copied" ? (
                          <IconCheck className="size-3.5" />
                        ) : copyState === "failed" ? (
                          <IconX className="size-3.5" />
                        ) : (
                          <IconCopy className="size-3.5" />
                        )}
                      </button>
                      <span
                        className="text-text-tertiary mt-auto text-[10px] font-semibold"
                        aria-hidden
                      >
                        {panelLabel}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="border-border-subtle bg-surface-card-subtle flex items-center justify-between rounded-t-xl border-b px-2 py-1.5">
                        <p className="text-text-secondary text-[11px] font-semibold uppercase tracking-wide">
                          {panelLabel}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              void copyPanel(panel);
                            }}
                            className={`inline-flex size-6 items-center justify-center rounded border transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none ${
                              copyState === "copied"
                                ? "border-status-success/50 text-status-success"
                                : copyState === "failed"
                                  ? "border-status-error/50 text-status-error"
                                  : "border-border-subtle bg-surface-control text-text-secondary hover:border-button-neutral-border-hover hover:text-text-primary"
                            }`}
                            title={`Copy ${panelLabel}`}
                            aria-label={`Copy ${panelLabel} code`}
                          >
                            {copyState === "copied" ? (
                              <IconCheck className="size-3" />
                            ) : copyState === "failed" ? (
                              <IconX className="size-3" />
                            ) : (
                              <IconCopy className="size-3" />
                            )}
                          </button>
                        </div>
                      </div>
                      <span id={`${id}-${panel}-code-editor-label`} className="sr-only">
                        Live {panelLabel} editor for {title}
                      </span>
                      <div className="min-h-0 flex-1 overflow-hidden rounded-b-xl border-x border-b border-border-subtle">
                        <CodeMirror
                          id={`${id}-${panel}-code-editor`}
                          value={databaseFiles[panel]}
                          onChange={(nextValue) => updatePanel(panel, nextValue)}
                          extensions={toPanelExtensions(panel)}
                          theme={editorTheme}
                          basicSetup={CODEMIRROR_SETUP}
                          height="100%"
                          maxHeight="100%"
                          className={`${EDITOR_CLASS_DATABASE} database-code-editor`}
                          aria-labelledby={`${id}-${panel}-code-editor-label`}
                          aria-describedby={`${id}-code-hint`}
                        />
                      </div>
                    </>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <MaximizedSingleCodeEditor
      id={id}
      title={title}
      value={value}
      onChange={onChange}
      source={source}
      themeMode={themeMode}
      codeMirrorSetup={CODEMIRROR_SETUP}
      className={EDITOR_CLASS}
    />
  );
}
