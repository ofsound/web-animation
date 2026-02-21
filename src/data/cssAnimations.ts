import { demoCategories } from "../cssDemos/demos/catalog";
import type {
  Category,
  CategoryIconName,
  Demo,
} from "../types/demo";

export type CssAnimationCategoryId = `css-${string}`;

export interface CssAnimationCategory extends Category {
  id: CssAnimationCategoryId;
  sourceCategoryId: string;
}

export interface CssAnimationDemo extends Demo<CssAnimationCategoryId, "css"> {
  sourceCategoryId: string;
}

const categoryIconByLetter: Record<string, CategoryIconName> = {
  A: "spark",
  B: "spark",
  C: "pointer",
  D: "layers",
  E: "layers",
  F: "loader",
  G: "pointer",
  H: "pointer",
  I: "pointer",
  J: "type",
  K: "type",
  L: "loader",
  M: "layers",
};

const categoryDescriptionByLetter: Record<string, string> = {
  A: "Keyframe fundamentals and timing composition techniques.",
  B: "Easing strategies from cubic-bezier curves to stepped timing.",
  C: "Transition primitives including starting-style and allow-discrete.",
  D: "Scroll-linked timelines, ranges, and view timeline patterns.",
  E: "View Transition API techniques for state and page-like morphing.",
  F: "Typed custom property animation with @property registration.",
  G: "2D/3D transform composition, perspective, and transform origin.",
  H: "Motion path APIs with path(), circle(), ray(), and ellipse().",
  I: "clip-path morphs and reveal patterns with geometric shapes.",
  J: "Filter and backdrop-filter animation patterns.",
  K: "Typography animation patterns from gradients to variable fonts.",
  L: "Layout/size transition techniques, including modern and fallback approaches.",
  M: "Color-space motion and animation composition behavior.",
};

const toCategoryId = (letter: string): CssAnimationCategoryId =>
  `css-${letter.toLowerCase()}`;

export const cssAnimationCategories: CssAnimationCategory[] = demoCategories.map(
  (category) => ({
    id: toCategoryId(category.id),
    label: `${category.id}. ${category.title}`,
    icon: categoryIconByLetter[category.id] ?? "layers",
    description:
      categoryDescriptionByLetter[category.id] ??
      "Native CSS animation and transition techniques.",
    sourceCategoryId: category.id,
  }),
);

export const cssAnimationDemos: CssAnimationDemo[] = demoCategories.flatMap(
  (category) =>
    category.demos.map((demo) => ({
      id: demo.id,
      title: demo.title,
      description: demo.description,
      code: demo.code,
      categoryId: toCategoryId(category.id),
      sourceCategoryId: category.id,
      Component: demo.Component,
      source: "css" as const,
      support: demo.support,
    })),
);

export const cssAnimationDemoMetaById = new Map(
  cssAnimationDemos.map((demo) => [
    demo.id,
    {
      title: demo.title,
      description: demo.description,
      code: demo.code,
    },
  ]),
);

export const cssDemosByCategory = new Map<CssAnimationCategoryId, CssAnimationDemo[]>(
  cssAnimationCategories.map((category) => [category.id, []]),
);

export const cssDemoCategoryById = new Map<string, CssAnimationCategoryId>();
for (const demo of cssAnimationDemos) {
  cssDemoCategoryById.set(demo.id, demo.categoryId);
  cssDemosByCategory.get(demo.categoryId)?.push(demo);
}

export const cssCategoryCounts = new Map<CssAnimationCategoryId, number>(
  cssAnimationCategories.map((category) => [
    category.id,
    cssDemosByCategory.get(category.id)?.length ?? 0,
  ]),
);
