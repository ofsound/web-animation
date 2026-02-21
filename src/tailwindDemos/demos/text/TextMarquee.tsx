export default function TextMarquee() {
  return (
    <div className="w-64 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        <span className="mx-4 text-text-tertiary">TAILWIND CSS v4 ✦</span>
        <span className="mx-4 text-text-tertiary">TAILWIND CSS v4 ✦</span>
        <span className="mx-4 text-text-tertiary">TAILWIND CSS v4 ✦</span>
        <span className="mx-4 text-text-tertiary">TAILWIND CSS v4 ✦</span>
      </div>
    </div>
  );
}
