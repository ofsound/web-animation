export default function HoverGlass() {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--surface-3)] p-6 backdrop-blur-md transition-all duration-300 hover:border-[var(--card-border)] hover:bg-[var(--surface-2)] hover:backdrop-blur-xl">
      <div className="mb-2 size-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500" />
      <p className="text-sm text-[var(--text-2)]">Glass effect</p>
    </div>
  );
}
