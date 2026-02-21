import { describe, expect, it } from "vitest";
import { demoCategories } from "./catalog";

describe("demo catalog", () => {
  it("contains the expected category and demo totals", () => {
    const demoCount = demoCategories.reduce((total, category) => total + category.demos.length, 0);
    expect(demoCategories).toHaveLength(13);
    expect(demoCount).toBe(55);
  });

  it("uses unique demo ids and keeps ids aligned with category letter", () => {
    const ids = demoCategories.flatMap((category) => category.demos.map((demo) => demo.id));
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);

    for (const category of demoCategories) {
      for (const demo of category.demos) {
        expect(demo.id.startsWith(category.id)).toBe(true);
      }
    }
  });

  it("defines non-empty code snippets and component references for each demo", () => {
    for (const category of demoCategories) {
      for (const demo of category.demos) {
        expect(demo.title.trim().length).toBeGreaterThan(0);
        expect(demo.description.trim().length).toBeGreaterThan(0);
        expect(demo.code.trim().length).toBeGreaterThan(0);
        expect(typeof demo.Component).toBe("function");
      }
    }
  });
});
