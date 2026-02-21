import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AnimationCard } from "./AnimationCard";

const mockMetadata = {
  title: "Scale & Glow",
  description:
    "Smooth scale-up with a glowing box-shadow on hover using transition-all.",
  code: "<button>Hover me</button>",
};

describe("AnimationCard", () => {
  it("renders title and description from metadata", () => {
    render(
      <AnimationCard id="hover-scale-glow" metadata={mockMetadata}>
        <span>Preview</span>
      </AnimationCard>,
    );

    expect(screen.getByText("Scale & Glow")).toBeInTheDocument();
    expect(
      screen.getByText(/Smooth scale-up with a glowing box-shadow on hover/),
    ).toBeInTheDocument();
  });

  it("updates the live preview for tailwind code edits", () => {
    render(
      <AnimationCard
        id="hover-scale-glow"
        metadata={{ ...mockMetadata, source: "tailwind" }}
      >
        <span>Preview</span>
      </AnimationCard>,
    );

    expect(screen.getByText("Hover me")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Live code editor/i), {
      target: {
        value: '<button className="rounded-xl bg-accent px-6 py-3">Edited</button>',
      },
    });

    expect(screen.getByText("Edited")).toBeInTheDocument();
  });
});
