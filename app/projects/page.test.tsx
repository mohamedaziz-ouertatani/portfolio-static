import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectsPage from "./page";

describe("ProjectsPage", () => {
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

  it("renders the hero heading", () => {
    render(<ProjectsPage />);
    expect(screen.getByText("Featured Projects")).toBeInTheDocument();
  });

  it("renders all 4 project cards", () => {
    render(<ProjectsPage />);
    expect(screen.getByText("ResearchBridge")).toBeInTheDocument();
    expect(screen.getByText("Estate-Mind")).toBeInTheDocument();
    expect(
      screen.getByText("Smart Inventory Forecasting & Replenishment Platform"),
    ).toBeInTheDocument();
    expect(screen.getByText("ML Project - MLOps Pipeline")).toBeInTheDocument();
  });

  it("renders the philosophy section and CTA", () => {
    render(<ProjectsPage />);
    expect(screen.getByText("Engineering Robust Solutions.")).toBeInTheDocument();
    expect(
      screen.getByText("Seeking an End-of-Studies Internship"),
    ).toBeInTheDocument();
  });
});
