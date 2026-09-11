import Image from "next/image";
import type { Project } from "@/lib/data/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`project-card${project.featured ? " featured" : ""}`}
      id={project.slug}
    >
      <div className="project-img">
        <Image
          src={project.image}
          alt={`${project.title} screenshot`}
          width={1200}
          height={project.featured ? 675 : 900}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="project-info">
        <h3>{project.title}</h3>
        <p className="project-meta">
          <span>{project.tagLabel}</span> {project.tagline}
        </p>
        <p className="project-description">{project.description}</p>
        {project.featured && (
          <span className="btn orange">
            View Project <span className="icon">↗</span>
          </span>
        )}
      </div>
    </a>
  );
}
