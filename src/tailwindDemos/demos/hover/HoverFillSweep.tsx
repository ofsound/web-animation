export default function HoverFillSweep() {
  return (
    <button className="group relative overflow-hidden rounded-xl border border-accent-brand px-6 py-3 font-semibold text-accent-brand transition-colors duration-300 hover:text-text-inverse">
      <span className="absolute inset-0 -translate-x-full bg-accent-brand transition-transform duration-300 group-hover:translate-x-0" />
      <span className="relative">Fill Sweep</span>
    </button>
  );
}
