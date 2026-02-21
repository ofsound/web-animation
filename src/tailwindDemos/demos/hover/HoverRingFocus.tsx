export default function HoverRingFocus() {
  return (
    <input
      type="text"
      id="ring-focus-demo"
      name="ring-focus-demo"
      placeholder="Click to focus..."
      className="rounded-xl border border-border-subtle bg-surface-card-subtle px-4 py-3 text-sm text-text-primary outline-none transition-all duration-300 placeholder:text-text-tertiary focus:border-accent-brand focus:ring-2 focus:ring-accent-brand/30 focus:shadow-glow-subtle"
    />
  );
}
