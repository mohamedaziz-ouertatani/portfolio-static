import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectCard from "./ProjectCard";
import { projects } from "@/lib/data/projects";

describe("ProjectCard", () => {
  it("renders the project title and links to the real repo", () => {
    const researchBridge = projects.find((p) => p.slug === "researchbridge")!;
    render(<ProjectCard project={researchBridge} />);
    expect(screen.getByText("ResearchBridge")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://github.com/mohamedaziz-ouertatani/ResearchBridge",
    );
  });

  it("renders the View Project CTA only for featured projects", () => {
    const featured = projects.find((p) => p.featured)!;
    const notFeatured = projects.find((p) => !p.featured)!;

    const { rerender } = render(<ProjectCard project={featured} />);
    expect(screen.getByText("View Project")).toBeInTheDocument();

    rerender(<ProjectCard project={notFeatured} />);
    expect(screen.queryByText("View Project")).not.toBeInTheDocument();
  });
});
