export default function HoverReveal() {
  return (
    <div className="group relative h-40 w-48 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-800">
      <div className="flex h-full items-center justify-center">
        <span className="text-3xl">🎨</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
        <span className="text-sm font-medium text-white">View Details →</span>
      </div>
    </div>
  );
}
