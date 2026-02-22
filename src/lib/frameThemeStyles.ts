type FrameTheme = "light" | "dark";

export function collectFrameThemeCss(theme: FrameTheme): string {
  if (typeof document === "undefined") {
    return "";
  }

  const computed = window.getComputedStyle(document.documentElement);
  const declarations: string[] = [`color-scheme: ${theme};`];

  for (let index = 0; index < computed.length; index += 1) {
    const name = computed.item(index);
    if (!name.startsWith("--")) continue;

    const value = computed.getPropertyValue(name).trim();
    if (!value) continue;

    declarations.push(`${name}: ${value};`);
  }

  return `:root {\n  ${declarations.join("\n  ")}\n}`;
}
