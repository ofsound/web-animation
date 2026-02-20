import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CategorySection } from "./CategorySection";
import type { AnimationCategory } from "../data/animations";

const mockCategory: AnimationCategory = {
  id: "hover",
  label: "Hover & Interaction",
  icon: "pointer",
  description: "Interactive transitions and tactile UI feedback patterns.",
};

describe("CategorySection", () => {
  it("renders category header with label and count", () => {
    render(
      <CategorySection category={mockCategory} count={10} eager>
        <span>Demo content</span>
      </CategorySection>,
    );

    expect(screen.getByRole("heading", { name: /Hover & Interaction/i })).toBeInTheDocument();
    expect(screen.getByText("10 demos")).toBeInTheDocument();
  });

  it("renders children when eager", () => {
    render(
      <CategorySection category={mockCategory} count={5} eager>
        <span data-testid="demo-content">Demo content</span>
      </CategorySection>,
    );

    expect(screen.getByTestId("demo-content")).toBeInTheDocument();
  });
});
