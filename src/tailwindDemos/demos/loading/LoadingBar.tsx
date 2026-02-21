export default function LoadingBar() {
  return (
    <div className="h-1.5 w-64 overflow-hidden rounded-full bg-[var(--card-border)]">
      <div className="h-full w-1/3 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-accent to-transparent bg-[length:200%_100%]" />
    </div>
  );
}
