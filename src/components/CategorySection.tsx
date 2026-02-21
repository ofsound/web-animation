import { useEffect, useRef, useState, type ReactNode } from "react";

interface SectionCategory {
  id: string;
  label: string;
}

interface CategorySectionProps {
  category: SectionCategory;
  eager?: boolean;
  children: ReactNode;
}

export function CategorySection({
  category,
  eager = false,
  children,
}: CategorySectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(eager);
  const cardGridStyle = {
    gridTemplateColumns: "repeat(auto-fit, minmax(0, 480px))",
    justifyContent: "center",
  } as const;

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
      aria-label={category.label}
      className="scroll-mt-8 p-5 pt-8 sm:p-7 sm:pt-9"
    >
      {isLoaded ? (
        <div className="grid gap-7" style={cardGridStyle}>
          {children}
        </div>
      ) : (
        <div className="grid gap-4" style={cardGridStyle} aria-hidden>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`${category.id}-placeholder-${index}`}
              className="h-[280px] rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card-subtle)]"
            />
          ))}
        </div>
      )}
    </section>
  );
}
