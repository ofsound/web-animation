export default function HoverIconRotate() {
  return (
    <button className="group flex items-center gap-3 rounded-xl bg-[var(--surface-3)] px-5 py-3 transition-colors hover:bg-[var(--surface-2)]">
      <span className="text-xl transition-all duration-500 group-hover:rotate-[360deg] group-hover:text-amber-400">
        ⚙️
      </span>
      <span className="text-sm text-[var(--text-2)]">Settings</span>
    </button>
  );
}
