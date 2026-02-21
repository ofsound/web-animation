export default function HoverGlass() {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-card-subtle p-6 backdrop-blur-md transition-all duration-300 hover:border-border-subtle hover:bg-surface-control hover:backdrop-blur-xl">
      <div className="mb-2 size-10 rounded-full bg-gradient-to-br from-accent-brand-secondary to-accent-brand" />
      <p className="text-sm text-text-secondary">Glass effect</p>
    </div>
  );
}
