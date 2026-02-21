import type { ComponentType } from "react";
import {
  animationCategories,
  animationDemos,
  type AnimationCategoryId,
} from "../../data/animations";
import type { Category, Demo } from "../../types/demo";
import {
  HoverScaleGlow,
  HoverGradientBorder,
  Hover3dTilt,
  HoverUnderline,
  HoverFillSweep,
  HoverShadowExpand,
  HoverIconRotate,
  HoverGlass,
  HoverRingFocus,
  HoverReveal,
  EntranceFadeIn,
  EntranceFadeInUp,
  EntranceFadeInDown,
  EntranceScaleIn,
  EntranceBounceIn,
  EntranceSlideBounce,
  EntranceZoomRotate,
  EntranceFlipX,
  EntranceFlipY,
  EntranceBlurIn,
  LoadingSpinner,
  LoadingDualRing,
  LoadingPulseDots,
  LoadingSkeleton,
  LoadingProgress,
  LoadingPulseRing,
  LoadingPing,
  LoadingGlow,
  LoadingBar,
  LoadingOrbit,
  TextGradientShift,
  TextTypewriter,
  TextShimmer,
  TextStaggerLetters,
  TextGlow,
  TextMarquee,
  TextWordStagger,
  TextGradientY,
  TextGlitch,
  TextSpacingBreathe,
  ComplexFloat,
  ComplexMorph,
  ComplexRubberBand,
  ComplexJello,
  ComplexTada,
  ComplexWave,
  ComplexBreathe,
  ComplexLevitate,
  ComplexWiggle,
  ComplexHeartbeat,
} from "./index";

const componentById: Record<string, ComponentType> = {
  "hover-scale-glow": HoverScaleGlow,
  "hover-gradient-border": HoverGradientBorder,
  "hover-3d-tilt": Hover3dTilt,
  "hover-underline": HoverUnderline,
  "hover-fill-sweep": HoverFillSweep,
  "hover-shadow-expand": HoverShadowExpand,
  "hover-icon-rotate": HoverIconRotate,
  "hover-glass": HoverGlass,
  "hover-ring-focus": HoverRingFocus,
  "hover-reveal": HoverReveal,
  "entrance-fade-in": EntranceFadeIn,
  "entrance-fade-in-up": EntranceFadeInUp,
  "entrance-fade-in-down": EntranceFadeInDown,
  "entrance-scale-in": EntranceScaleIn,
  "entrance-bounce-in": EntranceBounceIn,
  "entrance-slide-bounce": EntranceSlideBounce,
  "entrance-zoom-rotate": EntranceZoomRotate,
  "entrance-flip-x": EntranceFlipX,
  "entrance-flip-y": EntranceFlipY,
  "entrance-blur-in": EntranceBlurIn,
  "loading-spinner": LoadingSpinner,
  "loading-dual-ring": LoadingDualRing,
  "loading-pulse-dots": LoadingPulseDots,
  "loading-skeleton": LoadingSkeleton,
  "loading-progress": LoadingProgress,
  "loading-pulse-ring": LoadingPulseRing,
  "loading-ping": LoadingPing,
  "loading-glow": LoadingGlow,
  "loading-bar": LoadingBar,
  "loading-orbit": LoadingOrbit,
  "text-gradient-shift": TextGradientShift,
  "text-typewriter": TextTypewriter,
  "text-shimmer": TextShimmer,
  "text-stagger-letters": TextStaggerLetters,
  "text-glow": TextGlow,
  "text-marquee": TextMarquee,
  "text-word-stagger": TextWordStagger,
  "text-gradient-y": TextGradientY,
  "text-glitch": TextGlitch,
  "text-spacing-breathe": TextSpacingBreathe,
  "complex-float": ComplexFloat,
  "complex-morph": ComplexMorph,
  "complex-rubber-band": ComplexRubberBand,
  "complex-jello": ComplexJello,
  "complex-tada": ComplexTada,
  "complex-wave": ComplexWave,
  "complex-breathe": ComplexBreathe,
  "complex-levitate": ComplexLevitate,
  "complex-wiggle": ComplexWiggle,
  "complex-heartbeat": ComplexHeartbeat,
};

export type TailwindDemo = Demo<AnimationCategoryId, "tailwind">;

const tailwindDemos: TailwindDemo[] = animationDemos.flatMap((demo) => {
  const Component = componentById[demo.id];
  if (!Component) return [];

  return [
    {
      id: demo.id,
      categoryId: demo.category,
      title: demo.title,
      description: demo.description,
      code: demo.code,
      Component,
      source: "tailwind",
      difficulty: demo.difficulty,
    },
  ];
});

export const tailwindCategories: Category<AnimationCategoryId>[] = animationCategories;

export const tailwindDemosByCategory = new Map<AnimationCategoryId, TailwindDemo[]>(
  tailwindCategories.map((category) => [category.id, []]),
);

export const tailwindDemoCategoryById = new Map<string, AnimationCategoryId>();
for (const demo of tailwindDemos) {
  const categoryId = demo.categoryId;
  tailwindDemoCategoryById.set(demo.id, categoryId);
  tailwindDemosByCategory.get(categoryId)?.push(demo);
}

export const tailwindCategoryCounts = new Map<AnimationCategoryId, number>(
  tailwindCategories.map((category) => [
    category.id,
    tailwindDemosByCategory.get(category.id)?.length ?? 0,
  ]),
);
