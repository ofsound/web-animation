import { AnimationCard } from "../components/AnimationCard";
import type { CssAnimationDemo } from "../data/cssAnimations";

interface CssCategoryProps {
  demos: CssAnimationDemo[];
}

export function CssCategory({ demos }: CssCategoryProps) {
  return (
    <>
      {demos.map((demo) => {
        const DemoComponent = demo.component;

        return (
          <AnimationCard
            key={demo.id}
            id={demo.id}
            metadataOverride={{
              title: demo.title,
              description: demo.description,
              code: demo.code,
            }}
          >
            <DemoComponent />
          </AnimationCard>
        );
      })}
    </>
  );
}
