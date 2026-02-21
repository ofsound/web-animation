import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./components/ThemeProvider";
import { getDemoRoutePath } from "./data/demoRegistry";

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
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens a routed CSS demo in maximized mode", async () => {
    const path = getDemoRoutePath("css", "keyframes-basic-bounce");
    renderApp(path);

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
    renderApp(getDemoRoutePath("css", "keyframes-basic-bounce"));

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
    renderApp(getDemoRoutePath("tailwind", "hover-scale-glow"));

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
      getDemoRoutePath("tailwind", "hover-gradient-border"),
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
    expect(getPathname()).toBe(getDemoRoutePath("tailwind", "hover-scale-glow"));
  });

  it("crosses from tailwind to css when advancing past last tailwind demo", async () => {
    renderApp(getDemoRoutePath("tailwind", "complex-heartbeat"));

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
    expect(getPathname()).toBe(getDemoRoutePath("css", "keyframes-basic-bounce"));
  });

  it("switches mode to root route and resets scroll to top", async () => {
    renderApp(getDemoRoutePath("css", "keyframes-basic-bounce"));

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
      expect(getPathname()).toBe(getDemoRoutePath("tailwind", "hover-scale-glow")),
    );
  });
});
