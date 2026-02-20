import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useTheme } from "./useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns theme and toggleTheme", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
    expect(typeof result.current.toggleTheme).toBe("function");
  });

  it("reads stored theme from localStorage", () => {
    localStorage.setItem("tailwind-gallery-theme", "light");
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("light");
  });

  it("toggles theme from dark to light", () => {
    localStorage.setItem("tailwind-gallery-theme", "dark");
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("light");
  });

  it("toggles theme from light to dark", () => {
    localStorage.setItem("tailwind-gallery-theme", "light");
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("dark");
  });

  it("persists theme to localStorage on change", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.getItem("tailwind-gallery-theme")).toBe("light");
  });
});
