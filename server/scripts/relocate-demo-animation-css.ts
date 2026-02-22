import "dotenv/config";

import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../db/client.js";
import { demoFiles, demos } from "../db/schema.js";
import { createId } from "../utils.js";

const START_MARKER = "/* codex:migrated-demo-animation-css:start */";
const END_MARKER = "/* codex:migrated-demo-animation-css:end */";

type AnimationUtility = {
  className: string;
  animation: string;
  keyframes: readonly string[];
};

type AnimationVariantPrefix = "hover" | "focus" | "active" | "group-hover";

const ANIMATION_UTILITIES: readonly AnimationUtility[] = [
  { className: "animate-fade-in", animation: "fade-in 0.6s ease-out both", keyframes: ["fade-in"] },
  {
    className: "animate-fade-in-up",
    animation: "fade-in-up 0.6s ease-out both",
    keyframes: ["fade-in-up"],
  },
  {
    className: "animate-fade-in-down",
    animation: "fade-in-down 0.5s ease-out both",
    keyframes: ["fade-in-down"],
  },
  {
    className: "animate-scale-in",
    animation: "scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
    keyframes: ["scale-in"],
  },
  {
    className: "animate-float",
    animation: "float 3s ease-in-out infinite",
    keyframes: ["float"],
  },
  {
    className: "animate-pulse-glow",
    animation: "pulse-glow 2s ease-in-out infinite",
    keyframes: ["pulse-glow"],
  },
  {
    className: "animate-text-glow",
    animation: "text-glow 2s ease-in-out infinite",
    keyframes: ["text-glow"],
  },
  {
    className: "animate-pulse-ring",
    animation: "pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
    keyframes: ["pulse-ring"],
  },
  {
    className: "animate-spin-slow",
    animation: "spin 3s linear infinite",
    keyframes: ["spin"],
  },
  {
    className: "animate-spin-reverse",
    animation: "spin 2s linear infinite reverse",
    keyframes: ["spin"],
  },
  {
    className: "animate-bounce-in",
    animation: "bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both",
    keyframes: ["bounce-in"],
  },
  {
    className: "animate-wiggle",
    animation: "wiggle 1s ease-in-out infinite",
    keyframes: ["wiggle"],
  },
  {
    className: "animate-heartbeat",
    animation: "heartbeat 1.5s ease-in-out infinite",
    keyframes: ["heartbeat"],
  },
  {
    className: "animate-flip-x",
    animation: "flip-x 0.6s ease-out both",
    keyframes: ["flip-x"],
  },
  {
    className: "animate-flip-y",
    animation: "flip-y 0.6s ease-out both",
    keyframes: ["flip-y"],
  },
  {
    className: "animate-blur-in",
    animation: "blur-in 0.6s ease-out both",
    keyframes: ["blur-in"],
  },
  {
    className: "animate-rubber-band",
    animation: "rubber-band 1s ease-in-out",
    keyframes: ["rubber-band"],
  },
  {
    className: "animate-jello",
    animation: "jello 1s ease-in-out",
    keyframes: ["jello"],
  },
  {
    className: "animate-tada",
    animation: "tada 1s ease-in-out",
    keyframes: ["tada"],
  },
  {
    className: "animate-gradient-x",
    animation: "gradient-x 3s ease infinite",
    keyframes: ["gradient-x"],
  },
  {
    className: "animate-gradient-y",
    animation: "gradient-y 3s ease infinite",
    keyframes: ["gradient-y"],
  },
  {
    className: "animate-shimmer",
    animation: "shimmer 2s linear infinite",
    keyframes: ["shimmer"],
  },
  {
    className: "animate-typewriter",
    animation: "typewriter 3s steps(30) 1s both",
    keyframes: ["typewriter"],
  },
  {
    className: "animate-blink-caret",
    animation: "blink-caret 0.8s step-end infinite",
    keyframes: ["blink-caret"],
  },
  {
    className: "animate-morph",
    animation: "morph 4s ease-in-out infinite",
    keyframes: ["morph"],
  },
  {
    className: "animate-orbit",
    animation: "orbit 4s linear infinite",
    keyframes: ["orbit"],
  },
  {
    className: "animate-orbit-reverse",
    animation: "orbit 6s linear infinite reverse",
    keyframes: ["orbit"],
  },
  {
    className: "animate-wave",
    animation: "wave 2.5s ease-in-out infinite",
    keyframes: ["wave"],
  },
  {
    className: "animate-breathe",
    animation: "breathe 4s ease-in-out infinite",
    keyframes: ["breathe"],
  },
  {
    className: "animate-slide-in-bounce",
    animation: "slide-in-bounce 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both",
    keyframes: ["slide-in-bounce"],
  },
  {
    className: "animate-zoom-in-rotate",
    animation: "zoom-in-rotate 0.5s ease-out both",
    keyframes: ["zoom-in-rotate"],
  },
  {
    className: "animate-marquee",
    animation: "marquee 15s linear infinite",
    keyframes: ["marquee"],
  },
  {
    className: "animate-skeleton",
    animation: "skeleton 1.5s ease-in-out infinite",
    keyframes: ["skeleton"],
  },
  {
    className: "animate-progress",
    animation: "progress 2s ease-in-out infinite",
    keyframes: ["progress"],
  },
  {
    className: "animate-ping-slow",
    animation: "ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite",
    keyframes: ["ping-slow"],
  },
  {
    className: "animate-levitate",
    animation: "levitate 5s ease-in-out infinite",
    keyframes: ["levitate"],
  },
] as const;

