import { describe, expect, it } from "vitest";
import {
  assertNoDuplicateDemoIdsByMode,
  createGalleryRegistry,
  toDemoRouteSlug,
  type DemoEntry,
  type GalleryDataRuntime,
  type GalleryMode,
} from "./demoRegistry";

function createGalleryData(
  categories: Array<{ id: string; label: string }>,
  demosByCategoryInput: Record<string, DemoEntry[]>,
): GalleryDataRuntime {
  const categoryModels = categories.map((category) => ({
    id: category.id,
    label: category.label,
    icon: "layers" as const,
    description: `${category.label} demos`,
  }));

  const demosByCategory = new Map<string, DemoEntry[]>(
    categories.map((category) => [category.id, demosByCategoryInput[category.id] ?? []]),
  );

  const demoCategoryById = new Map<string, string>();
  for (const [categoryId, demos] of demosByCategory.entries()) {
    for (const demo of demos) {
      demoCategoryById.set(demo.id, categoryId);
    }
  }

  const categoryCounts = new Map<string, number>(
    categories.map((category) => [
      category.id,
      demosByCategory.get(category.id)?.length ?? 0,
    ]),
  );

  return {
    categories: categoryModels,
    demosByCategory,
    demoCategoryById,
    categoryCounts,
  };
}

const tailwindData = createGalleryData(
  [
    { id: "hover", label: "Hover" },
    { id: "complex", label: "Complex" },
  ],
  {
    hover: [
      {
        id: "hover-scale-glow",
        categoryId: "hover",
        title: "Scale & Glow",
        description: "Scale demo",
        code: "<div></div>",
        Component: () => null,
        source: "database",
      },
      {
        id: "hover-gradient-border",
        categoryId: "hover",
        title: "Gradient Border Spin",
        description: "Gradient demo",
        code: "<div></div>",
        Component: () => null,
        source: "database",
      },
    ],
    complex: [
      {
        id: "complex-heartbeat",
        categoryId: "complex",
        title: "Heartbeat",
        description: "Heartbeat demo",
        code: "<div></div>",
        Component: () => null,
        source: "database",
      },
    ],
  },
);

const cssData = createGalleryData(
  [{ id: "css-keyframes", label: "Keyframes" }],
  {
    "css-keyframes": [
      {
        id: "keyframes-basic-bounce",
        categoryId: "css-keyframes",
        title: "Basic @keyframes Bounce",
        description: "Bounce demo",
        code: "<div></div>",
        Component: () => null,
        source: "database",
      },
    ],
  },
);

const registry = createGalleryRegistry({
  tailwind: tailwindData,
  css: cssData,
});

const modes: GalleryMode[] = ["tailwind", "css"];

describe("demoRegistry", () => {
  it("resolves section and demo hashes to the right gallery mode", () => {
    for (const mode of modes) {
      const data = registry.getGalleryData(mode);
      const firstSection = data.categories[0];
      const firstDemo = data.demosByCategory.get(firstSection.id)?.[0];

      expect(firstSection).toBeDefined();
      expect(firstDemo).toBeDefined();

      expect(registry.resolveHashToModeAndTarget(firstSection.id)).toEqual({
        mode,
        targetId: firstSection.id,
      });
      expect(registry.resolveHashToModeAndTarget(firstDemo!.id)).toEqual({
        mode,
        targetId: firstDemo!.id,
      });
    }

    expect(registry.resolveHashToModeAndTarget("not-a-real-id")).toBeNull();
  });

  it("keeps category counts aligned with demosByCategory lengths", () => {
    for (const mode of modes) {
      const data = registry.getGalleryData(mode);

      for (const category of data.categories) {
        const expectedCount = data.demosByCategory.get(category.id)?.length ?? 0;
        expect(data.categoryCounts.get(category.id)).toBe(expectedCount);
      }
    }
  });

  it("builds and resolves canonical demo route slugs", () => {
    const slug = toDemoRouteSlug("Gradient Border Spin", "hover-gradient-border");
    expect(slug).toBe("gradient-border-spin~hover-gradient-border");

    expect(registry.resolveDemoFromRoute("tailwind", slug)).toEqual({
      demoId: "hover-gradient-border",
      canonicalSlug: "gradient-border-spin~hover-gradient-border",
    });
  });

  it("canonicalizes stale title slugs while keeping stable demo id", () => {
    const resolved = registry.resolveDemoFromRoute(
      "tailwind",
      "old-share-title~hover-gradient-border",
    );

    expect(resolved).toEqual({
      demoId: "hover-gradient-border",
      canonicalSlug: "gradient-border-spin~hover-gradient-border",
    });
  });

  it("rejects invalid route slugs", () => {
    expect(registry.resolveDemoFromRoute("tailwind", "hover-gradient-border")).toBeNull();
    expect(registry.resolveDemoFromRoute("tailwind", "anything~not-a-demo")).toBeNull();
    expect(
      registry.resolveDemoFromRoute(
        "css",
        "gradient-border-spin~hover-gradient-border",
      ),
    ).toBeNull();
  });

  it("converts legacy hash values into route paths", () => {
    expect(registry.resolveLegacyHashToRoute("hover-scale-glow")).toEqual({
      kind: "demo",
      mode: "tailwind",
      demoId: "hover-scale-glow",
      path: "/tailwind/scale-glow~hover-scale-glow",
    });

    expect(registry.resolveLegacyHashToRoute("hover")).toEqual({
      kind: "section",
      mode: "tailwind",
      sectionId: "hover",
      path: "/tailwind",
    });

    expect(registry.resolveLegacyHashToRoute("not-a-real-id")).toBeNull();
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
