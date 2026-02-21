export default function LoadingBar() {
  return (
    <div className="h-1.5 w-64 overflow-hidden rounded-full bg-border-subtle">
      <div className="h-full w-1/3 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-accent-brand to-transparent bg-[length:200%_100%]" />
    </div>
  );
}