const KEYFRAME_ORDER: readonly string[] = [
  "spin",
  "fade-in",
  "fade-in-up",
  "fade-in-down",
  "scale-in",
  "float",
  "pulse-glow",
  "text-glow",
  "pulse-ring",
  "bounce-in",
  "wiggle",
  "heartbeat",
  "flip-x",
  "flip-y",
  "blur-in",
  "rubber-band",
  "jello",
  "tada",
  "gradient-x",
  "gradient-y",
  "shimmer",
  "typewriter",
  "blink-caret",
  "morph",
  "orbit",
  "wave",
  "breathe",
  "glitch",
  "slide-in-bounce",
  "zoom-in-rotate",
  "marquee",
  "skeleton",
  "progress",
  "ping-slow",
  "levitate",
] as const;

const KEYFRAME_CSS: Record<string, string> = {
  spin: `@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}`,
  "fade-in": `@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}`,
  "fade-in-up": `@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}`,
  "fade-in-down": `@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}`,
  "scale-in": `@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}`,
  float: `@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}`,
  "pulse-glow": `@keyframes pulse-glow {
  0%,
  100% {
    box-shadow:
      0 0 5px color-mix(in oklch, var(--color-accent-brand) 30%, transparent),
      0 0 20px color-mix(in oklch, var(--color-accent-brand) 10%, transparent);
  }
  50% {
    box-shadow:
      0 0 20px color-mix(in oklch, var(--color-accent-brand) 60%, transparent),
      0 0 60px color-mix(in oklch, var(--color-accent-brand) 20%, transparent);
  }
}`,
  "text-glow": `@keyframes text-glow {
  0%,
  100% {
    text-shadow:
      0 0 8px color-mix(in oklch, var(--color-accent-brand) 40%, transparent),
      0 0 16px color-mix(in oklch, var(--color-accent-brand) 20%, transparent);
  }
  50% {
    text-shadow:
      0 0 12px color-mix(in oklch, var(--color-accent-brand) 70%, transparent),
      0 0 32px color-mix(in oklch, var(--color-accent-brand) 40%, transparent);
  }
}`,
  "pulse-ring": `@keyframes pulse-ring {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}`,
  "bounce-in": `@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}`,
  wiggle: `@keyframes wiggle {
  0%,
  100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}`,
  heartbeat: `@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
}`,
  "flip-x": `@keyframes flip-x {
  from {
    opacity: 0;
    transform: perspective(400px) rotateX(90deg);
  }
  to {
    opacity: 1;
    transform: perspective(400px) rotateX(0);
  }
}`,
  "flip-y": `@keyframes flip-y {
  from {
    opacity: 0;
    transform: perspective(400px) rotateY(90deg);
  }
  to {
    opacity: 1;
    transform: perspective(400px) rotateY(0);
  }
}`,
  "blur-in": `@keyframes blur-in {
  from {
    opacity: 0;
    filter: blur(12px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}`,
  "rubber-band": `@keyframes rubber-band {
  0% {
    transform: scaleX(1) scaleY(1);
  }
  30% {
    transform: scaleX(1.25) scaleY(0.75);
  }
  40% {
    transform: scaleX(0.75) scaleY(1.25);
  }
  50% {
    transform: scaleX(1.15) scaleY(0.85);
  }
  65% {
    transform: scaleX(0.95) scaleY(1.05);
  }
  75% {
    transform: scaleX(1.05) scaleY(0.95);
  }
  100% {
    transform: scaleX(1) scaleY(1);
  }
}`,
  jello: `@keyframes jello {
  0%,
  100% {
    transform: skewX(0) skewY(0);
  }
  30% {
    transform: skewX(-12.5deg) skewY(-12.5deg);
  }
  40% {
    transform: skewX(6.25deg) skewY(6.25deg);
  }
  50% {
    transform: skewX(-3.125deg) skewY(-3.125deg);
  }
  65% {
    transform: skewX(1.5625deg) skewY(1.5625deg);
  }
  75% {
    transform: skewX(-0.78125deg) skewY(-0.78125deg);
  }
}`,
  tada: `@keyframes tada {
  0% {
    transform: scale(1) rotate(0);
  }
  10%,
  20% {
    transform: scale(0.9) rotate(-3deg);
  }
  30%,
  50%,
  70%,
  90% {
    transform: scale(1.1) rotate(3deg);
  }
  40%,
  60%,
  80% {
    transform: scale(1.1) rotate(-3deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}`,
  "gradient-x": `@keyframes gradient-x {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}`,
  "gradient-y": `@keyframes gradient-y {
  0%,
  100% {
    background-position: 50% 0%;
  }
  50% {
    background-position: 50% 100%;
  }
}`,
  shimmer: `@keyframes shimmer {
  from {
    background-position: -200% 0;
  }
  to {
    background-position: 200% 0;
  }
}`,
  typewriter: `@keyframes typewriter {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}`,
  "blink-caret": `@keyframes blink-caret {
  from,
  to {
    border-color: transparent;
  }
  50% {
    border-color: currentColor;
  }
}`,
  morph: `@keyframes morph {
  0%,
  100% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  }
  50% {
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
  }
}`,
  orbit: `@keyframes orbit {
  from {
    transform: rotate(0deg) translateX(50px) rotate(0deg);
  }
  to {
    transform: rotate(360deg) translateX(50px) rotate(-360deg);
  }
}`,
  wave: `@keyframes wave {
  0%,
  100% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(14deg);
  }
  20% {
    transform: rotate(-8deg);
  }
  30% {
    transform: rotate(14deg);
  }
  40% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(10deg);
  }
  60% {
    transform: rotate(0deg);
  }
}`,
  breathe: `@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}`,
  glitch: `@keyframes glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-3px, 3px);
  }
  40% {
    transform: translate(-3px, -3px);
  }
  60% {
    transform: translate(3px, 3px);
  }
  80% {
    transform: translate(3px, -3px);
  }
  100% {
    transform: translate(0);
  }
}`,
  "slide-in-bounce": `@keyframes slide-in-bounce {
  0% {
    opacity: 0;
    transform: translateX(-60px);
  }
  60% {
    transform: translateX(8px);
  }
  80% {
    transform: translateX(-4px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}`,
  "zoom-in-rotate": `@keyframes zoom-in-rotate {
  from {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}`,
  marquee: `@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}`,
  skeleton: `@keyframes skeleton {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}`,
  progress: `@keyframes progress {
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
  }
}`,
  "ping-slow": `@keyframes ping-slow {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}`,
  levitate: `@keyframes levitate {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-8px) rotate(1deg);
  }
  50% {
    transform: translateY(-14px) rotate(0deg);
  }
  75% {
    transform: translateY(-8px) rotate(-1deg);
  }
}`,
};

