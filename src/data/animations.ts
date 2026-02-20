import type { ReactNode } from "react";

export type Theme = "light" | "dark";
export type AnimationCategoryId = "hover" | "entrance" | "loading" | "text" | "complex";
export type AnimationDifficulty = "Basic" | "Intermediate" | "Advanced";
export type CategoryIconName = "pointer" | "spark" | "loader" | "type" | "layers";

export interface AnimationDemo {
  id: string;
  title: string;
  description: string;
  category: AnimationCategoryId;
  difficulty: AnimationDifficulty;
  tags: string[];
  code: string;
  preview: (() => ReactNode) | null;
}

export interface AnimationCategory {
  id: AnimationCategoryId;
  label: string;
  icon: CategoryIconName;
  description: string;
}

export const animationCategories: AnimationCategory[] = [
  {
    "id": "hover",
    "label": "Hover & Interaction",
    "icon": "pointer",
    "description": "Interactive transitions and tactile UI feedback patterns."
  },
  {
    "id": "entrance",
    "label": "Entrance Effects",
    "icon": "spark",
    "description": "Reveal and staging animations for attention and hierarchy."
  },
  {
    "id": "loading",
    "label": "Loading States",
    "icon": "loader",
    "description": "Progressive, expressive states for async UI moments."
  },
  {
    "id": "text",
    "label": "Text Animations",
    "icon": "type",
    "description": "Animated typography styles for headlines and messaging."
  },
  {
    "id": "complex",
    "label": "Complex Keyframes",
    "icon": "layers",
    "description": "Multi-step keyframes and expressive motion studies."
  }
] as AnimationCategory[];

