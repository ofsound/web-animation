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

vi.mock("./IsolatedDemoFrame", () => ({
  IsolatedDemoFrame: ({
    files,
  }: {
    files: {
      html: string;
      css: string;
      js: string;
      tailwindCss: string;
      meta: string;
    };
  }) => (
    <div data-testid="isolated-demo-frame">
      <span data-testid="isolated-html">{files.html}</span>
      <span data-testid="isolated-css">{files.css}</span>
    </div>
  ),
}));

const mockMetadata = {
  title: "Scale & Glow",
  description:
    "Smooth scale-up with a glowing box-shadow on hover using transition-all.",
  code: "<button>Hover me</button>",
};

const databaseInitialCode = [
  "<!-- HTML -->",
  '<button class="rounded border">Original</button>',
  "",
  "/* Tailwind CSS */",
  "",
  "/* CSS */",
  ".rounded { border-width: 1px; }",
  "",
  "// JavaScript",
  "",
  "// Meta",
].join("\n");

describe("AnimationCard", () => {
  it("renders title and description from metadata", () => {
    render(
      <AnimationCard id="hover-scale-glow" metadata={mockMetadata} isMaximized>
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

  it("updates the live preview for database code edits in minimized mode", () => {
    render(
      <AnimationCard
        id="db-demo"
        metadata={{ ...mockMetadata, source: "database", code: databaseInitialCode }}
      >
        <span>Preview</span>
      </AnimationCard>,
    );

    expect(screen.getByTestId("isolated-html")).toHaveTextContent("Original");
    expect(screen.getByTestId("isolated-css")).toHaveTextContent(
      ".rounded { border-width: 1px; }",
    );

    fireEvent.change(screen.getByLabelText(/Live code editor/i), {
      target: {
        value: [
          "<!-- HTML -->",
          '<button class="rounded border">Edited</button>',
          "",
          "/* Tailwind CSS */",
          "",
          "/* CSS */",
          ".rounded { border-width: 3px; }",
          "",
          "// JavaScript",
          "",
          "// Meta",
        ].join("\n"),
      },
    });

    expect(screen.getByTestId("isolated-html")).toHaveTextContent("Edited");
    expect(screen.getByTestId("isolated-css")).toHaveTextContent(
      ".rounded { border-width: 3px; }",
    );
  });

  it("updates the live preview for database code edits in maximized mode", async () => {
    render(
      <AnimationCard
        id="db-demo-max"
        metadata={{ ...mockMetadata, source: "database", code: databaseInitialCode }}
        isMaximized
      >
        <span>Preview</span>
      </AnimationCard>,
    );

    const editor = await screen.findByLabelText(/Live code editor/i);

    fireEvent.change(editor, {
      target: {
        value: [
          "<!-- HTML -->",
          '<button class="rounded border">Max Edited</button>',
          "",
          "/* Tailwind CSS */",
          "",
          "/* CSS */",
          ".rounded { border-width: 2px; }",
          "",
          "// JavaScript",
          "",
          "// Meta",
        ].join("\n"),
      },
    });

    expect(screen.getByTestId("isolated-html")).toHaveTextContent("Max Edited");
    expect(screen.getByTestId("isolated-css")).toHaveTextContent(
      ".rounded { border-width: 2px; }",
    );
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
        queuePosition={2}
        queueTotal={120}
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
    expect(screen.getByText("2/120")).toBeInTheDocument();

    fireEvent.click(nextButton);
    expect(onGoNext).toHaveBeenCalledTimes(1);
    expect(onGoPrev).not.toHaveBeenCalled();
  });
});
