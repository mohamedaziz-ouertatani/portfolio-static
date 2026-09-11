import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Experience from "./Experience";

describe("Experience", () => {
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

  it("renders all 3 roles", () => {
    render(<Experience />);
    expect(screen.getByText("Next.js Developer Intern")).toBeInTheDocument();
    expect(screen.getAllByText("Swiver")).toHaveLength(2);
  });

  it("renders the section heading", () => {
    render(<Experience />);
    expect(screen.getByText("not just coursework.")).toBeInTheDocument();
  });
});
