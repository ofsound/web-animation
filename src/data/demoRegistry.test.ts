import { describe, expect, it } from "vitest";
import {
  assertNoDuplicateDemoIdsByMode,
  getGalleryData,
  resolveHashToModeAndTarget,
} from "./demoRegistry";

const modes = ["tailwind", "css"] as const;

describe("demoRegistry", () => {
  it("resolves section and demo hashes to the right gallery mode", () => {
    for (const mode of modes) {
      const data = getGalleryData(mode);
      const categories = data.categories as Array<{ id: string }>;
      const demosByCategory = data.demosByCategory as ReadonlyMap<
        string,
        Array<{ id: string }>
      >;
      const firstSection = categories[0];
      const firstDemo = demosByCategory.get(firstSection.id)?.[0];

      expect(firstSection).toBeDefined();
      expect(firstDemo).toBeDefined();

      expect(resolveHashToModeAndTarget(firstSection.id)).toEqual({
        mode,
        targetId: firstSection.id,
      });
      expect(resolveHashToModeAndTarget(firstDemo!.id)).toEqual({
        mode,
        targetId: firstDemo!.id,
      });
    }

    expect(resolveHashToModeAndTarget("not-a-real-id")).toBeNull();
  });

  it("keeps category counts aligned with demosByCategory lengths", () => {
    for (const mode of modes) {
      const data = getGalleryData(mode);
      const categories = data.categories as Array<{ id: string }>;
      const countsByCategory = data.categoryCounts as ReadonlyMap<string, number>;
      const demosByCategory = data.demosByCategory as ReadonlyMap<string, unknown[]>;

      for (const category of categories) {
        const expectedCount = demosByCategory.get(category.id)?.length ?? 0;
        expect(countsByCategory.get(category.id)).toBe(expectedCount);
      }
    }
  });

  it("throws when duplicate demo IDs exist across gallery modes", () => {
    expect(() =>
      assertNoDuplicateDemoIdsByMode({
        tailwind: new Map([["shared-demo-id", "hover"]]),
        css: new Map([["shared-demo-id", "css-a"]]),
      }),
    ).toThrow('Duplicate demo id "shared-demo-id"');
  });
});