export const animationDemos: AnimationDemo[] = [
  {
    "id": "hover-scale-glow",
    "title": "Scale & Glow",
    "description": "Smooth scale-up with a glowing box-shadow on hover using transition-all.",
    "category": "hover",
    "code": "<button className=\"rounded-xl bg-accent px-6 py-3 font-semibold text-white\n  transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_oklch(0.7_0.18_270/0.4)]\">\n  Hover me\n</button>",
    "difficulty": "Intermediate",
    "tags": [
      "interaction",
      "transform",
      "shadow"
    ],
    "preview": null
  },
  {
    "id": "hover-gradient-border",
    "title": "Gradient Border Spin",
    "description": "A conic-gradient border that rotates on hover using a pseudo-element technique.",
    "category": "hover",
    "code": "<div className=\"group relative rounded-2xl p-[2px]\">\n  <div className=\"absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,#7c3aed,#06b6d4,#f59e0b,#7c3aed)]\n    opacity-50 blur-sm transition-all duration-500 group-hover:opacity-100 group-hover:blur-md\n    group-hover:animate-spin-slow\" />\n  <div className=\"relative rounded-2xl bg-zinc-900 px-6 py-4 text-sm text-white/80\">\n    Gradient border\n  </div>\n</div>",
    "difficulty": "Intermediate",
    "tags": [
      "interaction",
      "transform",
      "gradient"
    ],
    "preview": null
  },
  {
    "id": "hover-3d-tilt",
    "title": "3D Tilt Card",
    "description": "Perspective-based 3D tilt effect using group-hover with rotateX/Y transforms.",
    "category": "hover",
    "code": "<div className=\"group [perspective:800px]\">\n  <div className=\"rounded-2xl border border-white/10 bg-white/5 p-6\n    transition-transform duration-500 ease-out\n    group-hover:[transform:rotateX(8deg)_rotateY(-8deg)]\">\n    <p className=\"text-sm text-white/70\">Hover for 3D tilt</p>\n  </div>\n</div>",
    "difficulty": "Advanced",
    "tags": [
      "interaction",
      "transform",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "hover-underline",
    "title": "Underline Slide",
    "description": "An animated underline that slides in from left on hover using scale-x transform origin.",
    "category": "hover",
    "code": "<a className=\"group relative text-lg font-medium text-white/80\">\n  Hover for underline\n  <span className=\"absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0\n    bg-accent transition-transform duration-300 group-hover:scale-x-100\" />\n</a>",
    "difficulty": "Basic",
    "tags": [
      "interaction",
      "transform",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "hover-fill-sweep",
    "title": "Button Fill Sweep",
    "description": "Background color sweeps across the button on hover using a translated pseudo-element.",
    "category": "hover",
    "code": "<button className=\"group relative overflow-hidden rounded-xl border border-accent\n  px-6 py-3 font-semibold text-accent transition-colors duration-300 hover:text-white\">\n  <span className=\"absolute inset-0 -translate-x-full bg-accent\n    transition-transform duration-300 group-hover:translate-x-0\" />\n  <span className=\"relative\">Fill Sweep</span>\n</button>",
    "difficulty": "Intermediate",
    "tags": [
      "interaction",
      "transform",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "hover-shadow-expand",
    "title": "Shadow Expansion",
    "description": "Multi-layered shadow that dramatically expands on hover, creating depth.",
    "category": "hover",
    "code": "<div className=\"rounded-2xl bg-zinc-800 p-6 shadow-lg transition-all duration-500\n  hover:-translate-y-1\n  hover:shadow-[0_20px_60px_-15px_oklch(0.7_0.18_270/0.3)]\">\n  <p className=\"text-sm text-white/70\">Hover to elevate</p>\n</div>",
    "difficulty": "Intermediate",
    "tags": [
      "interaction",
      "transform",
      "shadow"
    ],
    "preview": null
  },
  {
    "id": "hover-icon-rotate",
    "title": "Icon Rotate & Color",
    "description": "Icon rotates 360° and changes color on parent hover with smooth transition.",
    "category": "hover",
    "code": "<button className=\"group flex items-center gap-3 rounded-xl bg-white/5\n  px-5 py-3 transition-colors hover:bg-white/10\">\n  <span className=\"text-xl transition-all duration-500\n    group-hover:rotate-[360deg] group-hover:text-amber-400\">⚙️</span>\n  <span className=\"text-sm text-white/70\">Settings</span>\n</button>",
    "difficulty": "Intermediate",
    "tags": [
      "interaction",
      "transform",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "hover-glass",
    "title": "Glassmorphism Hover",
    "description": "Glass-like card that increases its blur and brightness on hover.",
    "category": "hover",
    "code": "<div className=\"rounded-2xl border border-white/10 bg-white/5 p-6\n  backdrop-blur-md transition-all duration-300\n  hover:border-white/20 hover:bg-white/10 hover:backdrop-blur-xl\">\n  <p className=\"text-sm text-white/70\">Glass effect</p>\n</div>",
    "difficulty": "Advanced",
    "tags": [
      "interaction",
      "typography",
      "filter"
    ],
    "preview": null
  },
  {
    "id": "hover-ring-focus",
    "title": "Ring Pulse on Focus",
    "description": "Input with animated ring that appears and pulses on focus using ring utilities.",
    "category": "hover",
    "code": "<input\n  type=\"text\"\n  placeholder=\"Click to focus...\"\n  className=\"rounded-xl border border-white/10 bg-white/5 px-4 py-3\n  text-sm text-white/80 outline-none transition-all duration-300\n  placeholder:text-white/30\n  focus:border-accent focus:ring-2 focus:ring-accent/30\n  focus:shadow-[0_0_20px_oklch(0.7_0.18_270/0.15)]\"\n/>",
    "difficulty": "Intermediate",
    "tags": [
      "interaction",
      "shadow",
      "loop"
    ],
    "preview": null
  },
  {
    "id": "hover-reveal",
    "title": "Card Reveal Overlay",
    "description": "Overlay content slides up from the bottom on hover, revealing a call-to-action.",
    "category": "hover",
    "code": "<div className=\"group relative h-40 w-48 overflow-hidden rounded-2xl\n  bg-gradient-to-br from-violet-600 to-indigo-800\">\n  <div className=\"absolute inset-x-0 bottom-0 flex translate-y-full items-center\n    justify-center bg-black/60 p-4 backdrop-blur-sm transition-transform\n    duration-300 group-hover:translate-y-0\">\n    <span className=\"text-sm font-medium text-white\">View Details →</span>\n  </div>\n</div>",
    "difficulty": "Intermediate",
    "tags": [
      "interaction",
      "transform",
      "gradient"
    ],
    "preview": null
  },
  {
    "id": "entrance-fade-in",
    "title": "Fade In",
    "description": "Simple opacity fade-in using a custom animate utility.",
    "category": "entrance",
    "code": "<div className=\"animate-fade-in rounded-xl bg-white/5 p-6 text-sm text-white/70\">\n  Fading in…\n</div>",
    "difficulty": "Basic",
    "tags": [
      "typography"
    ],
    "preview": null
  },
  {
    "id": "entrance-fade-in-up",
    "title": "Fade In Up",
    "description": "Element fades in while sliding up from below.",
    "category": "entrance",
    "code": "<div className=\"animate-fade-in-up rounded-xl bg-white/5 p-6\">\n  Sliding up\n</div>",
    "difficulty": "Basic",
    "tags": [
      "entrance"
    ],
    "preview": null
  },
  {
    "id": "entrance-fade-in-down",
    "title": "Fade In Down",
    "description": "Element fades in while sliding down from above.",
    "category": "entrance",
    "code": "<div className=\"animate-fade-in-down rounded-xl bg-white/5 p-6\">\n  Sliding down\n</div>",
    "difficulty": "Basic",
    "tags": [
      "entrance"
    ],
    "preview": null
  },
  {
    "id": "entrance-scale-in",
    "title": "Scale In (Pop)",
    "description": "Scales from 0.8 to 1 with a spring-like cubic-bezier for a satisfying pop.",
    "category": "entrance",
    "code": "<div className=\"animate-scale-in rounded-2xl bg-gradient-to-br\n  from-violet-500/20 to-cyan-500/20 p-6\">\n  Pop!\n</div>",
    "difficulty": "Intermediate",
    "tags": [
      "transform",
      "gradient",
      "shadow"
    ],
    "preview": null
  },
  {
    "id": "entrance-bounce-in",
    "title": "Bounce In",
    "description": "Element bounces in with overshoot and settle using a multi-step keyframe.",
    "category": "entrance",
    "code": "<div className=\"animate-bounce-in rounded-full bg-emerald-glow/20\n  p-4 text-center\">\n  🏀\n</div>",
    "difficulty": "Basic",
    "tags": [
      "shadow",
      "loop",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "entrance-slide-bounce",
    "title": "Slide In Bounce",
    "description": "Slides in from the left with a spring bounce at the end.",
    "category": "entrance",
    "code": "<div className=\"animate-slide-in-bounce rounded-xl bg-white/5 px-6 py-4\">\n  ← Bounced in\n</div>",
    "difficulty": "Basic",
    "tags": [
      "shadow",
      "loop"
    ],
    "preview": null
  },
  {
    "id": "entrance-zoom-rotate",
    "title": "Zoom In + Rotate",
    "description": "Scales from 0 to 1 while rotating 180°, creating a dramatic entrance.",
    "category": "entrance",
    "code": "<div className=\"animate-zoom-in-rotate inline-block rounded-xl\n  bg-rose-glow/20 p-4 text-2xl\">\n  ⭐\n</div>",
    "difficulty": "Advanced",
    "tags": [
      "transform",
      "shadow",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "entrance-flip-x",
    "title": "Flip In X",
    "description": "Element flips in around the X axis with perspective for 3D depth.",
    "category": "entrance",
    "code": "<div className=\"animate-flip-x rounded-xl bg-white/5 p-6 text-sm\">\n  Flipped in (X axis)\n</div>",
    "difficulty": "Advanced",
    "tags": [
      "typography"
    ],
    "preview": null
  },
  {
    "id": "entrance-flip-y",
    "title": "Flip In Y",
    "description": "Element flips in around the Y axis with perspective for 3D depth.",
    "category": "entrance",
    "code": "<div className=\"animate-flip-y rounded-xl bg-white/5 p-6 text-sm\">\n  Flipped in (Y axis)\n</div>",
    "difficulty": "Advanced",
    "tags": [
      "typography"
    ],
    "preview": null
  },
  {
    "id": "entrance-blur-in",
    "title": "Blur In",
    "description": "Fades in with a blur filter that resolves to sharp, creating a focusing effect.",
    "category": "entrance",
    "code": "<div className=\"animate-blur-in rounded-xl bg-white/5 p-6 text-sm\">\n  Blurring into focus\n</div>",
    "difficulty": "Basic",
    "tags": [
      "interaction",
      "shadow",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "loading-spinner",
    "title": "Spinner",
    "description": "Classic animated spinner using animate-spin with a border-based circle.",
    "category": "loading",
    "code": "<div className=\"size-10 animate-spin rounded-full\n  border-4 border-white/10 border-t-accent\" />",
    "difficulty": "Basic",
    "tags": [
      "loop",
      "loading"
    ],
    "preview": null
  },
  {
    "id": "loading-dual-ring",
    "title": "Dual Ring Spinner",
    "description": "Two concentric rings spinning in opposite directions for a mesmerizing effect.",
    "category": "loading",
    "code": "<div className=\"relative flex items-center justify-center\">\n  <div className=\"absolute size-10 animate-spin rounded-full\n    border-2 border-transparent border-t-accent\" />\n  <div className=\"absolute size-7 animate-spin-reverse rounded-full\n    border-2 border-transparent border-t-cyan-glow\" />\n</div>",
    "difficulty": "Intermediate",
    "tags": [
      "shadow",
      "loop",
      "loading"
    ],
    "preview": null
  },
  {
    "id": "loading-pulse-dots",
    "title": "Pulse Dots",
    "description": "Three dots pulsing with staggered delays for a classic loading indicator.",
    "category": "loading",
    "code": "<div className=\"flex gap-2\">\n  <div className=\"size-3 animate-bounce rounded-full bg-accent [animation-delay:0ms]\" />\n  <div className=\"size-3 animate-bounce rounded-full bg-accent [animation-delay:150ms]\" />\n  <div className=\"size-3 animate-bounce rounded-full bg-accent [animation-delay:300ms]\" />\n</div>",
    "difficulty": "Intermediate",
    "tags": [
      "loop",
      "loading"
    ],
    "preview": null
  },
  {
    "id": "loading-skeleton",
    "title": "Skeleton Loader",
    "description": "Shimmer effect skeleton placeholder using a gradient background animation.",
    "category": "loading",
    "code": "<div className=\"w-64 space-y-3\">\n  <div className=\"h-4 w-3/4 animate-skeleton rounded-lg\n    bg-[length:200%_100%]\n    bg-gradient-to-r from-white/5 via-white/10 to-white/5\" />\n  <div className=\"h-4 w-full animate-skeleton rounded-lg\n    bg-[length:200%_100%] [animation-delay:100ms]\n    bg-gradient-to-r from-white/5 via-white/10 to-white/5\" />\n  <div className=\"h-4 w-1/2 animate-skeleton rounded-lg\n    bg-[length:200%_100%] [animation-delay:200ms]\n    bg-gradient-to-r from-white/5 via-white/10 to-white/5\" />\n</div>",
    "difficulty": "Intermediate",
    "tags": [
      "gradient",
      "loading"
    ],
    "preview": null
  },
  {
    "id": "loading-progress",
    "title": "Animated Progress Bar",
    "description": "A progress bar with animated width and a shimmer overlay.",
    "category": "loading",
    "code": "<div className=\"h-2 w-64 overflow-hidden rounded-full bg-white/10\">\n  <div className=\"h-full animate-progress rounded-full bg-gradient-to-r\n    from-accent to-cyan-glow\" />\n</div>",
    "difficulty": "Intermediate",
    "tags": [
      "gradient",
      "shadow",
      "loading"
    ],
    "preview": null
  },
  {
    "id": "loading-pulse-ring",
    "title": "Pulse Ring",
    "description": "Expanding and fading ring for notification-style loading indicators.",
    "category": "loading",
    "code": "<div className=\"relative flex items-center justify-center\">\n  <div className=\"absolute size-8 animate-pulse-ring rounded-full\n    border-2 border-accent\" />\n  <div className=\"absolute size-8 animate-pulse-ring rounded-full\n    border-2 border-accent [animation-delay:400ms]\" />\n  <div className=\"relative size-4 rounded-full bg-accent\" />\n</div>",
    "difficulty": "Intermediate",
    "tags": [
      "shadow",
      "loop",
      "loading"
    ],
    "preview": null
  },
  {
    "id": "loading-ping",
    "title": "Ping Notification",
    "description": "Classic notification ping animation with a pulsing ring behind a dot.",
    "category": "loading",
    "code": "<span className=\"relative flex size-3\">\n  <span className=\"absolute inline-flex size-full\n    animate-ping-slow rounded-full bg-emerald-400 opacity-75\" />\n  <span className=\"relative inline-flex size-3\n    rounded-full bg-emerald-500\" />\n</span>",
    "difficulty": "Basic",
    "tags": [
      "shadow",
      "loop",
      "loading"
    ],
    "preview": null
  },
  {
    "id": "loading-glow",
    "title": "Pulse Glow",
    "description": "A circle that breathes with a pulsing box-shadow glow.",
    "category": "loading",
    "code": "<div className=\"size-16 animate-pulse-glow rounded-full\n  border border-accent/30 bg-accent/10\" />",
    "difficulty": "Basic",
    "tags": [
      "shadow",
      "loop",
      "loading"
    ],
    "preview": null
  },
  {
    "id": "loading-bar",
    "title": "Indeterminate Bar",
    "description": "Indeterminate loading bar using shimmer animation on a gradient.",
    "category": "loading",
    "code": "<div className=\"h-1.5 w-64 overflow-hidden rounded-full bg-white/10\">\n  <div className=\"h-full w-1/3 animate-shimmer rounded-full\n    bg-gradient-to-r from-transparent via-accent to-transparent\n    bg-[length:200%_100%]\" />\n</div>",
    "difficulty": "Intermediate",
    "tags": [
      "gradient",
      "loading"
    ],
    "preview": null
  },
  {
    "id": "loading-orbit",
    "title": "Orbit Loader",
    "description": "Two dots orbiting around a center point in opposite directions.",
    "category": "loading",
    "code": "<div className=\"relative flex size-24 items-center justify-center\">\n  <div className=\"size-2 rounded-full bg-white/20\" />\n  <div className=\"absolute animate-orbit\">\n    <div className=\"size-3 rounded-full bg-accent\" />\n  </div>\n  <div className=\"absolute animate-orbit-reverse\">\n    <div className=\"size-2 rounded-full bg-cyan-glow\" />\n  </div>\n</div>",
    "difficulty": "Advanced",
    "tags": [
      "shadow",
      "loop",
      "loading"
    ],
    "preview": null
  },
  {
    "id": "text-gradient-shift",
    "title": "Gradient Text Shift",
    "description": "Text with an animated gradient background that shifts colors along the X axis.",
    "category": "text",
    "code": "<h2 className=\"animate-gradient-x bg-gradient-to-r\n  from-violet-400 via-cyan-400 to-rose-400\n  bg-[length:200%_auto] bg-clip-text text-3xl\n  font-bold text-transparent\">\n  Gradient Magic\n</h2>",
    "difficulty": "Intermediate",
    "tags": [
      "gradient",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "text-typewriter",
    "title": "Typewriter",
    "description": "Classic typewriter effect with a blinking caret using CSS steps() and overflow hidden.",
    "category": "text",
    "code": "<div className=\"font-mono text-lg text-emerald-glow\">\n  <span className=\"inline-block animate-typewriter overflow-hidden\n    whitespace-nowrap border-r-2 border-emerald-glow\n    [animation:typewriter_3s_steps(24)_1s_both,blink-caret_0.8s_step-end_infinite]\">\n    npm install tailwindcss@4\n  </span>\n</div>",
    "difficulty": "Advanced",
    "tags": [
      "shadow",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "text-shimmer",
    "title": "Shimmer Text",
    "description": "A metallic shimmer sweeps across the text using a moving linear gradient.",
    "category": "text",
    "code": "<span className=\"animate-shimmer bg-[linear-gradient(110deg,#e2e8f0_0%,#94a3b8_35%,#e2e8f0_60%,#94a3b8_100%)]\n  bg-[length:200%_100%] bg-clip-text text-3xl\n  font-bold text-transparent\">\n  Shimmer Text\n</span>",
    "difficulty": "Intermediate",
    "tags": [
      "gradient",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "text-stagger-letters",
    "title": "Staggered Letters",
    "description": "Each letter fades in one by one with increasing animation-delay.",
    "category": "text",
    "code": "<div className=\"flex text-3xl font-bold\">\n  {\"ANIMATE\".split(\"\").map((char, i) => (\n    <span key={i} className=\"animate-fade-in-up\"\n      style={{ animationDelay: \\`\\${i * 80}ms\\` }}>\n      {char}\n    </span>\n  ))}\n</div>",
    "difficulty": "Basic",
    "tags": [
      "typography"
    ],
    "preview": null
  },
  {
    "id": "text-glow",
    "title": "Glowing Text",
    "description": "Text with a pulsing text-shadow glow effect using a custom animation.",
    "category": "text",
    "code": "<h2 className=\"animate-text-glow text-3xl font-bold text-accent\">\n  Glowing\n</h2>",
    "difficulty": "Basic",
    "tags": [
      "shadow",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "text-marquee",
    "title": "Marquee Scroll",
    "description": "Infinitely scrolling text using translateX animation, duplicated for seamless loop.",
    "category": "text",
    "code": "<div className=\"w-64 overflow-hidden\">\n  <div className=\"flex animate-marquee whitespace-nowrap\">\n    <span className=\"mx-4 text-white/50\">TAILWIND CSS v4 ✦</span>\n    <span className=\"mx-4 text-white/50\">TAILWIND CSS v4 ✦</span>\n    <span className=\"mx-4 text-white/50\">TAILWIND CSS v4 ✦</span>\n    <span className=\"mx-4 text-white/50\">TAILWIND CSS v4 ✦</span>\n  </div>\n</div>",
    "difficulty": "Advanced",
    "tags": [
      "transform",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "text-word-stagger",
    "title": "Word Stagger Fade",
    "description": "Each word fades in with a staggered delay for elegant paragraph reveals.",
    "category": "text",
    "code": "<p className=\"text-lg\">\n  {\"Modern animations with Tailwind\".split(\" \").map((word, i) => (\n    <span key={i} className=\"mr-2 inline-block animate-fade-in-up\"\n      style={{ animationDelay: \\`\\${i * 120}ms\\` }}>\n      {word}\n    </span>\n  ))}\n</p>",
    "difficulty": "Basic",
    "tags": [
      "typography"
    ],
    "preview": null
  },
  {
    "id": "text-gradient-y",
    "title": "Vertical Gradient Shift",
    "description": "Gradient animates along the Y axis for a different color flow effect.",
    "category": "text",
    "code": "<h2 className=\"animate-gradient-y bg-gradient-to-b\n  from-amber-300 via-rose-400 to-violet-500\n  bg-[length:auto_200%] bg-clip-text text-3xl\n  font-bold text-transparent\">\n  Vertical Flow\n</h2>",
    "difficulty": "Intermediate",
    "tags": [
      "gradient",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "text-glitch",
    "title": "Glitch Text",
    "description": "Text with a rapid translate glitch effect using a fast multi-step keyframe.",
    "category": "text",
    "code": "<h2 className=\"relative text-3xl font-black text-white\n  [animation:glitch_0.3s_ease-in-out_infinite]\">\n  GLITCH\n</h2>",
    "difficulty": "Advanced",
    "tags": [
      "transform",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "text-spacing-breathe",
    "title": "Letter Spacing Breathe",
    "description": "Text letter-spacing expands and contracts smoothly using CSS transition.",
    "category": "text",
    "code": "<h2 className=\"text-2xl font-bold tracking-tight text-white/80\n  transition-all duration-1000 hover:tracking-[0.3em]\">\n  BREATHE\n</h2>",
    "difficulty": "Basic",
    "tags": [
      "interaction",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "complex-float",
    "title": "Floating Element",
    "description": "Gentle up-and-down float using a smooth ease-in-out infinite loop.",
    "category": "complex",
    "code": "<div className=\"animate-float rounded-2xl bg-gradient-to-br\n  from-violet-500/20 to-cyan-500/20 p-6 shadow-lg\">\n  🚀 Floating\n</div>",
    "difficulty": "Intermediate",
    "tags": [
      "gradient",
      "shadow"
    ],
    "preview": null
  },
  {
    "id": "complex-morph",
    "title": "Morphing Blob",
    "description": "A blob that continuously morphs its border-radius for organic motion.",
    "category": "complex",
    "code": "<div className=\"size-28 animate-morph bg-gradient-to-br\n  from-violet-500 to-cyan-400 transition-all\" />",
    "difficulty": "Advanced",
    "tags": [
      "gradient"
    ],
    "preview": null
  },
  {
    "id": "complex-rubber-band",
    "title": "Rubber Band",
    "description": "Elastic stretching effect using alternating scaleX/scaleY keyframes.",
    "category": "complex",
    "code": "<div className=\"animate-rubber-band rounded-xl bg-amber-glow/20\n  px-8 py-4 text-lg font-bold text-amber-glow\">\n  Stretch!\n</div>",
    "difficulty": "Advanced",
    "tags": [
      "transform",
      "shadow",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "complex-jello",
    "title": "Jello Wobble",
    "description": "A jello-like wobble using skew transforms that settle into place.",
    "category": "complex",
    "code": "<div className=\"animate-jello rounded-xl bg-rose-glow/20\n  px-8 py-4 text-lg font-bold text-rose-glow\">\n  Wobble\n</div>",
    "difficulty": "Advanced",
    "tags": [
      "transform",
      "shadow",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "complex-tada",
    "title": "Tada!",
    "description": "Attention-seeking animation with scale and rotation combination.",
    "category": "complex",
    "code": "<div className=\"animate-tada text-4xl\">🎉</div>",
    "difficulty": "Basic",
    "tags": [
      "transform",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "complex-wave",
    "title": "Wave Emoji",
    "description": "Hand-wave animation using multi-step rotation keyframes.",
    "category": "complex",
    "code": "<div className=\"animate-wave origin-[70%_70%] text-4xl\">👋</div>",
    "difficulty": "Advanced",
    "tags": [
      "typography"
    ],
    "preview": null
  },
  {
    "id": "complex-breathe",
    "title": "Breathing Card",
    "description": "Card gently scales and adjusts opacity for a 'breathing' alive effect.",
    "category": "complex",
    "code": "<div className=\"animate-breathe rounded-2xl border border-white/10\n  bg-white/5 p-8\">\n  <p className=\"text-sm text-white/60\">I'm alive</p>\n</div>",
    "difficulty": "Basic",
    "tags": [
      "transform",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "complex-levitate",
    "title": "Levitate",
    "description": "Multi-step levitation with subtle rotation for a magical floating effect.",
    "category": "complex",
    "code": "<div className=\"animate-levitate rounded-xl bg-gradient-to-br\n  from-indigo-500/30 to-purple-600/30 p-6 shadow-xl\n  shadow-purple-500/10\">\n  <span className=\"text-2xl\">💎</span>\n</div>",
    "difficulty": "Intermediate",
    "tags": [
      "gradient",
      "shadow",
      "typography"
    ],
    "preview": null
  },
  {
    "id": "complex-wiggle",
    "title": "Wiggle",
    "description": "Subtle rotation wiggle using alternating negative/positive rotations.",
    "category": "complex",
    "code": "<div className=\"animate-wiggle text-4xl\">🔔</div>",
    "difficulty": "Basic",
    "tags": [
      "typography"
    ],
    "preview": null
  },
  {
    "id": "complex-heartbeat",
    "title": "Heartbeat",
    "description": "Double-pump heartbeat animation using multi-step scale keyframes — a classic.",
    "category": "complex",
    "code": "<div className=\"animate-heartbeat text-4xl text-rose-500\">❤️</div>",
    "difficulty": "Advanced",
    "tags": [
      "transform",
      "typography"
    ],
    "preview": null
  }
] as AnimationDemo[];

export const animationDemoMetaById = new Map(
  animationDemos.map((demo) => [demo.id, demo]),
);

export const demoCategoryById = new Map(
  animationDemos.map((demo) => [demo.id, demo.category]),
);

export const categoryCounts = new Map<AnimationCategoryId, number>(
  animationCategories.map((category) => [
    category.id,
    animationDemos.filter((demo) => demo.category === category.id).length,
  ]),
);
