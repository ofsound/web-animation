export default function LoadingProgress() {
  return (
    <div className="h-2 w-64 overflow-hidden rounded-full bg-[var(--card-border)]">
      <div className="h-full animate-progress rounded-full bg-gradient-to-r from-accent to-cyan-glow" />
    </div>
  );
}
