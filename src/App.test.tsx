import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const rafQueue: FrameRequestCallback[] = [];
let scrollIntoViewMock: ReturnType<typeof vi.fn>;

function flushRafFrames(frameCount = 1): void {
  for (let index = 0; index < frameCount; index += 1) {
    const callbacks = rafQueue.splice(0, rafQueue.length);
    callbacks.forEach((callback) => callback(performance.now()));
  }
}

describe("App hash navigation", () => {
  beforeEach(() => {
    window.location.hash = "";
    scrollIntoViewMock = vi.fn();

    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      writable: true,
      value: scrollIntoViewMock,
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
    window.location.hash = "#A1";
    render(<App />);

    flushRafFrames(4);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /A\. Core Keyframe Animations/i }),
      ).toBeInTheDocument();
    });
  });

  it("keeps only the latest hash navigation when updates happen rapidly", () => {
    render(<App />);
    flushRafFrames(2);

    window.location.hash = "#hover-scale-glow";
    window.dispatchEvent(new Event("hashchange"));
    window.location.hash = "#loading";
    window.dispatchEvent(new Event("hashchange"));

    flushRafFrames(6);

    expect(scrollIntoViewMock).toHaveBeenCalled();
    const lastScrolledElement = scrollIntoViewMock.mock.instances.at(-1) as
      | HTMLElement
      | undefined;
    expect(lastScrolledElement?.id).toBe("loading");
  });
});
