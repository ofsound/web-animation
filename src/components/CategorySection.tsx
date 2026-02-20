import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AnimationCategory } from "../data/animations";
import { CategoryIcon } from "./CategoryIcon";

interface CategorySectionProps {
  category: AnimationCategory;
  count: number;
  eager?: boolean;
  children: ReactNode;
}

export function CategorySection({ category, count, eager = false, children }: CategorySectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(eager);

  useEffect(() => {
    if (isLoaded || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: "250px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [isLoaded]);

  return (
    <section
      id={category.id}
      ref={sectionRef}
      aria-labelledby={`${category.id}-heading`}
      className="scroll-mt-[7rem] rounded-3xl border border-[var(--card-border)] bg-[color-mix(in_oklab,var(--surface-2)_84%,transparent)] p-5 pt-8 sm:p-7 sm:pt-9"
    >
      <header className="mb-7">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex size-8 items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--surface-3)] text-[var(--text-1)]">
            <CategoryIcon icon={category.icon} className="size-4" />
          </span>
          <h2 id={`${category.id}-heading`} className="text-xl font-bold text-[var(--text-1)] sm:text-2xl">
            {category.label}
          </h2>
          <span className="rounded-full border border-[var(--card-border)] bg-[var(--surface-3)] px-2 py-0.5 font-mono text-[10px] tracking-wide text-[var(--text-2)] uppercase">
            {count} demos
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-2)]">{category.description}</p>
      </header>

      {isLoaded ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`${category.id}-placeholder-${index}`}
              className="h-[280px] rounded-2xl border border-[var(--card-border)] bg-[var(--surface-3)]"
            />
          ))}
        </div>
      )}
    </section>
  );
}
