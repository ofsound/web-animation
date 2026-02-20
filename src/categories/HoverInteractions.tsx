import { AnimationCard } from "../components/AnimationCard";

export function HoverInteractions() {
  return (
    <>
      {/* 1 — Scale & Glow on Hover */}
      <AnimationCard
        id="hover-scale-glow"
        title="Scale & Glow"
        description="Smooth scale-up with a glowing box-shadow on hover using transition-all."
        category="Hover"
        code={`<button className="rounded-xl bg-accent px-6 py-3 font-semibold text-white
  transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_oklch(0.7_0.18_270/0.4)]">
  Hover me
</button>`}
      >
        <button className="bg-accent rounded-xl px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_oklch(0.7_0.18_270/0.4)]">
          Hover me
        </button>
      </AnimationCard>

      {/* 2 — Gradient Border Spin */}
      <AnimationCard
        id="hover-gradient-border"
        title="Gradient Border Spin"
        description="A conic-gradient border that rotates on hover using a pseudo-element technique."
        category="Hover"
        code={`<div className="group relative rounded-2xl p-[2px]">
  <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,#7c3aed,#06b6d4,#f59e0b,#7c3aed)]
    opacity-50 blur-sm transition-all duration-500 group-hover:opacity-100 group-hover:blur-md
    group-hover:animate-spin-slow" />
  <div className="relative rounded-2xl bg-zinc-900 px-6 py-4 text-sm text-white/80">
    Gradient border
  </div>
</div>`}
      >
        <div className="group relative rounded-2xl p-[2px]">
          <div className="group-hover:animate-spin-slow absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,#7c3aed,#06b6d4,#f59e0b,#7c3aed)] opacity-50 blur-sm transition-all duration-500 group-hover:opacity-100 group-hover:blur-md" />
          <div className="relative rounded-2xl bg-zinc-900 px-6 py-4 text-sm text-white/80">
            Gradient border
          </div>
        </div>
      </AnimationCard>

      {/* 3 — 3D Tilt Card */}
      <AnimationCard
        id="hover-3d-tilt"
        title="3D Tilt Card"
        description="Perspective-based 3D tilt effect using group-hover with rotateX/Y transforms."
        category="Hover"
        code={`<div className="group [perspective:800px]">
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6
    transition-transform duration-500 ease-out
    group-hover:[transform:rotateX(8deg)_rotateY(-8deg)]">
    <p className="text-sm text-white/70">Hover for 3D tilt</p>
  </div>
</div>`}
      >
        <div className="group [perspective:800px]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-transform duration-500 ease-out group-hover:[transform:rotateX(8deg)_rotateY(-8deg)]">
            <div className="size-12 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400" />
            <p className="mt-3 text-sm text-white/70">Hover for 3D tilt</p>
          </div>
        </div>
      </AnimationCard>

      {/* 4 — Underline Slide */}
      <AnimationCard
        id="hover-underline"
        title="Underline Slide"
        description="An animated underline that slides in from left on hover using scale-x transform origin."
        category="Hover"
        code={`<a className="group relative text-lg font-medium text-white/80">
  Hover for underline
  <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0
    bg-accent transition-transform duration-300 group-hover:scale-x-100" />
</a>`}
      >
        <a className="group relative cursor-pointer text-lg font-medium text-white/80">
          Hover for underline
          <span className="bg-accent absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
        </a>
      </AnimationCard>

      {/* 5 — Button Fill Sweep */}
      <AnimationCard
        id="hover-fill-sweep"
        title="Button Fill Sweep"
        description="Background color sweeps across the button on hover using a translated pseudo-element."
        category="Hover"
        code={`<button className="group relative overflow-hidden rounded-xl border border-accent
  px-6 py-3 font-semibold text-accent transition-colors duration-300 hover:text-white">
  <span className="absolute inset-0 -translate-x-full bg-accent
    transition-transform duration-300 group-hover:translate-x-0" />
  <span className="relative">Fill Sweep</span>
</button>`}
      >
        <button className="group border-accent text-accent relative overflow-hidden rounded-xl border px-6 py-3 font-semibold transition-colors duration-300 hover:text-white">
          <span className="bg-accent absolute inset-0 -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
          <span className="relative">Fill Sweep</span>
        </button>
      </AnimationCard>

      {/* 6 — Shadow Expansion */}
      <AnimationCard
        id="hover-shadow-expand"
        title="Shadow Expansion"
        description="Multi-layered shadow that dramatically expands on hover, creating depth."
        category="Hover"
        code={`<div className="rounded-2xl bg-zinc-800 p-6 shadow-lg transition-all duration-500
  hover:-translate-y-1
  hover:shadow-[0_20px_60px_-15px_oklch(0.7_0.18_270/0.3)]">
  <p className="text-sm text-white/70">Hover to elevate</p>
</div>`}
      >
        <div className="rounded-2xl bg-zinc-800 p-6 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_oklch(0.7_0.18_270/0.3)]">
          <div className="mb-2 text-2xl">🎯</div>
          <p className="text-sm text-white/70">Hover to elevate</p>
        </div>
      </AnimationCard>

      {/* 7 — Icon Rotate */}
      <AnimationCard
        id="hover-icon-rotate"
        title="Icon Rotate & Color"
        description="Icon rotates 360° and changes color on parent hover with smooth transition."
        category="Hover"
        code={`<button className="group flex items-center gap-3 rounded-xl bg-white/5
  px-5 py-3 transition-colors hover:bg-white/10">
  <span className="text-xl transition-all duration-500
    group-hover:rotate-[360deg] group-hover:text-amber-400">⚙️</span>
  <span className="text-sm text-white/70">Settings</span>
</button>`}
      >
        <button className="group flex items-center gap-3 rounded-xl bg-white/5 px-5 py-3 transition-colors hover:bg-white/10">
          <span className="text-xl transition-all duration-500 group-hover:rotate-[360deg] group-hover:text-amber-400">
            ⚙️
          </span>
          <span className="text-sm text-white/70">Settings</span>
        </button>
      </AnimationCard>

      {/* 8 — Glassmorphism Hover */}
      <AnimationCard
        id="hover-glass"
        title="Glassmorphism Hover"
        description="Glass-like card that increases its blur and brightness on hover."
        category="Hover"
        code={`<div className="rounded-2xl border border-white/10 bg-white/5 p-6
  backdrop-blur-md transition-all duration-300
  hover:border-white/20 hover:bg-white/10 hover:backdrop-blur-xl">
  <p className="text-sm text-white/70">Glass effect</p>
</div>`}
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:backdrop-blur-xl">
          <div className="mb-2 size-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500" />
          <p className="text-sm text-white/70">Glass effect</p>
        </div>
      </AnimationCard>

      {/* 9 — Ring Pulse on Focus */}
      <AnimationCard
        id="hover-ring-focus"
        title="Ring Pulse on Focus"
        description="Input with animated ring that appears and pulses on focus using ring utilities."
        category="Hover"
        code={`<input
  type="text"
  placeholder="Click to focus..."
  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3
  text-sm text-white/80 outline-none transition-all duration-300
  placeholder:text-white/30
  focus:border-accent focus:ring-2 focus:ring-accent/30
  focus:shadow-[0_0_20px_oklch(0.7_0.18_270/0.15)]"
/>`}
      >
        <input
          type="text"
          id="ring-focus-demo"
          name="ring-focus-demo"
          placeholder="Click to focus..."
          className="focus:border-accent focus:ring-accent/30 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition-all duration-300 outline-none placeholder:text-white/30 focus:shadow-[0_0_20px_oklch(0.7_0.18_270/0.15)] focus:ring-2"
        />
      </AnimationCard>

      {/* 10 — Card Reveal Overlay */}
      <AnimationCard
        id="hover-reveal"
        title="Card Reveal Overlay"
        description="Overlay content slides up from the bottom on hover, revealing a call-to-action."
        category="Hover"
        code={`<div className="group relative h-40 w-48 overflow-hidden rounded-2xl
  bg-gradient-to-br from-violet-600 to-indigo-800">
  <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center
    justify-center bg-black/60 p-4 backdrop-blur-sm transition-transform
    duration-300 group-hover:translate-y-0">
    <span className="text-sm font-medium text-white">View Details →</span>
  </div>
</div>`}
      >
        <div className="group relative h-40 w-48 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-800">
          <div className="flex h-full items-center justify-center">
            <span className="text-3xl">🎨</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
            <span className="text-sm font-medium text-white">
              View Details →
            </span>
          </div>
        </div>
      </AnimationCard>
    </>
  );
}
