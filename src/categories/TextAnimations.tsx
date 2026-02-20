import { AnimationCard } from "../components/AnimationCard";

export function TextAnimations() {
  return (
    <>
      <AnimationCard id="text-gradient-shift">
        <h2 className="animate-gradient-x bg-gradient-to-r from-violet-400 via-cyan-400 to-rose-400 bg-[length:200%_auto] bg-clip-text text-3xl font-bold text-transparent">
          Gradient Magic
        </h2>
      </AnimationCard>

      <AnimationCard id="text-typewriter">
        <div className="text-emerald-glow font-mono text-lg">
          <span className="border-emerald-glow inline-block [animation:typewriter_3s_steps(24)_1s_both,blink-caret_0.8s_step-end_infinite] overflow-hidden border-r-2 whitespace-nowrap">
            npm install tailwindcss@4
          </span>
        </div>
      </AnimationCard>

      <AnimationCard id="text-shimmer">
        <span className="animate-shimmer bg-[linear-gradient(110deg,#e2e8f0_0%,#94a3b8_35%,#e2e8f0_60%,#94a3b8_100%)] bg-[length:200%_100%] bg-clip-text text-3xl font-bold text-transparent">
          Shimmer Text
        </span>
      </AnimationCard>

      <AnimationCard id="text-stagger-letters">
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

      <AnimationCard id="text-glow">
        <h2 className="animate-text-glow text-accent text-3xl font-bold">Glowing ✨</h2>
      </AnimationCard>

      <AnimationCard id="text-marquee">
        <div className="w-64 overflow-hidden">
          <div className="animate-marquee flex whitespace-nowrap">
            <span className="mx-4 text-white/50">TAILWIND CSS v4 ✦</span>
            <span className="mx-4 text-white/50">TAILWIND CSS v4 ✦</span>
            <span className="mx-4 text-white/50">TAILWIND CSS v4 ✦</span>
            <span className="mx-4 text-white/50">TAILWIND CSS v4 ✦</span>
          </div>
        </div>
      </AnimationCard>

      <AnimationCard id="text-word-stagger">
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

      <AnimationCard id="text-gradient-y">
        <h2 className="animate-gradient-y bg-gradient-to-b from-amber-300 via-rose-400 to-violet-500 bg-[length:auto_200%] bg-clip-text text-3xl font-bold text-transparent">
          Vertical Flow
        </h2>
      </AnimationCard>

      <AnimationCard id="text-glitch">
        <h2 className="relative [animation:glitch_0.3s_ease-in-out_infinite] text-3xl font-black text-white">
          GLITCH
        </h2>
      </AnimationCard>

      <AnimationCard id="text-spacing-breathe">
        <h2 className="cursor-pointer text-2xl font-bold tracking-tight text-white/80 transition-all duration-1000 hover:tracking-[0.3em]">
          BREATHE
        </h2>
      </AnimationCard>
    </>
  );
}
