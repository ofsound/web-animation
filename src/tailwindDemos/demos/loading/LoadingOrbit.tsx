export default function LoadingOrbit() {
  return (
    <div className="relative flex size-24 items-center justify-center">
      <div className="size-2 rounded-full bg-[var(--text-3)]/50" />
      <div className="absolute animate-orbit">
        <div className="size-3 rounded-full bg-accent" />
      </div>
      <div className="absolute animate-orbit-reverse">
        <div className="size-2 rounded-full bg-cyan-glow" />
      </div>
    </div>
  );
}