const UTILITY_BY_CLASS = new Map(
  ANIMATION_UTILITIES.map((utility) => [utility.className, utility]),
);

function normalizeNewlines(input: string): string {
  return input.replace(/\r\n?/g, "\n");
}

function stripManagedBlock(cssContent: string): string {
  const normalized = normalizeNewlines(cssContent);
  const startIndex = normalized.indexOf(START_MARKER);
  const endIndex = normalized.indexOf(END_MARKER);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return normalized.trim();
  }

  const before = normalized.slice(0, startIndex).trimEnd();
  const after = normalized.slice(endIndex + END_MARKER.length).trimStart();

  if (!before) return after.trim();
  if (!after) return before.trim();
  return `${before}\n\n${after}`.trim();
}

function collectUsedAnimationClasses(input: string): Set<string> {
  const used = new Set<string>();
  const normalized = normalizeNewlines(input);
  const pattern = /(?:^|[^\w-:])(animate-[a-z0-9-]+)/g;
  for (const match of normalized.matchAll(pattern)) {
    const className = match[1];
    if (!className) continue;
    if (UTILITY_BY_CLASS.has(className)) {
      used.add(className);
    }
  }

  return used;
}

function collectUsedVariantAnimationClasses(input: string): Set<string> {
  const used = new Set<string>();
  const matches = normalizeNewlines(input).match(
    /(?:hover|focus|active|group-hover):animate-[a-z0-9-]+/g,
  );
  if (!matches) return used;

  for (const variantClass of matches) {
    const [, baseClass = ""] = variantClass.split(":");
    if (UTILITY_BY_CLASS.has(baseClass)) {
      used.add(variantClass);
    }
  }

  return used;
}

