import { forwardRef, useMemo } from "react";
import { useTheme } from "../hooks/useTheme";
import { collectFrameGlobalCss } from "../lib/frameGlobalStyles";
import { collectFrameThemeCss } from "../lib/frameThemeStyles";
import { FRAME_REPLAY_HELPER } from "../lib/frameReplayHelper";

export type IsolatedDemoFiles = {
  html: string;
  css: string;
  js: string;
  tailwindCss: string;
};

const NETWORK_GUARD = `
(() => {
  const block = (name) => {
    throw new Error(name + " is disabled in this demo frame.");
  };

  const deniedCtor = (name) =>
    class {
      constructor() {
        block(name);
      }
    };

  window.fetch = () =>
    Promise.reject(new Error("fetch is disabled in this demo frame."));
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

function buildFrameDoc(
  files: IsolatedDemoFiles,
  themeClass: "light" | "dark",
  themeCss: string,
  globalCss: string,
): string {

  const escapedGuard = escapeScript(NETWORK_GUARD);
  const escapedReplayHelper = escapeScript(FRAME_REPLAY_HELPER);
  const escapedJs = escapeScript(files.js);
  const inlineStyles = `${files.tailwindCss}\n${files.css}`;
  const html = files.html || "<div>No HTML content provided.</div>";

  return `<!doctype html>
<html lang="en" class="${themeClass}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob: https: http:; font-src data: https: http:; connect-src 'none'; media-src data: blob:; frame-src 'none'; child-src 'none'; form-action 'none';" />
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
  <style>${inlineStyles}</style>
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

interface IsolatedDemoFrameProps {
  files: IsolatedDemoFiles;
}

export const IsolatedDemoFrame = forwardRef<
  HTMLIFrameElement,
  IsolatedDemoFrameProps
>(function IsolatedDemoFrame({ files }, ref) {
  const { theme } = useTheme();
  const themeCss = useMemo(() => collectFrameThemeCss(theme), [theme]);
  const globalCss = useMemo(() => collectFrameGlobalCss(), []);
  const srcDoc = useMemo(
    () => buildFrameDoc(files, theme, themeCss, globalCss),
    [files, theme, themeCss, globalCss],
  );

  return (
    <iframe
      ref={ref}
      title="Isolated demo preview"
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      className="bg-demo-preview-bg h-full w-full rounded-xl border-0"
    />
  );
});
