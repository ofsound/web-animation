export default function HoverFillSweep() {
  return (
    <button className="group relative overflow-hidden rounded-xl border border-accent px-6 py-3 font-semibold text-accent transition-colors duration-300 hover:text-white">
      <span className="absolute inset-0 -translate-x-full bg-accent transition-transform duration-300 group-hover:translate-x-0" />
      <span className="relative">Fill Sweep</span>
    </button>
  );
}
