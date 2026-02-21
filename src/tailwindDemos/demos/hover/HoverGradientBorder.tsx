export default function HoverGradientBorder() {
  return (
    <div className="group relative rounded-2xl p-[2px]">
      <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_0deg,#7c3aed,#06b6d4,#f59e0b,#7c3aed)] opacity-50 blur-sm transition-all duration-500 group-hover:opacity-100 group-hover:blur-md group-hover:animate-spin-slow" />
      <div className="relative rounded-2xl bg-zinc-900 px-6 py-4 text-sm text-white/80">
        Gradient border
      </div>
    </div>
  );
}
