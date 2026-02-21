import { useEffect, useRef, useState, type ReactNode } from "react";

interface SectionCategory {
  id: string;
  label: string;
}

interface CategorySectionProps {
  category: SectionCategory;
  count: number;
  eager?: boolean;
  children: ReactNode;
}

export function CategorySection({
  category,
  count,
  eager = false,
  children,
}: CategorySectionProps) {
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
      className="scroll-mt-[7rem] p-5 pt-8 sm:p-7 sm:pt-9"
    >
      <header className="mb-7">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2
            id={`${category.id}-heading`}
            className="text-2xl font-bold text-[var(--text-1)] sm:text-2xl"
          >
            {category.label}
          </h2>
          <span className="font-mono text-sm text-[var(--text-3)]">
            {count} {count === 1 ? "demo" : "demos"}
          </span>
        </div>
      </header>

      {isLoaded ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {children}
        </div>
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
