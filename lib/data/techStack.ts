export interface TechStackCategory {
  label: string;
  tags: string[];
}

export const techStackCategories: TechStackCategory[] = [
  {
    label: "Data & Machine Learning",
    tags: ["Pandas", "NumPy", "scikit-learn", "statsmodels", "MLflow"],
  },
  {
    label: "Backend & APIs",
    tags: ["Fastify", "Node.js", "Express", "REST APIs", "JWT / RBAC"],
  },
  {
    label: "Databases",
    tags: ["PostgreSQL", "MongoDB", "Neo4j", "Data Warehousing"],
  },
  {
    label: "DevOps & MLOps",
    tags: ["Docker", "CI/CD", "Experiment Tracking"],
  },
  {
    label: "Frontend",
    tags: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    label: "Languages",
    tags: ["Python", "TypeScript", "JavaScript", "SQL", "Java", "R"],
  },
];
