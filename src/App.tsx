import { useRef } from "react";
import { HoverInteractions } from "./categories/HoverInteractions";
import { EntranceEffects } from "./categories/EntranceEffects";
import { LoadingStates } from "./categories/LoadingStates";
import { TextAnimations } from "./categories/TextAnimations";
import { ComplexKeyframes } from "./categories/ComplexKeyframes";

const categories = [
  { id: "hover", label: "Hover & Interaction", emoji: "🖱️" },
  { id: "entrance", label: "Entrance Effects", emoji: "🚪" },
  { id: "loading", label: "Loading States", emoji: "⏳" },
  { id: "text", label: "Text Animations", emoji: "✍️" },
  { id: "complex", label: "Complex Keyframes", emoji: "🎭" },
];

function App() {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      {/* ═══ Header ═══ */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-lg font-bold tracking-tight text-transparent">
              Tailwind v4 Animation Gallery
            </h1>
            <p className="mt-0.5 font-mono text-[11px] tracking-wide text-white/30">
              50 animations · React · Tailwind CSS v4
            </p>
          </div>
          {/* Category Navigation */}
          <nav className="hidden gap-1 md:flex">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollTo(cat.id)}
                className="rounded-lg px-3 py-1.5 font-mono text-[11px] text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70"
              >
                <span className="mr-1">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden border-b border-white/[0.04] py-20">
        {/* Spotlight effect */}
        <div className="pointer-events-none absolute inset-0">
          <div className="bg-accent/[0.06] absolute top-0 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="mb-4 inline-block rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5">
            <span className="font-mono text-xs tracking-wider text-white/50">
              ✦ 50 PRODUCTION-READY ANIMATIONS
            </span>
          </div>
          <h2 className="animate-gradient-x via-accent-bright to-cyan-glow bg-gradient-to-r from-white bg-[length:200%_auto] bg-clip-text text-4xl leading-tight font-extrabold tracking-tight text-transparent sm:text-5xl">
            Modern CSS Animations
            <br />
            with Tailwind v4
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/40">
            A curated collection of hover effects, entrances, loading states,
            text animations, and complex keyframes — all built with Tailwind CSS
            v4's new <code className="text-accent/70">@theme</code> and{" "}
            <code className="text-accent/70">@keyframes</code> system. Click{" "}
            <span className="font-semibold text-white/60">Code</span> on any
            card to copy.
          </p>
        </div>
      </section>

      {/* ═══ Gallery Sections ═══ */}
      <main className="mx-auto max-w-7xl px-6 pb-24">
        {/* Section: Hover & Interaction */}
        <section
          ref={(el) => {
            sectionRefs.current["hover"] = el;
          }}
          className="pt-16"
        >
          <SectionHeader
            emoji="🖱️"
            title="Hover & Interaction"
            count={10}
            description="Smooth hover transitions, 3D effects, and interactive state changes"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <HoverInteractions />
          </div>
        </section>

        {/* Section: Entrance Effects */}
        <section
          ref={(el) => {
            sectionRefs.current["entrance"] = el;
          }}
          className="pt-16"
        >
          <SectionHeader
            emoji="🚪"
            title="Entrance Effects"
            count={10}
            description="Reveal animations for elements appearing on screen"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <EntranceEffects />
          </div>
        </section>

        {/* Section: Loading States */}
        <section
          ref={(el) => {
            sectionRefs.current["loading"] = el;
          }}
          className="pt-16"
        >
          <SectionHeader
            emoji="⏳"
            title="Loading States"
            count={10}
            description="Spinners, skeletons, progress bars, and activity indicators"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <LoadingStates />
          </div>
        </section>

        {/* Section: Text Animations */}
        <section
          ref={(el) => {
            sectionRefs.current["text"] = el;
          }}
          className="pt-16"
        >
          <SectionHeader
            emoji="✍️"
            title="Text Animations"
            count={10}
            description="Typography effects, gradients, typewriter, and text reveals"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <TextAnimations />
          </div>
        </section>

        {/* Section: Complex Keyframes */}
        <section
          ref={(el) => {
            sectionRefs.current["complex"] = el;
          }}
          className="pt-16"
        >
          <SectionHeader
            emoji="🎭"
            title="Complex Keyframes"
            count={10}
            description="Multi-step animations, morphing shapes, and attention seekers"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ComplexKeyframes />
          </div>
        </section>
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-white/[0.04] py-8 text-center">
        <p className="font-mono text-xs text-white/20">
          Built with React + Tailwind CSS v4 + Vite · 2026
        </p>
      </footer>
    </div>
  );
}

function SectionHeader({
  emoji,
  title,
  count,
  description,
}: {
  emoji: string;
  title: string;
  count: number;
  description: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <h2 className="text-xl font-bold text-white/90">{title}</h2>
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-white/30">
          {count}
        </span>
      </div>
      <p className="mt-1 text-sm text-white/35">{description}</p>
      <div className="mt-4 h-px bg-gradient-to-r from-white/[0.08] to-transparent" />
    </div>
  );
}

export default App;
