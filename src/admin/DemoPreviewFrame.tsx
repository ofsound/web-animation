import { useMemo } from "react";
import { useTheme } from "../hooks/useTheme";
import { collectFrameGlobalCss } from "../lib/frameGlobalStyles";
import { collectFrameThemeCss } from "../lib/frameThemeStyles";
import { FRAME_REPLAY_HELPER } from "../lib/frameReplayHelper";
import type { DemoDraft } from "./types";

const NETWORK_GUARD = `
(() => {
  const block = (name) => {
    throw new Error(name + " is disabled in this preview.");
  };

  const deniedCtor = (name) =>
    class {
      constructor() {
        block(name);
      }
    };

  window.fetch = () => Promise.reject(new Error("fetch is disabled in this preview."));
  window.XMLHttpRequest = deniedCtor("XMLHttpRequest");
  window.WebSocket = deniedCtor("WebSocket");
  window.EventSource = deniedCtor("EventSource");

  if (navigator && typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon = () => false;
  }

  window.open = () => null;
})();
`;

function escapeScript(input: string): string {
  return input.replace(/<\/script/gi, "<\\/script");
}

function buildPreviewDoc(
  draft: DemoDraft,
  themeClass: "light" | "dark",
  themeCss: string,
  globalCss: string,
): string {
  const html = draft.files.html || "<div>No HTML provided.</div>";
  const css = `${draft.files.tailwind_css}\n${draft.files.css}`;
  const js = draft.files.js;

  const escapedJs = escapeScript(js);
  const escapedGuard = escapeScript(NETWORK_GUARD);
  const escapedReplayHelper = escapeScript(FRAME_REPLAY_HELPER);

  return `<!doctype html>
<html lang="en" class="${themeClass}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob: https: http:; font-src data: https: http:; connect-src 'none'; media-src data: blob:; child-src 'none'; frame-src 'none';" />
  <style>${themeCss}</style>
  <style>${globalCss}</style>
  <style>
    html, body {
      margin: 0;
      min-height: 100%;
    }
    body {
      box-sizing: border-box;
      overflow: auto;
    }
    #demo-root {
      min-height: 100dvh;
      width: 100%;
      box-sizing: border-box;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
    }
  </style>
  <style>${css}</style>
</head>
<body>
  <div id="demo-root">${html}</div>
  <script>${escapedGuard}</script>
  <script>${escapedReplayHelper}</script>
  <script>
  try {
${escapedJs}
  } catch (error) {
    const pre = document.createElement("pre");
    pre.textContent = String(error instanceof Error ? error.message : error);
    pre.style.cssText = "margin: 16px; padding: 12px; border: 1px solid #f87171; background: #450a0a; color: #fecaca; border-radius: 10px; font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;";
    document.body.appendChild(pre);
  }
  </script>
</body>
</html>`;
}

interface DemoPreviewFrameProps {
  draft: DemoDraft | null;
}

export function DemoPreviewFrame({ draft }: DemoPreviewFrameProps) {
  const { theme } = useTheme();
  const themeCss = useMemo(() => collectFrameThemeCss(theme), [theme]);
  const globalCss = useMemo(() => collectFrameGlobalCss(), []);

  const srcDoc = useMemo(() => {
    if (!draft) return "";
    return buildPreviewDoc(draft, theme, themeCss, globalCss);
  }, [draft, theme, themeCss, globalCss]);

  if (!draft) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-border-subtle bg-surface-control p-4 text-sm text-text-tertiary">
        Select a demo to preview.
      </div>
    );
  }

  return (
    <iframe
      title="Demo preview frame"
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      className="bg-demo-preview-bg h-[360px] w-full rounded-xl border border-border-subtle"
    />
  );
}
