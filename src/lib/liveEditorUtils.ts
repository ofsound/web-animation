const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const CSS_RULE_LINE_PATTERN =
  /^\s*(?:@|\.|#|:|::|\*|[a-z][\w-]*(?:\[[^\]]+\])?)[^{()]*\{/i;

export interface LiveDatabaseFiles {
  html: string;
  css: string;
  js: string;
  tailwindCss: string;
}

type LiveDatabaseSection = keyof LiveDatabaseFiles;
const LIVE_DATABASE_SECTION_INDEX: Record<LiveDatabaseSection, number> = {
  html: 0,
  tailwindCss: 1,
  css: 2,
  js: 3,
};

function toLiveDatabaseSection(line: string): LiveDatabaseSection | null {
  const marker = line.trim();
  if (/^<!--\s*html\s*-->$/i.test(marker)) return "html";
  if (/^\/\*\s*tailwind css\s*\*\/$/i.test(marker)) return "tailwindCss";
  if (/^\/\*\s*css\s*\*\/$/i.test(marker)) return "css";
  if (/^\/\/\s*javascript\s*$/i.test(marker)) return "js";
  return null;
}

export function toLiveDatabaseFiles(input: string): LiveDatabaseFiles {
  const files: LiveDatabaseFiles = {
    html: "",
    css: "",
    js: "",
    tailwindCss: "",
  };

  if (!input) return files;

  const normalizedInput = input.replace(/\r\n?/g, "\n");
  const lines = normalizedInput.split("\n");

  let currentSection: LiveDatabaseSection = "html";
  let currentSectionIndex = LIVE_DATABASE_SECTION_INDEX[currentSection];
  let hasSectionMarkers = false;

  for (const line of lines) {
    const nextSection = toLiveDatabaseSection(line);
    if (nextSection) {
      const nextSectionIndex = LIVE_DATABASE_SECTION_INDEX[nextSection];
      const isInitialHtmlMarker =
        nextSection === "html" && !hasSectionMarkers && files.html === "";

      // Section markers only move forward (or consume the initial HTML marker)
      // so marker-like lines inside JS/CSS content don't reshuffle sections.
      if (isInitialHtmlMarker || nextSectionIndex > currentSectionIndex) {
        currentSection = nextSection;
        currentSectionIndex = nextSectionIndex;
        hasSectionMarkers = true;
        continue;
      }
    }

    files[currentSection] = files[currentSection]
      ? `${files[currentSection]}\n${line}`
      : line;
  }

  if (!hasSectionMarkers) {
    files.html = input;
    files.css = "";
    files.js = "";
    files.tailwindCss = "";
  }

  return files;
}

export function toLiveDatabaseCode(files: LiveDatabaseFiles): string {
  const sections = [
    `<!-- HTML -->\n${files.html}`,
    `/* Tailwind CSS */\n${files.tailwindCss}`,
    `/* CSS */\n${files.css}`,
    `// JavaScript\n${files.js}`,
  ];

  return sections.join("\n\n");
}

export function toLiveTailwindMarkup(input: string): string | null {
  if (typeof window === "undefined") return null;

  let jsxLikeMarkup = input.trim();
  if (!jsxLikeMarkup) return null;

  jsxLikeMarkup = jsxLikeMarkup
    .replace(/\bclassName=/g, "class=")
    .replace(/\bhtmlFor=/g, "for=")
    .replace(/\{\s*"([^"]*)"\s*\}/g, "$1")
    .replace(/\{\s*'([^']*)'\s*\}/g, "$1")
    .replace(/<>\s*/g, "<div>")
    .replace(/\s*<\/>\s*/g, "</div>")
    .replace(/<([a-z][\w-]*)([^>]*)\/>/gi, (match, tag, attrs) => {
      return VOID_TAGS.has(String(tag).toLowerCase())
        ? match
        : `<${tag}${attrs}></${tag}>`;
    });

  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<div data-live-tailwind-root>${jsxLikeMarkup}</div>`,
    "text/html",
  );
  const root = doc.body.firstElementChild;
  if (!root) return null;

  root.querySelectorAll("script").forEach((element) => element.remove());
  root.querySelectorAll("*").forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.startsWith("on")) {
        element.removeAttribute(attribute.name);
      }
    }
  });

  return root.innerHTML || null;
}

function extractCssCandidate(input: string): string {
  const lines = input.split("\n");
  const firstRuleLine = lines.findIndex((line) =>
    CSS_RULE_LINE_PATTERN.test(line),
  );
  if (firstRuleLine === -1) return "";
  return lines.slice(firstRuleLine).join("\n");
}

export function toScopedLiveCss(input: string, demoId: string): string {
  const cssCandidate = extractCssCandidate(input);
  if (!cssCandidate) return "";

  const withoutJsComments = cssCandidate.replace(/^\s*\/\/.*$/gm, "");
  const classSelectorPortable = withoutJsComments.replace(
    /(?<![\w-])\.([A-Za-z_-][\w-]*)/g,
    `[class*="$1"]`,
  );
  const scopedSelector = `[data-live-demo-root="${demoId}"]`;

  return `@scope (${scopedSelector}) {\n${classSelectorPortable}\n}`;
}