function collectArbitraryKeyframeReferences(input: string): Set<string> {
  const used = new Set<string>();
  const normalized = normalizeNewlines(input);

  if (normalized.includes("glitch")) {
    used.add("glitch");
  }
  if (normalized.includes("typewriter")) {
    used.add("typewriter");
  }
  if (normalized.includes("blink-caret")) {
    used.add("blink-caret");
  }

  return used;
}

function hasClassRule(cssContent: string, className: string): boolean {
  const escaped = className.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const pattern = new RegExp(`\\.${escaped}\\b`);
  return pattern.test(cssContent);
}

function hasKeyframe(cssContent: string, keyframeName: string): boolean {
  const escaped = keyframeName.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const pattern = new RegExp(`@keyframes\\s+${escaped}\\b`);
  return pattern.test(cssContent);
}

function toVariantRule(
  variantClass: string,
  animation: string,
): string | null {
  const [prefix, className] = variantClass.split(":");
  if (!prefix || !className) return null;
  const escapedSelector = variantClass.replace(":", "\\:");

  switch (prefix as AnimationVariantPrefix) {
    case "hover":
      return `.${escapedSelector}:hover { animation: ${animation}; }`;
    case "focus":
      return `.${escapedSelector}:focus { animation: ${animation}; }`;
    case "active":
      return `.${escapedSelector}:active { animation: ${animation}; }`;
    case "group-hover":
      return `.group:hover .${escapedSelector} { animation: ${animation}; }`;
    default:
      return null;
  }
}

function buildManagedBlock(
  baseCss: string,
  usedClassNames: Set<string>,
  usedVariantClassNames: Set<string>,
  arbitraryKeyframes: Set<string>,
): string {
  const utilityRules: string[] = [];
  const keyframes = new Set<string>();

  for (const utility of ANIMATION_UTILITIES) {
    if (!usedClassNames.has(utility.className)) continue;
    if (!hasClassRule(baseCss, utility.className)) {
      utilityRules.push(`.${utility.className} { animation: ${utility.animation}; }`);
    }
    for (const keyframeName of utility.keyframes) {
      keyframes.add(keyframeName);
    }
  }

  for (const variantClassName of usedVariantClassNames) {
    const [, baseClass = ""] = variantClassName.split(":");
    const utility = UTILITY_BY_CLASS.get(baseClass);
    if (!utility) continue;

    if (!hasClassRule(baseCss, variantClassName.replace(":", "\\:"))) {
      const variantRule = toVariantRule(variantClassName, utility.animation);
      if (variantRule) {
        utilityRules.push(variantRule);
      }
    }

    for (const keyframeName of utility.keyframes) {
      keyframes.add(keyframeName);
    }
  }

  for (const keyframeName of arbitraryKeyframes) {
    keyframes.add(keyframeName);
  }

  const keyframeBlocks: string[] = [];
  for (const keyframeName of KEYFRAME_ORDER) {
    if (!keyframes.has(keyframeName)) continue;
    if (hasKeyframe(baseCss, keyframeName)) continue;

    const block = KEYFRAME_CSS[keyframeName];
    if (block) {
      keyframeBlocks.push(block);
    }
  }

  if (utilityRules.length === 0 && keyframeBlocks.length === 0) {
    return "";
  }

  return [
    START_MARKER,
    "/* Demo-local custom animation utilities migrated from src/index.css */",
    ...utilityRules,
    ...(utilityRules.length > 0 && keyframeBlocks.length > 0 ? [""] : []),
    ...keyframeBlocks,
    END_MARKER,
  ].join("\n");
}

