import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CategorySection } from "./CategorySection";
import type { Category } from "../types/demo";

const mockCategory: Category = {
  id: "hover",
  label: "Hover & Interaction",
  icon: "pointer",
  description: "Interactive transitions and tactile UI feedback patterns.",
};

describe("CategorySection", () => {
  it("exposes an accessible region label for the category", () => {
    render(
      <CategorySection category={mockCategory} eager>
        <span>Demo content</span>
      </CategorySection>,
    );

    expect(
      screen.getByRole("region", { name: /Hover & Interaction/i }),
    ).toBeInTheDocument();
  });

  it("renders children when eager", () => {
    render(
      <CategorySection category={mockCategory} eager>
        <span data-testid="demo-content">Demo content</span>
      </CategorySection>,
    );

    expect(screen.getByTestId("demo-content")).toBeInTheDocument();
  });
});
