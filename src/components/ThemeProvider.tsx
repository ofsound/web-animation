import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { ThemeContext, type Theme } from "../context/ThemeContext";

const STORAGE_KEY = "theme";

const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
};

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return getSystemTheme();
};

const applyThemeClass = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
};

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyThemeClass(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");

    const listener = () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") return;
      setThemeState(media.matches ? "light" : "dark");
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const toggleTheme = () => {
    setThemeState((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark",
    );
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
