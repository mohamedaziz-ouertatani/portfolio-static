import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Certifications from "./Certifications";

describe("Certifications", () => {
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

  it("renders all 3 certification titles", () => {
    render(<Certifications />);
    expect(
      screen.getByText("CCNA: Switching, Routing & Wireless Essentials"),
    ).toBeInTheDocument();
    expect(screen.getByText("Neo4j Fundamentals")).toBeInTheDocument();
  });
});
