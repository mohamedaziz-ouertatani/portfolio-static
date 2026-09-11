import type { Metadata } from "next";
import { projects } from "@/lib/data/projects";
import ProjectCard from "../components/ProjectCard";
import Philosophy from "../components/Philosophy";

export const metadata: Metadata = {
  title: "Projects - Mohamed Aziz Ouertatani",
  description:
    "Featured data engineering, MLOps, and full-stack projects by Mohamed Aziz Ouertatani: ResearchBridge, Estate-Mind, Smart Inventory Forecasting, and an MLOps pipeline.",
};

export default function ProjectsPage() {
  return (
    <>
      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <div className="glow glow-3" />

      <main className="container">
        <section className="projects-hero">
          <h1>Featured Projects</h1>
          <p>
            A curated collection of end-to-end data pipelines, machine
            learning systems, and full-stack applications built for
            performance and scalability.
          </p>
        </section>

        <section>
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard project={project} key={project.slug} />
            ))}
          </div>
        </section>

        <section>
          <Philosophy />
        </section>

        <section className="cta-section">
          <h2>Seeking an End-of-Studies Internship</h2>
          <p>
            I am looking for a 6-month PFE opportunity in Data Science, Data
            Engineering, or MLOps.
          </p>
          <a href="/#contact" className="btn orange">
            Get in touch <span className="icon">↗</span>
          </a>
        </section>
      </main>
    </>
  );
}
