import { useMemo } from "react";

export type IsolatedDemoFiles = {
  html: string;
  css: string;
  js: string;
  tailwindCss: string;
  meta: string;
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

let cachedStylesheetText: string | null = null;

function escapeScript(input: string): string {
  return input.replace(/<\/script/gi, "<\\/script");
}

function collectHostStylesheetText(): string {
  if (cachedStylesheetText !== null) {
    return cachedStylesheetText;
  }

  if (typeof document === "undefined") {
    cachedStylesheetText = "";
    return cachedStylesheetText;
  }

  let cssText = "";
  for (const stylesheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(stylesheet.cssRules)) {
        cssText += `${rule.cssText}\n`;
      }
    } catch {
      // Ignore inaccessible stylesheets.
    }
  }

  cachedStylesheetText = cssText;
  return cssText;
}

function getThemeClass(): string {
  if (typeof document === "undefined") return "";
  if (document.documentElement.classList.contains("dark")) return "dark";
  if (document.documentElement.classList.contains("light")) return "light";
  return "";
}

function buildFrameDoc(files: IsolatedDemoFiles): string {
  const appStyles = collectHostStylesheetText();
  const themeClass = getThemeClass();

  const escapedGuard = escapeScript(NETWORK_GUARD);
  const escapedJs = escapeScript(files.js);
  const inlineStyles = `${files.tailwindCss}\n${files.css}`;
  const html = files.html || "<div>No HTML content provided.</div>";

  return `<!doctype html>
<html lang="en" class="${themeClass}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob: https: http:; font-src data: https: http:; connect-src 'none'; media-src data: blob:; frame-src 'none'; child-src 'none'; form-action 'none';" />
  <style>${appStyles}</style>
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

export function IsolatedDemoFrame({ files }: IsolatedDemoFrameProps) {
  const srcDoc = useMemo(() => buildFrameDoc(files), [files]);

  return (
    <iframe
      title="Isolated demo preview"
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      className="h-full w-full rounded-xl border-0 bg-white"
    />
  );
}
