import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Stats from "./Stats";

describe("Stats", () => {
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
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  });

  it("renders both stat labels", () => {
    render(<Stats />);
    expect(screen.getByText("ACADEMIC EXCELLENCE")).toBeInTheDocument();
    expect(screen.getByText("PROFESSIONAL EXPERIENCE")).toBeInTheDocument();
  });

  it("renders the animated values under reduced motion", () => {
    render(<Stats />);
    expect(screen.getByText("2027")).toBeInTheDocument();
    expect(screen.getByText("2+")).toBeInTheDocument();
  });
});
