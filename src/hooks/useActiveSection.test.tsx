import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useActiveSection } from "./useActiveSection";

describe("useActiveSection", () => {
  it("returns first section id when no sections exist in DOM", () => {
    const { result } = renderHook(() => useActiveSection(["section-a", "section-b"]));

    expect(result.current).toBe("section-a");
  });

  it("returns first section id for empty array", () => {
    const { result } = renderHook(() => useActiveSection([]));

    expect(result.current).toBe("");
  });
});
