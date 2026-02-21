import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, type PropsWithChildren } from "react";
import { useTheme } from "./useTheme";
import { ThemeProvider } from "../components/ThemeProvider";

const STORAGE_KEY = "theme";

function ThemeWrapper({ children }: PropsWithChildren) {
  return createElement(ThemeProvider, null, children);
}

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: light)",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns theme and toggleTheme", () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeWrapper });

    expect(result.current.theme).toBe("dark");
    expect(typeof result.current.toggleTheme).toBe("function");
  });

  it("reads stored theme from localStorage", () => {
    localStorage.setItem(STORAGE_KEY, "light");
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeWrapper });

    expect(result.current.theme).toBe("light");
  });

  it("toggles theme from dark to light", () => {
    localStorage.setItem(STORAGE_KEY, "dark");
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeWrapper });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("light");
  });

  it("toggles theme from light to dark", () => {
    localStorage.setItem(STORAGE_KEY, "light");
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeWrapper });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("dark");
  });

  it("persists theme to localStorage on change", () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeWrapper });

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBe("light");
  });

  it("throws when used outside ThemeProvider", () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme must be used within ThemeProvider",
    );
  });
});
