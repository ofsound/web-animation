export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--card-border)] py-18 sm:py-24">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(1200px_circle_at_18%_-5%,var(--hero-glow),transparent_45%),radial-gradient(900px_circle_at_80%_0%,color-mix(in_oklab,var(--brand-2)_16%,transparent),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--card-border)_55%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--card-border)_55%,transparent)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-6">
        <p className="mb-5 inline-flex items-center rounded-full border border-[var(--card-border)] bg-[var(--surface-2)] px-4 py-1.5 font-mono text-[11px] tracking-[0.16em] text-[var(--text-2)] uppercase">
          Featured UI Motion Library
        </p>
        <h2 className="text-balance text-4xl leading-[1.02] font-black tracking-[-0.03em] text-[var(--text-1)] sm:text-6xl">
          Beautiful Tailwind Animations,
          <span className="decorative-motion block bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] bg-clip-text text-transparent motion-safe:animate-gradient-x [background-size:200%_100%]">
            Production-Ready Patterns
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[var(--text-2)] sm:text-lg">
          A curated gallery of 50 practical animation techniques for modern interfaces,
          built with React and Tailwind CSS v4. Explore featured techniques, copy code,
          and deep-link into any demo instantly.
        </p>
      </div>
    </section>
  );
}
