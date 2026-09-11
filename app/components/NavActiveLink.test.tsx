import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import NavActiveLink from "./NavActiveLink";

describe("NavActiveLink", () => {
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

    // NavActiveLink looks up its target section via document.querySelector(href)
    document.body.innerHTML = '<section id="about"></section>';
  });

  it("renders the label as a link to the given href", () => {
    render(<NavActiveLink href="#about" label="About" />);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "#about",
    );
  });

  it("has no active class before its section intersects", () => {
    render(<NavActiveLink href="#about" label="About" />);
    expect(screen.getByRole("link")).not.toHaveClass("active");
  });

  it("adds the active class when its section starts intersecting", () => {
    render(<NavActiveLink href="#about" label="About" />);
    act(() => {
      observedCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.getByRole("link")).toHaveClass("active");
  });

  it("removes the active class when its section stops intersecting", () => {
    render(<NavActiveLink href="#about" label="About" />);
    act(() => {
      observedCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    act(() => {
      observedCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.getByRole("link")).not.toHaveClass("active");
  });

  it("never becomes active for a non-anchor href like /projects", () => {
    document.body.innerHTML = "";
    render(<NavActiveLink href="/projects" label="Projects" />);
    expect(screen.getByRole("link")).not.toHaveClass("active");
  });

  it("still finds its target for a route-qualified href like /#about", () => {
    render(<NavActiveLink href="/#about" label="About" />);
    act(() => {
      observedCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.getByRole("link")).toHaveClass("active");
  });

  it("never becomes active for a route-qualified href whose target isn't on the current page", () => {
    // e.g. rendered on /projects, where no #about element exists
    document.body.innerHTML = "";
    render(<NavActiveLink href="/#about" label="About" />);
    expect(screen.getByRole("link")).not.toHaveClass("active");
  });
});
