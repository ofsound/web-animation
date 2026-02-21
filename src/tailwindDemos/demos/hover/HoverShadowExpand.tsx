export default function HoverShadowExpand() {
  return (
    <div className="rounded-2xl bg-surface-card-subtle p-6 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-glow">
      <div className="mb-2 text-2xl">🎯</div>
      <p className="text-sm text-text-secondary">Hover to elevate</p>
    </div>
  );
}
