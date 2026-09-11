import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AnimatedStat from "./AnimatedStat";

describe("AnimatedStat", () => {
  beforeEach(() => {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [];
      constructor(private callback: IntersectionObserverCallback) {}
      observe = () => {
        this.callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      };
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true, // simulate prefers-reduced-motion so the value snaps instantly — deterministic for testing
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  });

  it("renders the target value immediately under reduced motion", () => {
    render(<AnimatedStat value={2027} />);
    expect(screen.getByText("2027")).toBeInTheDocument();
  });

  it("renders the suffix alongside the value", () => {
    render(<AnimatedStat value={2} suffix="+" />);
    expect(screen.getByText("2+")).toBeInTheDocument();
  });
});
