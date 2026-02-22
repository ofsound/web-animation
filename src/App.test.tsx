import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./components/ThemeProvider";
import { toDemoRouteSlug } from "./data/demoRegistry";
import { fetchPublicGallery } from "./data/publicGallery";

vi.mock("./data/publicGallery", async () => {
  const actual =
    await vi.importActual<typeof import("./data/publicGallery")>(
      "./data/publicGallery",
    );

  return {
    ...actual,
    fetchPublicGallery: vi.fn(),
  };
});

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

function LocationPathProbe() {
  const location = useLocation();
  return <output data-testid="location-path">{location.pathname}</output>;
}

function renderApp(initialPath = "/tailwind") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider>
        <App />
        <LocationPathProbe />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

function demoPath(mode: "tailwind" | "css", title: string, demoId: string): string {
  return `/${mode}/${toDemoRouteSlug(title, demoId)}`;
}

async function waitForGalleryLoad() {
  await waitFor(() =>
    expect(screen.queryByText("Loading gallery…")).not.toBeInTheDocument(),
  );
}

class IntersectionObserverMock {
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  root = null;
  rootMargin = "";
  thresholds = [];
  takeRecords = () => [];

  observe(target: Element) {
    if (!(target instanceof HTMLElement) || target.tagName !== "SECTION") {
      return;
    }
    const rect = target.getBoundingClientRect();
    this.callback(
      [
        {
          boundingClientRect: rect,
          intersectionRatio: 1,
          intersectionRect: rect,
          isIntersecting: true,
          rootBounds: null,
          target,
          time: 0,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
  unobserve() {}
  disconnect() {}
}

let scrollToMock: ReturnType<typeof vi.fn>;
const fetchPublicGalleryMock = vi.mocked(fetchPublicGallery);

const PUBLIC_GALLERY_FIXTURE = {
  categories: [
    {
      id: "cat-hover",
      type: "tailwind" as const,
      slug: "hover",
      label: "Hover & Interaction",
      icon: "pointer",
      description: "Hover demos",
      sortOrder: 0,
    },
    {
      id: "cat-complex",
      type: "tailwind" as const,
      slug: "complex",
      label: "Complex Keyframes",
      icon: "layers",
      description: "Complex demos",
      sortOrder: 1,
    },
    {
      id: "cat-keyframes",
      type: "css" as const,
      slug: "keyframes",
      label: "Core Keyframe Animations",
      icon: "spark",
      description: "CSS keyframe demos",
      sortOrder: 0,
    },
  ],
  demos: [
    {
      id: "hover-scale-glow",
      source: "tailwind" as const,
      categoryId: "cat-hover",
      slug: "scale-and-glow",
      title: "Scale & Glow",
      description: "Scale and glow on hover.",
      status: "published" as const,
      difficulty: "Intermediate",
      support: null,
      sortOrder: 0,
      files: [
        { demoId: "hover-scale-glow", fileKind: "html" as const, content: "<button>Hover</button>", sortOrder: 0 },
        { demoId: "hover-scale-glow", fileKind: "tailwind_css" as const, content: ".demo{}", sortOrder: 1 },
      ],
    },
    {
      id: "hover-gradient-border",
      source: "tailwind" as const,
      categoryId: "cat-hover",
      slug: "gradient-border-spin",
      title: "Gradient Border Spin",
      description: "Animated gradient border.",
      status: "published" as const,
      difficulty: "Intermediate",
      support: null,
      sortOrder: 1,
      files: [
        { demoId: "hover-gradient-border", fileKind: "html" as const, content: "<button>Gradient</button>", sortOrder: 0 },
        { demoId: "hover-gradient-border", fileKind: "tailwind_css" as const, content: ".demo{}", sortOrder: 1 },
      ],
    },
    {
      id: "complex-heartbeat",
      source: "tailwind" as const,
      categoryId: "cat-complex",
      slug: "heartbeat",
      title: "Heartbeat",
      description: "Pulse keyframe.",
      status: "published" as const,
      difficulty: "Advanced",
      support: null,
      sortOrder: 0,
      files: [
        { demoId: "complex-heartbeat", fileKind: "html" as const, content: "<div>Beat</div>", sortOrder: 0 },
        { demoId: "complex-heartbeat", fileKind: "tailwind_css" as const, content: ".demo{}", sortOrder: 1 },
      ],
    },
    {
      id: "keyframes-basic-bounce",
      source: "css" as const,
      categoryId: "cat-keyframes",
      slug: "basic-keyframes-bounce",
      title: "Basic @keyframes Bounce",
      description: "Basic CSS bounce.",
      status: "published" as const,
      difficulty: null,
      support: "widely-available",
      sortOrder: 0,
      files: [
        { demoId: "keyframes-basic-bounce", fileKind: "html" as const, content: "<div class='dot'></div>", sortOrder: 0 },
        { demoId: "keyframes-basic-bounce", fileKind: "css" as const, content: ".dot{width:20px;height:20px;background:red;}", sortOrder: 1 },
      ],
    },
  ],
};

function getPathname() {
  return screen.getByTestId("location-path").textContent;
}

describe("App routing", () => {
  beforeEach(() => {
    window.location.hash = "";
    scrollToMock = vi.fn((position: ScrollToOptions | number, y?: number) => {
      const nextScrollY =
        typeof position === "number"
          ? typeof y === "number"
            ? y
            : position
          : (position.top ?? window.scrollY);
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        writable: true,
        value: nextScrollY,
      });
    });

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 0,
    });
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      writable: true,
      value: scrollToMock,
    });

    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: IntersectionObserverMock,
    });
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        media: "",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    );
    fetchPublicGalleryMock.mockResolvedValue(PUBLIC_GALLERY_FIXTURE);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("opens a routed CSS demo in maximized mode", async () => {
    const path = demoPath(
      "css",
      "Basic @keyframes Bounce",
      "keyframes-basic-bounce",
    );
    renderApp(path);
    await waitForGalleryLoad();

    await waitFor(() =>
      expect(screen.getByRole("radio", { name: /CSS/i })).toHaveAttribute(
        "aria-checked",
        "true",
      ),
    );

    expect(
      screen.getByRole("button", {
        name: /Exit expanded view for Basic @keyframes Bounce/i,
      }),
    ).toBeInTheDocument();
    expect(getPathname()).toBe(path);
  });

  it("closes a routed maximized demo back to mode root", async () => {
    renderApp(
      demoPath("css", "Basic @keyframes Bounce", "keyframes-basic-bounce"),
    );
    await waitForGalleryLoad();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Exit expanded view for Basic @keyframes Bounce/i,
      }),
    );

    await waitFor(() => expect(getPathname()).toBe("/css"));
    expect(
      screen.queryByRole("button", {
        name: /Exit expanded view for Basic @keyframes Bounce/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("updates URL slug when navigating next/prev in maximized mode", async () => {
    renderApp(demoPath("tailwind", "Scale & Glow", "hover-scale-glow"));
    await waitForGalleryLoad();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Show next card after Scale & Glow/i,
      }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: /Exit expanded view for Gradient Border Spin/i,
        }),
      ).toBeInTheDocument(),
    );
    expect(getPathname()).toBe(
      demoPath("tailwind", "Gradient Border Spin", "hover-gradient-border"),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /Show previous card before Gradient Border Spin/i,
      }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: /Exit expanded view for Scale & Glow/i,
        }),
      ).toBeInTheDocument(),
    );
    expect(getPathname()).toBe(
      demoPath("tailwind", "Scale & Glow", "hover-scale-glow"),
    );
  });

  it("crosses from tailwind to css when advancing past last tailwind demo", async () => {
    renderApp(demoPath("tailwind", "Heartbeat", "complex-heartbeat"));
    await waitForGalleryLoad();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Show next card after Heartbeat/i,
      }),
    );

    await waitFor(() =>
      expect(screen.getByRole("radio", { name: /CSS/i })).toHaveAttribute(
        "aria-checked",
        "true",
      ),
    );
    expect(getPathname()).toBe(
      demoPath("css", "Basic @keyframes Bounce", "keyframes-basic-bounce"),
    );
  });

  it("switches mode to root route and resets scroll to top", async () => {
    renderApp(
      demoPath("css", "Basic @keyframes Bounce", "keyframes-basic-bounce"),
    );
    await waitForGalleryLoad();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 480,
    });

    fireEvent.click(screen.getByRole("radio", { name: /Tailwind/i }));

    await waitFor(() => expect(getPathname()).toBe("/tailwind"));
    expect(
      scrollToMock.mock.calls.some(
        ([arg]) =>
          typeof arg === "object" &&
          arg !== null &&
          "top" in arg &&
          arg.top === 0,
      ),
    ).toBe(true);
  });

  it("redirects root route to /tailwind", async () => {
    renderApp("/");

    await waitFor(() => expect(getPathname()).toBe("/tailwind"));
  });

  it("redirects legacy demo hash links to canonical route URLs", async () => {
    window.location.hash = "#hover-scale-glow";
    renderApp("/tailwind");

    await waitFor(() =>
      expect(getPathname()).toBe(
        demoPath("tailwind", "Scale & Glow", "hover-scale-glow"),
      ),
    );
  });
});
