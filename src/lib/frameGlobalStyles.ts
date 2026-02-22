const DEV_INDEX_CSS_SUFFIX = "/src/index.css";
const PROD_INDEX_CSS_PATTERN = /\/assets\/index-[^/]+\.css(?:[?#].*)?$/i;

function isElement(node: Node | null): node is Element {
  return typeof Element !== "undefined" && node instanceof Element;
}

function isAppIndexStylesheet(sheet: CSSStyleSheet): boolean {
  const owner = sheet.ownerNode;
  if (!isElement(owner)) return false;

  if (owner.tagName === "STYLE") {
    const devId = owner.getAttribute("data-vite-dev-id");
    if (devId?.endsWith(DEV_INDEX_CSS_SUFFIX)) return true;
  }

  if (owner.tagName === "LINK") {
    const href = (owner as HTMLLinkElement).href || sheet.href || "";
    return PROD_INDEX_CSS_PATTERN.test(href);
  }

  return false;
}

function toStylesheetText(sheet: CSSStyleSheet): string {
  try {
    return Array.from(sheet.cssRules)
      .map((rule) => rule.cssText)
      .join("\n");
  } catch {
    return "";
  }
}

export function collectFrameGlobalCss(): string {
  if (typeof document === "undefined") return "";

  const sheets = Array.from(document.styleSheets) as CSSStyleSheet[];
  const css = sheets
    .filter(isAppIndexStylesheet)
    .map(toStylesheetText)
    .filter((text) => text.trim().length > 0)
    .join("\n");

  return css;
}
