import { describe, expect, it } from "vitest";
import {
  assertNoDuplicateDemoIdsByMode,
  getDemoRoutePath,
  getGalleryData,
  resolveDemoFromRoute,
  resolveHashToModeAndTarget,
  resolveLegacyHashToRoute,
  toDemoRouteSlug,
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

  it("builds and resolves canonical demo route slugs", () => {
    const slug = toDemoRouteSlug("Gradient Border Spin", "hover-gradient-border");
    expect(slug).toBe("gradient-border-spin~hover-gradient-border");

    expect(resolveDemoFromRoute("tailwind", slug)).toEqual({
      demoId: "hover-gradient-border",
      canonicalSlug: "gradient-border-spin~hover-gradient-border",
    });
  });

  it("canonicalizes stale title slugs while keeping stable demo id", () => {
    const resolved = resolveDemoFromRoute(
      "tailwind",
      "old-share-title~hover-gradient-border",
    );

    expect(resolved).toEqual({
      demoId: "hover-gradient-border",
      canonicalSlug: "gradient-border-spin~hover-gradient-border",
    });
  });

  it("rejects invalid route slugs", () => {
    expect(resolveDemoFromRoute("tailwind", "hover-gradient-border")).toBeNull();
    expect(resolveDemoFromRoute("tailwind", "anything~not-a-demo")).toBeNull();
    expect(
      resolveDemoFromRoute("css", "gradient-border-spin~hover-gradient-border"),
    ).toBeNull();
  });

  it("converts legacy hash values into route paths", () => {
    expect(resolveLegacyHashToRoute("hover-scale-glow")).toEqual({
      kind: "demo",
      mode: "tailwind",
      demoId: "hover-scale-glow",
      path: getDemoRoutePath("tailwind", "hover-scale-glow"),
    });

    expect(resolveLegacyHashToRoute("hover")).toEqual({
      kind: "section",
      mode: "tailwind",
      sectionId: "hover",
      path: "/tailwind",
    });

    expect(resolveLegacyHashToRoute("not-a-real-id")).toBeNull();
  });

  it("throws when duplicate demo IDs exist across gallery modes", () => {
    expect(() =>
      assertNoDuplicateDemoIdsByMode({
        tailwind: new Map([["shared-demo-id", "hover"]]),
        css: new Map([["shared-demo-id", "css-keyframes"]]),
      }),
    ).toThrow('Duplicate demo id "shared-demo-id"');
  });
});
