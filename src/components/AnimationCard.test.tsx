import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AnimationCard } from "./AnimationCard";

describe("AnimationCard", () => {
  it("renders title and description from metadata", () => {
    render(
      <AnimationCard id="hover-scale-glow">
        <span>Preview</span>
      </AnimationCard>,
    );

    expect(screen.getByText("Scale & Glow")).toBeInTheDocument();
    expect(
      screen.getByText(/Smooth scale-up with a glowing box-shadow on hover/),
    ).toBeInTheDocument();
  });

  it("throws when id is not in metadata", () => {
    expect(() =>
      render(
        <AnimationCard id="nonexistent-demo">
          <span>Preview</span>
        </AnimationCard>,
      ),
    ).toThrow('AnimationCard: no metadata found for demo id "nonexistent-demo"');
  });
});
