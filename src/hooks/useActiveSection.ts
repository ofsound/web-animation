import { useEffect, useState } from "react";

export function useActiveSection(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node instanceof HTMLElement);

    if (sections.length === 0) return;
    const observedEntries = new Map<string, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          observedEntries.set(entry.target.id, entry);
        });

        const visible = Array.from(observedEntries.values()).filter(
          (entry) => entry.isIntersecting,
        );
        if (visible.length === 0) return;

        const rootBounds = visible[0]?.rootBounds;
        const anchorLine =
          rootBounds?.top !== undefined && rootBounds?.height !== undefined
            ? rootBounds.top + rootBounds.height * 0.35
            : window.innerHeight * 0.35;

        const [nextActive] = visible.sort((a, b) => {
          const distanceA = Math.abs(a.boundingClientRect.top - anchorLine);
          const distanceB = Math.abs(b.boundingClientRect.top - anchorLine);

          if (distanceA !== distanceB) {
            return distanceA - distanceB;
          }
          return b.intersectionRatio - a.intersectionRatio;
        });

        if (nextActive?.target.id) {
          setActiveSection(nextActive.target.id);
        }
      },
      {
        root: null,
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeSection || sectionIds[0] || "";
}
