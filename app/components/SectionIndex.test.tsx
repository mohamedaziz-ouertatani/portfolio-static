import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import SectionIndex from "./SectionIndex";

describe("SectionIndex", () => {
  let observedCallback: IntersectionObserverCallback;

  beforeEach(() => {
    document.body.innerHTML =
      '<section id="hero"></section><section id="experience"></section>' +
      '<section id="about"></section><section id="stack"></section>' +
      '<section id="contact"></section><section id="credentials"></section>';

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

  it("renders all 6 numbered items", () => {
    render(<SectionIndex />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("06")).toBeInTheDocument();
    expect(screen.getByText("Credentials")).toBeInTheDocument();
  });

  it("marks the first item active by default", () => {
    render(<SectionIndex />);
    const introLink = screen.getByText("Intro").closest("a");
    expect(introLink).toHaveClass("active");
  });

  it("moves the active item when a different section intersects", () => {
    render(<SectionIndex />);
    const stackSection = document.getElementById("stack")!;

    act(() => {
      observedCallback(
        [
          {
            isIntersecting: true,
            target: stackSection,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByText("Stack").closest("a")).toHaveClass("active");
    expect(screen.getByText("Intro").closest("a")).not.toHaveClass("active");
  });
});
