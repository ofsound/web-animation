import { AnimationCard } from "../components/AnimationCard";

export function EntranceEffects() {
  return (
    <>
      {/* 11 — Fade In */}
      <AnimationCard
        id="entrance-fade-in"
        title="Fade In"
        description="Simple opacity fade-in using a custom animate utility."
        category="Entrance"
        code={`<div className="animate-fade-in rounded-xl bg-white/5 p-6 text-sm text-white/70">
  Fading in…
</div>`}
      >
        <div className="animate-fade-in rounded-xl bg-white/5 p-6 text-sm text-white/70">
          Fading in…
        </div>
      </AnimationCard>

      {/* 12 — Fade In Up */}
      <AnimationCard
        id="entrance-fade-in-up"
        title="Fade In Up"
        description="Element fades in while sliding up from below."
        category="Entrance"
        code={`<div className="animate-fade-in-up rounded-xl bg-white/5 p-6">
  Sliding up
</div>`}
      >
        <div className="animate-fade-in-up rounded-xl bg-white/5 p-6 text-sm text-white/70">
          Sliding up ↑
        </div>
      </AnimationCard>

      {/* 13 — Fade In Down */}
      <AnimationCard
        id="entrance-fade-in-down"
        title="Fade In Down"
        description="Element fades in while sliding down from above."
        category="Entrance"
        code={`<div className="animate-fade-in-down rounded-xl bg-white/5 p-6">
  Sliding down
</div>`}
      >
        <div className="animate-fade-in-down rounded-xl bg-white/5 p-6 text-sm text-white/70">
          Sliding down ↓
        </div>
      </AnimationCard>

      {/* 14 — Scale In (Pop) */}
      <AnimationCard
        id="entrance-scale-in"
        title="Scale In (Pop)"
        description="Scales from 0.8 to 1 with a spring-like cubic-bezier for a satisfying pop."
        category="Entrance"
        code={`<div className="animate-scale-in rounded-2xl bg-gradient-to-br
  from-violet-500/20 to-cyan-500/20 p-6">
  Pop!
</div>`}
      >
        <div className="animate-scale-in rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 p-6 text-sm font-medium text-white/80">
          Pop! 🎉
        </div>
      </AnimationCard>

      {/* 15 — Bounce In */}
      <AnimationCard
        id="entrance-bounce-in"
        title="Bounce In"
        description="Element bounces in with overshoot and settle using a multi-step keyframe."
        category="Entrance"
        code={`<div className="animate-bounce-in rounded-full bg-emerald-glow/20
  p-4 text-center">
  🏀
</div>`}
      >
        <div className="animate-bounce-in bg-emerald-glow/20 rounded-full p-6 text-center text-2xl">
          🏀
        </div>
      </AnimationCard>

      {/* 16 — Slide In Bounce */}
      <AnimationCard
        id="entrance-slide-bounce"
        title="Slide In Bounce"
        description="Slides in from the left with a spring bounce at the end."
        category="Entrance"
        code={`<div className="animate-slide-in-bounce rounded-xl bg-white/5 px-6 py-4">
  ← Bounced in
</div>`}
      >
        <div className="animate-slide-in-bounce rounded-xl bg-white/5 px-6 py-4 text-sm text-white/70">
          ← Bounced in
        </div>
      </AnimationCard>

      {/* 17 — Zoom In Rotate */}
      <AnimationCard
        id="entrance-zoom-rotate"
        title="Zoom In + Rotate"
        description="Scales from 0 to 1 while rotating 180°, creating a dramatic entrance."
        category="Entrance"
        code={`<div className="animate-zoom-in-rotate inline-block rounded-xl
  bg-rose-glow/20 p-4 text-2xl">
  ⭐
</div>`}
      >
        <div className="animate-zoom-in-rotate bg-rose-glow/20 inline-block rounded-xl p-4 text-2xl">
          ⭐
        </div>
      </AnimationCard>

      {/* 18 — Flip X */}
      <AnimationCard
        id="entrance-flip-x"
        title="Flip In X"
        description="Element flips in around the X axis with perspective for 3D depth."
        category="Entrance"
        code={`<div className="animate-flip-x rounded-xl bg-white/5 p-6 text-sm">
  Flipped in (X axis)
</div>`}
      >
        <div className="animate-flip-x rounded-xl bg-white/5 p-6 text-sm text-white/70">
          Flipped in (X axis)
        </div>
      </AnimationCard>

      {/* 19 — Flip Y */}
      <AnimationCard
        id="entrance-flip-y"
        title="Flip In Y"
        description="Element flips in around the Y axis with perspective for 3D depth."
        category="Entrance"
        code={`<div className="animate-flip-y rounded-xl bg-white/5 p-6 text-sm">
  Flipped in (Y axis)
</div>`}
      >
        <div className="animate-flip-y rounded-xl bg-white/5 p-6 text-sm text-white/70">
          Flipped in (Y axis)
        </div>
      </AnimationCard>

      {/* 20 — Blur In */}
      <AnimationCard
        id="entrance-blur-in"
        title="Blur In"
        description="Fades in with a blur filter that resolves to sharp, creating a focusing effect."
        category="Entrance"
        code={`<div className="animate-blur-in rounded-xl bg-white/5 p-6 text-sm">
  Blurring into focus
</div>`}
      >
        <div className="animate-blur-in rounded-xl bg-white/5 p-6 text-sm text-white/70">
          Blurring into focus 🔍
        </div>
      </AnimationCard>
    </>
  );
}
