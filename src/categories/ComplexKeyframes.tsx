import { AnimationCard } from "../components/AnimationCard";

export function ComplexKeyframes() {
  return (
    <>
      {/* 41 — Floating Element */}
      <AnimationCard
        id="complex-float"
        title="Floating Element"
        description="Gentle up-and-down float using a smooth ease-in-out infinite loop."
        category="Complex"
        code={`<div className="animate-float rounded-2xl bg-gradient-to-br
  from-violet-500/20 to-cyan-500/20 p-6 shadow-lg">
  🚀 Floating
</div>`}
      >
        <div className="animate-float rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 p-6 text-sm font-medium text-white/80 shadow-lg">
          🚀 Floating
        </div>
      </AnimationCard>

      {/* 42 — Morphing Blob */}
      <AnimationCard
        id="complex-morph"
        title="Morphing Blob"
        description="A blob that continuously morphs its border-radius for organic motion."
        category="Complex"
        code={`<div className="size-28 animate-morph bg-gradient-to-br
  from-violet-500 to-cyan-400 transition-all" />`}
      >
        <div className="animate-morph size-28 bg-gradient-to-br from-violet-500 to-cyan-400" />
      </AnimationCard>

      {/* 43 — Rubber Band */}
      <AnimationCard
        id="complex-rubber-band"
        title="Rubber Band"
        description="Elastic stretching effect using alternating scaleX/scaleY keyframes."
        category="Complex"
        code={`<div className="animate-rubber-band rounded-xl bg-amber-glow/20
  px-8 py-4 text-lg font-bold text-amber-glow">
  Stretch!
</div>`}
      >
        <div className="animate-rubber-band bg-amber-glow/20 text-amber-glow rounded-xl px-8 py-4 text-lg font-bold">
          Stretch!
        </div>
      </AnimationCard>

      {/* 44 — Jello */}
      <AnimationCard
        id="complex-jello"
        title="Jello Wobble"
        description="A jello-like wobble using skew transforms that settle into place."
        category="Complex"
        code={`<div className="animate-jello rounded-xl bg-rose-glow/20
  px-8 py-4 text-lg font-bold text-rose-glow">
  Wobble
</div>`}
      >
        <div className="animate-jello bg-rose-glow/20 text-rose-glow rounded-xl px-8 py-4 text-lg font-bold">
          Wobble 🍮
        </div>
      </AnimationCard>

      {/* 45 — Tada */}
      <AnimationCard
        id="complex-tada"
        title="Tada!"
        description="Attention-seeking animation with scale and rotation combination."
        category="Complex"
        code={`<div className="animate-tada text-4xl">🎉</div>`}
      >
        <div className="animate-tada text-4xl">🎉</div>
      </AnimationCard>

      {/* 46 — Wave */}
      <AnimationCard
        id="complex-wave"
        title="Wave Emoji"
        description="Hand-wave animation using multi-step rotation keyframes."
        category="Complex"
        code={`<div className="animate-wave origin-[70%_70%] text-4xl">👋</div>`}
      >
        <div className="animate-wave origin-[70%_70%] text-4xl">👋</div>
      </AnimationCard>

      {/* 47 — Breathing Card */}
      <AnimationCard
        id="complex-breathe"
        title="Breathing Card"
        description="Card gently scales and adjusts opacity for a 'breathing' alive effect."
        category="Complex"
        code={`<div className="animate-breathe rounded-2xl border border-white/10
  bg-white/5 p-8">
  <p className="text-sm text-white/60">I'm alive</p>
</div>`}
      >
        <div className="animate-breathe rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="mx-auto mb-2 size-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
          <p className="text-center text-sm text-white/60">I'm alive</p>
        </div>
      </AnimationCard>

      {/* 48 — Levitating Object */}
      <AnimationCard
        id="complex-levitate"
        title="Levitate"
        description="Multi-step levitation with subtle rotation for a magical floating effect."
        category="Complex"
        code={`<div className="animate-levitate rounded-xl bg-gradient-to-br
  from-indigo-500/30 to-purple-600/30 p-6 shadow-xl
  shadow-purple-500/10">
  <span className="text-2xl">💎</span>
</div>`}
      >
        <div className="animate-levitate rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 p-6 shadow-xl shadow-purple-500/10">
          <span className="text-2xl">💎</span>
        </div>
      </AnimationCard>

      {/* 49 — Wiggle */}
      <AnimationCard
        id="complex-wiggle"
        title="Wiggle"
        description="Subtle rotation wiggle using alternating negative/positive rotations."
        category="Complex"
        code={`<div className="animate-wiggle text-4xl">🔔</div>`}
      >
        <div className="animate-wiggle text-4xl">🔔</div>
      </AnimationCard>

      {/* 50 — Heartbeat */}
      <AnimationCard
        id="complex-heartbeat"
        title="Heartbeat"
        description="Double-pump heartbeat animation using multi-step scale keyframes — a classic."
        category="Complex"
        code={`<div className="animate-heartbeat text-4xl text-rose-500">❤️</div>`}
      >
        <div className="animate-heartbeat text-4xl text-rose-500">❤️</div>
      </AnimationCard>
    </>
  );
}
