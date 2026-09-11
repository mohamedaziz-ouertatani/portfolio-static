import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders the contact email and phone", () => {
    render(<Footer />);
    expect(
      screen.getByText(/ouertatanimohamedaziz@gmail\.com/),
    ).toBeInTheDocument();
    expect(screen.getByText(/\+216 29 241 717/)).toBeInTheDocument();
  });

  it("renders all 3 social links", () => {
    render(<Footer />);
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
  });

  it("renders the copyright line", () => {
    render(<Footer />);
    expect(
      screen.getByText(/Mohamed Aziz Ouertatani\. All rights reserved\./),
    ).toBeInTheDocument();
  });
});
