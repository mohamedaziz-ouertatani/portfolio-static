import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  beforeEach(() => {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "";
      readonly thresholds = [];
      constructor(_callback: IntersectionObserverCallback) {}
      observe = vi.fn();
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
    vi.stubGlobal(
      "requestIdleCallback",
      (cb: IdleRequestCallback) => setTimeout(cb, 0) as unknown as number,
    );
  });

  it("renders the hero headline", () => {
    render(<HomePage />);
    expect(screen.getByText(/MLOps Student/)).toBeInTheDocument();
  });

  it("renders all major sections", () => {
    render(<HomePage />);
    expect(screen.getByText("Next.js Developer Intern")).toBeInTheDocument();
    expect(screen.getByText("Data & Machine Learning")).toBeInTheDocument();
    expect(screen.getByText("Let's talk")).toBeInTheDocument();
    expect(screen.getByText("ACADEMIC EXCELLENCE")).toBeInTheDocument();
    expect(screen.getByText("Neo4j Fundamentals")).toBeInTheDocument();
  });
});