type DemoFileRow = {
  id: string;
  demoId: string;
  fileKind: "html" | "css" | "tailwind_css";
  content: string;
  sortOrder: number;
};

async function main(): Promise<void> {
  const tailwindDemos = await db
    .select({ id: demos.id })
    .from(demos)
    .where(eq(demos.source, "tailwind"))
    .orderBy(asc(demos.sortOrder), asc(demos.createdAt));

  if (tailwindDemos.length === 0) {
    console.log("No tailwind demos found.");
    return;
  }

  const demoIds = tailwindDemos.map((demo) => demo.id);
  const files = await db
    .select({
      id: demoFiles.id,
      demoId: demoFiles.demoId,
      fileKind: demoFiles.fileKind,
      content: demoFiles.content,
      sortOrder: demoFiles.sortOrder,
    })
    .from(demoFiles)
    .where(
      and(
        inArray(demoFiles.demoId, demoIds),
        inArray(demoFiles.fileKind, ["html", "css", "tailwind_css"]),
      ),
    )
    .orderBy(asc(demoFiles.demoId), asc(demoFiles.sortOrder));

  const filesByDemoId = new Map<string, DemoFileRow[]>();
  for (const file of files) {
    const existing = filesByDemoId.get(file.demoId) ?? [];
    existing.push(file as DemoFileRow);
    filesByDemoId.set(file.demoId, existing);
  }

  let updatedCount = 0;
  let insertedCount = 0;
  let unchangedCount = 0;

  for (const demo of tailwindDemos) {
    const demoFilesForDemo = filesByDemoId.get(demo.id) ?? [];
    const htmlFile = demoFilesForDemo.find((file) => file.fileKind === "html");
    const tailwindFile = demoFilesForDemo.find(
      (file) => file.fileKind === "tailwind_css",
    );
    const cssFile = demoFilesForDemo.find((file) => file.fileKind === "css");

    const inputForDetection = [htmlFile?.content ?? "", tailwindFile?.content ?? ""].join(
      "\n",
    );

    const usedClassNames = collectUsedAnimationClasses(inputForDetection);
    const usedVariantClassNames = collectUsedVariantAnimationClasses(inputForDetection);
    const arbitraryKeyframes = collectArbitraryKeyframeReferences(inputForDetection);

    const existingCssContent = cssFile?.content ?? "";
    const baseCss = stripManagedBlock(existingCssContent);
    const managedBlock = buildManagedBlock(
      baseCss,
      usedClassNames,
      usedVariantClassNames,
      arbitraryKeyframes,
    );

    const nextCss = managedBlock
      ? [baseCss, managedBlock].filter((part) => part.trim().length > 0).join("\n\n")
      : baseCss;

    if (cssFile) {
      const normalizedCurrent = normalizeNewlines(existingCssContent).trim();
      const normalizedNext = normalizeNewlines(nextCss).trim();
      if (normalizedCurrent === normalizedNext) {
        unchangedCount += 1;
        continue;
      }

      await db
        .update(demoFiles)
        .set({ content: nextCss, updatedAt: new Date() })
        .where(eq(demoFiles.id, cssFile.id));

      updatedCount += 1;
      continue;
    }

    if (!managedBlock) {
      unchangedCount += 1;
      continue;
    }

    const nextSortOrder = demoFilesForDemo.reduce(
      (maxSort, file) => Math.max(maxSort, file.sortOrder),
      -1,
    ) + 1;

    await db.insert(demoFiles).values({
      id: createId("file"),
      demoId: demo.id,
      fileKind: "css",
      content: nextCss,
      sortOrder: nextSortOrder,
    });

    insertedCount += 1;
  }

  console.log(
    [
      `Processed ${tailwindDemos.length} tailwind demos.`,
      `Inserted CSS files: ${insertedCount}.`,
      `Updated CSS files: ${updatedCount}.`,
      `Unchanged demos: ${unchangedCount}.`,
    ].join(" "),
  );
}

main().catch((error: unknown) => {
  console.error("Failed to relocate custom animation CSS into demo files.");
  console.error(error);
  process.exitCode = 1;
});
