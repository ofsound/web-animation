export default function LoadingProgress() {
  return (
    <div className="h-2 w-64 overflow-hidden rounded-full bg-border-subtle">
      <div className="h-full animate-progress rounded-full bg-gradient-to-r from-accent-brand to-accent-brand-secondary" />
    </div>
  );
}
