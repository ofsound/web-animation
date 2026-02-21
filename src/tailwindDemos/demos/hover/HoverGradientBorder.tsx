export default function HoverGradientBorder() {
  return (
    <div className="group relative rounded-2xl p-[2px]">
      <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,var(--color-accent-brand),var(--color-accent-brand-secondary),var(--color-status-warning),var(--color-accent-brand))] opacity-50 blur-sm transition-all duration-500 group-hover:animate-spin-slow group-hover:opacity-100 group-hover:blur-md" />
      <div className="relative rounded-2xl bg-surface-card px-6 py-4 text-sm text-text-secondary">
        Gradient border
      </div>
    </div>
  );
}
