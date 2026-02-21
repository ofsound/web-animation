import { useEffect, useRef, useState, type ReactNode } from "react";

interface SectionCategory {
  id: string;
  label: string;
}

interface CategorySectionProps {
  category: SectionCategory;
  eager?: boolean;
  surfaceTone?: "odd" | "even";
  children: ReactNode;
}

export function CategorySection({
  category,
  eager = false,
  surfaceTone = "odd",
  children,
}: CategorySectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(eager);
  const sectionSurfaceClass =
    surfaceTone === "even"
      ? "bg-surface-section-even"
      : "bg-surface-section-odd";
  const shouldRenderContent = eager || isLoaded;

  useEffect(() => {
    if (shouldRenderContent || !sectionRef.current) return;

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
  }, [shouldRenderContent]);

  return (
    <section
      id={category.id}
      ref={sectionRef}
      aria-label={category.label}
      className={`py-12 sm:py-14 ${sectionSurfaceClass}`}
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-7 lg:px-10 2xl:px-14">
        {shouldRenderContent ? (
          <div className="grid grid-cols-1 gap-7 xl:grid-cols-2 2xl:grid-cols-3">
            {children}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3" aria-hidden>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`${category.id}-placeholder-${index}`}
                className="h-[280px] rounded-2xl border border-border-subtle bg-surface-card-subtle"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
