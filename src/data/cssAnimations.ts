import { demoCategories } from "../cssDemos/demos/catalog";
import type {
  Category,
  CategoryIconName,
  Demo,
} from "../types/demo";

export type CssAnimationCategoryId = `css-${string}`;

interface CssAnimationCategory extends Category {
  id: CssAnimationCategoryId;
}
export type CssAnimationDemo = Demo<CssAnimationCategoryId, "css">;

const categoryIconById: Record<string, CategoryIconName> = {
  keyframes: "spark",
  easing: "spark",
  transitions: "pointer",
  scroll: "layers",
  "view-transitions": "layers",
  property: "loader",
  transforms: "pointer",
  "motion-path": "pointer",
  "clip-path": "pointer",
  filters: "type",
  text: "type",
  size: "loader",
  color: "layers",
};

const categoryDescriptionById: Record<string, string> = {
  keyframes: "Keyframe fundamentals and timing composition techniques.",
  easing: "Easing strategies from cubic-bezier curves to stepped timing.",
  transitions: "Transition primitives including starting-style and allow-discrete.",
  scroll: "Scroll-linked timelines, ranges, and view timeline patterns.",
  "view-transitions": "View Transition API techniques for state and page-like morphing.",
  property: "Typed custom property animation with @property registration.",
  transforms: "2D/3D transform composition, perspective, and transform origin.",
  "motion-path": "Motion path APIs with path(), circle(), ray(), and ellipse().",
  "clip-path": "clip-path morphs and reveal patterns with geometric shapes.",
  filters: "Filter and backdrop-filter animation patterns.",
  text: "Typography animation patterns from gradients to variable fonts.",
  size: "Layout/size transition techniques, including modern and fallback approaches.",
  color: "Color-space motion and animation composition behavior.",
};

const toCategoryId = (id: string): CssAnimationCategoryId => `css-${id}`;

export const cssAnimationCategories: CssAnimationCategory[] = demoCategories.map(
  (category) => ({
    id: toCategoryId(category.id),
    label: category.title,
    icon: categoryIconById[category.id] ?? "layers",
    description:
      categoryDescriptionById[category.id] ??
      "Native CSS animation and transition techniques.",
  }),
);

const cssAnimationDemos: CssAnimationDemo[] = demoCategories.flatMap(
  (category) =>
    category.demos.map((demo) => ({
      id: demo.id,
      title: demo.title,
      description: demo.description,
      code: demo.code,
      categoryId: toCategoryId(category.id),
      Component: demo.Component,
      source: "css" as const,
      support: demo.support,
    })),
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
