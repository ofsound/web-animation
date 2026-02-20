export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "tailwind-gallery-theme";

export function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;

  return "dark";
}

/** Runs on import to set theme before React renders; prevents FOUC. */
function initTheme(): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = getPreferredTheme();
}

initTheme();
