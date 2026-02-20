import { AnimationCard } from "../components/AnimationCard";

export function TextAnimations() {
  return (
    <>
      {/* 31 — Gradient Text Shift */}
      <AnimationCard
        id="text-gradient-shift"
        title="Gradient Text Shift"
        description="Text with an animated gradient background that shifts colors along the X axis."
        category="Text"
        code={`<h2 className="animate-gradient-x bg-gradient-to-r
  from-violet-400 via-cyan-400 to-rose-400
  bg-[length:200%_auto] bg-clip-text text-3xl
  font-bold text-transparent">
  Gradient Magic
</h2>`}
      >
        <h2 className="animate-gradient-x bg-gradient-to-r from-violet-400 via-cyan-400 to-rose-400 bg-[length:200%_auto] bg-clip-text text-3xl font-bold text-transparent">
          Gradient Magic
        </h2>
      </AnimationCard>

      {/* 32 — Typewriter */}
      <AnimationCard
        id="text-typewriter"
        title="Typewriter"
        description="Classic typewriter effect with a blinking caret using CSS steps() and overflow hidden."
        category="Text"
        code={`<div className="font-mono text-lg text-emerald-glow">
  <span className="inline-block animate-typewriter overflow-hidden
    whitespace-nowrap border-r-2 border-emerald-glow
    [animation:typewriter_3s_steps(24)_1s_both,blink-caret_0.8s_step-end_infinite]">
    npm install tailwindcss@4
  </span>
</div>`}
      >
        <div className="text-emerald-glow font-mono text-lg">
          <span className="border-emerald-glow inline-block [animation:typewriter_3s_steps(24)_1s_both,blink-caret_0.8s_step-end_infinite] overflow-hidden border-r-2 whitespace-nowrap">
            npm install tailwindcss@4
          </span>
        </div>
      </AnimationCard>

      {/* 33 — Shimmer Text */}
      <AnimationCard
        id="text-shimmer"
        title="Shimmer Text"
        description="A metallic shimmer sweeps across the text using a moving linear gradient."
        category="Text"
        code={`<span className="animate-shimmer bg-[linear-gradient(110deg,#e2e8f0_0%,#94a3b8_35%,#e2e8f0_60%,#94a3b8_100%)]
  bg-[length:200%_100%] bg-clip-text text-3xl
  font-bold text-transparent">
  Shimmer Text
</span>`}
      >
        <span className="animate-shimmer bg-[linear-gradient(110deg,#e2e8f0_0%,#94a3b8_35%,#e2e8f0_60%,#94a3b8_100%)] bg-[length:200%_100%] bg-clip-text text-3xl font-bold text-transparent">
          Shimmer Text
        </span>
      </AnimationCard>

      {/* 34 — Staggered Letter Fade */}
      <AnimationCard
        id="text-stagger-letters"
        title="Staggered Letters"
        description="Each letter fades in one by one with increasing animation-delay."
        category="Text"
        code={`<div className="flex text-3xl font-bold">
  {"ANIMATE".split("").map((char, i) => (
    <span key={i} className="animate-fade-in-up"
      style={{ animationDelay: \`\${i * 80}ms\` }}>
      {char}
    </span>
  ))}
</div>`}
      >
        <div className="flex text-3xl font-bold text-white/90">
          {"ANIMATE".split("").map((char, i) => (
            <span
              key={i}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {char}
            </span>
          ))}
        </div>
      </AnimationCard>

      {/* 35 — Glowing Text */}
      <AnimationCard
        id="text-glow"
        title="Glowing Text"
        description="Text with a pulsing text-shadow glow effect using a custom animation."
        category="Text"
        code={`<h2 className="text-3xl font-bold text-accent
  [animation:pulse-glow_2s_ease-in-out_infinite]
  [text-shadow:0_0_10px_oklch(0.7_0.18_270/0.5)]">
  Glowing
</h2>`}
      >
        <h2 className="text-accent text-3xl font-bold [text-shadow:0_0_10px_oklch(0.7_0.18_270/0.5),0_0_40px_oklch(0.7_0.18_270/0.2)]">
          Glowing ✨
        </h2>
      </AnimationCard>

      {/* 36 — Marquee */}
      <AnimationCard
        id="text-marquee"
        title="Marquee Scroll"
        description="Infinitely scrolling text using translateX animation, duplicated for seamless loop."
        category="Text"
        code={`<div className="w-64 overflow-hidden">
  <div className="flex animate-marquee whitespace-nowrap">
    <span className="mx-4 text-white/50">TAILWIND CSS v4 ✦</span>
    <span className="mx-4 text-white/50">TAILWIND CSS v4 ✦</span>
    <span className="mx-4 text-white/50">TAILWIND CSS v4 ✦</span>
    <span className="mx-4 text-white/50">TAILWIND CSS v4 ✦</span>
  </div>
</div>`}
      >
        <div className="w-64 overflow-hidden">
          <div className="animate-marquee flex whitespace-nowrap">
            <span className="mx-4 text-white/50">TAILWIND CSS v4 ✦</span>
            <span className="mx-4 text-white/50">TAILWIND CSS v4 ✦</span>
            <span className="mx-4 text-white/50">TAILWIND CSS v4 ✦</span>
            <span className="mx-4 text-white/50">TAILWIND CSS v4 ✦</span>
          </div>
        </div>
      </AnimationCard>

      {/* 37 — Word Fade Stagger */}
      <AnimationCard
        id="text-word-stagger"
        title="Word Stagger Fade"
        description="Each word fades in with a staggered delay for elegant paragraph reveals."
        category="Text"
        code={`<p className="text-lg">
  {"Modern animations with Tailwind".split(" ").map((word, i) => (
    <span key={i} className="mr-2 inline-block animate-fade-in-up"
      style={{ animationDelay: \`\${i * 120}ms\` }}>
      {word}
    </span>
  ))}
</p>`}
      >
        <p className="text-lg text-white/80">
          {"Modern animations with Tailwind".split(" ").map((word, i) => (
            <span
              key={i}
              className="animate-fade-in-up mr-2 inline-block"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {word}
            </span>
          ))}
        </p>
      </AnimationCard>

      {/* 38 — Gradient Y Text */}
      <AnimationCard
        id="text-gradient-y"
        title="Vertical Gradient Shift"
        description="Gradient animates along the Y axis for a different color flow effect."
        category="Text"
        code={`<h2 className="animate-gradient-y bg-gradient-to-b
  from-amber-300 via-rose-400 to-violet-500
  bg-[length:auto_200%] bg-clip-text text-3xl
  font-bold text-transparent">
  Vertical Flow
</h2>`}
      >
        <h2 className="animate-gradient-y bg-gradient-to-b from-amber-300 via-rose-400 to-violet-500 bg-[length:auto_200%] bg-clip-text text-3xl font-bold text-transparent">
          Vertical Flow
        </h2>
      </AnimationCard>

      {/* 39 — Glitch Text */}
      <AnimationCard
        id="text-glitch"
        title="Glitch Text"
        description="Text with a rapid translate glitch effect using a fast multi-step keyframe."
        category="Text"
        code={`<h2 className="relative text-3xl font-black text-white
  [animation:glitch_0.3s_ease-in-out_infinite]">
  GLITCH
</h2>`}
      >
        <h2 className="relative [animation:glitch_0.3s_ease-in-out_infinite] text-3xl font-black text-white">
          GLITCH
        </h2>
      </AnimationCard>

      {/* 40 — Letter Spacing Breathe */}
      <AnimationCard
        id="text-spacing-breathe"
        title="Letter Spacing Breathe"
        description="Text letter-spacing expands and contracts smoothly using CSS transition."
        category="Text"
        code={`<h2 className="text-2xl font-bold tracking-tight text-white/80
  transition-all duration-1000 hover:tracking-[0.3em]">
  BREATHE
</h2>`}
      >
        <h2 className="cursor-pointer text-2xl font-bold tracking-tight text-white/80 transition-all duration-1000 hover:tracking-[0.3em]">
          BREATHE
        </h2>
      </AnimationCard>
    </>
  );
}
