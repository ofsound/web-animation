export default function HoverRingFocus() {
  return (
    <input
      type="text"
      id="ring-focus-demo"
      name="ring-focus-demo"
      placeholder="Click to focus..."
      className="rounded-xl border border-[var(--card-border)] bg-[var(--surface-3)] px-4 py-3 text-sm text-[var(--text-1)] outline-none transition-all duration-300 placeholder:text-[var(--text-3)] focus:border-accent focus:ring-2 focus:ring-accent/30 focus:shadow-[0_0_20px_oklch(0.7_0.18_270/0.15)]"
    />
  );
}
