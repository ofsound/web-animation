import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { ThemeProvider } from "./components/ThemeProvider";

function renderApp() {
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  );
}

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const rafQueue: FrameRequestCallback[] = [];
let rafTimestamp = 0;
let scrollIntoViewMock: ReturnType<typeof vi.fn>;
let scrollToMock: ReturnType<typeof vi.fn>;

function flushRafFrames(frameCount = 1): void {
  for (let index = 0; index < frameCount; index += 1) {
    rafTimestamp += 16;
    const callbacks = rafQueue.splice(0, rafQueue.length);
    callbacks.forEach((callback) => callback(rafTimestamp));
  }
}

describe("App hash navigation", () => {
  beforeEach(() => {
    window.location.hash = "";
    rafTimestamp = 0;
    scrollIntoViewMock = vi.fn();
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

    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      writable: true,
      value: scrollIntoViewMock,
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
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        rafQueue.push(callback);
        return rafQueue.length;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    rafQueue.splice(0, rafQueue.length);
    vi.unstubAllGlobals();
  });

  it("switches to CSS mode from a CSS deep-link hash", async () => {
    window.location.hash = "#keyframes-basic-bounce";
    renderApp();

    flushRafFrames(4);

    await waitFor(() => {
      expect(screen.getByRole("radio", { name: /CSS/i })).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });
  });

  it("keeps only the latest hash navigation when updates happen rapidly", () => {
    renderApp();
    flushRafFrames(2);

    window.location.hash = "#hover-scale-glow";
    window.dispatchEvent(new Event("hashchange"));
    window.location.hash = "#loading";
    window.dispatchEvent(new Event("hashchange"));

    flushRafFrames(80);

    expect(scrollToMock).toHaveBeenCalled();
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });
});
