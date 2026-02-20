import { AnimationCard } from "../components/AnimationCard";

export function ComplexKeyframes() {
  return (
    <>
      <AnimationCard id="complex-float">
        <div className="animate-float rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 p-6 text-sm font-medium text-white/80 shadow-lg">
          🚀 Floating
        </div>
      </AnimationCard>

      <AnimationCard id="complex-morph">
        <div className="animate-morph size-28 bg-gradient-to-br from-violet-500 to-cyan-400" />
      </AnimationCard>

      <AnimationCard id="complex-rubber-band">
        <div className="animate-rubber-band bg-amber-glow/20 text-amber-glow rounded-xl px-8 py-4 text-lg font-bold">
          Stretch!
        </div>
      </AnimationCard>

      <AnimationCard id="complex-jello">
        <div className="animate-jello bg-rose-glow/20 text-rose-glow rounded-xl px-8 py-4 text-lg font-bold">
          Wobble 🍮
        </div>
      </AnimationCard>

      <AnimationCard id="complex-tada">
        <div className="animate-tada text-4xl">🎉</div>
      </AnimationCard>

      <AnimationCard id="complex-wave">
        <div className="animate-wave origin-[70%_70%] text-4xl">👋</div>
      </AnimationCard>

      <AnimationCard id="complex-breathe">
        <div className="animate-breathe rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="mx-auto mb-2 size-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
          <p className="text-center text-sm text-white/60">I'm alive</p>
        </div>
      </AnimationCard>

      <AnimationCard id="complex-levitate">
        <div className="animate-levitate rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 p-6 shadow-xl shadow-purple-500/10">
          <span className="text-2xl">💎</span>
        </div>
      </AnimationCard>

      <AnimationCard id="complex-wiggle">
        <div className="animate-wiggle text-4xl">🔔</div>
      </AnimationCard>

      <AnimationCard id="complex-heartbeat">
        <div className="animate-heartbeat text-4xl text-rose-500">❤️</div>
      </AnimationCard>
    </>
  );
}
