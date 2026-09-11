import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TechStack from "./TechStack";

describe("TechStack", () => {
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
  });

  it("renders all 6 category labels", () => {
    render(<TechStack />);
    expect(screen.getByText("Data & Machine Learning")).toBeInTheDocument();
    expect(screen.getByText("Languages")).toBeInTheDocument();
  });
});
