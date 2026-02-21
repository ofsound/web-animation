export default function HoverIconRotate() {
  return (
    <button className="group flex items-center gap-3 rounded-xl bg-surface-card-subtle px-5 py-3 transition-colors hover:bg-surface-control">
      <span className="text-xl transition-all duration-500 group-hover:rotate-[360deg] group-hover:text-status-warning">
        ⚙️
      </span>
      <span className="text-sm text-text-secondary">Settings</span>
    </button>
  );
}
