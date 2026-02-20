import { AnimationCard } from "../components/AnimationCard";

export function EntranceEffects() {
  return (
    <>
      <AnimationCard id="entrance-fade-in">
        <div className="animate-fade-in rounded-xl bg-white/5 p-6 text-sm text-white/70">
          Fading in…
        </div>
      </AnimationCard>

      <AnimationCard id="entrance-fade-in-up">
        <div className="animate-fade-in-up rounded-xl bg-white/5 p-6 text-sm text-white/70">
          Sliding up ↑
        </div>
      </AnimationCard>

      <AnimationCard id="entrance-fade-in-down">
        <div className="animate-fade-in-down rounded-xl bg-white/5 p-6 text-sm text-white/70">
          Sliding down ↓
        </div>
      </AnimationCard>

      <AnimationCard id="entrance-scale-in">
        <div className="animate-scale-in rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 p-6 text-sm font-medium text-white/80">
          Pop! 🎉
        </div>
      </AnimationCard>

      <AnimationCard id="entrance-bounce-in">
        <div className="animate-bounce-in bg-emerald-glow/20 rounded-full p-6 text-center text-2xl">
          🏀
        </div>
      </AnimationCard>

      <AnimationCard id="entrance-slide-bounce">
        <div className="animate-slide-in-bounce rounded-xl bg-white/5 px-6 py-4 text-sm text-white/70">
          ← Bounced in
        </div>
      </AnimationCard>

      <AnimationCard id="entrance-zoom-rotate">
        <div className="animate-zoom-in-rotate bg-rose-glow/20 inline-block rounded-xl p-4 text-2xl">
          ⭐
        </div>
      </AnimationCard>

      <AnimationCard id="entrance-flip-x">
        <div className="animate-flip-x rounded-xl bg-white/5 p-6 text-sm text-white/70">
          Flipped in (X axis)
        </div>
      </AnimationCard>

      <AnimationCard id="entrance-flip-y">
        <div className="animate-flip-y rounded-xl bg-white/5 p-6 text-sm text-white/70">
          Flipped in (Y axis)
        </div>
      </AnimationCard>

      <AnimationCard id="entrance-blur-in">
        <div className="animate-blur-in rounded-xl bg-white/5 p-6 text-sm text-white/70">
          Blurring into focus 🔍
        </div>
      </AnimationCard>
    </>
  );
}
