export default function LoadingSkeleton() {
  return (
    <div className="w-64 space-y-3">
      <div className="h-4 w-3/4 animate-skeleton rounded-lg bg-gradient-to-r from-[var(--card-border)] via-[var(--text-3)]/40 to-[var(--card-border)] bg-[length:200%_100%]" />
      <div className="h-4 w-full animate-skeleton rounded-lg bg-gradient-to-r from-[var(--card-border)] via-[var(--text-3)]/40 to-[var(--card-border)] bg-[length:200%_100%] [animation-delay:100ms]" />
      <div className="h-4 w-1/2 animate-skeleton rounded-lg bg-gradient-to-r from-[var(--card-border)] via-[var(--text-3)]/40 to-[var(--card-border)] bg-[length:200%_100%] [animation-delay:200ms]" />
    </div>
  );
}
