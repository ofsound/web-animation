export default function HoverShadowExpand() {
  return (
    <div className="rounded-2xl bg-zinc-800 p-6 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_oklch(0.7_0.18_270/0.3)]">
      <div className="mb-2 text-2xl">🎯</div>
      <p className="text-sm text-white/70">Hover to elevate</p>
    </div>
  );
}
