import { describe, expect, it } from "vitest";
import { toLiveDatabaseCode, toLiveDatabaseFiles } from "./liveEditorUtils";

function trimTrailingNewline(value: string): string {
  return value.endsWith("\n") ? value.slice(0, -1) : value;
}

describe("toLiveDatabaseFiles", () => {
  it("parses canonical section markers into files", () => {
    const code = toLiveDatabaseCode({
      html: "<div>Demo</div>",
      tailwindCss: ".shell { display: grid; }",
      css: ".orbit { offset-distance: 50%; }",
      js: "console.log('ok');",
    });

    const parsed = toLiveDatabaseFiles(code);
    expect(trimTrailingNewline(parsed.html)).toBe("<div>Demo</div>");
    expect(trimTrailingNewline(parsed.tailwindCss)).toBe(
      ".shell { display: grid; }",
    );
    expect(trimTrailingNewline(parsed.css)).toBe(
      ".orbit { offset-distance: 50%; }",
    );
    expect(parsed.js).toBe("console.log('ok');");
  });

  it("does not backtrack sections when marker-like lines appear inside JavaScript", () => {
    const jsWithCssTemplate = [
      "const cssSnippet = `",
      "/* CSS */",
      "@property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }",
      ".orbit { offset-distance: 50%; }",
      "`;",
      "console.log(cssSnippet);",
    ].join("\n");

    const code = toLiveDatabaseCode({
      html: "<div>Demo</div>",
      tailwindCss: ".shell { display: grid; }",
      css: ".baseline { color: red; }",
      js: jsWithCssTemplate,
    });

    const parsed = toLiveDatabaseFiles(code);

    expect(trimTrailingNewline(parsed.css)).toBe(".baseline { color: red; }");
    expect(parsed.js).toContain("const cssSnippet = `");
    expect(parsed.js).toContain("/* CSS */");
    expect(parsed.js).toContain("@property --angle");
    expect(parsed.js).toContain(".orbit { offset-distance: 50%; }");
    expect(parsed.js).toContain("console.log(cssSnippet);");
  });
});
