export default function HoverReveal() {
  return (
    <div className="group relative h-40 w-48 overflow-hidden rounded-2xl bg-gradient-to-br from-accent-brand to-accent-brand-secondary">
      <div className="flex h-full items-center justify-center">
        <span className="text-3xl">🎨</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-shell-sidebar-overlay p-4 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
        <span className="text-sm font-medium text-text-inverse">View Details →</span>
      </div>
    </div>
  );
}
