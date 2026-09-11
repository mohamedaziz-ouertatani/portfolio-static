import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import ScrollFadeIn from "./ScrollFadeIn";

describe("ScrollFadeIn", () => {
  let observedCallback: IntersectionObserverCallback;

  beforeEach(() => {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [];
      constructor(callback: IntersectionObserverCallback) {
        observedCallback = callback;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  it("renders children", () => {
    render(
      <ScrollFadeIn>
        <p>Hello</p>
      </ScrollFadeIn>,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("starts without the visible class", () => {
    render(
      <ScrollFadeIn>
        <p>Hello</p>
      </ScrollFadeIn>,
    );
    expect(screen.getByText("Hello").parentElement).not.toHaveClass(
      "visible",
    );
  });

  it("adds the visible class once IntersectionObserver reports intersecting", () => {
    render(
      <ScrollFadeIn>
        <p>Hello</p>
      </ScrollFadeIn>,
    );
    act(() => {
      observedCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.getByText("Hello").parentElement).toHaveClass("visible");
  });
});
