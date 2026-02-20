import { AnimationCard } from "../components/AnimationCard";

export function LoadingStates() {
  return (
    <>
      <AnimationCard id="loading-spinner">
        <div className="border-t-accent size-10 animate-spin rounded-full border-4 border-[var(--card-border)]" />
      </AnimationCard>

      <AnimationCard id="loading-dual-ring">
        <div className="relative flex size-12 items-center justify-center">
          <div className="border-t-accent absolute size-10 animate-spin rounded-full border-2 border-transparent" />
          <div className="animate-spin-reverse border-t-cyan-glow absolute size-7 rounded-full border-2 border-transparent" />
        </div>
      </AnimationCard>

      <AnimationCard id="loading-pulse-dots">
        <div className="flex gap-2">
          <div className="bg-accent size-3 animate-bounce rounded-full [animation-delay:0ms]" />
          <div className="bg-accent size-3 animate-bounce rounded-full [animation-delay:150ms]" />
          <div className="bg-accent size-3 animate-bounce rounded-full [animation-delay:300ms]" />
        </div>
      </AnimationCard>

      <AnimationCard id="loading-skeleton">
        <div className="w-64 space-y-3">
          <div className="animate-skeleton h-4 w-3/4 rounded-lg bg-gradient-to-r from-[var(--card-border)] via-[var(--text-3)]/40 to-[var(--card-border)] bg-[length:200%_100%]" />
          <div className="animate-skeleton h-4 w-full rounded-lg bg-gradient-to-r from-[var(--card-border)] via-[var(--text-3)]/40 to-[var(--card-border)] bg-[length:200%_100%] [animation-delay:100ms]" />
          <div className="animate-skeleton h-4 w-1/2 rounded-lg bg-gradient-to-r from-[var(--card-border)] via-[var(--text-3)]/40 to-[var(--card-border)] bg-[length:200%_100%] [animation-delay:200ms]" />
        </div>
      </AnimationCard>

      <AnimationCard id="loading-progress">
        <div className="h-2 w-64 overflow-hidden rounded-full bg-[var(--card-border)]">
          <div className="animate-progress from-accent to-cyan-glow h-full rounded-full bg-gradient-to-r" />
        </div>
      </AnimationCard>

      <AnimationCard id="loading-pulse-ring">
        <div className="relative flex size-20 items-center justify-center">
          <div className="animate-pulse-ring border-accent absolute size-8 rounded-full border-2" />
          <div className="animate-pulse-ring border-accent absolute size-8 rounded-full border-2 [animation-delay:400ms]" />
          <div className="bg-accent relative size-4 rounded-full" />
        </div>
      </AnimationCard>

      <AnimationCard id="loading-ping">
        <span className="relative flex size-5">
          <span className="animate-ping-slow absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-5 rounded-full bg-emerald-500" />
        </span>
      </AnimationCard>

      <AnimationCard id="loading-glow">
        <div className="animate-pulse-glow border-accent/30 bg-accent/10 size-16 rounded-full border" />
      </AnimationCard>

      <AnimationCard id="loading-bar">
        <div className="h-1.5 w-64 overflow-hidden rounded-full bg-[var(--card-border)]">
          <div className="animate-shimmer via-accent h-full w-1/3 rounded-full bg-gradient-to-r from-transparent to-transparent bg-[length:200%_100%]" />
        </div>
      </AnimationCard>

      <AnimationCard id="loading-orbit">
        <div className="relative flex size-24 items-center justify-center">
          <div className="size-2 rounded-full bg-[var(--text-3)]/50" />
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
