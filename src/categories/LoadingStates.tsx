import { AnimationCard } from "../components/AnimationCard";

export function LoadingStates() {
  return (
    <>
      {/* 21 — Spinner */}
      <AnimationCard
        id="loading-spinner"
        title="Spinner"
        description="Classic animated spinner using animate-spin with a border-based circle."
        category="Loading"
        code={`<div className="size-10 animate-spin rounded-full
  border-4 border-white/10 border-t-accent" />`}
      >
        <div className="border-t-accent size-10 animate-spin rounded-full border-4 border-white/10" />
      </AnimationCard>

      {/* 22 — Dual Ring */}
      <AnimationCard
        id="loading-dual-ring"
        title="Dual Ring Spinner"
        description="Two concentric rings spinning in opposite directions for a mesmerizing effect."
        category="Loading"
        code={`<div className="relative flex items-center justify-center">
  <div className="absolute size-10 animate-spin rounded-full
    border-2 border-transparent border-t-accent" />
  <div className="absolute size-7 animate-spin-reverse rounded-full
    border-2 border-transparent border-t-cyan-glow" />
</div>`}
      >
        <div className="relative flex size-12 items-center justify-center">
          <div className="border-t-accent absolute size-10 animate-spin rounded-full border-2 border-transparent" />
          <div className="animate-spin-reverse border-t-cyan-glow absolute size-7 rounded-full border-2 border-transparent" />
        </div>
      </AnimationCard>

      {/* 23 — Pulse Dots */}
      <AnimationCard
        id="loading-pulse-dots"
        title="Pulse Dots"
        description="Three dots pulsing with staggered delays for a classic loading indicator."
        category="Loading"
        code={`<div className="flex gap-2">
  <div className="size-3 animate-bounce rounded-full bg-accent [animation-delay:0ms]" />
  <div className="size-3 animate-bounce rounded-full bg-accent [animation-delay:150ms]" />
  <div className="size-3 animate-bounce rounded-full bg-accent [animation-delay:300ms]" />
</div>`}
      >
        <div className="flex gap-2">
          <div className="bg-accent size-3 animate-bounce rounded-full [animation-delay:0ms]" />
          <div className="bg-accent size-3 animate-bounce rounded-full [animation-delay:150ms]" />
          <div className="bg-accent size-3 animate-bounce rounded-full [animation-delay:300ms]" />
        </div>
      </AnimationCard>

      {/* 24 — Skeleton Loader */}
      <AnimationCard
        id="loading-skeleton"
        title="Skeleton Loader"
        description="Shimmer effect skeleton placeholder using a gradient background animation."
        category="Loading"
        code={`<div className="w-64 space-y-3">
  <div className="h-4 w-3/4 animate-skeleton rounded-lg
    bg-[length:200%_100%]
    bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
  <div className="h-4 w-full animate-skeleton rounded-lg
    bg-[length:200%_100%] [animation-delay:100ms]
    bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
  <div className="h-4 w-1/2 animate-skeleton rounded-lg
    bg-[length:200%_100%] [animation-delay:200ms]
    bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
</div>`}
      >
        <div className="w-64 space-y-3">
          <div className="animate-skeleton h-4 w-3/4 rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]" />
          <div className="animate-skeleton h-4 w-full rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] [animation-delay:100ms]" />
          <div className="animate-skeleton h-4 w-1/2 rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] [animation-delay:200ms]" />
        </div>
      </AnimationCard>

      {/* 25 — Progress Bar */}
      <AnimationCard
        id="loading-progress"
        title="Animated Progress Bar"
        description="A progress bar with animated width and a shimmer overlay."
        category="Loading"
        code={`<div className="h-2 w-64 overflow-hidden rounded-full bg-white/10">
  <div className="h-full animate-progress rounded-full bg-gradient-to-r
    from-accent to-cyan-glow" />
</div>`}
      >
        <div className="h-2 w-64 overflow-hidden rounded-full bg-white/10">
          <div className="animate-progress from-accent to-cyan-glow h-full rounded-full bg-gradient-to-r" />
        </div>
      </AnimationCard>

      {/* 26 — Pulse Ring */}
      <AnimationCard
        id="loading-pulse-ring"
        title="Pulse Ring"
        description="Expanding and fading ring for notification-style loading indicators."
        category="Loading"
        code={`<div className="relative flex items-center justify-center">
  <div className="absolute size-8 animate-pulse-ring rounded-full
    border-2 border-accent" />
  <div className="absolute size-8 animate-pulse-ring rounded-full
    border-2 border-accent [animation-delay:400ms]" />
  <div className="relative size-4 rounded-full bg-accent" />
</div>`}
      >
        <div className="relative flex size-20 items-center justify-center">
          <div className="animate-pulse-ring border-accent absolute size-8 rounded-full border-2" />
          <div className="animate-pulse-ring border-accent absolute size-8 rounded-full border-2 [animation-delay:400ms]" />
          <div className="bg-accent relative size-4 rounded-full" />
        </div>
      </AnimationCard>

      {/* 27 — Ping Notification */}
      <AnimationCard
        id="loading-ping"
        title="Ping Notification"
        description="Classic notification ping animation with a pulsing ring behind a dot."
        category="Loading"
        code={`<span className="relative flex size-3">
  <span className="absolute inline-flex size-full
    animate-ping-slow rounded-full bg-emerald-400 opacity-75" />
  <span className="relative inline-flex size-3
    rounded-full bg-emerald-500" />
</span>`}
      >
        <span className="relative flex size-5">
          <span className="animate-ping-slow absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-5 rounded-full bg-emerald-500" />
        </span>
      </AnimationCard>

      {/* 28 — Pulse Glow Loader */}
      <AnimationCard
        id="loading-glow"
        title="Pulse Glow"
        description="A circle that breathes with a pulsing box-shadow glow."
        category="Loading"
        code={`<div className="size-16 animate-pulse-glow rounded-full
  border border-accent/30 bg-accent/10" />`}
      >
        <div className="animate-pulse-glow border-accent/30 bg-accent/10 size-16 rounded-full border" />
      </AnimationCard>

      {/* 29 — Bar Loader */}
      <AnimationCard
        id="loading-bar"
        title="Indeterminate Bar"
        description="Indeterminate loading bar using shimmer animation on a gradient."
        category="Loading"
        code={`<div className="h-1.5 w-64 overflow-hidden rounded-full bg-white/10">
  <div className="h-full w-1/3 animate-shimmer rounded-full
    bg-gradient-to-r from-transparent via-accent to-transparent
    bg-[length:200%_100%]" />
</div>`}
      >
        <div className="h-1.5 w-64 overflow-hidden rounded-full bg-white/10">
          <div className="animate-shimmer via-accent h-full w-1/3 rounded-full bg-gradient-to-r from-transparent to-transparent bg-[length:200%_100%]" />
        </div>
      </AnimationCard>

      {/* 30 — Orbit Loader */}
      <AnimationCard
        id="loading-orbit"
        title="Orbit Loader"
        description="Two dots orbiting around a center point in opposite directions."
        category="Loading"
        code={`<div className="relative flex size-24 items-center justify-center">
  <div className="size-2 rounded-full bg-white/20" />
  <div className="absolute animate-orbit">
    <div className="size-3 rounded-full bg-accent" />
  </div>
  <div className="absolute animate-orbit-reverse">
    <div className="size-2 rounded-full bg-cyan-glow" />
  </div>
</div>`}
      >
        <div className="relative flex size-24 items-center justify-center">
          <div className="size-2 rounded-full bg-white/20" />
          <div className="animate-orbit absolute">
            <div className="bg-accent size-3 rounded-full" />
          </div>
          <div className="animate-orbit-reverse absolute">
            <div className="bg-cyan-glow size-2 rounded-full" />
          </div>
        </div>
      </AnimationCard>
    </>
  );
}
