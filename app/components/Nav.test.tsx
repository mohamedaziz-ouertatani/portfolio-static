import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Nav from "./Nav";

describe("Nav", () => {
  it("renders the site short name as the logo", () => {
    render(<Nav />);
    expect(screen.getByText("Aziz Ouertatani")).toBeInTheDocument();
  });

  it("renders all 4 nav links", () => {
    render(<Nav />);
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders the Get in touch CTA", () => {
    render(<Nav />);
    expect(screen.getByText("Get in touch")).toBeInTheDocument();
  });
});
