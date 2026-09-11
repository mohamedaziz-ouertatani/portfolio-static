export interface Service {
  num: string;
  name: string;
  description: string;
}

/** Hero section's 4-item service/focus-area grid. */
export const services: Service[] = [
  {
    num: "/ 01",
    name: "Data & ML",
    description:
      "Pipelines, models, and forecasting that hold up in production.",
  },
  {
    num: "/ 02",
    name: "Backend & APIs",
    description:
      "Type-safe services with authentication, RBAC, and real data persistence.",
  },
  {
    num: "/ 03",
    name: "DevOps & MLOps",
    description: "Containerized, tracked, and reproducible from day one.",
  },
  {
    num: "/ 04",
    name: "Frontend & BI",
    description: "Interfaces and dashboards that make the data usable.",
  },
];
