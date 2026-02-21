import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AnimationCard } from "./AnimationCard";

vi.mock("@uiw/react-codemirror", () => ({
  __esModule: true,
  default: ({
    id,
    value,
    onChange,
    className,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
  }: {
    id?: string;
    value?: string;
    onChange?: (nextValue: string) => void;
    className?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
  }) => (
    <textarea
      id={id}
      value={value ?? ""}
      onChange={(event) => onChange?.(event.target.value)}
      className={className}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    />
  ),
}));

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

  it("shows maximized prev/next controls and respects disabled states", () => {
    const onGoPrev = vi.fn();
    const onGoNext = vi.fn();

    render(
      <AnimationCard
        id="hover-scale-glow"
        metadata={mockMetadata}
        isMaximized
        canGoPrev={false}
        canGoNext
        onGoPrev={onGoPrev}
        onGoNext={onGoNext}
      >
        <span>Preview</span>
      </AnimationCard>,
    );

    const prevButton = screen.getByRole("button", {
      name: /Show previous card before Scale & Glow/i,
    });
    const nextButton = screen.getByRole("button", {
      name: /Show next card after Scale & Glow/i,
    });

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeEnabled();

    fireEvent.click(nextButton);
    expect(onGoNext).toHaveBeenCalledTimes(1);
    expect(onGoPrev).not.toHaveBeenCalled();
  });
});
